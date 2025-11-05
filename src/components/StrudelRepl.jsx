import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { StrudelMirror } from '@strudel/codemirror';
import { evalScope } from '@strudel/core';
import { initAudioOnFirstClick, getAudioContext, webaudioOutput, registerSynthSounds } from '@strudel/webaudio';
import { registerSoundfonts } from '@strudel/soundfonts';
import { transpiler } from '@strudel/transpiler';

const StrudelRepl = forwardRef((props, ref) => {
    const editorRef = useRef(null);
    // Expose playback controls to parent
    useImperativeHandle(ref, () => ({
        setCode: (code) => editorRef.current?.setCode(code),
        evaluate: () => editorRef.current?.evaluate(),
        stop: () => editorRef.current?.stop()
    }));

    useEffect(() => {
        
        editorRef.current = new StrudelMirror({
            defaultOutput: webaudioOutput,
            getTime: () => getAudioContext().currentTime,
            transpiler,
            root: document.getElementById('strudel-editor'),
         
            prebake: async () => {
                initAudioOnFirstClick();
                await Promise.all([
                    evalScope(
                        import('@strudel/core'),
                        import('@strudel/mini'),
                        import('@strudel/tonal'),
                        import('@strudel/webaudio')
                    ),
                    registerSynthSounds(),
                    registerSoundfonts()
                ]);
            }
        });
    }, []);

    return (
        <div className="repl-container mt-3">
            <label className="form-label">Strudel Code Editor:</label>
            <div id="strudel-editor" style={{ maxHeight: '50vh', overflowY: 'auto' }} />
            <div id="output" />
        </div>
    );
});

StrudelRepl.displayName = 'StrudelRepl';
export default StrudelRepl;