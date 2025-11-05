import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import { stranger_tune } from './tunes';
import console_monkey_patch, { subscribe, unsubscribe } from './console-monkey-patch';
import Controls from './components/Controls';
import Editor from './components/Editor';
import StrudelRepl from './components/StrudelRepl';
import D3Graph from './components/D3Graph';

export default function App() {
    const strudelReplRef = useRef(null);
    const [editorCode, setEditorCode] = useState(stranger_tune);
    const [controls, setControls] = useState({
        p1: 'on',
        basslines: '0',
        arpeggiators: '0',
        master_volume: '0.8',
        show_drums2: false,
        tempo: '120',
        drum_pattern: '0',
        reverb: '0.1'
    });

    // Process code with control values
    const runPreprocessing = (code, controlValues) => {
        if (!strudelReplRef.current) return;

        let processed = code
            .replaceAll('<p1_Radio>', controlValues.p1 === 'hush' ? '_' : '')
            .replaceAll('<bassline_control>', controlValues.basslines)
            .replaceAll('<arpeggiator_control>', controlValues.arpeggiators)
            .replaceAll('<master_volume_control>', controlValues.master_volume)
            .replaceAll('<tempo_control>', controlValues.tempo)
            .replaceAll('<drum_pattern_control>', controlValues.drum_pattern)
            .replaceAll('<reverb_control>', controlValues.reverb);

        // Handle drums2 visibility
        processed = controlValues.show_drums2
            ? processed.replace('// drums2: (disabled)\n', 'drums2:\n')
            : processed.replace(/drums2:([\s\S]*?)(?=\n\w+:|\n\/\/|\nall\()/g, '// drums2: (disabled)\n');

        strudelReplRef.current.setCode(processed);
    };

    // Playback controls
    const handlePlay = () => strudelReplRef.current?.evaluate();
    const handleStop = () => strudelReplRef.current?.stop();
    const handleProcAndPlay = () => {
        runPreprocessing(editorCode, controls);
        handlePlay();
    };

    // Save settings to JSON file
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

    // Load settings from JSON file
    const handleLoad = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const loadedControls = JSON.parse(event.target.result);
                setControls(loadedControls);
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
                        <Editor value={editorCode} onChange={(e) => setEditorCode(e.target.value)} />
                        <hr />
                        <StrudelRepl ref={strudelReplRef} />
                    </Col>

                    <Col md={5}>
                        <Controls
                            controls={controls}
                            setControls={setControls}
                            onPlay={handlePlay}
                            onStop={handleStop}
                            onProcAndPlay={handleProcAndPlay}
                            onSave={handleSave}
                            onLoad={handleLoad}
                        />
                        <hr />
                        <div className="p-3 border rounded">
                            <h4>Live Log Graph</h4>
                            />
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}