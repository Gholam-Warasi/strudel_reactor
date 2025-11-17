import React from 'react';
import { Row, Col, Button, ButtonGroup, Form } from 'react-bootstrap';

function Controls({ controls, setControls, onSave, onLoad }) {
    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        if (type === 'checkbox') return setControls(prev => ({ ...prev, [name]: checked }));

        // try parse number, otherwise keep string
        const maybeNum = Number(value);
        setControls(prev => ({ ...prev, [name]: Number.isNaN(maybeNum) ? value : maybeNum }));
    };

    // toggle solo: if enabling a solo, turn others off
    const toggleSolo = (channel) => {
        setControls(prev => ({
            ...prev,
            solo_drums: channel === 'drums' ? !prev.solo_drums : false,
            solo_bass: channel === 'bass' ? !prev.solo_bass : false,
            solo_chords: channel === 'chords' ? !prev.solo_chords : false,
            solo_lead: channel === 'lead' ? !prev.solo_lead : false,
        }));
    };

    const channels = ['drums', 'bass', 'chords', 'lead'];

    return (
        <div className="mixer-controls">
            {/* Master Controls */}
            <h5>Master</h5>
            <Row className="mb-3">
                <Col>
                    <label className="form-label">Master Vol</label>
                    <input type="range" name="master_volume" min={0} max={1.5} step={0.01}
                        value={controls.master_volume} onChange={handleChange} className="form-range" />
                    <div className="text-center small">{controls.master_volume.toFixed(2)}</div>
                </Col>
                <Col>
                    <label className="form-label">Tempo</label>
                    <input type="number" name="tempo" min={40} max={240} value={controls.tempo}
                        onChange={handleChange} className="form-control form-control-sm" />
                </Col>
            </Row>

            <label className="form-label">Crossfader: {controls.crossfader.toFixed(2)}</label>
            <input type="range" name="crossfader" className="form-range"
                min={-1} max={1} step={0.01} value={controls.crossfader}
                onChange={handleChange} />
            <hr />

            <h5>Channels</h5>
            <Row className="text-center g-2">
                {channels.map(ch => (
                    <Col key={ch}>
                        <strong>{ch.charAt(0).toUpperCase() + ch.slice(1)}</strong>

                        <div className="fader-container my-2">
                            <input
                                type="range" name={`gain_${ch}`} min={0} max={1.5} step={0.01}
                                value={controls[`gain_${ch}`]} onChange={handleChange}
                            />
                        </div>
                        <div className="small mb-2">{controls[`gain_${ch}`].toFixed(2)}</div>

                        {/* Mute/Solo Buttons */}
                        <ButtonGroup size="sm" vertical className="d-block">
                            <Button
                                variant={controls[`solo_${ch}`] ? 'warning' : 'outline-warning'}
                                onClick={() => toggleSolo(ch)}
                            >Solo</Button>
                            <Button
                                variant={controls[`mute_${ch}`] ? 'danger' : 'outline-secondary'}
                                onClick={() => setControls(prev => ({ ...prev, [`mute_${ch}`]: !prev[`mute_${ch}`] }))}
                            >Mute</Button>
                        </ButtonGroup>
                    </Col>
                ))}
            </Row>

            <hr />
           
            <h5>Patterns & FX</h5>
            <div className="mb-3">
                <label className="form-label">Drum Pattern</label>
                <Form.Select name="drum_pattern" value={controls.drum_pattern} onChange={handleChange}>
                    <option value={0}>Base</option>
                    <option value={1}>Lower</option>
                    <option value={2}>Higher</option>
                </Form.Select>
            </div>
            <div className="form-check form-switch mb-3">
                <input className="form-check-input" type="checkbox" id="showDrums2" name="show_drums2" checked={controls.show_drums2} onChange={handleChange} />
                <label className="form-check-label" htmlFor="showDrums2">Show second drum layer</label>
            </div>
        </div>
    );
}
export default Controls;