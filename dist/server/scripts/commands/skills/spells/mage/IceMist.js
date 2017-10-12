"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skill_1 = require("../../../../../base/Skill");
const character_1 = require("../../../../../../models/character");
const IceMist_1 = require("../../../../../effects/IceMist");
class IceMist extends Skill_1.Skill {
    constructor() {
        super(...arguments);
        this.name = 'cast icemist';
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
        const effect = new IceMist_1.IceMist(baseEffect);
        effect.cast(user, target, this);
    }
}
IceMist.macroMetadata = {
    name: 'IceMist',
    macro: 'cast icemist',
    icon: 'kaleidoscope-pearls',
    color: '#000080',
    mode: 'clickToTarget'
};
exports.IceMist = IceMist;
//# sourceMappingURL=IceMist.js.map