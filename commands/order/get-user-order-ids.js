const BaseGetIds = require('../baseGetterIds');

class GetUserOrderIds extends BaseGetIds {
    constructor (app) {
        super(app);
        this.condVars = ['id', 'status', 'finishDate', 'updatedAt'];
        this.searchColumns = ['id', 'status', 'finishDate'];
        this.orderColumns = ['id', 'status', 'finishDate', 'updatedAt'];
        this.columns = ['id', 'status', 'finishDate', 'updatedAt'];
        this.defaultOrder = 'finishDate';
        this.ignore = [];
    }

    static get url () {
        return '/proxy/get-user-order-ids.json';
    }

    async executeGetterIds (inData) {
        const query = this.prepareQuery(inData);
        query.where = {...query.where, userId: inData.userId};
        let orders = [];
        try {
            orders = await this.model.Order.findAll(query);
        } catch (err) {
            orders = [];
        }
        return { rows: orders.map(order => order.id).slice(0, 1000), subtype: 'order' };
    }
}

module.exports = GetUserOrderIds;
