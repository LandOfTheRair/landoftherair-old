"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../base/Command");
class Tickle extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = 'tickle';
        this.format = 'Target?';
    }
    execute(player, { room, gameState, args }) {
        return __awaiter(this, void 0, void 0, function* () {
            const possTargets = room.getPossibleMessageTargets(player, args);
            if (possTargets && possTargets[0]) {
                const target = possTargets[0];
                player.sendClientMessage(`You tickle ${target.name}!`);
                target.sendClientMessage(`${player.name} tickles you!`);
                player.sendClientMessageToRadius(`${player.name} tickles ${target.name}!`, 4, [player.uuid, target.uuid]);
                player.removeAgro(target);
                return;
            }
            player.sendClientMessage('You tickles the air!');
            player.sendClientMessageToRadius(`${player.name} tickles the air!`, 4, [player.uuid]);
        });
    }
}
exports.Tickle = Tickle;
//# sourceMappingURL=Tickle.js.map