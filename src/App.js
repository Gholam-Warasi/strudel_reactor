import React, { useEffect, useRef, useState } from 'react';
import { Container, Row, Col, Button, Navbar, Nav, Form, Tab, Tabs } from 'react-bootstrap';
import Controls from './components/Controls';
import Editor from './components/Editor';
import D3Graph from './components/D3Graph';
import console_monkey_patch, { subscribe, unsubscribe } from './console-monkey-patch';
import { jazzlike } from './tunes';
import FileManager from './components/FileManager';

export default function App() {
    // References to access DOM elements or components directly
    const strudelReplRef = useRef(null); 
    const fileInputRef = useRef(null);   

    // State variables
    const [editorCode, setEditorCode] = useState(jazzlike); 
    const [d3Data, setD3Data] = useState([]);               
    const [loading, setLoading] = useState(false);          
    const [leftTabKey, setLeftTabKey] = useState('mixer');  

    // Mixer/control settings
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

    // Effect runs once on mount to initialize console patching and D3 event subscription
    useEffect(() => {
        const handleD3Data = (event) => setD3Data(event.detail); 
        console_monkey_patch(); 
        subscribe('d3Data', handleD3Data); 
        return () => unsubscribe('d3Data', handleD3Data); 
    }, []);

    // Trigger click on hidden file input
    const triggerFileInput = () => fileInputRef.current?.click();

    // Handle file selection and load settings
    const handleLoad = (e) => {
        const file = e?.target?.files?.[0];
        if (file)
            FileManager.load(file, setControls, setLoading, () => (e.target.value = null));
    };

    return (
        <div className="app-root">
            {/* Top Navbar */}
            <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm mb-4">
                <Container fluid>
                    <Navbar.Brand href="#">Strudel Preprocessor</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                            <Form className="d-flex align-items-center gap-2">
                                {/* Save preset button */}
                                <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => FileManager.save(controls)}
                                >
                                    Save Preset
                                </Button>

                                {/* Load preset button */}
                                <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={triggerFileInput}
                                >
                                    Load Preset
                                </Button>

                                {/* Hidden file input for loading JSON presets */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="application/json"
                                    onChange={handleLoad}
                                    className="d-none"
                                />
                            </Form>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Main content area */}
            <Container fluid>
                <Row>
                    {/* Left Column: Tabbed Controls and D3 graph */}
                    <Col lg={4} md={12} className="mb-3">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <Tabs
                                    activeKey={leftTabKey}
                                    onSelect={(k) => setLeftTabKey(k)}
                                    id="control-tabs"
                                    className="mb-3"
                                    fill
                                >
                                    {/* Mixer controls tab */}
                                    <Tab eventKey="mixer" title="Mixer">
                                        <Controls
                                            controls={controls}
                                            setControls={setControls}
                                        />
                                    </Tab>

                                    {/* D3 levels graph tab */}
                                    <Tab eventKey="graph" title="Levels">
                                        <div style={{ height: 400, paddingTop: '20px' }}>
                                            <D3Graph data={d3Data} />
                                        </div>
                                    </Tab>
                                </Tabs>
                            </div>
                        </div>
                    </Col>

                    {/* Right Column: Code editor */}
                    <Col lg={8} md={12} className="mb-3">
                        <div className="card shadow-sm">
                            <div className="card-body d-flex flex-column">
                                <Editor
                                    value={editorCode}
                                    onChange={(e) => setEditorCode(e.target.value)}
                                    strudelReplRef={strudelReplRef}
                                    controls={controls}
                                />
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
