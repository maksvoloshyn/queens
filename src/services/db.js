import { db } from './firebase';
import { doc, setDoc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

const USE_LOCAL = import.meta.env.VITE_USE_LOCAL_EMULATOR === 'true';

// Fetch the daily puzzle from Firestore or LocalStorage
export async function getDailyPuzzle(dateString) {
  if (USE_LOCAL) {
    const data = localStorage.getItem(`puzzle_${dateString}`);
    return data ? JSON.parse(data) : null;
  }
  
  try {
    const docRef = doc(db, 'puzzles', dateString);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching daily puzzle:", error);
    return null;
  }
}

// Admin: Save a puzzle to Firestore or LocalStorage
export async function savePuzzle(dateString, puzzleData) {
  if (USE_LOCAL) {
    localStorage.setItem(`puzzle_${dateString}`, JSON.stringify(puzzleData));
    return true;
  }
  
  try {
    await setDoc(doc(db, 'puzzles', dateString), puzzleData);
    return true;
  } catch (error) {
    console.error("Error saving puzzle:", error);
    return false;
  }
}

// Progress saving (combines date and username for the ID)
export async function saveProgress(dateString, username, progressData) {
  if (!username) return false;
  const id = `${dateString}_${username}`;
  
  const payload = {
    username,
    dateString,
    ...progressData,
    lastUpdated: new Date().toISOString()
  };

  if (USE_LOCAL) {
    localStorage.setItem(`progress_${id}`, JSON.stringify(payload));
    return true;
  }

  try {
    await setDoc(doc(db, 'progress', id), payload, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving progress:", error);
    return false;
  }
}

// Fetch user progress to resume game
export async function getProgress(dateString, username) {
  if (!username) return null;
  const id = `${dateString}_${username}`;
  
  if (USE_LOCAL) {
    const data = localStorage.getItem(`progress_${id}`);
    return data ? JSON.parse(data) : null;
  }

  try {
    const docRef = doc(db, 'progress', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching progress:", error);
    return null;
  }
}

// Leaderboard logic
export async function saveScore(dateString, username, timeSeconds) {
  const id = `${dateString}_${username}`;
  const payload = {
    username,
    dateString,
    timeSeconds,
    timestamp: new Date().toISOString()
  };

  if (USE_LOCAL) {
    const existingStr = localStorage.getItem(`leaderboard_${dateString}`) || '[]';
    const existing = JSON.parse(existingStr);
    const index = existing.findIndex(s => s.username === username);
    if (index >= 0) {
      if (timeSeconds < existing[index].timeSeconds) {
        existing[index] = payload;
      }
    } else {
      existing.push(payload);
    }
    localStorage.setItem(`leaderboard_${dateString}`, JSON.stringify(existing));
    return true;
  }

  try {
    await setDoc(doc(db, 'leaderboard', id), payload, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving score:", error);
    return false;
  }
}

export async function getLeaderboard(dateString) {
  if (USE_LOCAL) {
    const existingStr = localStorage.getItem(`leaderboard_${dateString}`) || '[]';
    const existing = JSON.parse(existingStr);
    // Sort ascending by time
    existing.sort((a, b) => a.timeSeconds - b.timeSeconds);
    return existing.slice(0, 10);
  }

  try {
    const q = query(
      collection(db, 'leaderboard'),
      where('dateString', '==', dateString),
      orderBy('timeSeconds', 'asc'),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    const scores = [];
    querySnapshot.forEach((doc) => {
      scores.push(doc.data());
    });
    return scores;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
}
