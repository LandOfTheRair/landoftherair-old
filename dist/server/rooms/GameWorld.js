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
const lodash_1 = require("lodash");
const scheduler = require("node-schedule");
const mingy_1 = require("mingy");
const lootastic_1 = require("lootastic");
const fantastical_1 = require("fantastical");
const colyseus_1 = require("colyseus");
const gamestate_1 = require("../../models/gamestate");
const maplayer_1 = require("../../models/maplayer");
const database_1 = require("../database");
const player_1 = require("../../models/player");
const command_executor_1 = require("../helpers/command-executor");
const npc_1 = require("../../models/npc");
const logger_1 = require("../logger");
const Spawner_1 = require("../base/Spawner");
const Classes = require("../classes");
const Effects = require("../effects");
const character_1 = require("../../models/character");
const item_creator_1 = require("../helpers/item-creator");
const item_1 = require("../../models/item");
const locker_1 = require("../../models/container/locker");
const visual_effects_1 = require("../gidmetadata/visual-effects");
const party_manager_1 = require("../helpers/party-manager");
const TICK_DIVISOR = 2;
const TickRates = {
    // tick players every second
    PlayerAction: TICK_DIVISOR,
    // npc actions every 2 seconds
    NPCAction: TICK_DIVISOR * 2,
    // tick spawners every half-second
    SpawnerTick: TICK_DIVISOR,
    PlayerSave: 30 * TICK_DIVISOR
};
class GameWorld extends colyseus_1.Room {
    constructor(opts) {
        super(opts);
        this.spawners = [];
        this.dropTables = {
            region: [],
            map: []
        };
        this.ticks = 0;
        this.allMapNames = opts.allMapNames;
        this.setPatchRate(500 / TICK_DIVISOR);
        this.setSimulationInterval(this.tick.bind(this), 1000 / TICK_DIVISOR);
        this.setState(new gamestate_1.GameState({
            players: [],
            map: lodash_1.cloneDeep(require(opts.mapPath)),
            mapName: opts.mapName
        }));
        this.onInit();
    }
    get allSpawners() {
        return this.spawners;
    }
    get mapRegion() {
        return this.state.map.properties.region;
    }
    get maxSkill() {
        return this.state.map.properties.maxSkill || 1;
    }
    get maxCreatures() {
        return this.state.map.properties.maxCreatures || 0;
    }
    get canSpawnCreatures() {
        return this.state.mapNPCs.length < this.maxCreatures;
    }
    get decayRateHours() {
        return this.state.map.properties.itemExpirationHours || 6;
    }
    get decayChecksMinutes() {
        return this.state.map.properties.itemGarbageCollection || 60;
    }
    savePlayer(player) {
        if (player.$$doNotSave)
            return;
        if (player._id) {
            delete player._id;
        }
        const savePlayer = player.toJSON();
        delete savePlayer.$fov;
        delete savePlayer._party;
        if (player.leftHand && player.leftHand.itemClass === 'Corpse') {
            savePlayer.leftHand = null;
        }
        if (player.rightHand && player.rightHand.itemClass === 'Corpse') {
            savePlayer.rightHand = null;
        }
        return database_1.DB.$players.update({ username: savePlayer.username, charSlot: savePlayer.charSlot }, { $set: savePlayer });
    }
    sendMessageToUsernames(usernames, message) {
        usernames.forEach(username => {
            const client = lodash_1.find(this.clients, { username });
            if (!client)
                return;
            this.sendClientLogMessage(client, message);
        });
    }
    findClient(player) {
        return lodash_1.find(this.clients, { username: player.username });
    }
    sendPlayerLogMessage(player, messageData) {
        const client = this.findClient(player);
        if (!client)
            return;
        this.sendClientLogMessage(client, messageData);
    }
    sendClientLogMessage(client, messageData) {
        let overMessage = messageData;
        let overName = '';
        let overClass = '';
        let overTarget = '';
        let overDir = '';
        let grouping = 'always';
        if (lodash_1.isObject(messageData)) {
            const { message, name, subClass, target, dirFrom } = messageData;
            overMessage = message;
            overName = name;
            overClass = subClass;
            overTarget = target;
            overDir = dirFrom;
            if (overClass) {
                grouping = overClass.split(' ')[0];
            }
        }
        this.send(client, {
            action: 'log_message',
            name: overName,
            message: overMessage,
            subClass: overClass,
            target: overTarget,
            dirFrom: overDir,
            grouping
        });
    }
    showGroundWindow(player) {
        const client = this.findClient(player);
        this.send(client, { action: 'show_ground' });
    }
    showTrainerWindow(player, npc) {
        const client = this.findClient(player);
        this.send(client, { action: 'show_trainer', trainSkills: npc.trainSkills, classTrain: npc.classTrain, uuid: npc.uuid });
    }
    showShopWindow(player, npc) {
        const client = this.findClient(player);
        this.send(client, { action: 'show_shop', vendorItems: npc.vendorItems, uuid: npc.uuid });
    }
    showBankWindow(player, npc) {
        const client = this.findClient(player);
        this.send(client, { action: 'show_bank', uuid: npc.uuid, bankId: npc.bankId });
    }
    createLockerIfNotExist(player, regionId, lockerName, lockerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return database_1.DB.$characterLockers.update({ username: player.username, charSlot: player.charSlot, regionId, lockerId }, { $setOnInsert: { items: [] }, $set: { lockerName } }, { upsert: true });
        });
    }
    loadLocker(player, lockerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return database_1.DB.$characterLockers.findOne({ username: player.username, charSlot: player.charSlot, regionId: this.mapRegion, lockerId })
                .then(lock => lock && lock.lockerId ? new locker_1.Locker(lock) : null);
        });
    }
    updateLocker(player, locker) {
        const client = this.findClient(player);
        this.saveLocker(player, locker);
        this.send(client, { action: 'update_locker', locker });
    }
    saveLocker(player, locker) {
        return database_1.DB.$characterLockers.update({ username: player.username, charSlot: player.charSlot, regionId: locker.regionId, lockerId: locker.lockerId }, { $set: { lockerName: locker.lockerName, items: locker.allItems } });
    }
    openLocker(player, lockerName, lockerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const regionId = this.mapRegion;
            yield this.createLockerIfNotExist(player, regionId, lockerName, lockerId);
            const lockers = yield database_1.DB.$characterLockers.find({ username: player.username, charSlot: player.charSlot, regionId }).toArray();
            const client = this.findClient(player);
            this.send(client, { action: 'show_lockers', lockers, lockerId });
        });
    }
    teleport(player, { newMap, x, y }) {
        const client = this.findClient(player);
        if (newMap && !this.allMapNames[newMap]) {
            this.sendClientLogMessage(client, `Warning: map "${newMap}" does not exist.`);
            return;
        }
        player.x = x;
        player.y = y;
        this.state.resetPlayerStatus(player, true);
        if (newMap && player.map !== newMap) {
            player.map = newMap;
            this.prePlayerMapLeave(player);
            this.savePlayer(player);
            player.$$doNotSave = true;
            this.state.resetFOV(player);
            this.send(client, { action: 'change_map', map: newMap });
        }
    }
    addItemToGround(ref, item) {
        if (item.itemClass !== 'Corpse') {
            this.setItemExpiry(item);
        }
        delete item.$heldBy;
        this.state.addItemToGround(ref, item);
    }
    removeItemFromGround(item) {
        this.removeItemExpiry(item);
        this.state.removeItemFromGround(item);
    }
    // TODO check if player is in this map, return false if not - also, modify this to take a promise? - also fail if in game already
    requestJoin(opts) {
        // console.log('req', opts);
        return true;
    }
    onJoin(client, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const playerData = yield database_1.DB.$players.findOne({ username: client.username, map: this.state.mapName, charSlot: options.charSlot, inGame: { $ne: true } });
            if (!playerData) {
                this.send(client, { error: 'invalid_char', prettyErrorName: 'Invalid Character Data', prettyErrorDesc: 'No idea how this happened!' });
                return false;
            }
            this.send(client, { action: 'set_map', map: this.state.map });
            const player = new player_1.Player(playerData);
            player.$$room = this;
            player.initServer();
            this.setUpClassFor(player);
            this.state.addPlayer(player);
            player.inGame = true;
            this.savePlayer(player);
            if (this.state.mapName === 'Tutorial' && !player.respawnPoint) {
                player.respawnPoint = { x: 14, y: 14, map: 'Tutorial' };
            }
        });
    }
    prePlayerMapLeave(player) {
        this.corpseCheck(player);
        this.restoreCheck(player);
        this.doorCheck(player);
        if (this.state.mapName === 'Tutorial' && player.respawnPoint.map === 'Tutorial') {
            player.respawnPoint = { x: 68, y: 13, map: 'Rylt' };
        }
    }
    leaveGameAndSave(player) {
        return database_1.DB.$players.update({ username: player.username, charSlot: player.charSlot }, { $set: { inGame: false } });
    }
    onLeave(client) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = this.state.findPlayer(client.username);
            this.state.removePlayer(client.username);
            player.inGame = false;
            // do not leave party if you're teleporting between maps
            if (!player.$$doNotSave && player.partyName) {
                this.partyManager.leaveParty(player);
            }
            yield this.leaveGameAndSave(player);
            this.prePlayerMapLeave(player);
            this.savePlayer(player);
        });
    }
    onMessage(client, data) {
        if (!data.command)
            return;
        const player = this.state.findPlayer(client.username);
        data.gameState = this.state;
        data.room = this;
        data.client = client;
        command_executor_1.CommandExecutor.queueCommand(player, data.command, data);
    }
    executeCommand(player, command, args) {
        const data = {
            gameState: this.state,
            room: this,
            args,
            command
        };
        command_executor_1.CommandExecutor.executeCommand(player, data.command, data);
    }
    onInit() {
        return __awaiter(this, void 0, void 0, function* () {
            const timerData = yield this.loadBossTimers();
            const spawnerTimers = timerData ? timerData.spawners : [];
            this.loadNPCsFromMap();
            this.loadSpawners(spawnerTimers);
            this.loadDropTables();
            this.loadGround();
            this.watchForItemDecay();
            this.initPartyManager();
        });
    }
    onDispose() {
        this.saveGround();
        this.saveBossTimers();
        this.partyManager.stopEmitting();
    }
    initPartyManager() {
        this.partyManager = new party_manager_1.PartyManager(this);
    }
    loadBossTimers() {
        return __awaiter(this, void 0, void 0, function* () {
            return database_1.DB.$mapBossTimers.findOne({ mapName: this.state.mapName });
        });
    }
    saveBossTimers() {
        const spawners = this.spawners.filter(spawner => spawner.shouldSerialize && spawner.currentTick > 0);
        const saveSpawners = spawners.map(spawner => ({ x: spawner.x, y: spawner.y, currentTick: spawner.currentTick }));
        if (saveSpawners.length > 0) {
            database_1.DB.$mapBossTimers.update({ mapName: this.state.mapName }, { $set: { spawners: saveSpawners } }, { upsert: true });
        }
    }
    loadGround() {
        return __awaiter(this, void 0, void 0, function* () {
            let obj = yield database_1.DB.$mapGroundItems.findOne({ mapName: this.state.mapName });
            if (!obj)
                obj = {};
            const groundItems = obj.groundItems || {};
            this.checkIfAnyItemsAreExpired(groundItems);
            this.state.groundItems = groundItems;
            database_1.DB.$mapGroundItems.remove({ mapName: this.state.mapName });
        });
    }
    saveGround() {
        return __awaiter(this, void 0, void 0, function* () {
            database_1.DB.$mapGroundItems.update({ mapName: this.state.mapName }, { $set: { groundItems: this.state.serializableGroundItems() } }, { upsert: true });
        });
    }
    checkIfAnyItemsAreExpired(groundItems) {
        Object.keys(groundItems).forEach(x => {
            Object.keys(groundItems[x]).forEach(y => {
                Object.keys(groundItems[x][y]).forEach(itemClass => {
                    groundItems[x][y][itemClass] = lodash_1.compact(groundItems[x][y][itemClass].map(i => this.hasItemExpired(i) ? null : new item_1.Item(i)));
                });
            });
        });
    }
    watchForItemDecay() {
        const rule = new scheduler.RecurrenceRule();
        rule.minute = this.decayChecksMinutes;
        scheduler.scheduleJob(rule, () => {
            this.checkIfAnyItemsAreExpired(this.state.groundItems);
        });
    }
    removeItemExpiry(item) {
        delete item.expiresAt;
    }
    setItemExpiry(item) {
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + this.decayRateHours);
        item.expiresAt = expiry.getTime();
    }
    hasItemExpired(item) {
        return Date.now() > item.expiresAt;
    }
    loadDropTables() {
        return __awaiter(this, void 0, void 0, function* () {
            this.dropTables.map = ((yield database_1.DB.$mapDrops.findOne({ mapName: this.state.mapName })) || {}).drops || [];
            if (this.mapRegion) {
                this.dropTables.region = ((yield database_1.DB.$regionDrops.findOne({ regionName: this.mapRegion })) || {}).drops || [];
            }
        });
    }
    loadNPCsFromMap() {
        const npcs = this.state.map.layers[maplayer_1.MapLayer.NPCs].objects;
        if (npcs.length === 0)
            return;
        const normalNPCSpawner = new Spawner_1.Spawner(this, { x: 0, y: 0, map: this.state.mapName }, {
            leashRadius: -1
        });
        normalNPCSpawner.canSlowDown = false;
        this.spawners.push(normalNPCSpawner);
        npcs.forEach(npcData => {
            const data = npcData.properties || {};
            data.name = npcData.name || this.determineNPCName(npcData);
            data.sprite = npcData.gid - this.state.map.tilesets[3].firstgid;
            data.x = npcData.x / 64;
            data.y = (npcData.y / 64) - 1;
            const npc = new npc_1.NPC(data);
            npc.$$room = this;
            this.setUpClassFor(npc);
            try {
                if (npc.script) {
                    const { setup, responses } = require(`${__dirname}/../scripts/npc/${npc.script}`);
                    setup(npc);
                    if (npc.hostility === 'Never') {
                        npc.parser = new mingy_1.Parser();
                        responses(npc);
                    }
                }
            }
            catch (e) {
                logger_1.Logger.error(e);
            }
            if (!npc.name)
                this.determineNPCName(npc);
            normalNPCSpawner.addNPC(npc);
        });
    }
    loadSpawners(timerData) {
        const spawners = this.state.map.layers[maplayer_1.MapLayer.Spawners].objects;
        spawners.forEach(spawnerData => {
            const spawner = require(`${__dirname}/../scripts/spawners/${spawnerData.properties.script}`);
            const spawnerProto = spawner[Object.keys(spawner)[0]];
            const properties = spawnerData.properties;
            const spawnerX = spawnerData.x / 64;
            const spawnerY = (spawnerData.y / 64) - 1;
            const spawnerOldData = lodash_1.find(timerData, { x: spawnerX, y: spawnerY });
            if (spawnerOldData) {
                properties.currentTick = spawnerOldData.currentTick;
            }
            const spawnerObject = new spawnerProto(this, { map: this.state.mapName, x: spawnerX, y: spawnerY }, properties);
            this.spawners.push(spawnerObject);
        });
    }
    determineNPCName(npc) {
        let func = 'human';
        switch (npc.allegiance) {
            case 'None':
                func = 'human';
                break;
            case 'Pirates':
                func = 'dwarf';
                break;
            case 'Townsfolk':
                func = 'human';
                break;
            case 'Royalty':
                func = lodash_1.sample(['elf', 'highelf']);
                break;
            case 'Adventurers':
                func = 'human';
                break;
            case 'Wilderness':
                func = lodash_1.sample(['fairy', 'highfairy']);
                break;
            case 'Underground':
                func = lodash_1.sample(['goblin', 'orc', 'ogre']);
                break;
        }
        if (func === 'human')
            return fantastical_1.species[func]({ allowMultipleNames: false });
        return fantastical_1.species[func](lodash_1.sample(['male', 'female']));
    }
    getPossibleMessageTargets(player, findStr) {
        const allTargets = this.state.allPossibleTargets;
        const possTargets = allTargets.filter(target => {
            if (target.isDead())
                return;
            const diffX = target.x - player.x;
            const diffY = target.y - player.y;
            if (!player.canSee(diffX, diffY))
                return false;
            if (!player.canSeeThroughStealthOf(target))
                return false;
            return this.doesTargetMatchSearch(target, findStr);
        });
        return possTargets;
    }
    doesTargetMatchSearch(target, findStr) {
        return target.uuid === findStr || lodash_1.startsWith(target.name.toLowerCase(), findStr.toLowerCase());
    }
    setUpClassFor(char) {
        Classes[char.baseClass || 'Undecided'].becomeClass(char);
    }
    tick() {
        this.ticks++;
        // tick players every second or so
        if (this.ticks % TickRates.PlayerAction === 0) {
            this.state.tickPlayers();
        }
        if (this.ticks % TickRates.NPCAction === 0) {
            this.spawners.forEach(spawner => spawner.npcTick());
        }
        if (this.ticks % TickRates.SpawnerTick === 0) {
            this.spawners.forEach(spawner => spawner.tick());
        }
        // save players every minute or so
        if (this.ticks % TickRates.PlayerSave === 0) {
            this.state.players.forEach(player => this.savePlayer(player));
            // reset ticks
            this.ticks = 0;
        }
    }
    getAllLoot(npc, bonus = 0, sackOnly = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const tables = [];
            if (this.dropTables.map.length > 0) {
                tables.push({
                    table: new lootastic_1.LootTable(this.dropTables.map, bonus),
                    func: lootastic_1.LootFunctions.EachItem,
                    args: 0
                });
            }
            if (this.dropTables.region.length > 0) {
                tables.push({
                    table: new lootastic_1.LootTable(this.dropTables.region, bonus),
                    func: lootastic_1.LootFunctions.EachItem,
                    args: 0
                });
            }
            if (npc.drops && npc.drops.length > 0) {
                tables.push({
                    table: new lootastic_1.LootTable(npc.drops, bonus),
                    func: lootastic_1.LootFunctions.EachItem,
                    args: 0
                });
            }
            if (!sackOnly && npc.copyDrops && npc.copyDrops.length > 0) {
                const drops = lodash_1.compact(npc.copyDrops.map(({ drop, chance }) => {
                    const item = lodash_1.get(npc, drop);
                    if (!item)
                        return null;
                    return { result: item.name, chance };
                }));
                if (drops.length > 0) {
                    tables.push({
                        table: new lootastic_1.LootTable(drops, bonus),
                        func: lootastic_1.LootFunctions.EachItem,
                        args: 0
                    });
                }
            }
            const items = lootastic_1.LootRoller.rollTables(tables);
            const itemPromises = items.map(itemName => item_creator_1.ItemCreator.getItemByName(itemName));
            const allItems = yield Promise.all(itemPromises);
            return allItems;
        });
    }
    calculateLootDrops(npc, killer) {
        return __awaiter(this, void 0, void 0, function* () {
            const bonus = killer.getTotalStat('luk');
            const allItems = yield this.getAllLoot(npc, bonus);
            if (npc.gold) {
                const gold = yield item_creator_1.ItemCreator.getGold(npc.gold);
                allItems.push(gold);
            }
            this.createCorpse(npc, allItems);
        });
    }
    createCorpse(target, searchItems) {
        return __awaiter(this, void 0, void 0, function* () {
            const corpse = yield item_creator_1.ItemCreator.getItemByName('Corpse');
            corpse.sprite = target.sprite + 4;
            corpse.searchItems = searchItems;
            corpse.tansFor = target.tansFor;
            corpse.desc = `the corpse of a ${target.name}`;
            this.addItemToGround(target, corpse);
            target.$$corpseRef = corpse;
            corpse.npcUUID = target.uuid;
            corpse.$$isPlayerCorpse = target.isPlayer();
        });
    }
    dropCorpseItems(corpse, searcher) {
        if (!corpse || !corpse.searchItems)
            return;
        corpse.searchItems.forEach(item => {
            if (searcher && item.itemClass === 'Coin') {
                searcher.gainGold(item.value);
                searcher.sendClientMessage(`You loot ${item.value} gold coins from the corpse.`);
            }
            else {
                this.addItemToGround(corpse, item);
            }
        });
        corpse.searchItems = null;
    }
    corpseCheck(player) {
        let item = null;
        if (player.leftHand && player.leftHand.itemClass === 'Corpse') {
            item = player.leftHand;
            player.setLeftHand(null);
        }
        if (player.rightHand && player.rightHand.itemClass === 'Corpse') {
            item = player.rightHand;
            player.setRightHand(null);
        }
        if (item) {
            delete item.$heldBy;
            this.addItemToGround(player, item);
        }
    }
    restoreCheck(player) {
        if (!player.isDead())
            return;
        player.restore(false);
    }
    doorCheck(player) {
        const interactable = this.state.getInteractable(player.x, player.y);
        if (interactable && interactable.type === 'Door') {
            player.teleportToRespawnPoint();
        }
    }
    castEffectFromTrap(target, obj) {
        if (!obj || !obj.properties || !obj.properties.effect)
            return;
        const { effect, caster } = obj.properties;
        const effectRef = new Effects[effect.name](effect);
        effectRef.casterRef = caster;
        effectRef.cast(target, target);
    }
    placeTrap(x, y, user, trap) {
        const interactable = user.$$room.state.getInteractable(x, y, true, 'Trap');
        if (interactable)
            return false;
        const statCopy = user.sumStats;
        const trapInteractable = {
            x: x * 64,
            y: (y + 1) * 64,
            type: 'Trap',
            properties: {
                effect: trap.effect,
                caster: {
                    name: user.name,
                    username: user.username,
                    casterStats: statCopy
                },
                setSkill: user.calcSkillLevel(character_1.SkillClassNames.Thievery),
                setStealth: user.getTotalStat('stealth'),
                timestamp: Date.now()
            }
        };
        user.$$room.state.addInteractable(trapInteractable);
        return true;
    }
    drawEffect(player, center, effect, radius = 0) {
        const client = this.findClient(player);
        const effectId = visual_effects_1.VISUAL_EFFECTS[effect];
        this.send(client, { action: 'draw_effect_r', effect: effectId, center, radius });
    }
    shareExpWithParty(player, exp) {
        const party = player.party;
        const members = party.allMembers;
        if (members.length > 4) {
            exp = exp * 0.75;
        }
        if (members.length > 7) {
            exp = exp * 0.75;
        }
        exp = Math.floor(exp);
        members.forEach(({ username }) => {
            if (username === player.username)
                return;
            const partyMember = this.state.findPlayer(username);
            if (player.distFrom(partyMember) > 7)
                return;
            partyMember.gainExp(exp);
        });
    }
    shareSkillWithParty(player, skill) {
        const party = player.party;
        const members = party.allMembers;
        if (members.length > 4) {
            skill = skill * 0.75;
        }
        if (members.length > 7) {
            skill = skill * 0.75;
        }
        skill = Math.floor(skill);
        members.forEach(({ username }) => {
            if (username === player.username)
                return;
            const partyMember = this.state.findPlayer(username);
            if (player.distFrom(partyMember) > 7)
                return;
            partyMember.gainSkill(skill);
        });
    }
}
exports.GameWorld = GameWorld;
//# sourceMappingURL=GameWorld.js.map