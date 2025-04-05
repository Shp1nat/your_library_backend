const BaseGetIds = require('../baseGetterIds');

class GetAuthorIds extends BaseGetIds {
    constructor (app) {
        super(app);
        this.condVars = ['name', 'description', 'updatedAt'];
        this.searchColumns = ['name', 'description'];
        this.orderColumns = ['id', 'name', 'description', 'updatedAt'];
        this.columns = ['id'];
        this.defaultOrder = 'name';
        this.ignore = [];
    }

    static get url () {
        return '/proxy/get-author-ids.json';
    }

    async executeGetterIds (inData) {
        const query = this.prepareQuery(inData);
        const authors = await this.model.Author.findAll(query);
        return { rows: authors.map(author => author.id).slice(0, 1000), subtype: 'author' };
    }
}

module.exports = GetAuthorIds;
