const BaseRemover = require('../baseRemover');

class RemoveType extends BaseRemover {
    static get url () {
        return '/proxy/remove-type.json';
    }

    get idsErrorMessage() {
        return 'Набор типов для удаления не указаны';
    }

    get findErrorMessage() {
        return 'Наборы типов с данными id не были найдены';
    }

    async validate (inData) {
        if (!inData?.type)
            throw new Error(this.formatErrorMessage);
        if (!inData.type.id || (Array.isArray(inData.type.id) && inData.type.id.length === 0))
            throw new Error(this.idsErrorMessage);
    }

    async removeType (inData) {
        const types = await this.model.Type.findAll({where: {id: inData.type.id}, transaction: inData.transaction});
        if (types.length < 1)
            throw new Error(this.findErrorMessage);

        const ids = types.map(a => a.id);
        await this.model.Type.destroy({ where: { id: ids}, transaction: inData.transaction });
        await this.model.Book_Type.destroy({ where: { TypeId: ids}, transaction: inData.transaction });

        return ids;
    }

    async executeRemover (inData) {
        const ids = await this.removeType(inData);
        return { id: ids };
    }

}

module.exports = RemoveType;
