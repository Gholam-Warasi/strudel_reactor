import React, { useEffect, useRef, useState } from 'react';
import { Container, Row, Col, Button, Navbar, Nav, Form } from 'react-bootstrap';
import Controls from './components/Controls';
import Editor from './components/Editor';
import D3Graph from './components/D3Graph';
import console_monkey_patch, { subscribe, unsubscribe } from './console-monkey-patch';
import { jazzlike } from './tunes';
import FileManager from './components/FileManager';

export default function App() {
    const strudelReplRef = useRef(null);
    const fileInputRef = useRef(null);
    const [editorCode, setEditorCode] = useState(jazzlike);
    const [d3Data, setD3Data] = useState([]);
    const [loading, setLoading] = useState(false);

    const [controls, setControls] = useState({
        crossfader: 0,
        master_volume: 0.9,
        reverb: 0.15,
        delay_send: 0.12,
        tempo: 110,
        gain_drums: 1.0,
        gain_bass: 0.9,
        gain_chords: 0.8,
        gain_lead: 0.7,
        mute_drums: false, mute_bass: false, mute_chords: false, mute_lead: false,
        solo_drums: false, solo_bass: false, solo_chords: false, solo_lead: false,
        show_drums2: false,
    });

    useEffect(() => {
        const handleD3Data = (event) => setD3Data(event.detail);
        console_monkey_patch();
        subscribe('d3Data', handleD3Data);
        return () => unsubscribe('d3Data', handleD3Data);
    }, []);

    const triggerFileInput = () => fileInputRef.current?.click();

    const handleLoad = (e) => {
        const file = e?.target?.files?.[0];
        if (file)
            FileManager.load(file, setControls, setLoading, () => (e.target.value = null));
    };

    return (
        <div className="app-root" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar bg="light" expand="lg" className="shadow-sm mb-4">
                <Container fluid>
                    <Navbar.Brand href="#">Strudel Preprocessor</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Form className="d-flex align-items-center gap-2">
                            <Button variant="outline-secondary" size="sm" onClick={() => FileManager.save(controls)}>Save</Button>
                            <Button variant="outline-secondary" size="sm" onClick={triggerFileInput}>Load</Button>
                            <input ref={fileInputRef} type="file" accept="application/json" onChange={handleLoad} className="d-none" />
                        </Form>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container fluid>
                <Row>
                    {/* Left Column: D3 Graph (top) and Mixer Controls (bottom) */}
                    <Col lg={4} md={12} className="mb-3">
                        {/* D3 Graph - Top Left */}
                        <div className="card shadow-sm mb-3">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h5 className="card-title mb-0">Live Log Graph</h5>
                                    <small className="text-muted">Real-time</small>
                                </div>
                                <div style={{ height: 300 }}>
                                    <D3Graph data={d3Data} />
                                </div>
                            </div>
                        </div>

                        {/* Mixer Controls - Bottom Left */}
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h5 className="card-title mb-0">Mixer & Controls</h5>
                                    <small className="text-muted">Master</small>
                                </div>
                                <Controls
                                    controls={controls}
                                    setControls={setControls}
                                    onSave={() => FileManager.save(controls)}
                                    onLoad={handleLoad}
                                />
                            </div>
                        </div>
                    </Col>

                    {/* Right Column: Editors */}
                    <Col lg={8} md={12} className="mb-3">
                        {/* Strudel Code Editor - Top Right */}
                        <div className="card shadow-sm mb-3">
                            <div className="card-body d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="card-title mb-0">Strudel Code Editor</h5>
                                    <small className="text-muted">Live editing</small>
                                </div>

                                <div style={{ minHeight: 350 }}>
                                    <Editor
                                        value={editorCode}
                                        onChange={(e) => setEditorCode(e.target.value)}
                                        strudelReplRef={strudelReplRef}
                                        controls={controls}
                                    />
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>

                <footer className="text-center text-muted mt-4">
                    Built by Gholam {new Date().getFullYear()}
                </footer>
            </Container>
        </div>
    );
}