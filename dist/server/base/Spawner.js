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
const npc_loader_1 = require("../helpers/npc-loader");
const lootastic_1 = require("lootastic");
const lodash_1 = require("lodash");
const npc_1 = require("../../models/npc");
const logger_1 = require("../logger");
const common_responses_1 = require("../scripts/npc/common-responses");
class Spawner {
    constructor(room, { x, y, map }, spawnOpts) {
        this.room = room;
        this.currentTick = 0;
        // in half-seconds
        this.respawnRate = 240;
        this.initialSpawn = 0;
        this.maxCreatures = 5;
        this.spawnRadius = 0;
        this.randomWalkRadius = 10;
        this.leashRadius = 20;
        this.npcs = [];
        this.requireDeadToRespawn = false;
        this.canSlowDown = true;
        this.shouldStrip = false;
        this.stripRadius = 0;
        this.stripOnSpawner = true;
        this.$$slowTicks = 0;
        this.$$isStayingSlow = false;
        lodash_1.extend(this, spawnOpts);
        this.x = x;
        this.y = y;
        this.map = map;
        if (this.currentTick === 0) {
            for (let i = 0; i < this.initialSpawn; i++) {
                this.createNPC();
            }
        }
    }
    isActive() {
        return true;
    }
    shouldLoadItem(itemName) {
        if (lodash_1.isString(itemName))
            return { name: itemName };
        if (itemName.chance && itemName.name) {
            if (itemName.chance < 0)
                return { name: itemName.name };
            if (lodash_1.random(0, 100) <= itemName.chance)
                return { name: itemName.name };
        }
        return null;
    }
    chooseItemFrom(choices) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!choices)
                return null;
            if (lodash_1.isString(choices))
                return npc_loader_1.NPCLoader.loadItem(choices);
            const itemChooser = new lootastic_1.LootTable(choices);
            const item = itemChooser.chooseWithReplacement(1);
            if (item && item[0] && item[0] !== 'none')
                return npc_loader_1.NPCLoader.loadItem(item[0]);
            return null;
        });
    }
    chooseSpriteFrom(choices) {
        if (lodash_1.isNumber(choices))
            return choices;
        if (!choices || choices.length === 0)
            return 0;
        return lodash_1.sample(choices);
    }
    createNPC() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.npcIds || this.npcIds.length === 0) {
                logger_1.Logger.error(`No valid npcIds for spawner ${this.constructor.name} at ${this.x}, ${this.y} on ${this.map}`);
                return;
            }
            const npcChooser = new lootastic_1.LootTable(this.npcIds);
            const chosenNPC = npcChooser.chooseWithReplacement(1)[0];
            const npcData = yield npc_loader_1.NPCLoader.loadNPCData(chosenNPC);
            if (!npcData) {
                logger_1.Logger.error(`No valid spawn for spawner ${this.constructor.name} at ${this.x}, ${this.y} on ${this.map}`);
                return;
            }
            npcData.sprite = this.chooseSpriteFrom(npcData.sprite);
            npcData.rightHand = yield this.chooseItemFrom(npcData.rightHand);
            npcData.leftHand = yield this.chooseItemFrom(npcData.leftHand);
            if (npcData.gear) {
                yield Promise.all(Object.keys(npcData.gear).map((slot) => __awaiter(this, void 0, void 0, function* () {
                    const item = yield this.chooseItemFrom(npcData.gear[slot]);
                    npcData.gear[slot] = item;
                    return item;
                })));
            }
            let sackItems = [];
            if (npcData.sack) {
                const items = yield Promise.all(npcData.sack.map((itemName) => __awaiter(this, void 0, void 0, function* () {
                    const { name } = this.shouldLoadItem(itemName);
                    if (!name)
                        return null;
                    return yield npc_loader_1.NPCLoader.loadItem(name);
                })));
                sackItems = lodash_1.compact(items);
            }
            let beltItems = [];
            if (npcData.belt) {
                const items = yield Promise.all(npcData.belt.map((itemName) => __awaiter(this, void 0, void 0, function* () {
                    const { name } = this.shouldLoadItem(itemName);
                    if (!name)
                        return null;
                    return yield npc_loader_1.NPCLoader.loadItem(name);
                })));
                beltItems = lodash_1.compact(items);
            }
            npcData.x = lodash_1.random(this.x - this.spawnRadius, this.x + this.spawnRadius);
            npcData.y = lodash_1.random(this.y - this.spawnRadius, this.y + this.spawnRadius);
            npcData.map = this.map;
            if (!npcData.name) {
                npcData.name = this.room.determineNPCName(npcData);
            }
            if (npcData.gold) {
                npcData.gold = lodash_1.random(npcData.gold.min, npcData.gold.max);
            }
            if (npcData.hp) {
                const hp = lodash_1.random(npcData.hp.min, npcData.hp.max);
                npcData.stats.hp = hp;
            }
            if (npcData.mp) {
                const mp = lodash_1.random(npcData.mp.min, npcData.mp.max);
                npcData.stats.mp = mp;
            }
            const npc = new npc_1.NPC(npcData);
            const additionalSackItems = yield this.room.getAllLoot(npc, 0, true);
            sackItems.push(...additionalSackItems);
            beltItems.forEach(item => npc.belt.addItem(item));
            sackItems.forEach(item => npc.sack.addItem(item));
            const ai = lodash_1.sample(this.npcAISettings) || 'default';
            const { tick } = require(`../scripts/ai/${ai}`);
            if (tick)
                npc.$$ai.tick.add(tick);
            if (npc.combatMessages) {
                common_responses_1.RandomlyShouts(npc, npc.combatMessages);
            }
            npc.allegiance = npcData.allegiance;
            npc.alignment = npcData.alignment;
            npc.hostility = npcData.hostility;
            npc.spawner = this;
            npc.$$room = this.room;
            npc.$$shouldStrip = this.shouldStrip;
            npc.$$stripRadius = this.stripRadius;
            npc.$$stripOnSpawner = this.stripOnSpawner;
            npc.$$stripX = this.stripX;
            npc.$$stripY = this.stripY;
            npc.sendSpawnMessage();
            this.assignPath(npc);
            this.addNPC(npc);
            npc.recalculateStats();
            npc.hp.toMaximum();
            npc.mp.toMaximum();
            return npc;
        });
    }
    addNPC(npc) {
        this.npcs.push(npc);
        this.room.state.addNPC(npc);
    }
    removeNPC(npc) {
        lodash_1.pull(this.npcs, npc);
        this.room.state.removeNPC(npc);
    }
    assignPath(npc) {
        if (!this.paths || this.paths.length === 0)
            return false;
        npc.setPath(lodash_1.sample(this.paths));
    }
    getDistsForPlayers() {
        return this.room.state.players.map(x => x.distFrom(this));
    }
    shouldSlowDown(dists) {
        if (!this.canSlowDown)
            return false;
        return dists.length > 0 && lodash_1.min(dists) > Math.max(this.leashRadius, 30);
    }
    tick() {
        if (!this.isActive())
            return;
        if (this.requireDeadToRespawn) {
            if (this.npcs.length === 0 || lodash_1.every(this.npcs, npc => npc.isDead()))
                this.currentTick++;
        }
        else {
            this.currentTick++;
        }
        if (this.$$slowTicks > 0) {
            this.$$slowTicks--;
            return;
        }
        if (this.shouldSlowDown(this.getDistsForPlayers())) {
            this.$$slowTicks = 4;
            this.$$isStayingSlow = true;
        }
        else {
            this.$$isStayingSlow = false;
        }
        if (this.currentTick > this.respawnRate
            && this.npcs.length < this.maxCreatures
            && (this.alwaysSpawn || this.room.canSpawnCreatures)) {
            this.currentTick = 0;
            this.createNPC();
        }
    }
    npcTick() {
        this.npcs.forEach(npc => {
            npc.tick();
            if (npc.hostility === 'Never')
                return;
            if (!this.$$isStayingSlow) {
                npc.$$room.state.calculateFOV(npc);
            }
        });
    }
}
exports.Spawner = Spawner;
//# sourceMappingURL=Spawner.js.map