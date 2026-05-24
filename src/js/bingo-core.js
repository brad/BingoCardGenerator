export const bingoCore = {
    DEFAULT_CONFIG: {
        title: "Bingo",
        words: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25",
        width: 5,
        height: 5,
        centerType: 'f',
        centerValue: "Free",
        centerSubheadingValue: "Free Space",
        fontSize: 'm',
        enableNotes: false,
    },

    sanitizeRoomId(raw) {
        if (!raw || raw === 'default') return 'default';
        // Base64 encoded JSON can contain characters like '/', '+', '=' which are problematic for Firestore document IDs.
        // We replace everything non-alphanumeric with underscores for maximum safety.
        return raw.replace(/[^a-zA-Z0-9]/g, '_');
    },

    generateCardData(config = {}, roomId = 'default') {
        const merged = { ...this.DEFAULT_CONFIG, ...config };
        const {
            title,
            words,
            width,
            height,
            centerType,
            centerValue,
            centerSubheadingValue,
            fontSize,
            enableNotes,
        } = merged;

        let possibleSpaces = words.split(',').map(s => s.trim()).filter(s => s !== "");
        const totalSquares = width * height;

        // Shuffle possible spaces
        const shuffled = [...possibleSpaces];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const spaces = [];
        const centerSquareIndex = Math.floor(height / 2) * width + Math.floor(width / 2);

        for (let i = 0; i < totalSquares; i++) {
            if (centerType !== 'r' && i === centerSquareIndex) {
                spaces.push({
                    text: centerValue || "Free",
                    subheading: centerSubheadingValue || "",
                    isFreeSpace: centerType === 'f',
                    marked: centerType === 'f',
                    note: "",
                    photo: "",
                    wasEverDaubed: centerType === 'f',
                });
            } else {
                const text = shuffled.pop() || "";
                spaces.push({
                    text: text,
                    subheading: "",
                    isFreeSpace: false,
                    marked: false,
                    note: "",
                    photo: "",
                    wasEverDaubed: false
                });
            }
        }

        return {
            title,
            width,
            height,
            fontSize,
            enableNotes: !!enableNotes,
            spaces,
            roomId: this.sanitizeRoomId(roomId), // Store the room ID (config string) in the card data
        };
    },

    encodeConfig(config) {
        const compact = {
            t: config.title,
            w: config.words,
            s: config.width,
            ct: config.centerType, // f, m, r
            cv: config.centerValue,
            cs: config.centerSubheadingValue,
            fz: config.fontSize, // s, m, l
            en: !!config.enableNotes,
        };
        const str = JSON.stringify(compact);
        return 'c=' + btoa(unescape(encodeURIComponent(str)));
    },

    decodeConfig(queryString) {
        const params = new URLSearchParams(queryString);
        const encoded = params.get('c');
        if (encoded) {
            try {
                const str = decodeURIComponent(escape(atob(encoded)));
                const compact = JSON.parse(str);
                const size = parseInt(compact.s || this.DEFAULT_CONFIG.width);
                return {
                    title: compact.t || this.DEFAULT_CONFIG.title,
                    words: compact.w || this.DEFAULT_CONFIG.words,
                    width: size,
                    height: size,
                    centerType: compact.ct || this.DEFAULT_CONFIG.centerType,
                    centerValue: compact.cv || this.DEFAULT_CONFIG.centerValue,
                    centerSubheadingValue: compact.cs || this.DEFAULT_CONFIG.centerSubheadingValue,
                    fontSize: compact.fz || this.DEFAULT_CONFIG.fontSize,
                    enableNotes: compact.en !== undefined ? !!compact.en : this.DEFAULT_CONFIG.enableNotes,
                    raw: encoded, // Keep the raw encoded string as room ID
                };
            } catch (e) {
                console.error("Failed to decode config", e);
            }
        }

        return {
            ...this.DEFAULT_CONFIG,
            raw: 'default',
        };
    }
};
