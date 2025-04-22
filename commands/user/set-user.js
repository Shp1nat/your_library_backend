const BaseSetter = require('../baseSetter');

class SetUser extends BaseSetter {
    static get url () {
        return '/proxy/set-user.json';
    }

    get duplicateErrorMessage() {
        return 'Пользователь с такими логином уже существует';
    }

    get userNotFoundErrorMessage() {
        return 'Данный пользователь не существует';
    }

    async validate (inData) {
        if (!inData?.user || !inData.user.id || !inData.user.login)
            throw new Error(this.formatErrorMessage);

        let user = await this.getUser(inData.user.id);

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

    async getUser (userId, transaction) {
        return this.model.User.findOne({
            where: {id: userId},
            transaction: transaction
        });
    }

    async updateUser (inData) {
        let user;
        const defaults = {
            login: inData.user.login,
            name: inData.user.name,
            lastname: inData.user.lastname,
            patronymic: inData.user.patronymic,
            age: inData.user.age
        };

        user = await this.getUser(inData.user.id, inData.transaction);
        if (!user)
            throw new Error(this.userNotFoundErrorMessage);

        await user.update(defaults, { transaction: inData.transaction});

        return user;
    }

    async executeSetter (inData) {
        await this.validate(inData);
        const user = await this.updateUser(inData);
        return { id: user.id, updatedAt: user.updatedAt };
    }

}

module.exports = SetUser;
