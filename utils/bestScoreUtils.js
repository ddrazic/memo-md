import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export const updateBestScore = async (newScore) => {
  const user = auth.currentUser;
  if (user) {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const currentBestScore = userDocSnap.data().bestScore;

        if (currentBestScore === null || newScore < currentBestScore) {
          await updateDoc(userDocRef, { bestScore: parseFloat(newScore.toFixed(2)) });
          console.log("Novi rekord uspješno ažuriran!");
          return true;
        }
      }
    } catch (error) {
      console.error("Greška pri ažuriranju rezultata:", error);
    }
  }
  return false;
};