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
const item_creator_1 = require("./item-creator");
const database_1 = require("../database");
const Effects = require("../effects");
class NPCLoader {
    static searchNPCs(name) {
        const regex = new RegExp(`.*${name}.*`, 'i');
        return database_1.DB.$npcs.find({ $or: [{ npcId: regex }, { name: regex }] }).toArray();
    }
    static loadNPCData(npcId) {
        return database_1.DB.$npcs.findOne({ npcId }).then(npc => {
            if (!npc)
                throw new Error(`NPC ${npcId} does not exist.`);
            return npc;
        });
    }
    static loadItem(item) {
        return item_creator_1.ItemCreator.getItemByName(item);
    }
    static loadVendorItems(npc, items) {
        return __awaiter(this, void 0, void 0, function* () {
            npc.vendorItems = yield Promise.all(items.map(item => this.loadItem(item)));
        });
    }
    static checkPlayerHeldItem(player, itemName, hand = 'right') {
        return player.hasHeldItem(itemName, hand);
    }
    static takePlayerItem(player, itemName, hand = 'right') {
        player[`set${lodash_1.capitalize(hand)}Hand`](null);
    }
    static givePlayerItem(player, itemName, hand = 'right', setOwner = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = yield this.loadItem(itemName);
            if (setOwner) {
                item.setOwner(player);
            }
            player[`set${lodash_1.capitalize(hand)}Hand`](item);
        });
    }
    static givePlayerEffect(player, effectName, { potency, duration } = {}) {
        player.applyEffect(new Effects[effectName]({ name: effectName, potency, duration }));
    }
    static getItemsFromPlayerSackByName(player, name) {
        const indexes = [];
        for (let i = 0; i < player.sack.allItems.length; i++) {
            const item = player.sack.allItems[i];
            if (!item || item.name !== name)
                continue;
            indexes.push(i);
        }
        return indexes;
    }
    static takeItemsFromPlayerSack(player, sackIndexes = []) {
        player.sack.takeItemFromSlots(sackIndexes);
    }
}
exports.NPCLoader = NPCLoader;
//# sourceMappingURL=npc-loader.js.map