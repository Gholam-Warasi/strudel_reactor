import React from 'react';

function Controls({ controls, setControls, onPlay, onStop, onProcAndPlay }) {

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setControls({
            ...controls,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    return (
        <div className="p-3 border rounded">
            <h4>Controls</h4>

            {/* Buttons */}
            <div className="d-flex gap-2 mb-3">
                <button onClick={onPlay} className="btn btn-success flex-fill">Play</button>
                <button onClick={onStop} className="btn btn-danger flex-fill">Stop</button>
                <button onClick={onProcAndPlay} className="btn btn-primary flex-fill">Sync & Play</button>
            </div>

            <hr />

            {/* Radio Instrument */}
            <div className="mb-3">
                <label className="form-label fw-bold">P1 Instrument</label>
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="radio"
                        name="p1"
                        id="p1-on"
                        value="on"
                        checked={controls.p1 === 'on'}
                        onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="p1-on">ON</label>
                </div>
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="radio"
                        name="p1"
                        id="p1-hush"
                        value="hush"
                        checked={controls.p1 === 'hush'}
                        onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="p1-hush">HUSH</label>
                </div>
            </div>

            {/* Bassline */}
            <div className="mb-3">
                <label htmlFor="basslines" className="form-label">Bassline</label>
                <select
                    className="form-select"
                    id="basslines"
                    name="basslines"
                    value={controls.basslines}
                    onChange={handleChange}
                >
                    <option value="0">Bassline 1</option>
                    <option value="1">Bassline 2</option>
                </select>
            </div>

            {/* Arpeggiator */}
            <div className="mb-3">
                <label htmlFor="arpeggiators" className="form-label">Arpeggiator</label>
                <select
                    className="form-select"
                    id="arpeggiators"
                    name="arpeggiators"
                    value={controls.arpeggiators}
                    onChange={handleChange}
                >
                    <option value="0">Arp Pattern 1</option>
                    <option value="1">Arp Pattern 2</option>
                </select>
            </div>

            {/* Drum Pattern */}
            <div className="mb-3">
                <label htmlFor="drum_pattern" className="form-label">Drum Pattern</label>
                <select
                    className="form-select"
                    id="drum_pattern"
                    name="drum_pattern"
                    value={controls.drum_pattern}
                    onChange={handleChange}
                >
                    <option value="0">Pattern 1 (Quiet)</option>
                    <option value="1">Pattern 2 (Buildup)</option>
                    <option value="2">Pattern 3 (Full)</option>
                </select>
            </div>

        </div>
    );
}

export default Controls;