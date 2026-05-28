const STORAGE_KEY = 'bingo_card_state';
const USER_KEY = 'bingo_user_info';

export const storage = {
    saveCard(cardData) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cardData));
    },

    loadCard() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    },

    clearCard() {
        localStorage.removeItem(STORAGE_KEY);
    },

    setUserInfo(userInfo) {
        localStorage.setItem(USER_KEY, JSON.stringify(userInfo));
    },

    getUserInfo(roomId = null) {
        const data = localStorage.getItem(USER_KEY);
        let user;
        if (data) {
            user = JSON.parse(data);
        } else {
            // Create a new user if none exists
            user = {
                id: crypto.randomUUID(),
                nicknames: {}
            };
        }

        if (!user.nicknames) user.nicknames = {};

        // If roomId is provided, we set user.nickname for the caller's convenience
        if (roomId) {
            user.nickname = user.nicknames[roomId] || '';
        } else {
            user.nickname = '';
        }

        this.setUserInfo(user);
        return user;
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
