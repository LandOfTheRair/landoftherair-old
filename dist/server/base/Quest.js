"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Quest {
    get name() {
        return this.constructor.name;
    }
    get initialData() {
        return {};
    }
    static canUpdateProgress(player, questOpts = {}) {
        return false;
    }
    static updateProgress(player, questOpts = {}) { }
    static isComplete(player) {
        return false;
    }
    static incompleteText(player) {
        return '';
    }
    static completeFor(player) { }
    static givePlayerRewards(player) { }
}
exports.Quest = Quest;
//# sourceMappingURL=Quest.js.map