let originalLog = null;
const logArray = [];
const channelLevels = { drums: 0, bass: 0, chords: 0, lead: 0 };

// Map note ranges to channels (approximate mapping)
function detectChannel(logText) {
    // Check for drum samples first (these don't always have notes)
    const drumSamples = ['bd', 'sd', 'hh', 'kick', 'snare', 'hat', 'rim', 'cp', 'clap',
        'mt', 'lt', 'ht', 'tom', 'crash', 'ride', 'oh', 'ch'];
    for (const drum of drumSamples) {
        if (logText.includes(`sound ${drum}`) || logText.includes(`s:${drum}`)) {
            return 'drums';
        }
    }

    const noteMatch = logText.match(/note:([a-g][#b]?\d)/i);
    if (!noteMatch) {
        // If no note but has sound/s: property, might be drums
        if (logText.includes('sound') || logText.includes('s:')) {
            return 'drums';
        }
        return null;
    }

    const note = noteMatch[1].toLowerCase();
    const octave = parseInt(note.match(/\d/)[0]);

    // Lead: triangle wave or higher notes (octaves 5+)
    if (logText.includes('s:triangle') || logText.includes('s:sine') || octave >= 5) {
        return 'lead';
    }

    // Bass: lower notes (octaves 1-3) or bass synths
    if (octave <= 3 || logText.includes('s:bass') || logText.includes('s:sub')) {
        return 'bass';
    }

    // Chords: supersaw or sawtooth in middle range
    if (logText.includes('s:supersaw') || logText.includes('s:sawtooth')) {
        return 'chords';
    }


    // Octave 4 defaults to chords
    if (octave === 4) {
        return 'chords';
    }

    return 'chords'; // default
}

export default function console_monkey_patch() {
    //If react multicalls this, do nothing
    if (originalLog) return;
    originalLog = console.log;
    //Overwrite console.log function
    console.log = function (...args) {
        //Join args with space, default behaviour. Check for [hap], that's a strudel prefix
        const logText = args.join(" ");
        if (logText.substring(0, 8) === "%c[hap] ") {
            const cleanLog = logText.replace("%c[hap] ", "");

            // Extract gain value
            const gainMatch = cleanLog.match(/gain:([\d.]+)/);
            if (gainMatch) {
                const gain = parseFloat(gainMatch[1]);
                const channel = detectChannel(cleanLog);

                if (channel) {
                    // Update channel level with exponential smoothing for visual effect
                    channelLevels[channel] = Math.max(channelLevels[channel] * 0.8, gain);

                    // Create event with channel-specific data
                    const event = new CustomEvent("d3Data", {
                        detail: Object.entries(channelLevels).map(([ch, val]) => `${ch}:${val.toFixed(3)}`)
                    });
                    document.dispatchEvent(event);
                }
            }

            //If so, add it to the Array of values.
            //Then remove the oldest values once we've hit 100.
            logArray.push(cleanLog);
            if (logArray.length > 100) {
                logArray.splice(0, 1);
            }
        }
        originalLog.apply(console, args);
    };

    // Decay channel levels over time
    setInterval(() => {
        let changed = false;
        for (const channel in channelLevels) {
            if (channelLevels[channel] > 0.01) {
                channelLevels[channel] *= 0.92; // Decay factor
                changed = true;
            } else if (channelLevels[channel] !== 0) {
                channelLevels[channel] = 0;
                changed = true;
            }
        }
        if (changed) {
            const event = new CustomEvent("d3Data", {
                detail: Object.entries(channelLevels).map(([ch, val]) => `${ch}:${val.toFixed(3)}`)
            });
            document.dispatchEvent(event);
        }
    }, 50); // Update every 50ms for smooth decay
}

export function getD3Data() {
    return Object.entries(channelLevels).map(([ch, val]) => `${ch}:${val.toFixed(3)}`);
}

export function subscribe(eventName, listener) {
    document.addEventListener(eventName, listener);
}

export function unsubscribe(eventName, listener) {
    document.removeEventListener(eventName, listener);
}