"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const item_1 = require("../item");
class Container {
    constructor({ size }) {
        this.items = [];
        this.size = size;
    }
    get allItems() {
        return this.items;
    }
    initItems() {
        this.items = this.items.map(item => new item_1.Item(item));
    }
    isFull() {
        return this.items.length >= this.size;
    }
    fix() {
        this.items = lodash_1.compact(this.items);
    }
    addItem(item) {
        if (!this.canAccept(item))
            return `That item does not fit properly in your ${this.constructor.name.toLowerCase()}.`;
        if (this.isFull())
            return `Your ${this.constructor.name.toLowerCase()} is full.`;
        this.items.push(item);
    }
    getItemFromSlot(slot) {
        return this.items[slot];
    }
    takeItemFromSlot(slot) {
        const item = this.items[slot];
        if (!item)
            return null;
        this.items[slot] = null;
        this.fix();
        return item;
    }
    randomItem() {
        return lodash_1.sample(this.items);
    }
    takeItem(item) {
        const index = lodash_1.findIndex(this.items, x => x === item);
        this.takeItemFromSlot(index);
    }
    takeItemFromSlots(slots) {
        slots.reverse().forEach(index => this.takeItemFromSlot(index));
    }
    canAccept(item) {
        return item.itemClass !== 'Corpse' && item.itemClass !== 'Coin';
    }
}
exports.Container = Container;
//# sourceMappingURL=container.js.map