"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const Quest_1 = require("../../../base/Quest");
class KillRebels extends Quest_1.Quest {
    static get requirements() {
        return {
            type: 'kill',
            npcIds: [
                'Rylt Renegade Prisoner'
            ]
        };
    }
    static get initialData() {
        return lodash_1.clone({ kills: 0 });
    }
    static canUpdateProgress(player, questOpts = {}) {
        return questOpts.kill && lodash_1.includes(this.requirements.npcIds, questOpts.kill);
    }
    static updateProgress(player, questOpts = {}) {
        const { kills } = player.getQuestData(this);
        const structure = this.initialData;
        structure.kills = kills + 1;
        player.setQuestData(this, structure);
    }
    static isComplete(player) {
        const { kills } = player.getQuestData(this);
        return kills >= KillRebels.killsRequired;
    }
    static incompleteText(player) {
        const { kills } = player.getQuestData(this);
        return `By my records, you have to kill ${this.killsRequired - kills} prisoners yet!`;
    }
    static completeFor(player) {
        this.givePlayerRewards(player);
        player.completeQuest(this);
    }
    static givePlayerRewards(player) {
        player.gainGold(2000);
        player.gainExp(500);
    }
}
KillRebels.isRepeatable = true;
KillRebels.killsRequired = 20;
exports.KillRebels = KillRebels;
//# sourceMappingURL=KillRebels.js.map