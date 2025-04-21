const BaseRemover = require('../baseRemover');

class RemoveAuthor extends BaseRemover {
    static get url () {
        return '/proxy/remove-author.json';
    }

    get idsErrorMessage() {
        return 'Набор авторов для удаления не указаны';
    }

    get findErrorMessage() {
        return 'Наборы авторов с данными id не были найдены';
    }

    async validate (inData) {
        if (!inData?.author)
            throw new Error(this.formatErrorMessage);
        if (!inData.author.id || (Array.isArray(inData.author.id) && inData.author.id.length === 0))
            throw new Error(this.idsErrorMessage);
    }

    async removeAuthor (inData) {
        const authors = await this.model.Author.findAll({where: {id: inData.author.id}, transaction: inData.transaction});
        if (authors.length < 1)
            throw new Error(this.findErrorMessage);

        const ids = authors.map(a => a.id);
        await this.model.Author.destroy({ where: { id: ids}, transaction: inData.transaction });
        await this.model.Book_Author.destroy({ where: { AuthorId: ids}, transaction: inData.transaction });

        return ids;
    }

    async executeRemover (inData) {
        const ids = await this.removeAuthor(inData);
        return { id: ids };
    }

}

module.exports = RemoveAuthor;
