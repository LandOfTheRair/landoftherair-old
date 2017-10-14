"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../base/Command");
const command_executor_1 = require("../../../helpers/command-executor");
class Interact extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~interact';
    }
    execute(player, { room, gameState, x, y }) {
        // can't interact from >1 tile away
        if (Math.abs(x) > 1 || Math.abs(y) > 1)
            return;
        const interactable = player.$$room.state.getInteractable(player.x + x, player.y + y);
        if (!interactable)
            return;
        let cmdInfo = {};
        switch (interactable.type) {
            case 'Door':
                cmdInfo = this.doDoor(gameState, interactable);
                break;
        }
        const { command, shouldContinue, errorMessage } = cmdInfo;
        const args = `${x} ${y}`;
        if (!command || !shouldContinue) {
            if (errorMessage)
                player.sendClientMessage(errorMessage);
            return;
        }
        command_executor_1.CommandExecutor.executeCommand(player, command, { room, gameState, args });
    }
    doDoor(gameState, door) {
        const gameStateDoor = gameState.mapData.openDoors[door.id];
        const shouldContinue = !gameStateDoor || (gameStateDoor && !gameStateDoor.isOpen);
        return { command: 'open', shouldContinue };
    }
}
exports.Interact = Interact;
//# sourceMappingURL=Interact.js.map