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
const colyseus_1 = require("colyseus");
const lobbystate_1 = require("../../models/lobbystate");
const account_1 = require("../../models/account");
const player_1 = require("../../models/player");
const character_creator_1 = require("../helpers/character-creator");
const lodash_1 = require("lodash");
const database_1 = require("../database");
const jwt = require("jsonwebtoken");
const item_creator_1 = require("../helpers/item-creator");
const character_1 = require("../../models/character");
const AUTH0_SECRET = process.env.AUTH0_SECRET;
class Lobby extends colyseus_1.Room {
    constructor(opts) {
        super(opts);
        this.setPatchRate(500);
        this.autoDispose = false;
        this.setState(new lobbystate_1.LobbyState({ accounts: [], messages: [], motd: '' }));
        this.onInit();
    }
    onInit() {
        this.loadSettings();
        database_1.DB.$players.update({}, { $set: { inGame: -1 } }, { multi: true });
    }
    getAccount(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return database_1.DB.$accounts.findOne({ userId })
                .then(data => {
                if (data)
                    return new account_1.Account(data);
                return null;
            });
        });
    }
    updateAccount(account) {
        delete account._id;
        delete account.inGame;
        return database_1.DB.$accounts.update({ userId: account.userId }, { $set: account });
    }
    saveAccount(account) {
        return __awaiter(this, void 0, void 0, function* () {
            return database_1.DB.$accounts.insert(account);
        });
    }
    createAccount({ userId, username }) {
        return __awaiter(this, void 0, void 0, function* () {
            const account = new account_1.Account({ userId, username, createdAt: Date.now(), characterNames: [], maxCharacters: 4 });
            yield this.saveAccount(account);
            return account;
        });
    }
    tryLogin(client, { userId, username }) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkAccount = this.state.findAccount(userId);
            if (checkAccount) {
                this.send(client, {
                    error: 'already_logged_in',
                    prettyErrorName: 'Account Already Logged In',
                    prettyErrorDesc: 'Please log out from other locations first.'
                });
                return;
            }
            let account = yield this.getAccount(userId);
            if (!account) {
                if (!username) {
                    this.send(client, { action: 'need_user_name' });
                    return;
                }
                else {
                    try {
                        account = yield this.createAccount({ userId, username });
                    }
                    catch (e) {
                        this.send(client, {
                            error: 'account_exists',
                            prettyErrorName: 'Account Already Exists',
                            prettyErrorDesc: 'Please choose a unique username.'
                        });
                    }
                }
            }
            if (!account || !account.username || !account.userId)
                return;
            client.userId = account.userId;
            client.username = account.username;
            this.state.addAccount(account);
            this.send(client, { action: 'set_account', account });
        });
    }
    quit(client) {
        const account = this.state.findAccount(client.userId);
        if (!account)
            return;
        account.inGame = -1;
    }
    logout(client) {
        this.state.removeAccount(client.userId);
    }
    verifyToken(token) {
        try {
            jwt.verify(token, AUTH0_SECRET, { algorithms: ['HS256'] });
            return true;
        }
        catch (e) {
            return false;
        }
    }
    sendMessage(client, message) {
        if (!client.username || !client.userId)
            return;
        message = lodash_1.truncate(message, { length: 500, omission: '[truncated]' });
        if (!message || !message.trim())
            return;
        this.state.addMessage({ account: client.username, message });
    }
    viewCharacter(client, data) {
        this.send(client, { action: 'set_character', character: character_creator_1.CharacterCreator.getCustomizedCharacter(data) });
    }
    createCharacter(client, { charSlot, character }) {
        return __awaiter(this, void 0, void 0, function* () {
            character = character_creator_1.CharacterCreator.getCustomizedCharacter(character);
            const account = this.state.findAccount(client.userId);
            const oldPlayerName = account.characterNames[charSlot];
            if (oldPlayerName) {
                database_1.DB.$players.remove({ username: client.username, charSlot });
            }
            account.characterNames[charSlot] = character.name;
            this.updateAccount(account);
            account.inGame = -1;
            this.send(client, { action: 'set_account', account });
            const stats = lodash_1.pick(character, ['str', 'dex', 'agi', 'int', 'wis', 'wil', 'con', 'luk', 'cha']);
            const name = character.name;
            const sex = character.sex;
            const gold = character.gold;
            const allegiance = character.allegiance;
            const player = new player_1.Player({
                username: account.username,
                createdAt: Date.now(),
                charSlot,
                stats, sex, name, allegiance, gold,
                x: 14, y: 14, map: 'Tutorial',
                isGM: account.isGM
            });
            yield this.giveCharacterBasicGearAndSkills(player);
            const savePlayer = player.toJSON();
            database_1.DB.$players.insert(savePlayer);
        });
    }
    giveCharacterBasicGearAndSkills(player) {
        return __awaiter(this, void 0, void 0, function* () {
            let skill2 = '';
            lodash_1.sampleSize([
                character_1.SkillClassNames.OneHanded, character_1.SkillClassNames.TwoHanded, character_1.SkillClassNames.Shortsword,
                character_1.SkillClassNames.Staff, character_1.SkillClassNames.Dagger, character_1.SkillClassNames.Mace, character_1.SkillClassNames.Axe
            ], 4).forEach(skill => {
                player._gainSkill(skill, player.calcSkillXP(1));
            });
            let body = '';
            let mainhand = '';
            switch (player.allegiance) {
                case 'None': {
                    mainhand = 'Antanian Dagger';
                    body = 'Antanian Studded Tunic';
                    skill2 = character_1.SkillClassNames.Dagger;
                    break;
                }
                case 'Pirates': {
                    mainhand = 'Antanian Axe';
                    body = 'Antanian Tunic';
                    skill2 = character_1.SkillClassNames.Axe;
                    break;
                }
                case 'Townsfolk': {
                    mainhand = 'Antanian Greatsword';
                    body = 'Antanian Ringmail Tunic';
                    skill2 = character_1.SkillClassNames.TwoHanded;
                    break;
                }
                case 'Royalty': {
                    mainhand = 'Antanian Mace';
                    body = 'Antanian Tunic';
                    skill2 = character_1.SkillClassNames.Mace;
                    break;
                }
                case 'Adventurers': {
                    mainhand = 'Antanian Longsword';
                    body = 'Antanian Studded Tunic';
                    skill2 = character_1.SkillClassNames.OneHanded;
                    break;
                }
                case 'Wilderness': {
                    mainhand = 'Antanian Staff';
                    body = 'Antanian Studded Tunic';
                    skill2 = character_1.SkillClassNames.Staff;
                    break;
                }
                case 'Underground': {
                    mainhand = 'Antanian Shortsword';
                    body = 'Antanian Tunic';
                    skill2 = character_1.SkillClassNames.Shortsword;
                    break;
                }
            }
            player.gear.Armor = yield item_creator_1.ItemCreator.getItemByName(body);
            player.rightHand = yield item_creator_1.ItemCreator.getItemByName(mainhand);
            player._gainSkill(skill2, player.calcSkillXP(2));
        });
    }
    getCharacter(username, charSlot) {
        return database_1.DB.$players.findOne({ username, charSlot, inGame: { $ne: true } });
    }
    saveSettings() {
        database_1.DB.$lobbySettings.update({ lobby: 1 }, { $set: { motd: this.state.motd } }, { upsert: 1 });
    }
    loadSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            const settings = yield database_1.DB.$lobbySettings.findOne({ lobby: 1 });
            if (settings) {
                this.state.motd = settings.motd;
            }
            else {
                database_1.DB.$lobbySettings.insert({ lobby: 1 });
            }
            return settings;
        });
    }
    playCharacter(client, { charSlot }) {
        return __awaiter(this, void 0, void 0, function* () {
            const account = this.state.findAccount(client.userId);
            if (account && account.inGame >= 0) {
                this.send(client, {
                    error: 'already_in_game',
                    prettyErrorName: 'Already In Game',
                    prettyErrorDesc: 'You are already in game. If you actually are not in game, give this a few seconds or refresh the page.'
                });
                return;
            }
            const character = yield this.getCharacter(client.username, charSlot);
            if (!character) {
                this.send(client, {
                    error: 'no_character',
                    prettyErrorName: 'No Character',
                    prettyErrorDesc: 'There is no character in this slot (or it is already in-game). Please create one.'
                });
                return;
            }
            account.inGame = charSlot;
            this.send(client, { action: 'start_game', character });
        });
    }
    onJoin(client, options) {
        this.send(client, { action: 'need_user_id' });
    }
    onLeave(client) {
        this.state.removeAccount(client.username);
    }
    onMessage(client, data) {
        if (data.idToken && !this.verifyToken(data.idToken)) {
            this.send(client, {
                error: 'error_invalid_token',
                prettyErrorName: 'Invalid Auth Token',
                prettyErrorDesc: 'Stop hacking.'
            });
            return;
        }
        if (data.action === 'heartbeat')
            return;
        if (data.action === 'status')
            return this.changeStatus(client, data.status);
        if (data.action === 'alert')
            return this.broadcastAlert(client, data);
        if (data.action === 'play')
            return this.playCharacter(client, data);
        if (data.action === 'create')
            return this.createCharacter(client, data);
        if (data.action === 'logout')
            return this.logout(client);
        if (data.action === 'quit')
            return this.quit(client);
        if (data.action === 'motd_set')
            return this.setMOTD(client, data);
        if (data.userId && data.idToken)
            return this.tryLogin(client, data);
        if (data.message)
            return this.sendMessage(client, data.message);
        if (data.characterCreator)
            return this.viewCharacter(client, data);
    }
    broadcastMOTD() {
        this.state.addMessage({ account: '<System>', message: this.state.motd });
    }
    setMOTD(client, data) {
        const account = this.state.findAccount(client.userId);
        if (account && !account.isGM)
            return;
        this.state.motd = data.motd;
        if (this.state.motd) {
            this.broadcastMOTD();
        }
        this.saveSettings();
    }
    broadcastAlert(client, data) {
        const account = this.state.findAccount(client.userId);
        if (account && !account.isGM)
            return;
        this.broadcast({ action: 'alert', sender: account.username, message: data.message });
    }
    changeStatus(client, newStatus) {
        if (!lodash_1.includes(['Available', 'AFK'], newStatus))
            return;
        const account = this.state.findAccount(client.userId);
        if (!account)
            return;
        account.status = newStatus;
        this.send(client, { action: 'set_account', account });
    }
    onDispose() { }
}
exports.Lobby = Lobby;
//# sourceMappingURL=Lobby.js.map