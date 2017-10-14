"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../base/Command");
class ShowSkills extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = 'show skills';
    }
    execute(player, { room, args }) {
        player.sendClientMessage(`You are ${player.name}, the ${player.alignment} level ${player.level} ${player.baseClass}.`);
        player.sendClientMessage(`Your allegiance lies with the ${player.allegiance}.`);
        Object.keys(player.allSkills).forEach(key => {
            player.sendClientMessage(`Your ${key.toUpperCase()} skill level is ${player.calcSkillLevel(key)}.`);
        });
    }
}
ShowSkills.macroMetadata = {
    name: 'Show Skills',
    macro: 'show skills',
    icon: 'checklist',
    color: '#000000',
    mode: 'autoActivate'
};
exports.ShowSkills = ShowSkills;
//# sourceMappingURL=ShowSkills.js.map