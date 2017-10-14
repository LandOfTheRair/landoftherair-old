"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
class Account {
    constructor(opts) {
        this.characterNames = [];
        this.maxCharacters = 4;
        this.isGM = false;
        this.inGame = -1;
        this.status = 'Available';
        lodash_1.extend(this, opts);
    }
    toJSON() {
        return {
            username: this.username,
            status: this.status,
            inGame: this.inGame,
            isGM: this.isGM
        };
    }
}
exports.Account = Account;
//# sourceMappingURL=account.js.map