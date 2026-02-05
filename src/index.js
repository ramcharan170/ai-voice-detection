const express = require('express');
const cors = require('cors'); // 1. Import CORS
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const app = express(); // 2. ONLY ONE 'app' declaration

// 3. Middlewares (Must be before routes!)
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/', (req, res) => {
    res.send('AI Voice Detection API is running');
});

app.post('/api/voice-detection', (req, res) => {
    const { audioBase64, language } = req.body;

    if (!audioBase64) {
        return res.status(400).json({ error: "No audio data provided" });
    }

    const tempFileName = `temp_${Date.now()}.wav`;
    const tempPath = path.join(__dirname, tempFileName);

    try {
        const base64Data = audioBase64.replace(/^data:audio\/\w+;base64,/, "");
        fs.writeFileSync(tempPath, Buffer.from(base64Data, 'base64'));

        // Determine Python command based on OS
        const pythonCommand = process.platform === "win32" ? "python" : "python3";

        const pythonProcess = spawn(pythonCommand, [
            path.join(__dirname, '../ai_engine/bridge.py'),
            tempPath,
            language || "Unknown"
        ]);

        let output = "";
        let errorOutput = "";

        pythonProcess.stdout.on('data', (data) => output += data.toString());
        pythonProcess.stderr.on('data', (data) => errorOutput += data.toString());

        pythonProcess.on('close', (code) => {
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

            if (code !== 0) {
                console.error("Python Error:", errorOutput);
                return res.status(500).json({ error: "Python Error", details: errorOutput });
            }

            try {
                res.json(JSON.parse(output));
            } catch (e) {
                res.status(500).json({ error: "Invalid JSON from Python", raw: output });
            }
        });

    } catch (err) {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`API running on http://0.0.0.0:${PORT}`));