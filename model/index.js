const fs = require('fs');
const async = require('async');
const path = require('path');

const modelNameToSubtype = {
    User: 'user',
    Order: 'order',
    Vacancy: 'vacancy',
    Example: 'example',
    Book: 'book',
    Author: 'author',
    Genre: 'genre',
    Type: 'type',
    Publisher: 'publisher',
};

module.exports.createModel = (inParams, onDone) => {
    let result = {};
    result.__modelNameToSubtype = modelNameToSubtype;
    const folder = inParams.folder || __dirname;
    fs.readdir(folder, (err, files) => {
        if (err)
            return onDone(err, result);

        if (files.length === 0)
            return onDone();
        var opts = Object.assign({}, inParams, {engine: this});
        let parts = [];
        async.eachSeries(files, (file, fileDone) => {
            if (file === 'index.js')
                return fileDone();
            let fileName = path.join(folder, file);
            fs.lstat(fileName, (err, stat) => {
                if (err)
                    return fileDone();
                if (stat.isDirectory()) {
                    let data = Object.assign({}, opts);
                    data.folder = fileName;
                    return this.loadCommands(data, fileDone);
                } else {
                    var Cls = require(fileName);
                    if (Cls.createModel === undefined)
                        return fileDone();
                    let part = {
                        step: Cls.step || 0,
                        filename: file,
                        createModel: async (p) => {
                            return await Cls.createModel(p);
                        }
                    };
                    if (Cls.updateVector !== undefined) {
                        part.updateVector = async (p) => {
                            return await Cls.updateVector(p);
                        };
                    }
                    if (Cls.loadFactory !== undefined) {
                        part.loadFactory = async (p) => {
                            return await Cls.loadFactory(p);
                        };
                    }
                    parts.push(part);
                    return fileDone();
                }
            });
        }, (err) => {
            if (err)
                return onDone(err);

            parts.sort((a, b) => {
                return a.step - b.step;
            });

            parts.push({
                createModel: async (p) => {
                    const {sequelize} = p.connection;
                    if (process.env.ALTER_DB === 'true')
                        await sequelize.sync({alter: true});
                    else
                        await sequelize.sync();
                }
            });

            async.eachSeries(parts, (part, partDone) => {
                let env = Object.assign({}, inParams);
                env.connection = inParams.app.connection;
                env.model = result;
                part.createModel(env).then((r) => {
                    result = Object.assign(result, r);
                    return partDone();
                }).catch(err => {
                    return partDone(err);
                });
            }, (err) => {
                if (err)
                    return onDone(err, result);

                async.eachSeries(parts, (part, partDone) => {
                    if (!part.loadFactory)
                        return partDone();
                    let env = Object.assign({}, inParams);
                    env.connection = inParams.app.connection;
                    env.model = result;
                    part.loadFactory(env).then((r) => {
                        result = Object.assign(result, r);
                        return partDone();
                    }).catch(err => {
                        return partDone(err);
                    });
                }, (err) => {
                    if (err)
                        return onDone(err);
                    return onDone(null, result);
                });
            });
        });
    });
};
