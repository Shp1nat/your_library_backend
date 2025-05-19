const {Op} = require("sequelize");

class RejectVacancy {
    constructor(app) {
        this.app = app;
        this.model = app?.model;
        this.sequelize = app?.connection?.sequelize;
        this.execute = this.execute.bind(this);
    }

    static get url () {
        return '/proxy/reject-vacancy.json';
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

    async rejectVacancy (inData) {
        const defaults = {
            status: 'rejected'
        };
        await this.model.Vacancy.update(defaults, { where: { id: inData.vacancyIds}, transaction: inData.transaction });

        return inData.vacancyIds;
    }

    async executeRejectVacancy (inData) {
        await this.validate(inData);
        const id = await this.rejectVacancy(inData);
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

            const result = await this.executeRejectVacancy(Object.assign(inData.body, { transaction: inData.transaction }));
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

module.exports = RejectVacancy;