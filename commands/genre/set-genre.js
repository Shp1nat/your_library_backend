const BaseSetter = require('../baseSetter');

class SetGenre extends BaseSetter {
    static get url () {
        return '/proxy/set-genre.json';
    }

    get duplicateErrorMessage() {
        return 'Данный жанр уже существует';
    }

    async validate(inData) {
        if (!inData?.genre || !inData.genre.name)
            throw new Error(this.formatErrorMessage);

        let genre = await this.getGenre(inData.genre.id || null);
        if (!genre || genre.name !== inData.genre.name) {
            genre = await this.model.Genre.findOne({
                where: {
                    name: inData.genre.name
                },
                transaction: inData.transaction
            });
            if (genre)
                throw new Error(this.duplicateErrorMessage);
        }
    }

    async getGenre (genreId, transaction) {
        return this.model.Genre.findOne({
            where: {id: genreId},
            transaction: transaction
        });
    }

    async createOrUpdateGenre (inData) {
        let genre;
        const defaults = {
            name: inData.genre.name,
            description: inData.genre.description
        };

        if (inData.genre.id || inData.genre.id === 0) {
            genre = await this.getGenre(inData.genre.id, inData.transaction);
            if (genre)
                await genre.update(defaults, { transaction: inData.transaction});
        } else {
            genre = await this.model.Genre.create(defaults, { transaction: inData.transaction });
            genre = await this.getGenre(genre.id, inData.transaction);
        }

        if (!genre)
            throw new Error('Ошибка');

        return genre;
    }

    async executeSetter (inData) {
        await this.validate(inData);
        const genre = await this.createOrUpdateGenre(inData);
        return { id: genre.id, updatedAt: genre.updatedAt };
    }

}

module.exports = SetGenre;
