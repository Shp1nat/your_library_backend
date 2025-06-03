const BaseSetter = require('../baseSetter');

class SetAuthor extends BaseSetter {
    static get url () {
        return '/proxy/set-author.json';
    }

    get formatErrorMessage() {
        return 'Имя и фамилия автора не должны быть пустыми';
    }

    get duplicateErrorMessage() {
        return 'Автор с такими именем и фамилией уже существует';
    }

    async validate (inData) {
        if (!inData?.author || !inData.author.name || !inData.author.lastname)
            throw new Error(this.formatErrorMessage);

        let author = await this.getAuthor(inData.author.id || null);
        if (!author || author.name !== inData.author.name || author.lastname !== inData.author.lastname) {
            author = await this.model.Author.findOne({
                where: {
                    name: inData.author.name,
                    lastname: inData.author.lastname
                },
                transaction: inData.transaction
            });
            if (author)
                throw new Error(this.duplicateErrorMessage);
        }
    }

    async getAuthor (authorId, transaction) {
        return this.model.Author.findOne({
            where: {id: authorId},
            transaction: transaction
        });
    }

    async createOrUpdateAuthor (inData) {
        let author;
        const defaults = {
            name: inData.author.name,
            lastname: inData.author.lastname,
            patronymic: inData.author.patronymic,
            description: inData.author.description
        };

        if (JSON.parse(inData.avatarChanged))
            defaults.picture = inData.author.picture || null;

        if (inData.author.id || inData.author.id === 0) {
            author = await this.getAuthor(inData.author.id, inData.transaction);
            if (author)
                await author.update(defaults, { transaction: inData.transaction});
        } else {
            author = await this.model.Author.create(defaults, { transaction: inData.transaction });
            author = await this.getAuthor(author.id, inData.transaction);
        }

        if (!author)
            throw new Error('Ошибка');

        return author;
    }

    async executeSetter (inData) {
        await this.validate(inData);
        const author = await this.createOrUpdateAuthor(inData);
        return { id: author.id, updatedAt: author.updatedAt };
    }

}

module.exports = SetAuthor;
