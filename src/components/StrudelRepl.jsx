import React from 'react';
function StrudelRepl() {
    return (
        <div className="repl-container mt-3">
            <label className="form-label">Strudel REPL (Processed Output):</label>
            {/* The StrudelMirror instance will attach itself here */}
            <div id="strudel-repl-editor" style={{ maxHeight: '50vh', overflowY: 'auto' }} />
            <div id="output" />
            {/* Note: The <canvas> for pianoroll is omitted for brevity */}
        </div>
    );
}

export default StrudelRepl;