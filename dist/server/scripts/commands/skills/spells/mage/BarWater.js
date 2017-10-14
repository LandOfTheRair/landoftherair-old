"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skill_1 = require("../../../../../base/Skill");
const character_1 = require("../../../../../../models/character");
const BarWater_1 = require("../../../../../effects/BarWater");
class BarWater extends Skill_1.Skill {
    constructor() {
        super(...arguments);
        this.name = 'cast barwater';
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
        const effect = new BarWater_1.BarWater(baseEffect);
        effect.cast(user, target, this);
    }
}
BarWater.macroMetadata = {
    name: 'BarWater',
    macro: 'cast barwater',
    icon: 'rosa-shield',
    color: '#208aec',
    mode: 'clickToTarget'
};
exports.BarWater = BarWater;
//# sourceMappingURL=BarWater.js.map