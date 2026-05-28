const STORAGE_KEY = 'bingo_card_state';
const USER_KEY = 'bingo_user_info';
const SESSION_KEY = 'bingo_last_session';

export const storage = {
    saveCard(cardData) {
        const key = cardData.roomId ? `${STORAGE_KEY}_${cardData.roomId}` : STORAGE_KEY;
        localStorage.setItem(key, JSON.stringify(cardData));
    },

    loadCard(roomId = null) {
        const key = roomId ? `${STORAGE_KEY}_${roomId}` : STORAGE_KEY;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },

    clearCard(roomId = null) {
        const key = roomId ? `${STORAGE_KEY}_${roomId}` : STORAGE_KEY;
        localStorage.removeItem(key);
    },

    setUserInfo(userInfo) {
        localStorage.setItem(USER_KEY, JSON.stringify(userInfo));
    },

    getUserInfo(roomId = null) {
        const data = localStorage.getItem(USER_KEY);
        let user;
        let isNew = false;
        if (data) {
            user = JSON.parse(data);
        } else {
            // Create a new user if none exists
            user = {
                id: crypto.randomUUID(),
                nicknames: {}
            };
            isNew = true;
        }

        if (!user.nicknames) user.nicknames = {};

        // If roomId is provided, we set user.nickname for the caller's convenience
        if (roomId) {
            user.nickname = user.nicknames[roomId] || '';
        } else {
            user.nickname = '';
        }

        this.setUserInfo(user);
        return { ...user, isNew };
    },

    saveLastSession(session) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    },

    getLastSession() {
        const data = localStorage.getItem(SESSION_KEY);
        return data ? JSON.parse(data) : null;
    }
};

const FORM_KEY = 'bingo_form_data';

export const formStorage = {
    save(data) {
        localStorage.setItem(FORM_KEY, JSON.stringify(data));
    },
    load() {
        const data = localStorage.getItem(FORM_KEY);
        return data ? JSON.parse(data) : null;
    },
    clear() {
        localStorage.removeItem(FORM_KEY);
    }
};
