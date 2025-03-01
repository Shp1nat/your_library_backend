module.exports = (app, model) => {
    return async (req, res) => {
        try {
            const user = await model.User.findByPk(req.user.userId);

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json(user);
        } catch (error) {
            res.status(401).json({ error: 'Invalid token' });
        }
    };
};