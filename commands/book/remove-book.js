const BaseRemover = require('../baseRemover');

class RemoveBook extends BaseRemover {
    static get url () {
        return '/proxy/remove-book.json';
    }

    get idsErrorMessage() {
        return 'Набор книг для удаления не указаны';
    }

    get findErrorMessage() {
        return 'Наборы книг с данными id не были найдены';
    }

    async validate(inData) {
        if (!inData?.book)
            throw new Error(this.formatErrorMessage);
        if (!inData.book.id || (Array.isArray(inData.book.id) && inData.book.id.length === 0))
            throw new Error(this.idsErrorMessage);
    }

    async removeBook (inData) {
        const books = await this.model.Book.findAll({where: {id: inData.book.id}, transaction: inData.transaction});
        if (books.length < 1)
            throw new Error(this.findErrorMessage);

        const ids = books.map(a => a.id);
        await this.model.Book.destroy({ where: { id: ids}, transaction: inData.transaction });
        await this.model.Example.destroy({ where: { bookId: ids}, transaction: inData.transaction });
        //todo handle orders

        return ids;
    }

    async executeRemover (inData) {
        const ids = await this.removeBook(inData);
        return { id: ids };
    }

}

module.exports = RemoveBook;
