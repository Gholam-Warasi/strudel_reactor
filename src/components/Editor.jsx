import React, { useEffect, useRef, useCallback } from 'react';
import StrudelRepl from './StrudelRepl';

function Editor({ value, onChange, strudelReplRef, controls, onPreprocess }) {
    const debounceRef = useRef(null);

    // Debounced preprocessing function
    const debouncedPreprocess = useCallback((code, ctrl) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            runPreprocessing(code, ctrl);
            debounceRef.current = null;
        }, 120);
    }, []);

    // Run preprocessing whenever controls or value change
    useEffect(() => {
        debouncedPreprocess(value, controls);
    }, [controls, value, debouncedPreprocess]);

    const runPreprocessing = (code, controlValues) => {
        if (!strudelReplRef.current || typeof strudelReplRef.current.setCode !== 'function') return;

        // Make a shallow copy so we can mutate safely
        const c = { ...controlValues };

        // Map FX controls: fx_x -> delay_send, fx_y -> reverb
        c.delay_send = c.fx_x ?? 0.12;
        c.reverb = c.fx_y ?? 0.15;

        // Parse/ensure numeric defaults (in case they are strings)
        const defaults = ['master_volume', 'reverb', 'delay_send', 'crossfader', 'tempo'];
        defaults.forEach(k => {
            if (c[k] !== undefined) {
                const p = parseFloat(c[k]);
                c[k] = Number.isNaN(p) ? c[k] : p;
            }
        });

        // Solo/mute logic: if any solo is active, only that channel(s) audible
        const solos = ['drums', 'bass', 'chords', 'lead'].filter(ch => c[`solo_${ch}`]);
        if (solos.length > 0) {
            ['drums', 'bass', 'chords', 'lead'].forEach(ch => {
                c[`mute_${ch}`] = !solos.includes(ch);
            });
        }

        // Compute effective gains: base fader * (1 if not muted else 0)
        const effective = {};
        ['drums', 'bass', 'chords', 'lead'].forEach(ch => {
            const fader = Number.parseFloat(c[`gain_${ch}`] ?? 1.0);
            effective[ch] = (c[`mute_${ch}`] ? 0 : fader);
        });

        // Crossfader: -1 (A) => favor drums+bass ; +1 (B) => favor chords+lead
        const x = Number(c.crossfader ?? 0);
        const aWeight = Math.max(0, 1 - Math.max(0, x));
        const bWeight = Math.max(0, 1 - Math.max(0, -x));

        // Apply crossfader with small bleed
        effective.drums *= aWeight + (1 - aWeight) * 0.1;
        effective.bass *= aWeight + (1 - aWeight) * 0.1;
        effective.chords *= bWeight + (1 - bWeight) * 0.1;
        effective.lead *= bWeight + (1 - bWeight) * 0.1;

        // Clamp to sensible ranges and incorporate master volume
        const master = Number(c.master_volume ?? 1.0);
        ['drums', 'bass', 'chords', 'lead'].forEach(ch => {
            let g = Number(effective[ch]);
            if (!Number.isFinite(g)) g = 0;
            g = Math.max(0, Math.min(2, g));
            effective[ch] = (g * master).toFixed(4);
        });

        // Build replacement map for placeholders
        let processed = code
            .replaceAll('<tempo_control>', String(c.tempo ?? 120))
            .replaceAll('<master_volume_control>', String(master.toFixed(4)))
            .replaceAll('<reverb_control>', String((Number(c.reverb) ?? 0.1).toFixed(3)))
            .replaceAll('<delay_send_control>', String((Number(c.delay_send) ?? 0.0).toFixed(3)))
            .replaceAll('<drum_pattern_control>', String(c.drum_pattern ?? 0))
            .replaceAll('<bassline_control>', String(c.bassline ?? 0))
            .replaceAll('<arpeggiator_control>', String(c.arpeggiator ?? 0))
            .replaceAll('<crossfader_control>', String((Number(c.crossfader) ?? 0).toFixed(3)));

        // Per-channel gains and mute insertion
        processed = processed
            .replaceAll('<gain_drums>', effective.drums)
            .replaceAll('<gain_bass>', effective.bass)
            .replaceAll('<gain_chords>', effective.chords)
            .replaceAll('<gain_lead>', effective.lead)
            .replaceAll('<mute_drums>', c.mute_drums ? '//' : '')
            .replaceAll('<mute_bass>', c.mute_bass ? '//' : '')
            .replaceAll('<mute_chords>', c.mute_chords ? '//' : '')
            .replaceAll('<mute_lead>', c.mute_lead ? '//' : '');

        // Toggle drums2 block
        processed = c.show_drums2
            ? processed.replace('// drums2: (disabled)\n', 'drums2:\n')
            : processed.replace(/drums2:([\s\S]*?)(?=\n\w+:|\n\/\/|\nall\()/g, '// drums2: (disabled)\n');

        // Send to repl
        strudelReplRef.current.setCode(processed);

        // If REPL exposes play(), call it so updates are heard instantly
        try {
            if (typeof strudelReplRef.current.play === 'function') {
                strudelReplRef.current.play();
            }
        } catch (err) {
            console.debug('REPL play() not available or failed:', err);
        }
    };

    const handlePlay = () => strudelReplRef.current?.evaluate();
    const handleStop = () => strudelReplRef.current?.stop();
    const handleProcAndPlay = () => {
        if (onPreprocess) onPreprocess();
        runPreprocessing(value, controls);
        handlePlay();
    };

    return (
        <div className="editor-container">
            {/* Playback Buttons */}
            <div className="d-flex gap-2 mb-3">
                <button onClick={handlePlay} className="btn btn-success flex-fill">Play</button>
                <button onClick={handleStop} className="btn btn-danger flex-fill">Stop</button>
                <button onClick={handleProcAndPlay} className="btn btn-primary flex-fill">Sync & Play</button>
            </div>
            <label htmlFor="proc-editor" className="form-label">Text to preprocess:</label>
            <textarea
                className="form-control"
                rows="15"
                id="proc-editor"
                value={value}
                onChange={onChange}
                style={{ fontFamily: "monospace" }}
            />
            <hr />
            <StrudelRepl ref={strudelReplRef} />
        </div>
    );
}

export default Editor;