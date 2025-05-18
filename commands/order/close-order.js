const {Op} = require("sequelize");

class CloseOrder {
    constructor(app) {
        this.app = app;
        this.model = app?.model;
        this.sequelize = app?.connection?.sequelize;
        this.execute = this.execute.bind(this);
    }

    static get url () {
        return '/proxy/close-order.json';
    }

    get formatErrorMessage() {
        return 'Неверный формат ввода';
    }

    get accessErrorMessage() {
        return 'Ошибка доступа';
    }

    get idsErrorMessage() {
        return 'Набор экземпляров для заказа не указан';
    }

    get creationErrorMessage() {
        return 'Не удалось создать заказ';
    }

    async validate (inData) {
        if (!inData?.orderIds)
            throw new Error(this.formatErrorMessage);
        if (Array.isArray(inData.orderIds) && inData.orderIds.length === 0)
            throw new Error(this.idsErrorMessage);
    }

    async restoreExamples (orderIds, transaction) {
        const objs = await this.model.Order_Example.findAll({
            attributes: ['OrderId', 'ExampleId'],
            where: { OrderId: orderIds },
            transaction: transaction,
        });

        const idCount = {};
        for (const obj of objs) {
            const id = obj.ExampleId;
            idCount[id] = (idCount[id] || 0) + 1;
        }

        for (const id in idCount)
            await this.model.Example.increment({availableCount: idCount[id]}, {where: {id: id}, transaction: transaction});
    }

    async closeOrder (inData) {
        const defaults = {
            status: 'closed',
            finishDate: new Date(Date.now())
        };
        await this.model.Order.update(defaults, { where: { id: inData.orderIds}, transaction: inData.transaction });

        await this.restoreExamples(inData.orderIds, inData.transaction);

        return inData.orderIds;
    }

    async executeCloseOrder (inData) {
        await this.validate(inData);
        const id = await this.closeOrder(inData);
        return { id: id };
    }

    async execute (inData) {
        const transactionFromParent = !!inData.transaction;
        const transaction = transactionFromParent ? inData.transaction : await this.sequelize.transaction();
        inData.transaction = transaction;
        let status;
        let response;
        try {
            const userId = inData.user?.userId;
            if (!userId)
                throw new Error(this.accessErrorMessage);

            const result = await this.executeCloseOrder(Object.assign(inData.body, { transaction: inData.transaction }));
            if (result && result.result === false) {
                if (!transactionFromParent)
                    await transaction.rollback();
                status = 401;
            } else {
                if (!transactionFromParent)
                    await transaction.commit();
                status = 200;
            }
            response = { result: result };
        } catch (error) {
            console.log(error);
            if (!transactionFromParent)
                await transaction.rollback();
            status = 400;
            response = { error: error.message };
        }
        inData.res.status(status).json(response);
    }
}

module.exports = CloseOrder;