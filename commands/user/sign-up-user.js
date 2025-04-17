const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

module.exports = (app, model) => {
    return async (req, res) => {
        try {
            const { login, password, email, name, lastname, patronymic, age, address } = req.body;
            const user = await model.User.create({
                login,
                password,
                email,
                name,
                lastname,
                patronymic,
                age,
                address
            });
            const token = jwt.sign({ userId: user.id }, 'your-secret-key', { expiresIn: '1h' }); // Замените 'your-secret-key' на ваш секретный ключ

            res.status(201).json({ token });
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ error: 'User with this login or email already exists' });
            }

            res.status(500).json({ error: error.message });
        }
    };
};