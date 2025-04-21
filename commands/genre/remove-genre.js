const BaseRemover = require('../baseRemover');

class RemoveGenre extends BaseRemover {
    static get url () {
        return '/proxy/remove-genre.json';
    }

    get idsErrorMessage() {
        return 'Набор жанров для удаления не указаны';
    }

    get findErrorMessage() {
        return 'Наборы жанров с данными id не были найдены';
    }

    async validate (inData) {
        if (!inData?.genre)
            throw new Error(this.formatErrorMessage);
        if (!inData.genre.id || (Array.isArray(inData.genre.id) && inData.genre.id.length === 0))
            throw new Error(this.idsErrorMessage);
    }

    async removeGenre (inData) {
        const genres = await this.model.Genre.findAll({where: {id: inData.genre.id}, transaction: inData.transaction});
        if (genres.length < 1)
            throw new Error(this.findErrorMessage);

        const ids = genres.map(a => a.id);
        await this.model.Genre.destroy({ where: { id: ids}, transaction: inData.transaction });
        await this.model.Book_Genre.destroy({ where: { GenreId: ids}, transaction: inData.transaction });

        return ids;
    }

    async executeRemover (inData) {
        const ids = await this.removeGenre(inData);
        return { id: ids };
    }

}

module.exports = RemoveGenre;
