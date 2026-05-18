export const bingoCore = {
    generateCardData(config) {
        const { title, words, width, height, freespace, freespaceValue, freespaceSubheadingValue, freespaceRandom } = config;

        let possibleSpaces = words.split(',').map(s => s.trim()).filter(s => s !== "");
        const totalSquares = width * height;

        if (possibleSpaces.length < (freespace ? totalSquares - 1 : totalSquares)) {
             console.warn("Not enough words for the card size!");
        }

        // Shuffle possible spaces
        const shuffled = [...possibleSpaces];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const spaces = [];
        const centerSquareIndex = Math.floor(height / 2) * width + Math.floor(width / 2);

        for (let i = 0; i < totalSquares; i++) {
            if (freespace && !freespaceRandom && i === centerSquareIndex) {
                spaces.push({
                    text: freespaceValue,
                    subheading: freespaceSubheadingValue,
                    isFreeSpace: true,
                    marked: true
                });
            } else {
                const text = shuffled.pop() || "";
                spaces.push({
                    text: text,
                    subheading: "",
                    isFreeSpace: false,
                    marked: false
                });
            }
        }

        if (freespace && freespaceRandom) {
            const randomIndex = Math.floor(Math.random() * totalSquares);
            spaces[randomIndex] = {
                text: freespaceValue,
                subheading: freespaceSubheadingValue,
                isFreeSpace: true,
                marked: true
            };
        }

        return {
            title,
            width,
            height,
            spaces
        };
    },

    encodeConfig(config) {
        // To keep it shorter and cleaner, we'll JSON stringify and then use Base64
        // We use a compact key mapping to save space
        const compact = {
            t: config.title,
            w: config.words,
            wi: config.width,
            h: config.height,
            f: config.freespace ? 1 : 0,
            fv: config.freespaceValue,
            fs: config.freespaceSubheadingValue,
            fr: config.freespaceRandom ? 1 : 0
        };
        const str = JSON.stringify(compact);
        // Using btoa(unescape(encodeURIComponent(str))) for unicode support
        return 'c=' + btoa(unescape(encodeURIComponent(str)));
    },

    decodeConfig(queryString) {
        const params = new URLSearchParams(queryString);
        const encoded = params.get('c');
        if (encoded) {
            try {
                const str = decodeURIComponent(escape(atob(encoded)));
                const compact = JSON.parse(str);
                return {
                    title: compact.t,
                    words: compact.w,
                    width: parseInt(compact.wi),
                    height: parseInt(compact.h),
                    freespace: compact.f === 1,
                    freespaceValue: compact.fv,
                    freespaceSubheadingValue: compact.fs,
                    freespaceRandom: compact.fr === 1
                };
            } catch (e) {
                console.error("Failed to decode config", e);
            }
        }

        // Fallback to old format or empty
        return {
            title: params.get('title') || 'Bingo',
            words: params.get('words') || '',
            width: parseInt(params.get('width') || 5),
            height: parseInt(params.get('height') || 5),
            freespace: params.get('freespace') === 'true',
            freespaceValue: params.get('freespaceValue') || 'Free',
            freespaceSubheadingValue: params.get('freespaceSubheadingValue') || 'Free Space',
            freespaceRandom: params.get('freespaceRandom') === 'true'
        };
    }
};
