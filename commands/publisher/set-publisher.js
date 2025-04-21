const BaseSetter = require('../baseSetter');

class SetPublisher extends BaseSetter {
    static get url () {
        return '/proxy/set-publisher.json';
    }

    get duplicateErrorMessage() {
        return 'Издательство с данным названием с данным набором адресов уже существует';
    }

    async validate (inData) {
        if (!inData?.publisher || !inData.publisher.name || !inData.publisher.addresses)
            throw new Error(this.formatErrorMessage);

        let publisher = await this.getPublisher(inData.publisher.id || null);
        if (
            !publisher
            || publisher.name !== inData.publisher.name
            || !this.idsArraysEqual(publisher.addresses.map(address => address.id), inData.publisher.addresses.map(address => address.id))
        ) {
            const publishers = await this.model.Publisher.findAll({
                where: {
                    name: inData.publisher.name
                },
                include: [
                    {
                        model: this.model.Address,
                        as: 'addresses',
                        attributes: ['id'],
                        through: {attributes: []}
                    }
                ],
                transaction: inData.transaction
            });

            const propNames = ['addresses'];
            for (const publisher of publishers) {
                let sameProps = true;
                for (const propName of propNames) {
                    const newPropIds = inData.publisher[propName].map(prop => prop.id)
                    const currenPropIds = publisher[propName].map(prop => prop.id);
                    if (!this.idsArraysEqual(newPropIds, currenPropIds))
                        sameProps = false;
                }
                if (sameProps)
                    throw new Error(this.duplicateErrorMessage);
            }
        }
    }

    async getPublisher (publisherId, transaction) {
        return this.model.Publisher.findOne({
            where: {id: publisherId},
            include: [
                {
                    model: this.model.Address,
                    as: 'addresses',
                    attributes: ['id'],
                    through: {attributes: []}
                }
            ],
            transaction: transaction
        });
    }

    async createOrUpdatePublisher (inData) {
        let publisher;
        const defaults = {
            name: inData.publisher.name,
            description: inData.publisher.description
        };

        if (inData.publisher.id || inData.publisher.id === 0) {
            publisher = await this.getPublisher(inData.publisher.id, inData.transaction);
            if (publisher) {
                await publisher.update(defaults, { transaction: inData.transaction});
            }
        } else {
            publisher = await this.model.Publisher.create(defaults, { transaction: inData.transaction });
            publisher = await this.getPublisher(publisher.id, inData.transaction);
        }

        if (!publisher)
            throw new Error('Ошибка');

        const addressIds = inData.publisher.addresses.map(address => address.id);
        const addresses = await this.getObjsByIds('Address', addressIds, inData.transaction);
        await publisher.setAddresses(addresses, {transaction: inData.transaction});

        return publisher;
    }

    async executeSetter (inData) {
        await this.validate(inData);
        const publisher = await this.createOrUpdatePublisher(inData);
        return { id: publisher.id, updatedAt: publisher.updatedAt };
    }

}

module.exports = SetPublisher;
