import {
    doc,
    setDoc,
    onSnapshot,
    collection,
    query,
    getDoc,
    serverTimestamp,
    runTransaction,
    getCountFromServer,
    deleteField,
    deleteDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { db } from './firebase-config.js';

export const sync = {
    async isNicknameAvailable(roomId, nickname) {
        const nickRef = doc(db, 'rooms', roomId, 'nicknames', nickname.toLowerCase());
        const docSnap = await getDoc(nickRef);
        return !docSnap.exists();
    },

    async isRoomIdAvailable(roomId) {
        const roomRef = doc(db, 'rooms', roomId);
        const docSnap = await getDoc(roomRef);
        return !docSnap.exists();
    },

    async getPlayerCount(roomId) {
        const playersCol = collection(db, 'rooms', roomId, 'players');
        const snapshot = await getCountFromServer(playersCol);
        return snapshot.data().count;
    },

    async saveRoomConfig(roomId, config) {
        const roomRef = doc(db, 'rooms', roomId);
        // Set expiresAt to 48 hours from now
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 48);

        await setDoc(roomRef, {
            config: config,
            createdAt: serverTimestamp(),
            expiresAt: expiresAt,
            active: false
        });
    },

    async getRoomConfig(roomId) {
        const roomRef = doc(db, 'rooms', roomId);
        const docSnap = await getDoc(roomRef);
        if (docSnap.exists()) {
            return docSnap.data().config;
        }
        return null;
    },

    async joinRoom(roomId, userInfo, cardData, oldNickname = null) {
        const roomRef = doc(db, 'rooms', roomId);
        const playerRef = doc(db, 'rooms', roomId, 'players', userInfo.id);
        const nickRef = doc(db, 'rooms', roomId, 'nicknames', userInfo.nickname.toLowerCase());

        try {
            await runTransaction(db, async (transaction) => {
                const nickDoc = await transaction.get(nickRef);
                if (nickDoc.exists() && nickDoc.data().userId !== userInfo.id) {
                    throw new Error('Nickname already taken');
                }

                if (oldNickname && oldNickname.toLowerCase() !== userInfo.nickname.toLowerCase()) {
                    const oldNickRef = doc(db, 'rooms', roomId, 'nicknames', oldNickname.toLowerCase());
                    transaction.delete(oldNickRef);
                }

                transaction.set(nickRef, { userId: userInfo.id });
                transaction.set(playerRef, {
                    nickname: userInfo.nickname,
                    cardData: cardData,
                    lastSeen: serverTimestamp()
                }, { merge: true });

                // If a player joins, ensure the room is marked active and remove expiresAt
                transaction.update(roomRef, {
                    active: true,
                    expiresAt: deleteField()
                });
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
