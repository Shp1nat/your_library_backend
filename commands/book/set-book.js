const BaseSetter = require('../baseSetter');

class SetBook extends BaseSetter {
    static get url () {
        return '/proxy/set-book.json';
    }

    getSetterName (modelName) {
        return 'set' + modelName + 's';
    }

    get duplicateErrorMessage() {
        return 'Книга с данным названием в данном году с данными жанрами, авторами и типами уже существует';
    }

    async validate(inData) {
        if (!inData?.book || !inData.book.name || !inData.book.year || !inData.book.authors || !inData.book.genres || !inData.book.types)
            throw new Error(this.formatErrorMessage);

        let book = await this.getBook(inData.book.id || null);
        if (
            !book
            || book.name !== inData.book.name
            || book.year !== inData.book.year
            || !this.idsArraysEqual(book.authors.map(author => author.id), inData.book.authors.map(author => author.id))
            || !this.idsArraysEqual(book.genres.map(genre => genre.id), inData.book.genres.map(genre => genre.id))
            || !this.idsArraysEqual(book.types.map(type => type.id), inData.book.types.map(type => type.id))
        ) {
            const books = await this.model.Book.findAll({
                where: {
                    name: inData.book.name,
                    year: inData.book.year,
                },
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
                transaction: inData.transaction
            });

            const propNames = ['authors', 'genres', 'types'];
            for (const book of books) {
                let sameProps = true;
                for (const propName of propNames) {
                    const newPropIds = inData.book[propName].map(prop => prop.id)
                    const currenPropIds = book[propName].map(prop => prop.id);
                    if (!this.idsArraysEqual(newPropIds, currenPropIds))
                        sameProps = false;
                }
                if (sameProps)
                    throw new Error(this.duplicateErrorMessage);
            }
        }
    }

    async getBook (bookId, transaction) {
        return this.model.Book.findOne({
            where: {id: bookId},
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
            transaction: transaction
        });
    }

    async setBookProps (book, props, transaction) {
        const propNames = ['Author', 'Genre', 'Type'];

        for (const propName of propNames) {
            const ids = props[propName.toLowerCase() + 's']?.map(prop => prop.id);
            const objs = await this.getObjsByIds(propName, ids, transaction);
            const setterName = this.getSetterName(propName);
            await book[setterName](objs, {transaction: transaction});
        }
    }

    async createOrUpdateBook (inData) {
        let book;
        const defaults = {
            name: inData.book.name,
            description: inData.book.description,
            year: inData.book.year
        };

        if (inData.book.id || inData.book.id === 0) {
            book = await this.getBook(inData.book.id, inData.transaction);
            if (book) {
                await book.update(defaults, { transaction: inData.transaction});
            }
        } else {
            book = await this.model.Book.create(defaults, { transaction: inData.transaction });
            book = await this.getBook(book.id, inData.transaction);
        }

        if (!book)
            throw new Error('Ошибка');

        const bookProps = {
            authors: inData.book.authors,
            genres: inData.book.genres,
            types: inData.book.types
        };
        await this.setBookProps(book, bookProps, inData.transaction);

        return book;
    }

    async executeSetter (inData) {
        await this.validate(inData);
        const book = await this.createOrUpdateBook(inData);
        return { id: book.id, updatedAt: book.updatedAt };
    }

}

module.exports = SetBook;
