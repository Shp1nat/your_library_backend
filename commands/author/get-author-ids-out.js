const BaseGetIdsOut = require('../baseGetterIdsOut');

class GetAuthorIdsOut extends BaseGetIdsOut {
    static get url () {
        return '/proxy/get-author-ids-out.json';
    }

    get subtype () {
        return 'author';
    }

    get fields () {
        return ['id', 'name', 'lastname', 'patronymic', 'description', 'updatedAt', 'picture'];
    }

    get oneItemFields () {
        return [];
    }

    get ObjModel () {
        return this.model.Author;
    }
}

module.exports = GetAuthorIdsOut;
