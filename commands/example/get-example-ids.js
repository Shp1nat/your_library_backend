const BaseGetIds = require('../baseGetterIds');
const {Op} = require("sequelize");

class GetExampleIds extends BaseGetIds {
    constructor (app) {
        super(app);
        this.condVars = ['name', 'description', 'year', 'availableCount', 'updatedAt'];
        this.searchColumns = ['name', 'description'];
        this.orderColumns = ['id', 'name', 'year', 'availableCount', 'description', 'updatedAt'];
        this.columns = ['id'];
        this.defaultOrder = 'name';
        this.ignore = [];
    }

    static get url () {
        return '/proxy/get-example-ids.json';
    }

    async getExampleIdsSetByPublisherCond (cond) {
        const publishers = await this.model.Publisher.findAll({
            attributes: ['id'],
            where: { name: {[Op.iLike]: '%' + cond + '%'} },
            include: {
                model: this.model.Example,
                as: 'examples',
                attributes: ['id']
            }
        });

        return new Set(publishers.flatMap(p => p.examples.map(e => e.id)));
    }

    getPopularObjs (orders, cond) {
        const frequencyMap = new Map();
        for (const order of orders) {
            if (order.examples && Array.isArray(order.examples)) {
                for (const example of order.examples) {
                    const itemsToCount = example[cond];
                    if (Array.isArray(itemsToCount)) {
                        for (const item of itemsToCount) {
                            if (item?.id)
                                frequencyMap.set(item.id, (frequencyMap.get(item.id) || 0) + 1);
                        }
                    }
                }
            }
        }
        const sortedIds = Array.from(frequencyMap.entries()).sort((a, b) => b[1] - a[1]).map(entry => entry[0]);
        return sortedIds.slice(0, 3);
    }

    async getExampleIdsSetByRecsCond (cond, userId) {
        const orders = await this.model.Order.findAll({
            attributes: ['id'],
            where: { userId: userId },
            include: {
                model: this.model.Example,
                as: 'examples',
                attributes: ['id'],
                separate: true,
                include: [
                    {
                        model: this.model.Author,
                        as: 'authors',
                        attributes: ['id'],
                        through: {attributes: []}
                    },
                    {
                        model: this.model.Genre,
                        as: 'genres',
                        attributes: ['id'],
                        through: {attributes: []}
                    },
                    {
                        model: this.model.Type,
                        as: 'types',
                        attributes: ['id'],
                        through: {attributes: []}
                    }
                ],
                through: {attributes: []}
            }
        });
        const popularObjs = this.getPopularObjs(orders, cond); //top3 ids

        //todo logic
    }

    getPublisherCond (conditions) {
        const publisherCondIndex = conditions.findIndex(c => c.var === 'publisherName');

        return (publisherCondIndex !== -1) ? conditions.splice(publisherCondIndex, 1)[0].value : null;
    }

    getRecsCond (conditions) {
        const recsTypeCondIndex = conditions.findIndex(c => c.var === 'recsType');

        return (recsTypeCondIndex !== -1) ? conditions.splice(recsTypeCondIndex, 1)[0].value : null;
    }

    async executeGetterIds (inData) {
        const publisherCond = this.getPublisherCond(inData.conditions);
        const recsCond = this.getRecsCond(inData.conditions);
        const query = this.prepareQuery(inData);
        const examples = await this.model.Example.findAll(query);
        let resultIds = examples.map(example => example.id);
        if (publisherCond) {
            const publisherExampleIdsSet  = await this.getExampleIdsSetByPublisherCond(publisherCond);
            resultIds = resultIds.filter(id => publisherExampleIdsSet.has(id));
        }
        if (recsCond && inData.userId) {
            const recsExampleIdsSet  = await this.getExampleIdsSetByRecsCond(recsCond, inData.userId);
            resultIds = resultIds.filter(id => recsExampleIdsSet.has(id));
        }
        return { rows: resultIds.slice(0, 1000), subtype: 'example' };
    }

}

module.exports = GetExampleIds;
