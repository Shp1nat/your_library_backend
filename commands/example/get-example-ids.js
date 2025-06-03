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

    getOrderedBookIds (orders) {
        const orderedBookIds = new Set();
        for (const order of orders) {
            if (order.examples && Array.isArray(order.examples)) {
                for (const example of order.examples) {
                    if (example.bookId) {
                        orderedBookIds.add(example.bookId);
                    }
                }
            }
        }
        return orderedBookIds;
    }

    getCountsPerPopularId (popularObjIds) {
        let countsPerPopularId;
        if (popularObjIds.length === 1) {
            countsPerPopularId = [10];
        } else if (popularObjIds.length === 2) {
            countsPerPopularId = [5, 5];
        } else { // 3 или более (но мы взяли топ-3)
            countsPerPopularId = [4, 3, 3];
        }
        return countsPerPopularId;
    }

    getTargetModel (cond) {
        if (cond === 'authors')
            return this.model.Author;
        else if (cond === 'genres')
            return this.model.Genre;
        else if (cond === 'types')
            return this.model.Type;
        else
            return null;
    }

    getPopularObjs (orders, cond) {
        const frequencyMap = new Map();
        for (const order of orders) {
            if (order.examples && Array.isArray(order.examples)) {
                for (const example of order.examples) {
                    if (example.book && example.book[cond]) {
                        const itemsToCount = example.book[cond];
                        if (Array.isArray(itemsToCount)) {
                            for (const item of itemsToCount) {
                                if (item?.id) { // Убедимся, что item и item.id существуют
                                    frequencyMap.set(item.id, (frequencyMap.get(item.id) || 0) + 1);
                                }
                            }
                        }
                    }
                }
            }
        }
        const sortedIds = Array.from(frequencyMap.entries())
            .sort((a, b) => b[1] - a[1]) // Сортировка по убыванию частоты
            .map(entry => entry[0]);     // Получаем только ID
        return sortedIds.slice(0, 3);    // Берем топ-3
    }

    async getExampleIdsSetByRecsCond (cond, userId) {
        const orders = await this.model.Order.findAll({
            attributes: ['id'],
            where: { userId: userId },
            include: {
                model: this.model.Example,
                as: 'examples',
                attributes: ['id', 'bookId'],
                include:  {
                    model: this.model.Book,
                    as: 'book',
                    attributes: ['id'],
                    include: [
                        {
                            model: this.model.Author,
                            as: 'authors',
                            attributes: ['id'],
                            through: { attributes: [] }
                        },
                        {
                            model: this.model.Genre,
                            as: 'genres',
                            attributes: ['id'],
                            through: { attributes: [] }
                        },
                        {
                            model: this.model.Type,
                            as: 'types',
                            attributes: ['id'],
                            through: { attributes: [] }
                        }
                    ]
                },
                through: { attributes: [] }
            }
        });

        const orderedBookIds = this.getOrderedBookIds(orders);
        const popularObjIds = this.getPopularObjs(orders, cond);

        if (popularObjIds.length === 0)
            return new Set([]);

        const countsPerPopularId = this.getCountsPerPopularId(popularObjIds);

        const recommendedExampleIds = new Set();

        for (let i = 0; i < popularObjIds.length; i++) {
            if (recommendedExampleIds.size >= 10) {
                break;
            }
            const popularId = popularObjIds[i];
            const limitForThisPopularId = countsPerPopularId[i];

            const targetModel = this.getTargetModel(cond);
            if (!targetModel)
                continue;

            try {
                const examplesFound = await this.model.Example.findAll({
                    attributes: ['id'],
                    where: {
                        id: { [Op.notIn]: Array.from(recommendedExampleIds) }
                    },
                    include: [
                        {
                            model: this.model.Book,
                            as: 'book',
                            attributes: ['id'],
                            where: {
                                id: { [Op.notIn]: Array.from(orderedBookIds) }
                            },
                            include: [
                                {
                                    model: targetModel,
                                    as: cond,
                                    attributes: [],
                                    where: { id: popularId },
                                    through: { attributes: [] },
                                    required: true
                                }
                            ],
                            required: true
                        }
                    ],
                    limit: limitForThisPopularId,
                    order: [this.sequelize.literal('RANDOM()')]
                });

                for (const example of examplesFound) {
                    if (recommendedExampleIds.size < 10) {
                        recommendedExampleIds.add(example.id);
                    } else {
                        break;
                    }
                }
            } catch (error) {
                console.error(`Error fetching recommendations for ${cond} ID ${popularId}:`, error);
            }
        }
        return recommendedExampleIds;
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
