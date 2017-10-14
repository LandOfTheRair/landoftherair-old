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
const database_1 = require("../database");
const item_1 = require("../../models/item");
class ItemCreator {
    static getItemByName(name) {
        return database_1.DB.$items.findOne({ name }).then(item => {
            if (!item)
                throw new Error(`Item ${name} does not exist.`);
            return new item_1.Item(item);
        });
    }
    static searchItems(name) {
        const regex = new RegExp(`.*${name}.*`, 'i');
        return database_1.DB.$items.find({ name: regex }).toArray();
    }
    static getGold(value) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = yield this.getItemByName('Gold Coin');
            item.value = value;
            return item;
        });
    }
}
exports.ItemCreator = ItemCreator;
//# sourceMappingURL=item-creator.js.map