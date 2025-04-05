const BaseGetIdsOut = require('../baseGetterIdsOut');

class GetGenreIdsOut extends BaseGetIdsOut {
    static get url () {
        return '/proxy/get-genre-ids-out.json';
    }

    get subtype () {
        return 'genre';
    }

    get fields () {
        return ['id', 'name', 'description', 'updatedAt'];
    }

    get oneItemFields () {
        return [];
    }

    get ObjModel () {
        return this.model.Genre;
    }
}

module.exports = GetGenreIdsOut;
