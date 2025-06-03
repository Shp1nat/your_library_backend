const BaseGetIdsOut = require('../baseGetterIdsOut');

class GetExampleIdsOut extends BaseGetIdsOut {
    static get url () {
        return '/proxy/get-example-ids-out.json';
    }

    get subtype () {
        return 'example';
    }

    get fields () {
        return ['id', 'name', 'description', 'year', 'availableCount', 'digitalVersion', 'updatedAt', 'picture'];
    }

    get oneItemFields () {
        return [];
    }

    getIncludes () {
        return [
            {
                model: this.model.Book,
                attributes: ['id', 'name'],
                include: [
                    {
                        model: this.model.Author,
                        as: 'authors',
                        attributes: ['id', 'name', 'lastname', 'patronymic', 'picture'],
                        through: { attributes: [] }
                    },
                    {
                        model: this.model.Genre,
                        as: 'genres',
                        attributes: ['id', 'name'],
                        through: { attributes: [] }
                    },
                    {
                        model: this.model.Type,
                        as: 'types',
                        attributes: ['id', 'name'],
                        through: { attributes: [] }
                    }
                ],
                as: 'book'
            },
            {
                model: this.model.Publisher,
                attributes: ['id', 'name'],
                as: 'publisher'
            }
        ];
    }

    get ObjModel () {
        return this.model.Example;
    }
}

module.exports = GetExampleIdsOut;
