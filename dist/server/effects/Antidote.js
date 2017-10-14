"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Effect_1 = require("../base/Effect");
const character_1 = require("../../models/character");
class Antidote extends Effect_1.SpellEffect {
    constructor() {
        super(...arguments);
        this.maxSkillForSkillGain = 7;
        this.skillFlag = () => character_1.SkillClassNames.Restoration;
    }
    cast(caster, target, skillRef) {
        this.setPotencyAndGainSkill(caster, skillRef);
        if (caster !== target) {
            this.casterEffectMessage(caster, `You cast Antidote on ${target.name}.`);
        }
        target.applyEffect(this);
    }
    effectStart(char) {
        const poison = char.hasEffect('Poison');
        if (!poison)
            return;
        if (this.potency < poison.potency) {
            this.effectMessage(char, 'Your poison was not able to be cured!');
            return;
        }
        if (poison) {
            char.unapplyEffect(poison);
        }
        this.effectMessage(char, 'Your stomach feels better.');
    }
}
exports.Antidote = Antidote;
//# sourceMappingURL=Antidote.js.map