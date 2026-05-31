import { db } from './firebase';
import {
    doc,
    setDoc,
    getDoc,
    getDocs,
    collection,
    query,
    where,
    orderBy,
    limit,
    runTransaction,
} from 'firebase/firestore';
import type { Board } from '../engine/gameLogic';
import { generatePuzzle } from '../engine/puzzleGenerator';

const USE_LOCAL = import.meta.env.VITE_USE_LOCAL_EMULATOR === 'true';

export interface PuzzleData {
    regions: number[][];
    solution?: { rowIndex: number; columnIndex: number }[];
}

export interface LeaderboardScore {
    username: string;
    dateString: string;
    timeSeconds: number;
    timestamp: string;
}

export interface ProgressData {
    grid: Board;
    timerSeconds: number;
    isSolved: boolean;
}

export interface ProgressPayload extends ProgressData {
    username: string;
    dateString: string;
    lastUpdated: string;
}

// Generate puzzle deterministically based on date seed with fallback retries
function generateWithRetry(dateString: string): PuzzleData | null {
    let attempts = 0;
    let puzzle = null;
    while (!puzzle && attempts < 100) {
        const seed =
            attempts === 0 ? dateString : `${dateString}_retry_${attempts}`;
        puzzle = generatePuzzle(seed);
        attempts++;
    }
    if (puzzle) {
        return {
            regions: puzzle.regions,
            solution: puzzle.solution,
        };
    }
    return null;
}

// Reconstruct a 2D regions puzzle from a flattened 1D Firestore layout
function reconstructPuzzle(data: any): PuzzleData {
    let regions2D: number[][] = [];
    if (data.regionsFlattened) {
        const flat = data.regionsFlattened as number[];
        for (let i = 0; i < flat.length; i += 8) {
            regions2D.push(flat.slice(i, i + 8));
        }
    } else if (data.regions) {
        regions2D = data.regions as number[][];
    }
    return {
        regions: regions2D,
        solution: data.solution,
    };
}

// Poll Firestore waiting for another client to finish daily puzzle generation
async function pollForDailyPuzzle(
    docRef: any,
    dateString: string,
): Promise<PuzzleData | null> {
    console.log('Another client is generating the daily puzzle. Polling...');
    let retries = 0;

    while (retries < 10) {
        await new Promise((resolve) => setTimeout(resolve, 500));

        try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data() as any;

                if (
                    data &&
                    (data.status === 'ready' ||
                        data.regionsFlattened ||
                        data.regions)
                ) {
                    const puzzleData = reconstructPuzzle(data);

                    localStorage.setItem(
                        `puzzle_${dateString}`,
                        JSON.stringify(puzzleData),
                    );

                    return puzzleData;
                }
            }
        } catch (pollError) {
            console.warn('Error during polling, will retry:', pollError);
        }

        retries++;
    }
    console.warn('Polling timed out.');
    return null;
}

// Generate the daily puzzle deterministically and save it to Firestore
async function generateAndSaveDailyPuzzle(
    docRef: any,
    dateString: string,
): Promise<PuzzleData | null> {
    const puzzleData = generateWithRetry(dateString);
    if (!puzzleData) return null;

    try {
        await setDoc(docRef, {
            regionsFlattened: puzzleData.regions.flat(),
            solution: puzzleData.solution || [],
            status: 'ready',
            generating: false,
            completedAt: new Date().toISOString(),
        });

        localStorage.setItem(
            `puzzle_${dateString}`,
            JSON.stringify(puzzleData),
        );

        return puzzleData;
    } catch (saveError) {
        console.error('Error saving daily puzzle to Firestore:', saveError);
        return null;
    }
}

// Fetch puzzle with atomic transaction-based generation check
export async function getDailyPuzzle(
    dateString: string,
): Promise<PuzzleData | null> {
    // Check local cache first for instant loading
    const cachedData = localStorage.getItem(`puzzle_${dateString}`);
    if (cachedData) {
        try {
            const parsed = JSON.parse(cachedData) as PuzzleData;
            if (parsed && parsed.regions) {
                return parsed;
            }
        } catch (e) {
            console.warn('Error parsing cached puzzle:', e);
        }
    }

    if (USE_LOCAL) {
        const puzzleData = generateWithRetry(dateString);

        if (puzzleData) {
            localStorage.setItem(
                `puzzle_${dateString}`,
                JSON.stringify(puzzleData),
            );
            return puzzleData;
        }
        return null;
    }

    const docRef = doc(db, 'puzzles', dateString);

    try {
        const txResult = await runTransaction(db, async (transaction) => {
            const docSnap = await transaction.get(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data() as any;

                if (
                    data &&
                    (data.status === 'ready' ||
                        data.regionsFlattened ||
                        data.regions)
                ) {
                    return { status: 'ready', data: reconstructPuzzle(data) };
                }

                if (data && data.status === 'generating') {
                    return { status: 'generating' };
                }
            }

            // Mark the puzzle as generating to prevent concurrency issues
            transaction.set(docRef, {
                status: 'generating',
                generating: true,
                createdAt: new Date().toISOString(),
            });
            return { status: 'needs_generation' };
        });

        if (txResult.status === 'ready' && txResult.data) {
            localStorage.setItem(
                `puzzle_${dateString}`,
                JSON.stringify(txResult.data),
            );
            return txResult.data;
        }

        if (txResult.status === 'generating') {
            return await pollForDailyPuzzle(docRef, dateString);
        }

        return await generateAndSaveDailyPuzzle(docRef, dateString);
    } catch (error) {
        console.error('Firestore error in getDailyPuzzle:', error);
        return null;
    }
}

// Save user completion score to Firebase or LocalStorage
export async function saveScore(
    dateString: string,
    username: string,
    timeSeconds: number,
): Promise<boolean> {
    const id = `${dateString}_${username}`;
    const payload: LeaderboardScore = {
        username,
        dateString,
        timeSeconds,
        timestamp: new Date().toISOString(),
    };

    if (USE_LOCAL) {
        const existingStr =
            localStorage.getItem(`leaderboard_${dateString}`) || '[]';
        let existing: LeaderboardScore[] = [];
        try {
            existing = JSON.parse(existingStr);
        } catch {
            existing = [];
        }
        const idx = existing.findIndex((s) => s.username === username);
        if (idx >= 0) {
            if (timeSeconds < existing[idx].timeSeconds) {
                existing[idx] = payload;
            }
        } else {
            existing.push(payload);
        }
        localStorage.setItem(
            `leaderboard_${dateString}`,
            JSON.stringify(existing),
        );
        return true;
    }

    try {
        await setDoc(doc(db, 'leaderboard', id), payload, { merge: true });
        // Invalidate session storage cache
        sessionStorage.removeItem(`leaderboard_${dateString}`);
        return true;
    } catch (error) {
        console.error('Error saving score to Firestore:', error);
        return false;
    }
}

// Fetch daily leaderboard (ordered by fast completion time)
export async function getLeaderboard(
    dateString: string,
): Promise<LeaderboardScore[]> {
    if (USE_LOCAL) {
        const existingStr =
            localStorage.getItem(`leaderboard_${dateString}`) || '[]';
        let existing: LeaderboardScore[] = [];

        try {
            existing = JSON.parse(existingStr);
        } catch {
            existing = [];
        }

        existing.sort((a, b) => a.timeSeconds - b.timeSeconds);

        return existing.slice(0, 10);
    }

    const cacheKey = `leaderboard_${dateString}`;

    try {
        const cachedStr = sessionStorage.getItem(cacheKey);

        if (cachedStr) {
            const cached = JSON.parse(cachedStr);

            if (Date.now() - cached.fetchedAt < 30000) {
                return cached.scores as LeaderboardScore[];
            }
        }
    } catch (e) {
        console.warn('Error reading leaderboard cache:', e);
    }

    try {
        const q = query(
            collection(db, 'leaderboard'),
            where('dateString', '==', dateString),
            orderBy('timeSeconds', 'asc'),
            limit(10),
        );
        const querySnapshot = await getDocs(q);
        const scores: LeaderboardScore[] = [];

        querySnapshot.forEach((doc) => {
            scores.push(doc.data() as LeaderboardScore);
        });

        try {
            sessionStorage.setItem(
                cacheKey,
                JSON.stringify({
                    scores,
                    fetchedAt: Date.now(),
                }),
            );
        } catch (e) {
            console.warn('Error caching leaderboard:', e);
        }

        return scores;
    } catch (error) {
        console.error('Error fetching leaderboard from Firestore:', error);

        return [];
    }
}

// Pure Local storage for saving user in-progress states
export function saveLocalProgress(
    dateString: string,
    username: string,
    progressData: ProgressData,
): boolean {
    if (!username) return false;

    const id = `${dateString}_${username}`;
    const payload: ProgressPayload = {
        username,
        dateString,
        ...progressData,
        lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem(`progress_${id}`, JSON.stringify(payload));

    return true;
}

// Pure Local storage for getting user in-progress states
export function getLocalProgress(
    dateString: string,
    username: string,
): ProgressPayload | null {
    if (!username || !dateString) return null;

    const id = `${dateString}_${username}`;
    const localData = localStorage.getItem(`progress_${id}`);

    if (localData) {
        try {
            return JSON.parse(localData) as ProgressPayload;
        } catch (e) {
            console.warn('Error parsing local progress:', e);
        }
    }

    return null;
}
