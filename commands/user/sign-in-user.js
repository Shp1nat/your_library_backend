const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

module.exports = (app, model) => {
    return async (req, res) => {
        try {
            const { login, password } = req.body;
            const user = await model.User.findOne({ where: { login } });

            if (!user) {
                return res.status(401).json({ error: 'Invalid login or password' });
            }

            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.status(401).json({ error: 'Invalid login or password' });
            }

            const accessToken = jwt.sign({ userId: user.id }, 'your-access-secret-key', { expiresIn: '60m' }); // 15 минут
            const refreshToken = jwt.sign({ userId: user.id, random: crypto.randomBytes(64).toString('hex') }, 'your-refresh-secret-key', { expiresIn: '7d' }); // 7 дней

            res.json({ accessToken, refreshToken });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
};