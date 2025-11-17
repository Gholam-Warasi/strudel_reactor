import { control } from '@strudel/core';
import React from 'react';

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
        <div className="p-3 border rounded">
            <h4>Mixer Controls</h4>

            <div className="mb-3">
                <label className="form-label">Crossfader: {controls.crossfader.toFixed(2)}</label>
                <input
                    type="range" name="crossfader" className="form-range"
                    min={-1} max={1} step={0.01} value={controls.crossfader}
                    onChange={handleChange}
                />
            </div>

            <div className="mb-3 d-flex align-items-center gap-2">
                <label className="form-label mb-0">Master Volume</label>
                <input type="range" name="master_volume" min={0} max={1.5} step={0.01}
                    value={controls.master_volume} onChange={handleChange} className="form-range" />
                <div className="ms-2">{controls.master_volume.toFixed(2)}</div>
            </div>

            <div className="mb-3">
                <label className="form-label">Tempo (BPM)</label>
                <input type="number" name="tempo" min={40} max={240} value={controls.tempo}
                    onChange={handleChange} className="form-control" />
            </div>

            <hr />

            {channels.map(ch => (
                <div key={ch} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <strong>{ch.charAt(0).toUpperCase() + ch.slice(1)}</strong>
                        <div>
                            <button
                                type="button"
                                className={`btn btn-sm me-1 ${controls[`mute_${ch}`] ? 'btn-danger' : 'btn-outline-secondary'}`}
                                onClick={() => setControls(prev => ({ ...prev, [`mute_${ch}`]: !prev[`mute_${ch}`] }))}
                            >{controls[`mute_${ch}`] ? 'Muted' : 'Mute'}</button>

                            <button
                                type="button"
                                className={`btn btn-sm ${controls[`solo_${ch}`] ? 'btn-warning' : 'btn-outline-secondary'}`}
                                onClick={() => toggleSolo(ch)}
                            >Solo</button>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-3 mt-2">
                        <input
                            type="range" name={`gain_${ch}`} min={0} max={1.5} step={0.01}
                            value={controls[`gain_${ch}`]} onChange={handleChange} className="form-range"
                        />
                        <div style={{ width: 48 }}>{controls[`gain_${ch}`].toFixed(2)}</div>
                    </div>
                </div>
            ))}

            <hr />

            <div className="mb-3">
                <label className="form-label">Drum Pattern</label>
                <select name="drum_pattern" className="form-select" value={controls.drum_pattern} onChange={handleChange}>
                    <option value={0}>Pattern A</option>
                    <option value={1}>Pattern B</option>
                    <option value={2}>Pattern C</option>
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">FX: Delay (X) / Reverb (Y)</label>
                <div className="d-flex gap-2 align-items-center">
                    <input type="range" name="fx_x" min={0} max={1} step={0.01} value={controls.fx_x} onChange={handleChange} className="form-range" />
                    <input type="range" name="fx_y" min={0} max={1} step={0.01} value={controls.fx_y} onChange={handleChange} className="form-range" />
                </div>
            </div>

            <div className="form-check form-switch mb-3">
                <input className="form-check-input" type="checkbox" id="showDrums2" name="show_drums2" checked={controls.show_drums2} onChange={handleChange} />
                <label className="form-check-label" htmlFor="showDrums2">Show second drum layer</label>
            </div>
        </div>
    );
}
export default Controls;