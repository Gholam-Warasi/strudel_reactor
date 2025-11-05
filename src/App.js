import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import { jazzlike } from './tunes';
import console_monkey_patch, { subscribe, unsubscribe } from './console-monkey-patch';
import Controls from './components/Controls';
import Editor from './components/Editor';
import D3Graph from './components/D3Graph';

export default function App() {
    const strudelReplRef = useRef(null);
    const [editorCode, setEditorCode] = useState(jazzlike);
    const [d3Data, setD3Data] = useState([]);

    const [controls, setControls] = useState({
        // mixer / tracks
        crossfader: 0,
        master_volume: 0.9,
        reverb: 0.15,
        delay_send: 0.12,
        tempo: 110,
        drum_pattern: 0,
        bassline: 0,
        arpeggiator: 0,
        show_drums2: false,
        fx_x: 0.12,
        fx_y: 0.15,

        // per-channel faders
        gain_drums: 1.0,
        gain_bass: 0.9,
        gain_chords: 0.8,
        gain_lead: 0.7,

        // mute/solo flags
        mute_drums: false, mute_bass: false, mute_chords: false, mute_lead: false,
        solo_drums: false, solo_bass: false, solo_chords: false, solo_lead: false,

    });

    useEffect(() => {
        const handleD3Data = (event) => setD3Data(event.detail);

        console_monkey_patch();
        subscribe('d3Data', handleD3Data);

        return () => unsubscribe('d3Data', handleD3Data);
    }, []);

    const handleSave = () => {
        const json = JSON.stringify(controls);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'strudel_settings.json';
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleLoad = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const loadedControls = JSON.parse(event.target.result);
                setControls(prev => ({
                    ...prev,
                    ...Object.fromEntries(Object.entries(loadedControls).map(([k, v]) => {
                        const numericKeys = [
                            'master_volume', 'tempo', 'reverb', 'delay_send', 'crossfader',
                            'gain_drums', 'gain_bass', 'gain_chords', 'gain_lead'
                        ];
                        if (numericKeys.includes(k)) {
                            const parsed = parseFloat(v);
                            return [k, Number.isNaN(parsed) ? v : parsed];
                        }
                        return [k, v];
                    }))
                }));
            } catch (error) {
                console.error("Failed to parse JSON:", error);
                alert("Error: Could not load settings file.");
            }
        };
        reader.readAsText(file);
        e.target.value = null;
    };

    return (
        <div className="App">
            <Container fluid className="p-3">
                <h2 className="text-center mb-4">Strudel Preprocessor</h2>
                <Row>
                    <Col md={7}>
                        <Editor
                            value={editorCode}
                            onChange={(e) => setEditorCode(e.target.value)}
                            strudelReplRef={strudelReplRef}
                            controls={controls}
                        />
                    </Col>

                    <Col md={5}>
                        <Controls
                            controls={controls}
                            setControls={setControls}
                            onSave={handleSave}
                            onLoad={handleLoad}
                        />
                        <hr />
                        <div className="p-3 border rounded">
                            <h4>Live Log Graph</h4>
                            <D3Graph data={d3Data} />
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}