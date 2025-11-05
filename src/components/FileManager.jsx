function FileManager() { }

// Save settings to a JSON file
FileManager.save = function (controls) {
    try {
        const json = JSON.stringify(controls, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'strudel_settings.json';
        document.body.appendChild(link);
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
    if (!file) return;
    if (typeof setLoading === 'function') setLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const text = event?.target?.result ?? reader.result;
            const loadedControls = JSON.parse(text);

            const numericKeys = new Set([
                'master_volume', 'tempo', 'reverb', 'delay_send', 'crossfader',
                'gain_drums', 'gain_bass', 'gain_chords', 'gain_lead'
            ]);

            const normalized = Object.fromEntries(
                Object.entries(loadedControls).map(([k, v]) => {
                    if (numericKeys.has(k)) {
                        const parsed = parseFloat(v);
                        return [k, Number.isNaN(parsed) ? v : parsed];
                    }
                    return [k, v];
                })
            );

            setControls(prev => ({ ...prev, ...normalized }));
        } catch (error) {
            console.error('Failed to parse JSON:', error);
            alert('Error: Could not load settings file. Is it valid JSON?');
        } finally {
            if (typeof setLoading === 'function') setLoading(false);
            if (typeof resetFileInput === 'function') resetFileInput();
        }
    };

    reader.onerror = (err) => {
        console.error('File read error:', err);
        if (typeof setLoading === 'function') setLoading(false);
        alert('Error reading the file. See console for details.');
        if (typeof resetFileInput === 'function') resetFileInput();
    };

    reader.readAsText(file);
};

export default FileManager;
