"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Effect_1 = require("../base/Effect");
const character_1 = require("../../models/character");
const dice = require("dice.js");
class IceMist extends Effect_1.SpellEffect {
    constructor() {
        super(...arguments);
        this.maxSkillForSkillGain = 7;
        this.skillFlag = () => character_1.SkillClassNames.Conjuration;
    }
    cast(caster, target, skillRef) {
        this.setPotencyAndGainSkill(caster, skillRef);
        let mult = 0.5;
        if (this.potency > 0)
            mult = 1;
        if (this.potency > 11)
            mult = 1.5;
        if (this.potency > 21)
            mult = 2;
        const intCheck = Math.floor(mult * this.getCasterStat(caster, 'int'));
        target.sendClientMessageToRadius({ message: 'You see a dense fog form.', subClass: 'combat magic' }, 10);
        target.drawEffectInRadius('ICE_MIST', target, 1, 6);
        const attacked = target.$$room.state.getAllInRange(target, 1);
        attacked.forEach(refTarget => {
            const damage = +dice.roll(`${this.potency || 1}d${intCheck}`);
            const atkName = refTarget === caster ? 'yourself' : refTarget.name;
            this.magicalAttack(caster, target, {
                skillRef,
                atkMsg: `You engulf ${atkName} in a chilling mist!`,
                defMsg: `${refTarget.name} engulfed you in a chilling mist!`,
                damage,
                damageClass: 'ice'
            });
        });
    }
}
exports.IceMist = IceMist;
//# sourceMappingURL=IceMist.js.map