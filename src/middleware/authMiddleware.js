const dotenv = require('dotenv');
dotenv.config();

const authMiddleware = (req, res, next) => {
    console.log('ENV API_KEY:', process.env.API_KEY);
    console.log('HEADER x-api-key:', req.headers['x-api-key']);

    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.API_KEY;

    if (!apiKey || apiKey !== validApiKey) {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid API key'
        });
    }

    next();
};

module.exports = authMiddleware;