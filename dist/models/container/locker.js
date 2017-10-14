"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const container_1 = require("./container");
class Locker extends container_1.Container {
    constructor(opts) {
        super({ size: 15 });
        lodash_1.extend(this, opts);
        this.initItems();
    }
}
exports.Locker = Locker;
//# sourceMappingURL=locker.js.map