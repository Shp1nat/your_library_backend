const BaseGetIds = require('../baseGetterIds');
const {Op} = require("sequelize");

class GetOrderIds extends BaseGetIds {
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
        return '/proxy/get-order-ids.json';
    }

    async getOrderIdsSetByUserLoginCond (cond) {
        const users = await this.model.User.findAll({
            attributes: ['id'],
            where: { login: {[Op.iLike]: '%' + cond + '%'} },
            include: {
                model: this.model.Order,
                as: 'orders',
                attributes: ['id']
            }
        });

        return new Set(users.flatMap(p => p.orders.map(e => e.id)));
    }

    async getOrderIdsSetByExampleNameCond (cond) {
        const examples = await this.model.Example.findAll({
            attributes: ['id'],
            where: { name: {[Op.iLike]: '%' + cond + '%'} },
            include: {
                model: this.model.Order,
                as: 'orders',
                attributes: ['id']
            }
        });

        return new Set(examples.flatMap(p => p.orders.map(e => e.id)));
    }

    getUserLoginCond (conditions) {
        const userLoginCondIndex = conditions.findIndex(c => c.var === 'userLogin');

        return (userLoginCondIndex !== -1) ? conditions.splice(userLoginCondIndex, 1)[0].value : null;
    }

    getExampleNameCond (conditions) {
        const exampleNameCondIndex = conditions.findIndex(c => c.var === 'exampleName');

        return (exampleNameCondIndex !== -1) ? conditions.splice(exampleNameCondIndex, 1)[0].value : null;
    }

    async executeGetterIds (inData) {
        const userLoginCond = this.getUserLoginCond(inData.conditions);
        const exampleNameCond = this.getExampleNameCond(inData.conditions);
        const query = this.prepareQuery(inData);
        const orders = await this.model.Order.findAll(query);
        let resultIds = orders.map(order => order.id);
        if (userLoginCond) {
            const userLoginOrderIdsSet  = await this.getOrderIdsSetByUserLoginCond(userLoginCond);
            resultIds = resultIds.filter(id => userLoginOrderIdsSet.has(id));
        }
        if (exampleNameCond) {
            const exampleNameOrderIdsSet  = await this.getOrderIdsSetByExampleNameCond(exampleNameCond);
            resultIds = resultIds.filter(id => exampleNameOrderIdsSet.has(id));
        }
        return { rows: resultIds.slice(0, 1000), subtype: 'order' };
    }
}

module.exports = GetOrderIds;
