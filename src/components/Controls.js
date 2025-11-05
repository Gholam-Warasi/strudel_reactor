import React from 'react';

function Controls({ controls, setControls, onPlay, onStop, onProcAndPlay, onSave, onLoad }) {

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

            <hr />

            {/* Master Volume */}
            <div className="mb-3">
                <label htmlFor="master_volume" className="form-label">
                    Master Volume: {controls.master_volume}
                </label>
                <input
                    type="range"
                    className="form-range"
                    min="0"
                    max="1.5"
                    step="0.01"
                    id="master_volume"
                    name="master_volume"
                    value={controls.master_volume}
                    onChange={handleChange}
                />
            </div>

            {/* Reverb */}
            <div className="mb-3">
                <label htmlFor="reverb" className="form-label">
                    Reverb: {controls.reverb}
                </label>
                <input
                    type="range"
                    className="form-range"
                    min="0"
                    max="1"
                    step="0.01"
                    id="reverb"
                    name="reverb"
                    value={controls.reverb}
                    onChange={handleChange}
                />
            </div>

            {/* Enable Drums 2 */}
            <div className="form-check mb-3">
                <input
                    className="form-check-input"
                    type="checkbox"
                    id="show_drums2"
                    name="show_drums2"
                    checked={controls.show_drums2}
                    onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="show_drums2">
                    Enable Drums 2
                </label>
            </div>

            <hr />

            {/* Tempo */}
            <div className="mb-3">
                <label htmlFor="tempo" className="form-label">Tempo (BPM)</label>
                <input
                    type="number"
                    className="form-control"
                    id="tempo"
                    name="tempo"
                    value={controls.tempo}
                    onChange={handleChange}
                />
            </div>

            {/* Save/Load */}
            <div className="d-flex gap-2">
                <button onClick={onSave} className="btn btn-outline-primary">
                    Save Settings
                </button>
                <label className="btn btn-outline-secondary">
                    Load Settings
                    <input
                        type="file"
                        className="d-none"
                        accept=".json"
                        onChange={onLoad}
                    />
                </label>
            </div>
        </div>
    );
}

export default Controls;