export const bingoCore = {
    generateCardData(config) {
        const { title, words, width, height, centerType, centerValue, centerSubheadingValue, fontSize, enableNotes } = config;

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
            if (centerType !== 'random' && i === centerSquareIndex) {
                spaces.push({
                    text: centerValue,
                    subheading: centerSubheadingValue,
                    isFreeSpace: centerType === 'free',
                    marked: centerType === 'free',
                    note: "",
                    wasEverDaubed: centerType === 'free'
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
            spaces
        };
    },

    encodeConfig(config) {
        const compact = {
            t: config.title,
            w: config.words,
            wi: config.width,
            h: config.height,
            ct: config.centerType,
            cv: config.centerValue,
            cs: config.centerSubheadingValue,
            fs: config.fontSize,
            en: !!config.enableNotes
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
                return {
                    title: compact.t,
                    words: compact.w,
                    width: parseInt(compact.wi),
                    height: parseInt(compact.h),
                    centerType: compact.ct,
                    centerValue: compact.cv,
                    centerSubheadingValue: compact.cs,
                    fontSize: compact.fs,
                    enableNotes: !!compact.en
                };
            } catch (e) {
                console.error("Failed to decode config", e);
            }
        }

        // Fallback or legacy
        const freespace = params.get('freespace') === 'true';
        return {
            title: params.get('title') || 'Bingo',
            words: params.get('words') || '',
            width: parseInt(params.get('width') || 5),
            height: parseInt(params.get('height') || 5),
            centerType: freespace ? 'free' : 'random',
            centerValue: params.get('freespaceValue') || 'Free',
            centerSubheadingValue: params.get('freespaceSubheadingValue') || 'Free Space',
            fontSize: 'medium',
            enableNotes: false
        };
    }
};
