class MakeVacancy {
    constructor(app) {
        this.app = app;
        this.model = app?.model;
        this.sequelize = app?.connection?.sequelize;
        this.execute = this.execute.bind(this);
    }

    static get url () {
        return '/proxy/make-vacancy.json';
    }

    get formatErrorMessage() {
        return 'Неверный формат ввода';
    }

    get accessErrorMessage() {
        return 'Ошибка доступа';
    }

    get creationErrorMessage() {
        return 'Не удалось создать вакансию';
    }

    get vacsLimitErrorMessage() {
        return 'Вы не можете иметь более 3х активных вакансий';
    }

    async validate (inData) {
        if (!inData?.vacancy || !inData.vacancy.text)
            throw new Error(this.formatErrorMessage);

        const waitingVacs = await this.model.Vacancy.count({
            where: {
                userId: inData.userId,
                status: 'waiting'
            },
            transaction: inData.transaction
        });
        if (waitingVacs >= 3)
            throw new Error(this.vacsLimitErrorMessage);
    }

    async makeVacancy (inData) {
        const defaults = {
            text: inData.vacancy.text,
            userId: inData.userId,
            status: 'waiting'
        };
        const vacancy = await this.model.Vacancy.create(defaults, { transaction: inData.transaction });

        if (!vacancy)
            throw new Error(this.creationErrorMessage);

        return vacancy.id;
    }

    async executeMakeVacancy (inData) {
        await this.validate(inData);
        const id = await this.makeVacancy(inData);
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

            const result = await this.executeMakeVacancy(Object.assign(inData.body, {userId: userId, transaction: inData.transaction }));
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

module.exports = MakeVacancy;