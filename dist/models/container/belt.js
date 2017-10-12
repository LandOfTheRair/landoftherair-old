"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const container_1 = require("./container");
class Belt extends container_1.Container {
    constructor(opts) {
        super({ size: opts.size || 5 });
        lodash_1.extend(this, opts);
        this.initItems();
    }
    canAccept(item) {
        return item.isBeltable && super.canAccept(item);
    }
}
exports.Belt = Belt;
//# sourceMappingURL=belt.js.map