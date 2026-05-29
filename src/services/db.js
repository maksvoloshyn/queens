import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Fetch the daily puzzle from Firestore
export async function getDailyPuzzle(dateString) {
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

// Admin: Save a puzzle to Firestore
export async function savePuzzle(dateString, puzzleData) {
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
  try {
    await setDoc(doc(db, 'progress', id), {
        username,
        dateString,
        ...progressData,
        lastUpdated: new Date()
    }, { merge: true });
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
