const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

class SignInUser {
    constructor(app) {
        this.app = app;
        this.model = app?.model;
        this.sequelize = app?.connection?.sequelize;
        this.execute = this.execute.bind(this);
    }

    async getUser (login, transaction) {
        return await this.model.User.findOne({
            attributes: ['id', 'login', 'password', 'status'],
            where: { login: login },
            transaction: transaction
        });
    }

    static get url () {
        return '/proxy/sign-in-user.json';
    }

    get formatErrorMessage() {
        return 'Неверный формат ввода';
    }

    get enterErrorMessage() {
        return 'Ошибка входа пользователя';
    }

    get loginErrorMessage() {
        return 'Пользователя с таким логином не существует';
    }

    get passwordErrorMessage() {
        return 'Неверный пароль';
    }

    get emptyFieldsErrorMessage() {
        return 'Поля логина и пароля не могут быть пустыми';
    }

    async validate (inData) {
        if (!inData || !inData.user)
            throw new Error(this.formatErrorMessage);

        if (!inData.user.login || !inData.user.password)
            throw new Error(this.emptyFieldsErrorMessage);

        const user = await this.getUser(inData.user.login, inData.transaction);

        if (!user)
            throw new Error(this.loginErrorMessage);

        const passwordMatch = await bcrypt.compare(inData.user.password, user.password);

        if (!passwordMatch)
            throw new Error(this.passwordErrorMessage);
    }

    async getResult (inData) {
        const user = await this.getUser(inData.user.login, inData.transaction);

        const accessToken = jwt.sign({ userId: user.id, status: user.status }, 'your-access-secret-key', { expiresIn: '60m' }); // 60 минут
        const refreshToken = jwt.sign({ userId: user.id, status: user.status, random: crypto.randomBytes(64).toString('hex') }, 'your-refresh-secret-key', { expiresIn: '7d' }); // 7 дней

        return Object.assign({status: user.status}, { accessToken, refreshToken });
    }

    async signIn (inData) {
        await this.validate(inData);
        const result = await this.getResult(inData);
        return result;
    }

    async execute (inData) {
        const transactionFromParent = !!inData.transaction;
        const transaction = transactionFromParent ? inData.transaction : await this.sequelize.transaction();
        inData.transaction = transaction;
        let status;
        let response;
        try {
            const result = await this.signIn(Object.assign(inData.body, { transaction: inData.transaction }));
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

module.exports = SignInUser;
