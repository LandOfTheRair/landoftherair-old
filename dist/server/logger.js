"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Rollbar = require("rollbar");
let rollbar = null;
const rollbarToken = process.env.ROLLBAR_TOKEN;
if (rollbarToken) {
    rollbar = new Rollbar({
        accessToken: rollbarToken,
        captureUncaught: true,
        captureUnhandledRejections: true
    });
}
class Logger {
    static _formatMessage(message) {
        return `[${new Date()}] ${message}`;
    }
    static log(msg) {
        console.log(this._formatMessage(msg));
    }
    static error(error, payload) {
        console.error(this._formatMessage(error));
        if (error.stack) {
            console.error(error.stack);
        }
        if (rollbarToken) {
            if (payload) {
                rollbar.error(error, null, payload);
            }
            else {
                rollbar.error(error);
            }
        }
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map