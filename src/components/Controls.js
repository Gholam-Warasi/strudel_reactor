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
        </div>
    );
}

export default Controls;