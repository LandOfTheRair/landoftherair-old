"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../base/Command");
class LookAt extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = 'look at';
        this.format = 'TARGET';
    }
    execute(player, { room, args }) {
        if (!args)
            return false;
        const possTargets = room.getPossibleMessageTargets(player, args);
        const target = possTargets[0];
        if (!target)
            return player.sendClientMessage('You do not see that person.');
        const chestItem = target.gear.Robe2 || target.gear.Robe1 || target.gear.Armor;
        const chestDesc = chestItem ? chestItem.desc : 'nothing';
        const leftDesc = target.leftHand ? target.leftHand.desc : '';
        const rightDesc = target.rightHand ? target.rightHand.desc : '';
        let handDesc = '';
        if (!leftDesc && !rightDesc) {
            handDesc = 'nothing';
        }
        else if (leftDesc && rightDesc) {
            handDesc = `${leftDesc} and ${rightDesc}`;
        }
        else {
            handDesc = leftDesc || rightDesc;
        }
        const description = `
    You are looking at a being named ${target.name}. 
    ${target.name} is of ${(target.alignment || 'unknown').toLowerCase()} alignment. 
    ${target.name} is wearing ${chestDesc} and holding ${handDesc}.`;
        player.sendClientMessage(description);
    }
}
LookAt.macroMetadata = {
    name: 'Look At',
    macro: 'look at',
    icon: 'look-at',
    color: '#8A6948',
    mode: 'clickToTarget'
};
exports.LookAt = LookAt;
//# sourceMappingURL=LookAt.js.map