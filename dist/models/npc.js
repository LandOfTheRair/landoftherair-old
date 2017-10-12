"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const character_1 = require("./character");
const uuid = require("uuid/v4");
class NPC extends character_1.Character {
    constructor() {
        super(...arguments);
        this.hostility = 'OnHit';
        this.trainSkills = [];
    }
    init() {
        if (!this.uuid)
            this.uuid = uuid();
        this.initAI();
        this.initSack();
        this.initBelt();
        this.recalculateStats();
    }
    toJSON() {
        return lodash_1.omit(super.toJSON(), ['script', 'parser', 'spawner', '$$ai', 'path']);
    }
    receiveMessage(player, message) {
        if (!this.parser)
            return;
        this.parser.setEnv('player', player);
        const output = this.parser.parse(message);
        if (!output || output === 'undefined')
            return;
        this.setDirRelativeTo(player);
        player.sendClientMessage({ name: this.name, message: output });
    }
    setDirRelativeTo(char) {
        const diffX = char.x - this.x;
        const diffY = char.y - this.y;
        this.setDirBasedOnXYDiff(diffX, diffY);
    }
    setPath(path) {
        if (!path)
            return;
        this.path = lodash_1.flatten(path.split(' ').map(str => {
            const [numSteps, dir] = str.split('-');
            const coord = this.getXYFromDir(dir);
            const ret = [];
            for (let i = 0; i < +numSteps; i++) {
                ret.push(coord);
            }
            return ret;
        }));
    }
    tick() {
        super.tick();
        if (this.$$ai && this.$$ai.tick) {
            this.$$ai.tick.dispatch(this);
        }
    }
    isValidStep({ x, y }) {
        if (!this.spawner)
            return true;
        if (this.spawner.randomWalkRadius > 0 && this.distFrom(this.spawner, { x, y }) > this.spawner.randomWalkRadius)
            return false;
        return true;
    }
    canDie() {
        return super.canDie() && this.hostility !== 'Never';
    }
    kill(dead) {
        if (this.$$shouldStrip) {
            const stripPoint = this.$$stripX && this.$$stripY ? { x: this.$$stripX, y: this.$$stripY } : this.spawner;
            dead.strip(this.$$stripOnSpawner ? stripPoint : this, this.$$stripRadius);
        }
    }
    die(killer) {
        super.die(killer);
        if (!this.spawner)
            return false;
        const giveXp = this.giveXp || { min: 1, max: 10 };
        if (killer) {
            if (killer.username) {
                killer.changeRep(this.allegiance, -this.repMod);
                killer.gainExpFromKills(lodash_1.random(giveXp.min, giveXp.max));
            }
            this.$$room.calculateLootDrops(this, killer);
        }
    }
    restore() {
        if (this.$$corpseRef) {
            this.$$room.dropCorpseItems(this.$$corpseRef);
            this.$$room.removeItemFromGround(this.$$corpseRef);
            if (this.$$corpseRef.$heldBy) {
                this.$$room.corpseCheck(this.$$room.state.findPlayer(this.$$corpseRef.$heldBy));
            }
        }
        this.spawner.removeNPC(this);
    }
    sendLeashMessage() {
        if (!this.leashMessage)
            return;
        this.sendClientMessageToRadius(`You hear ${this.leashMessage}.`, 8);
    }
    sendSpawnMessage() {
        if (!this.spawnMessage)
            return;
        this.sendClientMessageToRadius(`You hear ${this.spawnMessage}.`, 8);
    }
}
exports.NPC = NPC;
//# sourceMappingURL=npc.js.map