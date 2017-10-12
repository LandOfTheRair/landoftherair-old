"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dice = require("dice.js");
const Skill_1 = require("../../../../base/Skill");
const Poison_1 = require("../../../../effects/Poison");
const combat_helper_1 = require("../../../../helpers/combat-helper");
class WeakBite extends Skill_1.Skill {
    constructor() {
        super(...arguments);
        this.name = '';
        this.range = () => 0;
    }
    execute() { }
    use(user, target) {
        const damage = +dice.roll(`1d${user.getTotalStat('str')}`);
        combat_helper_1.CombatHelper.dealDamage(user, target, {
            damage,
            damageClass: 'physical',
            attackerDamageMessage: '',
            defenderDamageMessage: `${user.name} bit you!`
        });
        const effect = new Poison_1.Poison({ potency: 0, duration: 10 });
        effect.cast(user, target, this);
    }
}
exports.WeakBite = WeakBite;
//# sourceMappingURL=WeakBite.js.map