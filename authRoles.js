module.exports = (...allowedRoles) => {
    return (req, res, next) => {
        const userStatus = req.user?.status;

        if (!userStatus) {
            return res.status(403).json({ error: 'Доступ запрещен: статус не найден' });
        }

        if (!allowedRoles.includes(userStatus)) {
            return res.status(403).json({ error: 'Доступ запрещен: недостаточно прав' });
        }

        next();
    };
};
