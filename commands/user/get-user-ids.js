const BaseGetIds = require('../baseGetterIds');

class GetUserIds extends BaseGetIds {
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
        return '/proxy/get-user-ids.json';
    }

    async executeGetterIds (inData) {
        const query = this.prepareQuery(inData);
        const users = await this.model.User.findAll(query);
        return { rows: users.map(user => user.id).slice(0, 1000), subtype: 'user' };
    }
}

module.exports = GetUserIds;
