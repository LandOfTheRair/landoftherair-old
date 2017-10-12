"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skill_1 = require("../../../../../base/Skill");
const character_1 = require("../../../../../../models/character");
const Cure_1 = require("../../../../../effects/Cure");
class Cure extends Skill_1.Skill {
    constructor() {
        super(...arguments);
        this.name = 'cast cure';
        this.format = 'Target';
        this.flagSkills = [character_1.SkillClassNames.Restoration];
        this.mpCost = () => 5;
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
        const effect = new Cure_1.Cure(baseEffect);
        effect.cast(user, target, this);
    }
}
Cure.macroMetadata = {
    name: 'Cure',
    macro: 'cast cure',
    icon: 'tentacle-heart',
    color: '#080',
    mode: 'clickToTarget'
};
exports.Cure = Cure;
//# sourceMappingURL=Cure.js.map