const audioAnalysisService = require('../services/audioAnalysisService');

const analyzeVoice = async (req, res) => {
    try {
        const { language, audioFormat, audioBase64 } = req.body;

        // Note: Validation middleware already checked basic presence.

        // Call the service to process the audio
        // The service decodes the MP3 and runs DSP algorithms
        const result = await audioAnalysisService.analyzeAudio(audioBase64);

        // Construct the success response
        const response = {
            status: 'success',
            language: language,
            classification: result.classification,
            confidenceScore: result.confidenceScore,
            explanation: result.explanation
        };

        res.status(200).json(response);

    } catch (error) {
        console.error("Error processing voice request:", error);

        // Determine if it was a decoding error or something else
        let message = 'Internal Server Error';
        if (error.message.includes('ffmpeg') || error.message.includes('Invalid data')) {
            message = 'Failed to process audio file. Ensure it is a valid MP3.';
        }

        res.status(500).json({
            status: 'error',
            message: message
        });
    }
};

module.exports = {
    analyzeVoice
};
