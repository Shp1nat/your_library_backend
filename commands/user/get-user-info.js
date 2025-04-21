class GetUserInfo {
    constructor(app) {
        this.app = app;
        this.model = app?.model;
        this.sequelize = app?.connection?.sequelize;
        this.execute = this.execute.bind(this);
    }

    static get url () {
        return '/proxy/get-user-info.json';
    }

    get userNotFoundErrorMessage() {
        return 'Пользователь не найден';
    }

    get accessErrorMessage() {
        return 'Ошибка доступа';
    }

    async executeGetUserInfo (inData) {
        const user = await this.model.User.findByPk(inData.userId);

        if (!user)
            throw new Error(this.userNotFoundErrorMessage);

        return user;
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

            const result = await this.executeGetUserInfo(Object.assign({userId: userId}, { transaction: inData.transaction }));
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

module.exports = GetUserInfo;
