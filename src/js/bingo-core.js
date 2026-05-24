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

    ROOM_WORDS: [
        "apple", "banana", "cherry", "dragon", "eagle", "forest", "garden", "harbor", "island", "jungle",
        "koala", "lemon", "mountain", "nebula", "ocean", "panda", "quartz", "river", "spirit", "tiger",
        "umbra", "valley", "winter", "xenon", "yacht", "zebra", "amber", "blaze", "crystal", "desert",
        "echo", "frost", "glimmer", "haven", "indigo", "jade", "kestrel", "lunar", "misty", "nova",
        "opal", "prism", "quiet", "radiant", "solar", "twilight", "under", "vivid", "willow", "xeric",
        "young", "zenith", "arcane", "breeze", "cloud", "dawn", "ember", "flame", "grove", "hollow",
        "ivory", "june", "karma", "leaf", "moss", "night", "olive", "pearl", "quill", "rain",
        "stone", "thorn", "urban", "velvet", "wave", "xyloid", "yarn", "zero", "atlas", "bright",
        "coast", "dusk", "earth", "field", "gold", "hill", "iris", "jewel", "knoll", "lake",
        "maple", "north", "orbit", "path", "quick", "rose", "sky", "tide", "unit", "vale",
        "wild", "year", "zinc", "alpha", "bold", "calm", "dark", "ever", "fair", "great",
        "high", "iron", "just", "kind", "light", "mild", "near", "open", "pure", "rare",
        "soft", "true", "up", "vast", "warm", "young", "zeal", "acorn", "berry", "cedar",
        "delta", "elm", "fern", "glade", "hazel", "ivy", "jolt", "kelp", "lime", "mint",
        "nut", "oak", "pine", "quip", "root", "sage", "tree", "urn", "vine", "wood",
        "yarn", "zone", "air", "blue", "cold", "deep", "east", "fast", "green", "hot",
        "into", "jump", "keen", "long", "main", "new", "old", "pace", "red", "star",
        "top", "use", "view", "west", "zip", "bold", "crisp", "dim", "even", "firm",
        "glad", "hard", "itch", "join", "kept", "lost", "make", "nice", "once", "past",
        "quit", "rich", "safe", "tall", "upon", "very", "wide", "yawn", "zoom"
    ],

    generateRoomId() {
        const words = [];
        for (let i = 0; i < 3; i++) {
            const randomIndex = Math.floor(Math.random() * this.ROOM_WORDS.length);
            words.push(this.ROOM_WORDS[randomIndex]);
        }
        return words.join('-');
    },

    sanitizeRoomId(raw) {
        if (!raw || raw === 'default') return 'default';
        return raw.replace(/[^a-zA-Z0-9-]/g, '_');
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
            roomId: this.sanitizeRoomId(roomId),
        };
    },

    encodeConfig(config) {
        const compact = {
            t: config.title,
            w: config.words,
            s: config.width,
            ct: config.centerType,
            cv: config.centerValue,
            cs: config.centerSubheadingValue,
            fz: config.fontSize,
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
                    raw: encoded,
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
