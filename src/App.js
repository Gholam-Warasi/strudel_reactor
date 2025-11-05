import React, { useEffect, useRef, useState } from 'react';
import { Container, Row, Col, Button, Navbar, Nav, Form } from 'react-bootstrap';
import Controls from './components/Controls';
import Editor from './components/Editor';
import D3Graph from './components/D3Graph';
import console_monkey_patch, { subscribe, unsubscribe } from './console-monkey-patch';
import { jazzlike } from './tunes';

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
    });

    useEffect(() => {
        const handleD3Data = (event) => setD3Data(event.detail);
        console_monkey_patch();
        subscribe('d3Data', handleD3Data);
        return () => unsubscribe('d3Data', handleD3Data);
    }, []);

    const handleSave = () => {
        try {
            const json = JSON.stringify(controls, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'strudel_settings.json';
            link.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Save failed', err);
            alert('Error saving settings. See console for details.');
        }
    };

    const handleLoad = (e) => {
        const file = e?.target?.files?.[0];
        if (!file) return;
        setLoading(true);
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
                console.error('Failed to parse JSON:', error);
                alert('Error: Could not load settings file. Is it valid JSON?');
            } finally {
                setLoading(false);
                e.target.value = null;
            }
        };
        reader.readAsText(file);
    };

    const triggerFileInput = () => fileInputRef.current?.click();

    return (
        <div className="app-root" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar bg="light" expand="lg" className="shadow-sm mb-4">
                <Container>
                    <Navbar.Brand href="#">Strudel Preprocessor</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="#">Editor</Nav.Link>
                            <Nav.Link href="#">Mixer</Nav.Link>
                            <Nav.Link href="#">Visualizer</Nav.Link>
                        </Nav>
                        <Form className="d-flex align-items-center gap-2">
                            <Button variant="outline-secondary" size="sm" onClick={handleSave}>Save</Button>
                            <Button variant="outline-secondary" size="sm" onClick={triggerFileInput}>Load</Button>
                            <input ref={fileInputRef} type="file" accept="application/json" onChange={handleLoad} className="d-none" />
                        </Form>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container fluid>
                <Row>
                    <Col lg={8} md={12} className="mb-4">
                        <div className="card h-100 shadow-sm">
                            <div className="card-body d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="card-title mb-0">Editor</h5>
                                    <small className="text-muted">Live editing</small>
                                </div>

                                <div style={{ flexGrow: 1, minHeight: 320 }}>
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

                    <Col lg={4} md={12} className="mb-4">
                        <div className="card shadow-sm mb-3">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h5 className="card-title mb-0">Mixer & Controls</h5>
                                    <small className="text-muted">Master</small>
                                </div>
                                <Controls
                                    controls={controls}
                                    setControls={setControls}
                                    onSave={handleSave}
                                    onLoad={(e) => handleLoad(e)}
                                />
                            </div>
                        </div>

                        <div className="card shadow-sm">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h5 className="card-title mb-0">Live Log Graph</h5>
                                    <small className="text-muted">Real-time</small>
                                </div>
                                <div style={{ height: 220 }}>
                                    <D3Graph data={d3Data} />
                                </div>
                            </div>
                        </div>

                    </Col>
                </Row>

                <Row>
                    <Col>
                        <div className="card shadow-sm mt-3">
                            <div className="card-body small text-muted">
                                <strong>Quick Tips:</strong>
                                <ul className="mb-0 ms-3">
                                    <li>Use the crossfader to smoothly blend instruments.</li>
                                    <li>Adjust reverb and delay to create ambience.</li>
                                    <li>Save presets to re-use favourite mixes.</li>
                                </ul>
                            </div>
                        </div>
                    </Col>
                </Row>

                <footer className="text-center text-muted mt-4">Built by Gholam {new Date().getFullYear()}</footer>
            </Container>
        </div>
    );
}
