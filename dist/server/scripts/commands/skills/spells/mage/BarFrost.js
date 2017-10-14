"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skill_1 = require("../../../../../base/Skill");
const character_1 = require("../../../../../../models/character");
const BarFrost_1 = require("../../../../../effects/BarFrost");
class BarFrost extends Skill_1.Skill {
    constructor() {
        super(...arguments);
        this.name = 'cast barfrost';
        this.format = 'Target';
        this.flagSkills = [character_1.SkillClassNames.Conjuration];
        this.mpCost = () => 20;
        this.range = () => 5;
    }
    execute(user, { gameState, args, effect }) {
        const target = this.getTarget(user, args, true);
        if (!target)
            return;
        if (!this.tryToConsumeMP(user, effect))
            return;
        this.use(user, target, effect);
    }
    use(user, target, baseEffect = {}) {
        const effect = new BarFrost_1.BarFrost(baseEffect);
        effect.cast(user, target, this);
    }
}
BarFrost.macroMetadata = {
    name: 'BarFrost',
    macro: 'cast barfrost',
    icon: 'rosa-shield',
    color: '#000080',
    mode: 'clickToTarget'
};
exports.BarFrost = BarFrost;
//# sourceMappingURL=BarFrost.js.map