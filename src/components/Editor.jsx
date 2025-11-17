import React, { useEffect, useRef, useCallback, useState } from 'react';
import StrudelRepl from './StrudelRepl';
import { Tab, Tabs, Button, ButtonGroup } from 'react-bootstrap';

function Editor({ value, onChange, strudelReplRef, controls, onPreprocess }) {
    const debounceTimer = useRef(null);
    const [activeTab, setActiveTab] = useState('source');

    // run preprocessing when controls or code changes
    useEffect(() => {
        // clear old timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // wait a bit before running
        debounceTimer.current = setTimeout(() => {
            processCode(value, controls);
        }, 120);

        // cleanup
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [value, controls]);

    function processCode(code, controlValues) {
        // make sure repl exists
        if (!strudelReplRef.current) {
            return;
        }
        if (typeof strudelReplRef.current.setCode !== 'function') {
            return;
        }

        const newControls = { ...controlValues };

        // FX controls mapping
        if (newControls.fx_x !== undefined) {
            newControls.delay_send = newControls.fx_x;
        } else {
            newControls.delay_send = 0.12;
        }

        if (newControls.fx_y !== undefined) {
            newControls.reverb = newControls.fx_y;
        } else {
            newControls.reverb = 0.15;
        }

        // make sure numbers are actually numbers
        const numericControls = ['master_volume', 'reverb', 'delay_send', 'crossfader', 'tempo'];
        for (let i = 0; i < numericControls.length; i++) {
            const key = numericControls[i];
            if (newControls[key] !== undefined) {
                const parsed = parseFloat(newControls[key]);
                if (!isNaN(parsed)) {
                    newControls[key] = parsed;
                }
            }
        }

        // handle solo buttons - if any channel is soloed, mute the others
        const channelNames = ['drums', 'bass', 'chords', 'lead'];
        const soloedChannels = [];

        for (let i = 0; i < channelNames.length; i++) {
            const channel = channelNames[i];
            if (newControls['solo_' + channel]) {
                soloedChannels.push(channel);
            }
        }

        if (soloedChannels.length > 0) {
            for (let i = 0; i < channelNames.length; i++) {
                const channel = channelNames[i];
                if (!soloedChannels.includes(channel)) {
                    newControls['mute_' + channel] = true;
                } else {
                    newControls['mute_' + channel] = false;
                }
            }
        }

        // calculate the actual volume for each channel
        const channelGains = {};

        for (let i = 0; i < channelNames.length; i++) {
            const channel = channelNames[i];
            const faderValue = newControls['gain_' + channel];
            let fader = 1.0;
            if (faderValue !== undefined) {
                fader = parseFloat(faderValue);
            }

            if (newControls['mute_' + channel]) {
                channelGains[channel] = 0;
            } else {
                channelGains[channel] = fader;
            }
        }

        // crossfader stuff
        const crossfaderValue = newControls.crossfader !== undefined ? newControls.crossfader : 0;

        // A side weight (drums and bass)
        let aSideWeight = 1 - Math.max(0, crossfaderValue);
        if (aSideWeight < 0) {
            aSideWeight = 0;
        }

        // B side weight (chords and lead)
        let bSideWeight = 1 - Math.max(0, -crossfaderValue);
        if (bSideWeight < 0) {
            bSideWeight = 0;
        }

        // apply crossfader with a little bit of bleed through
        channelGains.drums = channelGains.drums * (aSideWeight + (1 - aSideWeight) * 0.1);
        channelGains.bass = channelGains.bass * (aSideWeight + (1 - aSideWeight) * 0.1);
        channelGains.chords = channelGains.chords * (bSideWeight + (1 - bSideWeight) * 0.1);
        channelGains.lead = channelGains.lead * (bSideWeight + (1 - bSideWeight) * 0.1);

        // apply master volume and make sure values are reasonable
        const masterVolume = newControls.master_volume !== undefined ? newControls.master_volume : 1.0;

        for (let i = 0; i < channelNames.length; i++) {
            const channel = channelNames[i];
            let gain = channelGains[channel];

            // check if it's a valid number
            if (!isFinite(gain)) {
                gain = 0;
            }

            // clamp between 0 and 2
            if (gain < 0) {
                gain = 0;
            }
            if (gain > 2) {
                gain = 2;
            }

            // apply master volume
            gain = gain * masterVolume;

            channelGains[channel] = gain.toFixed(4);
        }

        // start replacing placeholders in the code
        let processedCode = code;

        // tempo
        const tempo = newControls.tempo !== undefined ? newControls.tempo : 120;
        processedCode = processedCode.replaceAll('<tempo_control>', String(tempo));

        // master volume
        processedCode = processedCode.replaceAll('<master_volume_control>', masterVolume.toFixed(4));

        // reverb
        const reverbValue = newControls.reverb !== undefined ? newControls.reverb : 0.1;
        processedCode = processedCode.replaceAll('<reverb_control>', reverbValue.toFixed(3));

        // delay
        const delayValue = newControls.delay_send !== undefined ? newControls.delay_send : 0.0;
        processedCode = processedCode.replaceAll('<delay_send_control>', delayValue.toFixed(3));

        // drum pattern
        const drumPattern = newControls.drum_pattern !== undefined ? newControls.drum_pattern : 0;
        processedCode = processedCode.replaceAll('<drum_pattern_control>', String(drumPattern));

        // bassline
        const bassline = newControls.bassline !== undefined ? newControls.bassline : 0;
        processedCode = processedCode.replaceAll('<bassline_control>', String(bassline));

        // arpeggiator
        const arpeggiator = newControls.arpeggiator !== undefined ? newControls.arpeggiator : 0;
        processedCode = processedCode.replaceAll('<arpeggiator_control>', String(arpeggiator));

        // crossfader
        processedCode = processedCode.replaceAll('<crossfader_control>', crossfaderValue.toFixed(3));

        // channel gains
        processedCode = processedCode.replaceAll('<gain_drums>', channelGains.drums);
        processedCode = processedCode.replaceAll('<gain_bass>', channelGains.bass);
        processedCode = processedCode.replaceAll('<gain_chords>', channelGains.chords);
        processedCode = processedCode.replaceAll('<gain_lead>', channelGains.lead);

        // mute comments
        processedCode = processedCode.replaceAll('<mute_drums>', newControls.mute_drums ? '//' : '');
        processedCode = processedCode.replaceAll('<mute_bass>', newControls.mute_bass ? '//' : '');
        processedCode = processedCode.replaceAll('<mute_chords>', newControls.mute_chords ? '//' : '');
        processedCode = processedCode.replaceAll('<mute_lead>', newControls.mute_lead ? '//' : '');

        // drums2 toggle
        if (newControls.show_drums2) {
            processedCode = processedCode.replace('// drums2: (disabled)\n', 'drums2:\n');
        } else {
            processedCode = processedCode.replace(/drums2:([\s\S]*?)(?=\n\w+:|\n\/\/|\nall\(|$)/g, '// drums2: (disabled)\n');
        }

        // send the processed code to the repl
        strudelReplRef.current.setCode(processedCode);

        // try to auto-play
        try {
            if (strudelReplRef.current.play && typeof strudelReplRef.current.play === 'function') {
                strudelReplRef.current.play();
            }
        } catch (error) {
            // ignore errors
        }
    }

    function handlePlay() {
        if (strudelReplRef.current && strudelReplRef.current.evaluate) {
            strudelReplRef.current.evaluate();
        }
    }

    function handleStop() {
        if (strudelReplRef.current && strudelReplRef.current.stop) {
            strudelReplRef.current.stop();
        }
    }

    function handleProcAndPlay() {
        if (onPreprocess) {
            onPreprocess();
        }
        processCode(value, controls);
        handlePlay();
    }

    return (
        <div className="editor-container">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Code Editor</h5>
                <ButtonGroup>
                    <Button onClick={handleStop} variant="outline-danger">Stop</Button>
                    <Button onClick={handlePlay} variant="outline-primary">Play</Button>
                    <Button onClick={handleProcAndPlay} variant="success">Sync & Play</Button>
                </ButtonGroup>
            </div>

            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} id="editor-tabs" className="mb-0">
                <Tab eventKey="source" title="Source">
                    <textarea
                        className="form-control"
                        rows="20" 
                        id="proc-editor"
                        value={value}
                        onChange={onChange}
                        style={{
                            fontFamily: "monospace",
                            borderTopLeftRadius: 0, 
                            borderTopRightRadius: 0,
                            height: '60vh'
                        }}
                        placeholder="Type your strudel code here... (e.g., s('bd hh'))"
                    />
                </Tab>
                <Tab eventKey="processed" title="Processed Output">
                    <div style={{
                        border: '1px solid #495057',
                        borderTop: 'none',
                        height: '60vh',
                        padding: '10px',
                        borderRadius: '0 0 .375rem .375rem'
                    }}>
                        <StrudelRepl ref={strudelReplRef} />
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
}

export default Editor;