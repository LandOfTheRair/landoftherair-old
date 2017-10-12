"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../base/Command");
class ShowStats extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = 'show stats';
    }
    execute(player, { room, args }) {
        player.sendClientMessage(`You are ${player.name}, the ${player.alignment} level ${player.level} ${player.baseClass}.`);
        player.sendClientMessage(`Your allegiance lies with the ${player.allegiance}.`);
        Object.keys(player.baseStats).forEach((key) => {
            player.sendClientMessage(`Your ${key.toUpperCase()} is ${player.getTotalStat(key)} (BASE: ${player.getBaseStat(key)}).`);
        });
    }
}
ShowStats.macroMetadata = {
    name: 'Show Stats',
    macro: 'show stats',
    icon: 'checklist',
    color: '#000000',
    mode: 'autoActivate'
};
exports.ShowStats = ShowStats;
//# sourceMappingURL=ShowStats.js.map