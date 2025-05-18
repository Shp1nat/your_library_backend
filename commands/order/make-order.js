const {Op} = require("sequelize");

class MakeOrder {
    constructor(app) {
        this.app = app;
        this.model = app?.model;
        this.sequelize = app?.connection?.sequelize;
        this.execute = this.execute.bind(this);
    }

    static get url () {
        return '/proxy/make-order.json';
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

    get notAvailableErrorMessage() {
        return 'Нет доступных экземпляров';
    }

    get duplicatingExampleErrorMessage() {
        return 'В наборе присутствует книга, которая уже есть в одном из ваших активных заказов';
    }

    get ordersLimitErrorMessage() {
        return 'Вы не можете иметь более 3х незакрытых заказов';
    }

    get examplesLimitErrorMessage() {
        return 'Общее количество книг во всех незакрытых заказах не должно превыщать 10';
    }

    async validate (inData) {
        if (!inData?.exampleIds)
            throw new Error(this.formatErrorMessage);
        if (Array.isArray(inData.exampleIds) && inData.exampleIds.length === 0)
            throw new Error(this.idsErrorMessage);

        const orders = await this.model.Order.findAll({
            where: {
                userId: inData.userId,
                [Op.or]: [
                    { status: 'booked' },
                    { status: 'active' }
                ]
            },
            include: {
                model: this.model.Example,
                as: 'examples',
                through: {attributes: []}
            },
            transaction: inData.transaction
        });
        if (orders.length >= 3)
            throw new Error(this.ordersLimitErrorMessage);

        const exampleIds = orders.flatMap(order => order.examples.map(example => example.id));
        if (inData.exampleIds.some(id => exampleIds.includes(id)))
            throw new Error(this.duplicatingExampleErrorMessage);

        if ((exampleIds.length + inData.exampleIds.length) > 10)
            throw new Error(this.examplesLimitErrorMessage);

        // const exampleAvailableCounts = orders.flatMap(order => order.examples.map(example => example.availableCount));
        // if (exampleAvailableCounts.includes(0))
        //     throw new Error(this.notAvailableErrorMessage);
    }

    async makeOrder (inData) {
        const examples = await this.model.Example.findAll({
            where: {id: inData.exampleIds},
            transaction: inData.transaction
        });

        const defaults = {
            userId: inData.userId,
            status: 'booked',
            finishDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        };
        const order = await this.model.Order.create(defaults, { transaction: inData.transaction });

        if (!order)
            throw new Error(this.creationErrorMessage);

        await order.setExamples(examples, {transaction: inData.transaction});
        await this.model.Example.decrement({availableCount: 1}, {where: {id: inData.exampleIds}, transaction: inData.transaction});

        return order.id;
    }

    async executeMakeOrder (inData) {
        await this.validate(inData);
        const id = await this.makeOrder(inData);
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

            const result = await this.executeMakeOrder(Object.assign(inData.body, {userId: userId, transaction: inData.transaction }));
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

module.exports = MakeOrder;