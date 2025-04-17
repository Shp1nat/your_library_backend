const BaseGetIds = require('../baseGetterIds');

class GetBookIds extends BaseGetIds {
    constructor (app) {
        super(app);
        this.condVars = ['name', 'description', 'year', 'updatedAt'];
        this.searchColumns = ['name', 'description'];
        this.orderColumns = ['id', 'name', 'description', 'year', 'updatedAt'];
        this.columns = ['id'];
        this.defaultOrder = 'name';
        this.ignore = [];
    }

    static get url () {
        return '/proxy/get-book-ids.json';
    }

    async executeGetterIds (inData) {
        const query = this.prepareQuery(inData);
        const books = await this.model.Book.findAll(query);
        return { rows: books.map(book => book.id).slice(0, 1000), subtype: 'book' };
    }
}

module.exports = GetBookIds;
