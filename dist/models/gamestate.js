"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const Mrpas = require("mrpas");
const descriptions_1 = require("../server/gidmetadata/descriptions");
const combat_helper_1 = require("../server/helpers/combat-helper");
const maplayer_1 = require("./maplayer");
class GameState {
    constructor(opts) {
        this.players = [];
        this.map = {};
        this.mapName = '';
        this.mapData = { openDoors: {} };
        this.mapNPCs = [];
        this.groundItems = {};
        this.environmentalObjects = [];
        lodash_1.extend(this, opts);
        const denseLayer = this.map.layers[maplayer_1.MapLayer.Walls].data;
        const opaqueObjects = this.map.layers[maplayer_1.MapLayer.OpaqueDecor].objects;
        opaqueObjects.forEach(obj => obj.opacity = 1);
        const denseObjects = this.map.layers[maplayer_1.MapLayer.DenseDecor].objects;
        denseObjects.forEach(obj => obj.density = 1);
        const interactables = this.map.layers[maplayer_1.MapLayer.Interactables].objects;
        interactables.forEach(obj => {
            if (obj.type === 'Door') {
                obj.opacity = 1;
                obj.density = 1;
            }
        });
        const checkObjects = opaqueObjects.concat(interactables);
        this.fov = new Mrpas(this.map.width, this.map.height, (x, y) => {
            const tile = denseLayer[(y * this.map.width) + x];
            if (tile === 0) {
                const object = lodash_1.find(checkObjects, { x: x * 64, y: (y + 1) * 64 });
                return !object || (object && !object.opacity);
            }
            return false;
        });
    }
    get maxSkill() {
        return this.map.properties.maxSkill;
    }
    get allPossibleTargets() {
        return this.players.concat(this.mapNPCs);
    }
    addNPC(npc) {
        npc.$$map = this.map;
        this.mapNPCs.push(npc);
    }
    findNPC(uuid) {
        return lodash_1.find(this.mapNPCs, { uuid });
    }
    removeNPC(npc) {
        lodash_1.pull(this.mapNPCs, npc);
    }
    addPlayer(player) {
        player.$$map = this.map;
        this.players.push(player);
        this.resetPlayerStatus(player);
    }
    addInteractable(obj) {
        this.map.layers[maplayer_1.MapLayer.Interactables].objects.push(obj);
        this.environmentalObjects.push(obj);
    }
    getInteractable(x, y, useOffset = true, typeFilter) {
        const findObj = { x: x * 64, y: (y + (useOffset ? 1 : 0)) * 64 };
        if (typeFilter)
            findObj.type = typeFilter;
        return lodash_1.find(this.map.layers[maplayer_1.MapLayer.Interactables].objects, findObj);
    }
    removeInteractable(obj) {
        const check = x => x === obj;
        this.map.layers[maplayer_1.MapLayer.Interactables].objects = lodash_1.reject(this.map.layers[maplayer_1.MapLayer.Interactables].objects, check);
        this.environmentalObjects = lodash_1.reject(this.environmentalObjects, check);
    }
    findPlayer(username) {
        return lodash_1.find(this.players, { username });
    }
    removePlayer(username) {
        this.players = lodash_1.reject(this.players, p => p.username === username);
    }
    resetFOV(player) {
        Object.keys(player.$fov).forEach(x => {
            Object.keys(player.$fov[x]).forEach(y => {
                player.$fov[x][y] = false;
            });
        });
    }
    calculateFOV(player) {
        const affected = {};
        this.fov.compute(player.x, player.y, 4, (x, y) => {
            return affected[x - player.x] && affected[x - player.x][y - player.y];
        }, (x, y) => {
            affected[x - player.x] = affected[x - player.x] || {};
            affected[x - player.x][y - player.y] = true;
        });
        player.$fov = affected;
    }
    getInRange(arr, ref, radius, except = []) {
        const { x, y } = ref;
        return lodash_1.reject(arr, p => {
            if (ref.$fov) {
                const offsetX = p.x - x;
                const offsetY = p.y - y;
                if (!ref.canSee(offsetX, offsetY))
                    return true;
            }
            return p.x < x - radius
                || p.x > x + radius
                || p.y < y - radius
                || p.y > y + radius
                || lodash_1.includes(except, p.uuid);
        });
    }
    getPlayersInRange(ref, radius, except = []) {
        return this.getInRange(this.players, ref, radius, except);
    }
    getAllInRange(ref, radius, except = []) {
        return this.getInRange(this.allPossibleTargets, ref, radius, except);
    }
    checkTargetForHostility(me, target) {
        if (me.agro[target.uuid])
            return true;
        if (me.allegianceReputation[target.allegiance] <= 0)
            return true;
        if (me.allegiance === target.allegiance)
            return false;
        if (me.hostility === 'Always')
            return true;
        if (me.alignment === 'Evil' && (target.alignment === 'Neutral' || target.alignment === 'Good'))
            return true;
        return false;
    }
    getPossibleTargetsFor(me, radius) {
        return lodash_1.filter(this.allPossibleTargets, char => {
            // no hitting myself
            if (me === char)
                return false;
            // no hitting dead people
            if (char.isDead())
                return false;
            // if they can't attack, they're not worth fighting
            if (char.hostility === 'Never')
                return false;
            // they have to be visible
            const inRadius = char.x > me.x - radius
                && char.x < me.x + radius
                && char.y > me.y - radius
                && char.y < me.y + radius;
            if (!inRadius)
                return false;
            if (me.$fov) {
                const offsetX = char.x - me.x;
                const offsetY = char.y - me.y;
                if (!me.canSee(offsetX, offsetY))
                    return false;
            }
            if (!me.canSeeThroughStealthOf(char))
                return false;
            if (this.checkTargetForHostility(me, char))
                return true;
            return false;
        });
    }
    resetPlayerStatus(player, ignoreMessages = false) {
        this.calculateFOV(player);
        const mapLayers = this.map.layers;
        const playerOffset = (player.y * this.map.width) + player.x;
        const swimTile = mapLayers[maplayer_1.MapLayer.Fluids].data[playerOffset];
        const swimInfo = descriptions_1.GetSwimLevel(swimTile);
        if (swimInfo) {
            player.$$swimElement = swimInfo.element;
            player.swimLevel = swimInfo.swimLevel;
        }
        else {
            player.swimLevel = 0;
        }
        if (ignoreMessages)
            return;
        const findMe = (reg) => {
            const x = (reg.x / 64);
            const y = (reg.y / 64);
            const width = reg.width / 64;
            const height = reg.height / 64;
            return player.x >= x
                && player.x < x + width
                && player.y >= y
                && player.y < y + height;
        };
        const regionObjs = lodash_1.filter(this.map.layers[maplayer_1.MapLayer.RegionDescriptions].objects, reg => findMe(reg));
        const regionObj = lodash_1.minBy(regionObjs, 'width');
        let regionDesc = '';
        if (regionObj && regionObj.properties.desc) {
            regionDesc = regionObj.properties.desc;
        }
        const descObjs = this.map.layers[maplayer_1.MapLayer.Interactables].objects.concat(this.map.layers[maplayer_1.MapLayer.Decor].objects);
        const descObj = lodash_1.find(descObjs, { x: player.x * 64, y: (player.y + 1) * 64 });
        const intDesc = descriptions_1.GetGidDescription(descObj ? descObj.gid : 0);
        const swimDesc = descriptions_1.GetGidDescription(swimTile);
        const foliageDesc = mapLayers[maplayer_1.MapLayer.Foliage].data[playerOffset] ? 'You are near some trees.' : '';
        const floorDesc = descriptions_1.GetGidDescription(mapLayers[maplayer_1.MapLayer.Floors].data[playerOffset]);
        const terrainDesc = descriptions_1.GetGidDescription(mapLayers[maplayer_1.MapLayer.Terrain].data[playerOffset]);
        const desc = intDesc || swimDesc || foliageDesc || floorDesc || terrainDesc;
        const hasNewRegion = regionDesc && regionDesc !== player.$$lastRegion;
        const bgmObj = lodash_1.filter(this.map.layers[maplayer_1.MapLayer.BackgroundMusic].objects, reg => findMe(reg))[0];
        player.bgmSetting = bgmObj ? bgmObj.name : 'wilderness';
        if (hasNewRegion) {
            player.$$lastRegion = regionDesc;
            player.sendClientMessage({ message: regionDesc, subClass: 'env' });
        }
        else if (!regionDesc) {
            player.$$lastRegion = '';
        }
        if (!hasNewRegion && desc !== player.$$lastDesc) {
            player.$$lastDesc = desc;
            player.sendClientMessage({ message: desc, subClass: 'env' });
        }
    }
    toggleDoor(door) {
        door.isOpen = !door.isOpen;
        door.opacity = !door.isOpen;
        door.density = !door.isOpen;
        this.mapData.openDoors[door.id] = { isOpen: door.isOpen, baseGid: door.gid, x: door.x, y: door.y - 64 };
    }
    isItemValueStackable(item) {
        return item.itemClass === 'Coin';
    }
    addItemToGround({ x, y }, item) {
        if (!item)
            return;
        item.x = x;
        item.y = y;
        this.groundItems[x] = this.groundItems[x] || {};
        this.groundItems[x][y] = this.groundItems[x][y] || {};
        this.groundItems[x][y][item.itemClass] = this.groundItems[x][y][item.itemClass] || [];
        const typeList = this.groundItems[x][y][item.itemClass];
        if (this.isItemValueStackable(item) && typeList[0]) {
            typeList[0].value += item.value;
        }
        else {
            typeList.push(item);
        }
    }
    removeItemFromGround(item) {
        // initalize array if not exist
        this.getGroundItems(item.x, item.y)[item.itemClass];
        this.groundItems[item.x][item.y][item.itemClass] = lodash_1.reject(this.groundItems[item.x][item.y][item.itemClass], i => i.uuid === item.uuid);
        if (lodash_1.size(this.groundItems[item.x][item.y][item.itemClass]) === 0)
            delete this.groundItems[item.x][item.y][item.itemClass];
        if (lodash_1.size(this.groundItems[item.x][item.y]) === 0)
            delete this.groundItems[item.x][item.y];
        if (lodash_1.size(this.groundItems[item.x]) === 0)
            delete this.groundItems[item.x];
        delete item.x;
        delete item.y;
    }
    serializableGroundItems() {
        const groundItems = lodash_1.cloneDeep(this.groundItems);
        Object.keys(groundItems).forEach(x => {
            Object.keys(groundItems[x]).forEach(y => {
                delete groundItems[x][y].Corpse;
            });
        });
        return groundItems;
    }
    getGroundItems(x, y) {
        if (!this.groundItems[x])
            this.groundItems[x] = {};
        if (!this.groundItems[x][y])
            this.groundItems[x][y] = {};
        return this.groundItems[x][y];
    }
    tickPlayers() {
        this.players.forEach(p => {
            p.tick();
            if (p.swimLevel > 0) {
                const hpPercentLost = p.swimLevel * 4;
                const hpLost = Math.floor(p.hp.maximum * (hpPercentLost / 100));
                combat_helper_1.CombatHelper.dealOnesidedDamage(p, { damage: hpLost, damageClass: p.$$swimElement || 'water', damageMessage: 'You are drowning!', suppressIfNegative: true });
            }
        });
    }
    cleanNPCs() {
        return this.mapNPCs.map(npc => {
            const baseObj = lodash_1.pick(npc, [
                'agro', 'uuid', 'name',
                'hostility', 'alignment', 'allegiance', 'allegianceReputation',
                'dir', 'sprite',
                'leftHand', 'rightHand', 'gear.Armor', 'gear.Robe1', 'gear.Robe2',
                'hp',
                'x', 'y',
                'effects',
                'totalStats.stealth'
            ]);
            if (!baseObj.gear)
                baseObj.gear = {};
            return baseObj;
        });
    }
    checkIfDenseWall(x, y) {
        const adjustedY = y * this.map.width;
        return this.map.layers[maplayer_1.MapLayer.Walls].data[x + adjustedY]
            || this.map.layers[maplayer_1.MapLayer.Foliage].data[x + adjustedY];
    }
    get playerHash() {
        return lodash_1.reduce(this.players, (prev, p) => {
            prev[p.username] = p;
            p._party = p.party;
            return prev;
        }, {});
    }
    toJSON() {
        return {
            mapData: this.mapData,
            mapName: this.mapName,
            mapNPCs: this.cleanNPCs(),
            players: this.playerHash,
            groundItems: this.groundItems,
            environmentalObjects: this.environmentalObjects
        };
    }
}
exports.GameState = GameState;
//# sourceMappingURL=gamestate.js.map