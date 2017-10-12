"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skill_1 = require("../../../../../base/Skill");
const character_1 = require("../../../../../../models/character");
const FireMist_1 = require("../../../../../effects/FireMist");
class FireMist extends Skill_1.Skill {
    constructor() {
        super(...arguments);
        this.name = 'cast firemist';
        this.format = 'Target';
        this.flagSkills = [character_1.SkillClassNames.Conjuration];
        this.mpCost = () => 40;
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
        const effect = new FireMist_1.FireMist(baseEffect);
        effect.cast(user, target, this);
    }
}
FireMist.macroMetadata = {
    name: 'FireMist',
    macro: 'cast firemist',
    icon: 'kaleidoscope-pearls',
    color: '#DC143C',
    mode: 'clickToTarget'
};
exports.FireMist = FireMist;
//# sourceMappingURL=FireMist.js.map