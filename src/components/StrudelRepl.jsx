import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { StrudelMirror } from '@strudel/codemirror';
import { evalScope } from '@strudel/core';
import { drawPianoroll } from '@strudel/draw';
import { initAudioOnFirstClick, getAudioContext, webaudioOutput, registerSynthSounds } from '@strudel/webaudio';
import { registerSoundfonts } from '@strudel/soundfonts';
import { transpiler } from '@strudel/transpiler';

const StrudelRepl = forwardRef((props, ref) => {
    const editorRef = useRef(null);
    const pianoRollCanvasRef = useRef(null);

    // Expose playback controls to parent
    useImperativeHandle(ref, () => ({
        setCode: (code) => editorRef.current?.setCode(code),
        evaluate: () => editorRef.current?.evaluate(),
        stop: () => editorRef.current?.stop()
    }));

    useEffect(() => {
        const canvas = pianoRollCanvasRef.current;
        if (!canvas) return;

        // Double canvas size for sharper rendering
        canvas.width *= 2;
        canvas.height *= 2;

        const canvasContext = canvas.getContext('2d');
        const visualTimeWindow = [-2, 2]; // Show 2 seconds before and after

        // Initialize the code editor and audio engine
        editorRef.current = new StrudelMirror({
            defaultOutput: webaudioOutput,
            getTime: () => getAudioContext().currentTime,
            transpiler,
            root: document.getElementById('strudel-editor'),
            drawTime: visualTimeWindow,
            onDraw: (events, currentTime) => {
                drawPianoroll({
                    haps: events,
                    time: currentTime,
                    ctx: canvasContext,
                    drawTime: visualTimeWindow,
                    fold: 0
                });
            },
            prebake: async () => {
                initAudioOnFirstClick();
                await Promise.all([
                    evalScope(
                        import('@strudel/core'),
                        import('@strudel/draw'),
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
            <canvas ref={pianoRollCanvasRef} id="piano-roll" className="w-100" />
        </div>
    );
});

StrudelRepl.displayName = 'StrudelRepl';
export default StrudelRepl;