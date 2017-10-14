"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const Skill_1 = require("../../../../base/Skill");
class SetTrap extends Skill_1.Skill {
    constructor() {
        super(...arguments);
        this.name = '';
        this.range = () => 0;
    }
    execute() { }
    canUse(user, target) {
        const trap = lodash_1.find(user.sack.allItems, { itemClass: 'Trap' });
        return !!trap;
    }
    use(user, target) {
        const trap = lodash_1.find(user.sack.allItems, { itemClass: 'Trap' });
        if (user.$$room.placeTrap(user.x, user.y, user, trap)) {
            user.sack.takeItem(trap);
        }
    }
}
exports.SetTrap = SetTrap;
//# sourceMappingURL=SetTrap.js.map