export const bingoCore = {
    generateCardData(config, roomId = 'default') {
        const {
            title = "Bingo",
            words = "",
            width = 5,
            height = 5,
            centerType = 'f',
            centerValue = "Free",
            centerSubheadingValue = "Free Space",
            fontSize = 'm',
            enableNotes = false,
        } = config;

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
            roomId, // Store the room ID (config string) in the card data
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
                const size = parseInt(compact.s || 5);
                return {
                    title: compact.t,
                    words: compact.w,
                    width: size,
                    height: size,
                    centerType: compact.ct || 'f',
                    centerValue: compact.cv || "Free",
                    centerSubheadingValue: compact.cs || "",
                    fontSize: compact.fz || 'm',
                    enableNotes: !!compact.en,
                    raw: encoded, // Keep the raw encoded string as room ID
                };
            } catch (e) {
                console.error("Failed to decode config", e);
            }
        }

        return {
            title: 'Bingo',
            words: '',
            width: 5,
            height: 5,
            centerType: 'f',
            centerValue: 'Free',
            centerSubheadingValue: 'Free Space',
            fontSize: 'm',
            enableNotes: false,
            raw: 'default',
        };
    }
};
