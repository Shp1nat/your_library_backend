const BaseSetter = require('../baseSetter');

class SetType extends BaseSetter {
    static get url () {
        return '/proxy/set-type.json';
    }

    get formatErrorMessage() {
        return 'Название типа не должно быть пустыми';
    }

    get duplicateErrorMessage() {
        return 'Данный тип книги уже существует';
    }

    async validate (inData) {
        if (!inData?.type || !inData.type.name)
            throw new Error(this.formatErrorMessage);

        let type = await this.getType(inData.type.id || null);
        if (!type || type.name !== inData.type.name) {
            type = await this.model.Type.findOne({
                where: {
                    name: inData.type.name
                },
                transaction: inData.transaction
            });
            if (type)
                throw new Error(this.duplicateErrorMessage);
        }
    }

    async getType (typeId, transaction) {
        return this.model.Type.findOne({
            where: {id: typeId},
            transaction: transaction
        });
    }

    async createOrUpdateType (inData) {
        let type;
        const defaults = {
            name: inData.type.name,
            description: inData.type.description
        };

        if (inData.type.id || inData.type.id === 0) {
            type = await this.getType(inData.type.id, inData.transaction);
            if (type)
                await type.update(defaults, { transaction: inData.transaction});
        } else {
            type = await this.model.Type.create(defaults, { transaction: inData.transaction });
            type = await this.getType(type.id, inData.transaction);
        }

        if (!type)
            throw new Error('Ошибка');

        return type;
    }

    async executeSetter (inData) {
        await this.validate(inData);
        const type = await this.createOrUpdateType(inData);
        return { id: type.id, updatedAt: type.updatedAt };
    }

}

module.exports = SetType;
