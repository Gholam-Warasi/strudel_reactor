import React from 'react';

function Editor({ value, onChange }) {
    return (
        <div className="editor-container">
            <label htmlFor="proc-editor" className="form-label">Text to preprocess:</label>
            <textarea
                className="form-control"
                rows="15"
                id="proc-editor"
                value={value}
                onChange={onChange}
                style={{ fontFamily: "monospace" }}
            >
            </textarea>
        </div>
    );
}

export default Editor; 