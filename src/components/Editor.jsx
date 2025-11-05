import React from 'react';
import StrudelRepl from './StrudelRepl';

function Editor({ value, onChange, strudelReplRef, controls, onPreprocess }) {

    const handlePlay = () => strudelReplRef.current?.evaluate();
    const handleStop = () => strudelReplRef.current?.stop();
    const handleProcAndPlay = () => {
        onPreprocess();
        handlePlay();
    };

    return (
        <div className="editor-container">
            {/* Playback Buttons */}
            <div className="d-flex gap-2 mb-3">
                <button onClick={handlePlay} className="btn btn-success flex-fill">Play</button>
                <button onClick={handleStop} className="btn btn-danger flex-fill">Stop</button>
                <button onClick={handleProcAndPlay} className="btn btn-primary flex-fill">Sync & Play</button>
            </div>

            <label htmlFor="proc-editor" className="form-label">Text to preprocess:</label>
            <textarea
                className="form-control"
                rows="15"
                id="proc-editor"
                value={value}
                onChange={onChange}
                style={{ fontFamily: "monospace" }}
            />
            <hr />
            <StrudelRepl ref={strudelReplRef} />
        </div>
    );
}

export default Editor;