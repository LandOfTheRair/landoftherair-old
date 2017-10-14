"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../base/Command");
const maplayer_1 = require("../../../../models/maplayer");
const lodash_1 = require("lodash");
const character_1 = require("../../../../models/character");
class OpenDoor extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = ['open', 'close'];
        this.format = 'DIR';
    }
    execute(player, { room, gameState, args }) {
        if (!args)
            return false;
        let { x, y } = player.getXYFromDir(args);
        if (lodash_1.includes(args, ' ')) {
            [x, y] = args.split(' ').map(z => +z);
        }
        const map = gameState.map;
        const interactables = map.layers[maplayer_1.MapLayer.Interactables].objects;
        const targetX = (player.x + x);
        const targetY = (player.y + y + 1);
        const door = lodash_1.find(interactables, { x: targetX * 64, y: targetY * 64, type: 'Door' });
        if (!door) {
            player.sendClientMessage('There is no door there.');
            return;
        }
        door.properties = door.properties || {};
        const { requireLockpick, skillRequired, requireHeld } = door.properties;
        if (!door.isOpen
            && (requireLockpick || requireHeld)) {
            let shouldOpen = false;
            if (requireHeld
                && player.hasHeldItem(door.properties.requireHeld))
                shouldOpen = true;
            if (requireLockpick
                && skillRequired
                && player.baseClass === 'Thief'
                && player.hasHeldItem('Lockpick', 'right')) {
                const playerSkill = player.calcSkillLevel(character_1.SkillClassNames.Thievery);
                if (playerSkill < skillRequired) {
                    return player.sendClientMessage('You are not skilled enough to pick this lock.');
                }
                player.sendClientMessage('You successfully picked the lock!');
                player.setRightHand(null);
                shouldOpen = true;
            }
            if (!shouldOpen) {
                return player.sendClientMessage('The door is locked.');
            }
        }
        player.sendClientMessage(door.isOpen ? 'You close the door.' : 'You open the door.');
        gameState.toggleDoor(door);
        gameState.getPlayersInRange({ x: targetX, y: targetY }, 3).forEach(p => gameState.calculateFOV(p));
    }
}
exports.OpenDoor = OpenDoor;
//# sourceMappingURL=OpenDoor.js.map