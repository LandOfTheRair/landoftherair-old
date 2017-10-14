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
class Mock extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = 'mock';
        this.format = 'Target?';
    }
    execute(player, { room, gameState, args }) {
        return __awaiter(this, void 0, void 0, function* () {
            const possTargets = room.getPossibleMessageTargets(player, args);
            if (possTargets && possTargets[0]) {
                const target = possTargets[0];
                player.sendClientMessage(`You mock ${target.name}!`);
                target.sendClientMessage(`${player.name} mocks you!`);
                player.sendClientMessageToRadius(`${player.name} mocks ${target.name}!`, 4, [player.uuid, target.uuid]);
                target.addAgro(player, 1);
                return;
            }
            player.sendClientMessage('You mock yourself!');
            player.sendClientMessageToRadius(`${player.name} mocks theirself!`, 4, [player.uuid]);
        });
    }
}
exports.Mock = Mock;
//# sourceMappingURL=Mock.js.map