"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Effect_1 = require("../base/Effect");
const character_1 = require("../../models/character");
class Revive extends Effect_1.SpellEffect {
    constructor() {
        super(...arguments);
        this.maxSkillForSkillGain = 7;
        this.skillFlag = () => character_1.SkillClassNames.Restoration;
    }
    cast(caster, target, skillRef) {
        this.setPotencyAndGainSkill(caster, skillRef);
        let hpPercent = 5;
        if (this.potency > 0)
            hpPercent = 10;
        if (this.potency > 11)
            hpPercent = 20;
        if (this.potency > 21)
            hpPercent = 40;
        if (!target)
            return;
        target.hp.setToPercent(hpPercent);
        target.gainBaseStat('con', 1);
        target.dir = 'S';
    }
}
exports.Revive = Revive;
//# sourceMappingURL=Revive.js.map