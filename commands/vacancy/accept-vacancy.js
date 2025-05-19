const {Op} = require("sequelize");

class AcceptVacancy {
    constructor(app) {
        this.app = app;
        this.model = app?.model;
        this.sequelize = app?.connection?.sequelize;
        this.execute = this.execute.bind(this);
    }

    static get url () {
        return '/proxy/accept-vacancy.json';
    }

    get formatErrorMessage() {
        return 'Неверный формат ввода';
    }

    get accessErrorMessage() {
        return 'Ошибка доступа';
    }

    get idsErrorMessage() {
        return 'Набор вакансий не указан';
    }

    async validate (inData) {
        if (!inData?.vacancyIds)
            throw new Error(this.formatErrorMessage);
        if (Array.isArray(inData.vacancyIds) && inData.vacancyIds.length === 0)
            throw new Error(this.idsErrorMessage);
    }

    async setAdmins (vacancyIds, transaction) {
        const vacancies = await this.model.Vacancy.findAll({
            where: {id: vacancyIds},
            include: {
                model: this.model.User,
                as: 'user',
                attributes: ['id']
            },
            transaction: transaction
        });

        const userIds = vacancies.map(vacancy => vacancy.user?.id);
        const uniqueUserIds = [...new Set(userIds)];

        await this.model.User.update({status: 'admin'}, { where: { id: uniqueUserIds}, transaction: transaction });
    }

    async acceptVacancy (inData) {
        const defaults = {
            status: 'accepted'
        };

        await this.model.Vacancy.update(defaults, { where: { id: inData.vacancyIds}, transaction: inData.transaction });
        await this.setAdmins(inData.vacancyIds, inData.transaction);

        return inData.vacancyIds;
    }

    async executeAcceptVacancy (inData) {
        await this.validate(inData);
        const id = await this.acceptVacancy(inData);
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

            const result = await this.executeAcceptVacancy(Object.assign(inData.body, { transaction: inData.transaction }));
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

module.exports = AcceptVacancy;