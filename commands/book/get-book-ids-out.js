const BaseGetIdsOut = require('../baseGetterIdsOut');

class GetBookIdsOut extends BaseGetIdsOut {
    static get url () {
        return '/proxy/get-book-ids-out.json';
    }

    get subtype () {
        return 'book';
    }

    get fields () {
        return ['id', 'name', 'description', 'year', 'digitalVersion', 'updatedAt'];
    }

    get oneItemFields () {
        return [];
    }

    getIncludes () {
        return [
            {
                model: this.model.Author,
                attributes: ['id', 'name', 'lastname', 'patronymic'],
                as: 'authors',
                through: {attributes: []}
            },
            {
                model: this.model.Genre,
                attributes: ['id', 'name'],
                as: 'genres',
                through: {attributes: []}
            },
            {
                model: this.model.Type,
                attributes: ['id', 'name'],
                as: 'types',
                through: {attributes: []}
            }
        ];
    }

    get ObjModel () {
        return this.model.Book;
    }
}

module.exports = GetBookIdsOut;
