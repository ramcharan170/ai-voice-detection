const SUPPORTED_LANGUAGES = ['Tamil', 'English', 'Hindi', 'Malayalam', 'Telugu'];

const validationMiddleware = (req, res, next) => {
    const { language, audioFormat, audioBase64 } = req.body;

    if (!language || !SUPPORTED_LANGUAGES.includes(language)) {
        return res.status(400).json({
            status: 'error',
            message: `Invalid or unsupported language. Supported: ${SUPPORTED_LANGUAGES.join(', ')}`
        });
    }

    if (!audioFormat || audioFormat.toLowerCase() !== 'mp3') {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid audioFormat. Only "mp3" is supported.'
        });
    }

    if (!audioBase64 || typeof audioBase64 !== 'string') {
        return res.status(400).json({
            status: 'error',
            message: 'Missing or invalid audioBase64 string.'
        });
    }

    // Basic Base64 validation regex
    const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
    // We can loosen this slightly or check length, but usually just trying to decode is better. 
    // However, a simple regex check avoids processing obvious garbage.
    // Note: This regex might be too strict for some real-world data with newlines, so we'll do a try-catch in the controller or service instead for robust decoding.
    // For now, let's just ensure it's not empty.

    next();
};

module.exports = validationMiddleware;
