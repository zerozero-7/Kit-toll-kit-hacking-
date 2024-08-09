// criação de banco de dados.
const { JsonDatabase } = require("wio.db");
const dbConfigs = new JsonDatabase({databasePath:"./databases/dbConfigs.json"});
const dbEmojis = new JsonDatabase({databasePath:"./databases/dbEmojis.json"});
const dbPermissions = new JsonDatabase({databasePath:"./databases/dbPermissions.json"});
const dbSugestions = new JsonDatabase({databasePath:"./databases/dbSugestions.json"});
const dbMessages = new JsonDatabase({databasePath:"./databases/dbMessages.json"});
const dbGiveaway = new JsonDatabase({databasePath:"./databases/dbGiveaway.json"});

// exportação do banco de dados.
module.exports.dbConfigs = dbConfigs;
module.exports.dbEmojis = dbEmojis;
module.exports.dbPermissions = dbPermissions;
module.exports.dbSugestions = dbSugestions;
module.exports.dbMessages = dbMessages;
module.exports.dbGiveaway = dbGiveaway;