"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skill_1 = require("../../../../../base/Skill");
const character_1 = require("../../../../../../models/character");
const Afflict_1 = require("../../../../../effects/Afflict");
class Afflict extends Skill_1.Skill {
    constructor() {
        super(...arguments);
        this.name = 'cast afflict';
        this.format = 'Target';
        this.flagSkills = [character_1.SkillClassNames.Restoration];
        this.mpCost = () => 10;
        this.range = () => 5;
    }
    execute(user, { gameState, args, effect }) {
        if (!args)
            return false;
        const target = this.getTarget(user, args);
        if (!target)
            return;
        if (!this.tryToConsumeMP(user, effect))
            return;
        this.use(user, target, effect);
    }
    use(user, target, baseEffect = {}) {
        const effect = new Afflict_1.Afflict(baseEffect);
        effect.cast(user, target, this);
    }
}
Afflict.macroMetadata = {
    name: 'Afflict',
    macro: 'cast afflict',
    icon: 'bolas',
    color: '#bd5900',
    mode: 'lockActivation'
};
exports.Afflict = Afflict;
//# sourceMappingURL=Afflict.js.map