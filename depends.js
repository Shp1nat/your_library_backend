const {paths} = require('./files-paths.js');
const path  = require('path');
// todo разобраться в чем разница files-paths и depends. нужны ли мне два этих файла или объединить в один

module.exports.commandsPath = path.join(__dirname, 'commands');
module.exports.builtInAddressPath = path.join(__dirname, 'builtIn', 'address');