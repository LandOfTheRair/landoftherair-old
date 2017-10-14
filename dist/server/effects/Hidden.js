"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Effect_1 = require("../base/Effect");
const character_1 = require("../../models/character");
class Hidden extends Effect_1.SpellEffect {
    constructor() {
        super(...arguments);
        this.iconData = {
            name: 'hidden',
            color: '#ccc',
            bgColor: '#000'
        };
        this.maxSkillForSkillGain = 5;
        this.skillFlag = () => character_1.SkillClassNames.Thievery;
    }
    cast(caster, target, skillRef) {
        this.setPotencyAndGainSkill(caster, skillRef);
        this.duration = -1;
        this.potency = caster.stealthLevel();
        this.effectInfo = { isPermanent: true, caster: caster.uuid };
        caster.applyEffect(this);
    }
    effectStart(char) {
        this.effectMessage(char, 'You step into the shadows.');
        char.gainStat('stealth', this.potency);
    }
    effectTick(char) {
        if (char.isNearWall())
            return;
        this.effectEnd(char);
        char.unapplyEffect(this);
    }
    effectEnd(char) {
        this.effectMessage(char, 'You are no longer hidden!');
        char.loseStat('stealth', this.potency);
    }
}
exports.Hidden = Hidden;
//# sourceMappingURL=Hidden.js.map