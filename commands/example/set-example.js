const BaseSetter = require('../baseSetter');

class SetExample extends BaseSetter {
    static get url () {
        return '/proxy/set-example.json';
    }

    get duplicateErrorMessage() {
        return 'Экземпляр с данной книгой в данном издании данного года выпуска уже существует';
    }

    getSetterName (modelName) {
        return 'set' + modelName;
    }

    async validate (inData) {
        if (!inData?.example || !Number.isInteger(inData.example.availableCount) || !inData.example.publisher?.id || !inData.example.book?.id)
            throw new Error(this.formatErrorMessage);
        const example = await this.model.Example.findOne({
            attributes: ['id', 'bookId', 'publisherId', 'year'],
            where: {
                bookId: inData.example.book.id,
                publisherId: inData.example.publisher.id,
                year: inData.example.year
            },
            transaction: inData.transaction
        });
        if (example && inData.example.id !== example.id)
            throw new Error(this.duplicateErrorMessage);
    }

    async getExample (exampleId, transaction) {
        return this.model.Example.findOne({
            where: {id: exampleId},
            transaction: transaction
        });
    }

    async setExampleProps (example, props, transaction) {
        const propNames = ['Publisher', 'Book'];

        for (const propName of propNames) {
            const obj = await this.getObjById(propName, props[propName].id, transaction);
            const setterName = this.getSetterName(propName);
            await example[setterName](obj, {transaction: transaction});
        }
    }

    async createOrUpdateExample (inData) {
        let example;
        const defaults = {
            name: inData.example.book.name,
            description: inData.example.description,
            year: inData.example.year,
            availableCount: inData.example.availableCount,
            digitalVersion: inData.example.book.digitalVersion
        };
        if (JSON.parse(inData.avatarChanged))
            defaults.picture = inData.example.picture || null;

        if (inData.example.id || inData.example.id === 0) {
            example = await this.getExample(inData.example.id, inData.transaction);
            if (example) {
                await example.update(defaults, { transaction: inData.transaction});
            }
        } else {
            example = await this.model.Example.create(defaults, { transaction: inData.transaction });
            example = await this.getExample(example.id, inData.transaction);
        }

        if (!example)
            throw new Error('Ошибка');

        const exampleProps = {
            Publisher: inData.example.publisher,
            Book: inData.example.book
        };
        await this.setExampleProps(example, exampleProps, inData.transaction);

        return example;
    }

    async executeSetter (inData) {
        await this.validate(inData);
        const example = await this.createOrUpdateExample(inData);
        return { id: example.id, updatedAt: example.updatedAt };
    }

}

module.exports = SetExample;
