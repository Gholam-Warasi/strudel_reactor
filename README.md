# Strudel Music Preprocessor

This project is a React-based interface for the Strudel live-coding music engine. It allows users to manipulate algorithmic music patterns using a visual mixer interface, real-time D3.js visualizations, and code injection.

## Controls Description

### Mixer & Audio Controls
* **Master Volume:** specific global gain applied to the final audio output.
* **Tempo:** Controls the speed of the playback (BPM).
* **Crossfader:** A DJ-style crossfader that groups instruments into two "decks".
    * *Left (-1)*: Maximizes Drums and Bass.
    * *Right (+1)*: Maximizes Chords and Lead.
    * *Center (0)*: Plays all channels equally.
* **Channel Faders (Drums, Bass, Chords, Lead):** Individual volume sliders for specific instrument groups.
* **Mute/Solo:**
    * *Mute*: Silences the specific channel.
    * *Solo*: Isolates the specific channel and automatically mutes all others.
* **Drum Pattern:** A dropdown to select between 3 distinct rhythmic algorithms (Base, Lower, Higher density).
* **Show Second Drum Layer:** A toggle switch that injects a secondary block (`drums2`) into the code.

### File & Preset Management
* **Save Preset:** Downloads the current state of all sliders, knobs, and switches as a JSON file (`strudel_settings.json`).
* **Load Preset:** Allows the user to upload a previously saved JSON file to restore a specific mix state.

### Visuals
* **Levels Graph:** A D3.js bar chart that visualizes the "Activity/Gain" of the four main channels (Drums, Bass, Chords, Lead) in real-time.

## Quirks and Usage Guidelines

1.  **Audio Initialization:** You may need to click the document once to initialize the Web Audio API before sound occurs.
2.  **Visualizer Latency:** The D3 Graph works by "monkey-patching" (intercepting) the browser's `console.log` output from the Strudel engine. Because it relies on parsing text logs for gain values, there may be slight latency or smoothing applied to the visual bars compared to the audio.
3.  **Crossfader Logic:** The crossfader is not a simple volume pan; it mathematically weights the gain of the "A-Side" instruments vs the "B-Side" instruments.
4.  **Code Editing:** While you can type manually in the "Source" tab, moving any slider in the GUI will overwrite manual changes made to variables (like `<tempo_control>`) with the GUI values.

## Demonstration Video

https://mymailunisaedu-my.sharepoint.com/:v:/g/personal/warga002_mymail_unisa_edu_au/IQCOeVSmjfQZRrCbyvv9iMZ5AXEt5XJ5KclmZ7w6gXd_ztw?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=eDKd62

## Song Code Attribution

The base code used in `src/tunes.js` is a "jazzlike" progression.
* **Source:** Adapted from the Strudel Bakery / Felix Roos.
* **Attribution:** The code includes the comment `// Based on the style of Felix Roos (CC BY-NC-SA 4.0)`.
