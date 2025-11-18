function FileManager() { }

// Save settings to a JSON file
FileManager.save = function (controls) {
    try {
        // Convert the controls object into a pretty-printed JSON string
        const json = JSON.stringify(controls, null, 2);

        const blob = new Blob([json], { type: 'application/json' });

        // Generate a temporary URL pointing to the Blob
        const url = URL.createObjectURL(blob);

        // Create a temporary <a> element to trigger the download
        const link = document.createElement('a');
        link.href = url;
        link.download = 'strudel_settings.json'; 
        document.body.appendChild(link);

        // Programmatically click the link to start download
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
        console.error('Save failed', err);
        alert('Error saving settings. See console for details.');
    }
};

// Load settings from a JSON file
FileManager.load = function (file, setControls, setLoading, resetFileInput) {
    if (!file) return; // Exit if no file is provided

    if (typeof setLoading === 'function') setLoading(true);

    const reader = new FileReader(); // FileReader to read file contents

    // Event handler when file is successfully read
    reader.onload = (event) => {
        try {
            const text = event?.target?.result ?? reader.result;
            const loadedControls = JSON.parse(text);

            // Keys that should be converted to numbers
            const numericKeys = new Set([
                'master_volume', 'tempo', 'reverb', 'delay_send', 'crossfader',
                'gain_drums', 'gain_bass', 'gain_chords', 'gain_lead'
            ]);

            // Convert numeric string values to actual numbers
            const normalized = Object.fromEntries(
                Object.entries(loadedControls).map(([k, v]) => {
                    if (numericKeys.has(k)) {
                        const parsed = parseFloat(v);
                        return [k, Number.isNaN(parsed) ? v : parsed]; // Keep original if parse fails
                    }
                    return [k, v];
                })
            );

            // Merge loaded controls with existing state
            setControls(prev => ({ ...prev, ...normalized }));
        } catch (error) {
            console.error('Failed to parse JSON:', error);
            alert('Error: Could not load settings file. Is it valid JSON?');
        } finally {
            // Reset loading state and file input
            if (typeof setLoading === 'function') setLoading(false);
            if (typeof resetFileInput === 'function') resetFileInput();
        }
    };

    // Event handler for file read errors
    reader.onerror = (err) => {
        console.error('File read error:', err);
        if (typeof setLoading === 'function') setLoading(false);
        alert('Error reading the file. See console for details.');
        if (typeof resetFileInput === 'function') resetFileInput();
    };

    reader.readAsText(file);
};

export default FileManager; 
