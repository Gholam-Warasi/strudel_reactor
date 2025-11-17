let originalLog = null;
const levels = { drums: 0, bass: 0, chords: 0, lead: 0 };

// Helper to dispatch updates to the UI
const emitChange = () => {
    const detail = Object.entries(levels).map(([ch, val]) => `${ch}:${val.toFixed(3)}`);
    document.dispatchEvent(new CustomEvent("d3Data", { detail }));
};

function detectChannel(text) {
    const lower = text.toLowerCase();

    // 1. Check for Drums (regex matches "s:kick" or "sound kick")
    if (/s:(bd|sd|hh|kick|snare|hat|rim|cp|clap|mt|lt|ht|tom|crash|ride|oh|ch)\b/.test(lower) ||
        /sound (bd|sd|hh|kick|snare|hat|rim|cp|clap|mt|lt|ht|tom|crash|ride|oh|ch)\b/.test(lower)) {
        return 'drums';
    }

    // 2. Check for Notes
    const noteMatch = lower.match(/note:[a-g][#b]?(\d)/);
    if (noteMatch) {
        const octave = parseInt(noteMatch[1]);
        if (octave <= 3 || lower.includes('s:bass') || lower.includes('s:sub')) return 'bass';
        if (octave >= 5 || lower.includes('s:triangle') || lower.includes('s:sine')) return 'lead';
        return 'chords'; // Default for middle octaves
    }

    // 3. Fallbacks
    if (lower.includes('sound') || lower.includes('s:')) return 'drums'; // Fallback for non-note sounds
    if (lower.includes('s:supersaw') || lower.includes('s:sawtooth')) return 'chords';

    return null;
}

export default function console_monkey_patch() {
    if (originalLog) return; // Prevent multiple patches
    originalLog = console.log;

    console.log = function (...args) {
        const logText = args.join(" ");

        // Intercept Strudel logs starting with %c[hap]
        if (logText.startsWith("%c[hap] ")) {
            const cleanLog = logText.replace("%c[hap] ", "");
            const gainMatch = cleanLog.match(/gain:([\d.]+)/);

            if (gainMatch) {
                const channel = detectChannel(cleanLog);
                if (channel) {
                    // Update level with smoothing and emit
                    levels[channel] = Math.max(levels[channel] * 0.8, parseFloat(gainMatch[1]));
                    emitChange();
                }
            }
        }
        // Always pass through to the real console
        originalLog.apply(console, args);
    };

    // Decay loop (runs every 50ms)
    setInterval(() => {
        let changed = false;
        for (const ch in levels) {
            if (levels[ch] > 0) {
                levels[ch] = levels[ch] > 0.01 ? levels[ch] * 0.92 : 0;
                changed = true;
            }
        }
        if (changed) emitChange();
    }, 50);
}

export function getD3Data() {
    return Object.entries(levels).map(([ch, val]) => `${ch}:${val.toFixed(3)}`);
}

export function subscribe(event, listener) {
    document.addEventListener(event, listener);
}

export function unsubscribe(event, listener) {
    document.removeEventListener(event, listener);
}