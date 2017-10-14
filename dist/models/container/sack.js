"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const container_1 = require("./container");
class Sack extends container_1.Container {
    constructor(opts) {
        super({ size: opts.size || 25 });
        lodash_1.extend(this, opts);
        this.initItems();
    }
    canAccept(item) {
        return item.isSackable && super.canAccept(item);
    }
}
exports.Sack = Sack;
//# sourceMappingURL=sack.js.map