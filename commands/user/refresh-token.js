const jwt = require('jsonwebtoken');

module.exports = (app, model) => {
    return async (req, res) => {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({ error: 'Refresh token is required' });
            }

            const decoded = jwt.verify(refreshToken, 'your-refresh-secret-key');
            const user = await model.User.findByPk(decoded.userId);

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const accessToken = jwt.sign({ userId: user.id }, 'your-access-secret-key', { expiresIn: '15m' });

            res.json({ accessToken });
        } catch (error) {
            res.status(401).json({ error: 'Invalid refresh token' });
        }
    };
};