const STORAGE_KEY = 'bingo_card_state';

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
    }
};
