"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config({ silent: true });
const database_1 = require("./database");
const api_1 = require("./api");
const logger_1 = require("./logger");
if (!process.env.AUTH0_SECRET) {
    console.log('No env.AUTH0_SECRET. Set one.');
    process.exit(0);
}
Promise.all([database_1.DB.isReady, api_1.API.isReady]).then(() => {
    console.log('Server ready!');
});
process.on('unhandledRejection', e => {
    logger_1.Logger.error(e);
});
process.on('uncaughtException', e => {
    logger_1.Logger.error(e);
});
//# sourceMappingURL=index.js.map