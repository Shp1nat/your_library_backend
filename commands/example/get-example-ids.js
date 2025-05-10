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

    getPublisherCond (conditions) {
        const publisherCondIndex = conditions.findIndex(c => c.var === 'publisherName');

        return (publisherCondIndex !== -1) ? conditions.splice(publisherCondIndex, 1)[0].value : null;
    }

    async executeGetterIds (inData) {
        const publisherCond = this.getPublisherCond(inData.conditions);
        const query = this.prepareQuery(inData);
        const examples = await this.model.Example.findAll(query);
        let resultIds = examples.map(example => example.id);
        if (publisherCond) {
            const publisherExampleIdsSet  = await this.getExampleIdsSetByPublisherCond(publisherCond);
            resultIds = resultIds.filter(id => publisherExampleIdsSet.has(id));
        }
        return { rows: resultIds.slice(0, 1000), subtype: 'example' };
    }

}

module.exports = GetExampleIds;
