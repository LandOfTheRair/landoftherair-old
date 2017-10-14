"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const maplayer_1 = require("../../models/maplayer");
class Command {
    constructor() {
        this.format = '';
    }
    getMergeObjectFromArgs(args) {
        const matches = args.match(/(?:[^\s"']+|['"][^'"]*["'])+/g);
        const mergeObj = matches.reduce((obj, prop) => {
            const propData = prop.split('=');
            const key = propData[0];
            let val = propData[1];
            if (!val)
                return obj;
            val = val.trim();
            if (!isNaN(+val)) {
                val = +val;
            }
            else if (lodash_1.startsWith(val, '"')) {
                val = val.substring(1, val.length - 1);
            }
            lodash_1.set(obj, key.trim(), val);
            return obj;
        }, {});
        return mergeObj;
    }
    trySwapLeftToRight(player) {
        if (player.leftHand && !player.rightHand) {
            player.setRightHand(player.leftHand);
        }
    }
    trySwapRightToLeft(player) {
        if (player.rightHand && !player.leftHand) {
            player.setLeftHand(player.rightHand);
        }
    }
    getEmptyHand(player) {
        if (player.rightHand && player.leftHand)
            return '';
        if (player.rightHand)
            return 'LeftHand';
        if (player.leftHand)
            return 'RightHand';
        return 'RightHand';
    }
    addItemToContainer(player, container, item) {
        const didFail = container.addItem(item);
        if (didFail)
            return player.sendClientMessage(didFail);
        return true;
    }
    checkMerchantDistance(player, merchantUUID) {
        const container = player.$$room.state.findNPC(merchantUUID);
        if (!container)
            return player.sendClientMessage('That person is not here.');
        if (container.distFrom(player) > 2)
            return player.sendClientMessage('That person is too far away.');
        return true;
    }
    checkMerchantItems(player, merchantUUID, itemUUID) {
        const container = player.$$room.state.findNPC(merchantUUID);
        if (!container)
            return player.sendClientMessage('That person is not here.');
        const item = lodash_1.find(container.vendorItems, { uuid: itemUUID });
        if (!item)
            return player.sendClientMessage('You do not see that item.');
        return item;
    }
    checkPlayerEmptyHand(player) {
        const hasHands = player.hasEmptyHand();
        if (!hasHands)
            return player.sendClientMessage('Your hands are full.');
        return true;
    }
    findLocker(player) {
        const locker = lodash_1.find(player.$$room.state.map.layers[maplayer_1.MapLayer.Interactables].objects, { x: player.x * 64, y: (player.y + 1) * 64, type: 'Locker' });
        if (!locker)
            return player.sendClientMessage('There is no locker there.');
        return locker;
    }
    getItemsFromGround(player, itemClass) {
        const ground = player.$$room.state.getGroundItems(player.x, player.y);
        const items = ground[itemClass];
        if (!items)
            return player.sendClientMessage('You do not see that item.');
        return items;
    }
    getItemFromGround(player, itemClass, itemId) {
        const ground = player.$$room.state.getGroundItems(player.x, player.y);
        const item = lodash_1.find(ground[itemClass], { uuid: itemId });
        if (!item)
            return player.sendClientMessage('You do not see that item.');
        return item;
    }
}
Command.macroMetadata = {};
exports.Command = Command;
//# sourceMappingURL=Command.js.map