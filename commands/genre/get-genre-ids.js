const BaseGetIds = require('../baseGetterIds');

class GetGenreIds extends BaseGetIds {
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
        return '/proxy/get-genre-ids.json';
    }

    async executeGetterIds (inData) {
        const query = this.prepareQuery(inData);
        const genres = await this.model.Genre.findAll(query);
        return { rows: genres.map(genre => genre.id).slice(0, 1000), subtype: 'genre' };
    }

}

module.exports = GetGenreIds;
