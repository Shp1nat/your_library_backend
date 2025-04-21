const BaseRemover = require('../baseRemover');

class RemoveExample extends BaseRemover {
    static get url () {
        return '/proxy/remove-example.json';
    }

    get idsErrorMessage() {
        return 'Набор экземпляров для удаления не указаны';
    }

    get findErrorMessage() {
        return 'Наборы экземпляров с данными id не были найдены';
    }

    async validate (inData) {
        if (!inData?.example)
            throw new Error(this.formatErrorMessage);
        if (!inData.example.id || (Array.isArray(inData.example.id) && inData.example.id.length === 0))
            throw new Error(this.idsErrorMessage);
    }

    async removeExample (inData) {
        const examples = await this.model.Example.findAll({where: {id: inData.example.id}, transaction: inData.transaction});
        if (examples.length < 1)
            throw new Error(this.findErrorMessage);

        const ids = examples.map(a => a.id);
        await this.model.Example.destroy({ where: { id: ids}, transaction: inData.transaction });
        //todo handle orders

        return ids;
    }

    async executeRemover (inData) {
        const ids = await this.removeExample(inData);
        return { id: ids };
    }

}

module.exports = RemoveExample;
