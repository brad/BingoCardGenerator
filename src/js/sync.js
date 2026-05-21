import {
    doc,
    setDoc,
    onSnapshot,
    collection,
    query,
    where,
    getDoc,
    serverTimestamp,
    runTransaction,
    getCountFromServer
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { db } from './firebase-config.js';

export const sync = {
    async isNicknameAvailable(roomId, nickname) {
        const nickRef = doc(db, 'rooms', roomId, 'nicknames', nickname.toLowerCase());
        const docSnap = await getDoc(nickRef);
        return !docSnap.exists();
    },

    async getPlayerCount(roomId) {
        const playersCol = collection(db, 'rooms', roomId, 'players');
        const snapshot = await getCountFromServer(playersCol);
        return snapshot.data().count;
    },

    async joinRoom(roomId, userInfo, cardData) {
        const playerRef = doc(db, 'rooms', roomId, 'players', userInfo.id);
        const nickRef = doc(db, 'rooms', roomId, 'nicknames', userInfo.nickname.toLowerCase());

        try {
            await runTransaction(db, async (transaction) => {
                const nickDoc = await transaction.get(nickRef);
                if (nickDoc.exists() && nickDoc.data().userId !== userInfo.id) {
                    throw new Error('Nickname already taken');
                }

                transaction.set(nickRef, { userId: userInfo.id });
                transaction.set(playerRef, {
                    nickname: userInfo.nickname,
                    cardData: cardData,
                    lastSeen: serverTimestamp()
                }, { merge: true });
            });
            return true;
        } catch (e) {
            console.error("Join room failed: ", e);
            throw e;
        }
    },

    async updateCard(roomId, userId, cardData) {
        const playerRef = doc(db, 'rooms', roomId, 'players', userId);
        try {
            await setDoc(playerRef, {
                cardData: cardData,
                lastSeen: serverTimestamp()
            }, { merge: true });
        } catch (e) {
            console.error("Update card failed: ", e);
        }
    },

    subscribeToRoom(roomId, userId, callback) {
        const playersCol = collection(db, 'rooms', roomId, 'players');
        // Listen to all players except self
        const q = query(playersCol);

        return onSnapshot(q, (snapshot) => {
            const players = [];
            snapshot.forEach((doc) => {
                if (doc.id !== userId) {
                    players.push({
                        id: doc.id,
                        ...doc.data()
                    });
                }
            });
            callback(players);
        }, (error) => {
            console.error("Room subscription failed: ", error);
        });
    }
};
