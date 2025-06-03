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

    async execute (inData) {
        let status;
        let response;
        try {
            const result = await this.executeGetterIdsOut(inData.body);
            if (result.rows) {
                for (const row of result.rows) {
                    if (row.picture)
                        row.picture = row.picture?.toString('base64') || null;
                }
            } else {
                if (!result.error) {
                    const keys = Object.keys(result);
                    const prop = keys[0];
                    result[prop].picture = result[prop].picture?.toString('base64') || null;
                    for (const author of result[prop].book.authors)
                        author.picture = author.picture?.toString('base64') || null;
                }
            }
            status = 200;
            response = { result: result };
        } catch (error) {
            console.log(error);
            status = 400;
            response = { error: error.message };
        }
        inData.res.status(status).json(response);
    }
}

module.exports = GetExampleIdsOut;
