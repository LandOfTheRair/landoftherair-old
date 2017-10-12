"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skill_1 = require("../../../../../base/Skill");
const character_1 = require("../../../../../../models/character");
const BarFire_1 = require("../../../../../effects/BarFire");
class BarFire extends Skill_1.Skill {
    constructor() {
        super(...arguments);
        this.name = 'cast barfire';
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
        const effect = new BarFire_1.BarFire(baseEffect);
        effect.cast(user, target, this);
    }
}
BarFire.macroMetadata = {
    name: 'BarFire',
    macro: 'cast barfire',
    icon: 'rosa-shield',
    color: '#DC143C',
    mode: 'clickToTarget'
};
exports.BarFire = BarFire;
//# sourceMappingURL=BarFire.js.map