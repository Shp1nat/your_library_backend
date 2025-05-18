const {Op} = require("sequelize");
module.exports = async function checkOverdueOrders(app) {
    const { Order, User } = app.model;
    const { sequelize } = app.connection;
    const { Op } = app.Sequelize;

    const transaction = await sequelize.transaction();
    try {
        const today = new Date();

        const overdueOrders = await Order.findAll({
            where: {
                [Op.or]: [
                    { status: 'booked' },
                    { status: 'active' }
                ],
                finishDate: { [Op.lt]: today }
            },
            transaction
        });

        const userPenaltyMap = {};

        for (const order of overdueOrders) {
            const userId = order.userId;
            userPenaltyMap[userId] = (userPenaltyMap[userId] || 0) + 1;
        }

        const updates = Object.entries(userPenaltyMap).map(([userId, count]) =>
            User.increment(
                { penaltyPoints: count },
                { where: { id: userId }, transaction }
            )
        );

        await Promise.all(updates);
        await transaction.commit();

        console.log(`[CRON] Overdue check done: ${Object.keys(userPenaltyMap).length} users updated.`);
    } catch (err) {
        await transaction.rollback();
        console.error('[CRON] Overdue check failed:', err);
    }
};
