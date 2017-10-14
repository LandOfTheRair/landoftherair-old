"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skill_1 = require("../../../../../base/Skill");
const character_1 = require("../../../../../../models/character");
const Poison_1 = require("../../../../../effects/Poison");
class Poison extends Skill_1.Skill {
    constructor() {
        super(...arguments);
        this.name = 'cast poison';
        this.format = 'Target';
        this.flagSkills = [character_1.SkillClassNames.Restoration];
        this.mpCost = () => 15;
        this.range = () => 5;
    }
    execute(user, { gameState, args, effect }) {
        const target = this.getTarget(user, args);
        if (!target)
            return;
        if (!this.tryToConsumeMP(user, effect))
            return;
        this.use(user, target, effect);
    }
    use(user, target, baseEffect = {}) {
        const effect = new Poison_1.Poison(baseEffect);
        effect.cast(user, target, this);
    }
}
Poison.macroMetadata = {
    name: 'Poison',
    macro: 'cast poison',
    icon: 'poison-gas',
    color: '#0a0',
    mode: 'clickToTarget'
};
exports.Poison = Poison;
//# sourceMappingURL=Poison.js.map