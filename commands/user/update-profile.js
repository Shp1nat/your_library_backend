class UpdateProfile {
    constructor(app) {
        this.app = app;
        this.model = app?.model;
        this.sequelize = app?.connection?.sequelize;
        this.execute = this.execute.bind(this);
    }

    static get url () {
        return '/proxy/update-profile.json';
    }

    get duplicateErrorMessage() {
        return 'Логин занят';
    }

    get userNotFoundErrorMessage() {
        return 'Пользователь не найден';
    }

    get formatErrorMessage() {
        return 'Неверный формат ввода';
    }

    get accessErrorMessage() {
        return 'Ошибка доступа';
    }

    async getUser (userId, transaction) {
        return this.model.User.findOne({
            where: {id: userId},
            transaction: transaction
        });
    }

    async validate (inData) {
        if (!inData?.user || !inData.user.id)
            throw new Error(this.formatErrorMessage);

        let user = await this.getUser(inData.user.id, inData.transaction);

        if (!user)
            throw new Error(this.userNotFoundErrorMessage);

        if (inData.user.login !== user.login) {
            const usersCount = await this.model.User.count({
                where: {login: inData.user.login},
                transaction: inData.transaction
            });
            if (usersCount > 0)
                throw new Error(this.duplicateErrorMessage);
        }
    }

    async updateProfileInfo (inData) {
        let user;
        const defaults = {
            login: inData.user.login,
            name: inData.user.name,
            lastname: inData.user.lastname,
            patronymic: inData.user.patronymic,
            age: inData.user.age,
            picture: inData.user.picture
        };

        user = await this.getUser(inData.user.id, inData.transaction);
        if (!user)
            throw new Error(this.userNotFoundErrorMessage);

        await user.update(defaults, { transaction: inData.transaction});

        return user;
    }

    async executeUpdateProfile (inData) {
        await this.validate(inData);
        const user = await this.updateProfileInfo(inData);

        if (!user)
            throw new Error(this.userNotFoundErrorMessage);

        return { id: user.id, updatedAt: user.updatedAt };
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
            inData.body.user = JSON.parse(inData.body.user);
            inData.body.user.id = userId;

            if (inData.file)
                inData.body.user.picture = inData.file.buffer;

            const result = await this.executeUpdateProfile(Object.assign(inData.body, { transaction: inData.transaction }));
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

module.exports = UpdateProfile;
