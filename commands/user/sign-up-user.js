class SignUpUser {
    constructor(app) {
        this.app = app;
        this.model = app?.model;
        this.sequelize = app?.connection?.sequelize;
        this.execute = this.execute.bind(this);
    }

    static get url () {
        return '/proxy/sign-up-user.json';
    }

    get formatErrorMessage() {
        return 'Неверный формат ввода';
    }

    get creationErrorMessage() {
        return 'Ошибка регистрации пользователя';
    }

    get duplicateErrorMessage() {
        return 'Пользователь с таким логином уже существует';
    }

    get emptyFieldsErrorMessage() {
        return 'Поля логина и пароля не могут быть пустыми';
    }

    async validate (inData) {
        if (!inData || !inData.user)
            throw new Error(this.formatErrorMessage);

        if (!inData.user.login || !inData.user.password)
            throw new Error(this.emptyFieldsErrorMessage);

        const usersCount = await this.model.User.count({where: { login: inData.user.login }, transaction: inData.transaction});

        if (usersCount > 0)
            throw new Error(this.duplicateErrorMessage);
    }

    async createNewUser (inData) {
        const defaults = {
            login: inData.user.login,
            password: inData.user.password
        };

        const user = await this.model.User.create(defaults, {transaction: inData.transaction});

        if (!user)
            throw new Error(this.creationErrorMessage);

        return user;
    }

    async signUp (inData) {
        await this.validate(inData);
        const user = await this.createNewUser(inData);
        return { id: user.id, updatedAt: user.updatedAt };
    }

    async execute (inData) {
        const transactionFromParent = !!inData.transaction;
        const transaction = transactionFromParent ? inData.transaction : await this.sequelize.transaction();
        inData.transaction = transaction;
        let status;
        let response;
        try {
            const result = await this.signUp(Object.assign(inData.body, { transaction: inData.transaction }));
            if (result && result.result === false) {
                if (!transactionFromParent)
                    await transaction.rollback();
                status = 400;
            } else {
                if (!transactionFromParent)
                    await transaction.commit();
                status = 201;
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

module.exports = SignUpUser;
