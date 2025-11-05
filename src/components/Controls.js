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
        </div>
    );
}

export default Controls;