"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BehaviorSubject_1 = require("rxjs/BehaviorSubject");
const lodash_1 = require("lodash");
class LobbyState {
    constructor({ accounts = [], messages = [], motd = '' }) {
        this.accounts = [];
        this.messages = [];
        this.account$ = new BehaviorSubject_1.BehaviorSubject([]);
        this.inGame = {};
        this.status = {};
        this.accounts = accounts;
        this.messages = messages;
        this.motd = motd;
    }
    syncTo(state) {
        const oldAccLength = this.accounts.length;
        lodash_1.extend(this, state);
        if (this.accounts.length !== oldAccLength) {
            this.account$.next(this.accounts);
        }
        this.accounts.forEach(account => {
            this.inGame[account.username] = account.inGame;
            this.status[account.username] = account.status;
        });
    }
    addMessage(message) {
        if (!message.timestamp)
            message.timestamp = Date.now();
        this.messages.push(message);
        if (this.messages.length > 500) {
            this.messages.shift();
        }
    }
    findAccount(userId) {
        return lodash_1.find(this.accounts, { userId });
    }
    addAccount(account) {
        this.accounts.push(account);
        this.account$.next(this.accounts);
    }
    removeAccount(username) {
        this.accounts = lodash_1.reject(this.accounts, account => account.username === username);
        this.account$.next(this.accounts);
    }
    removeAccountAtPosition(position) {
        lodash_1.pullAt(this.accounts, [position]);
        this.account$.next(this.accounts);
    }
    toJSON() {
        return {
            accounts: this.accounts,
            messages: this.messages,
            motd: this.motd
        };
    }
}
exports.LobbyState = LobbyState;
//# sourceMappingURL=lobbystate.js.map