"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skill_1 = require("../../../../../base/Skill");
const character_1 = require("../../../../../../models/character");
const Antidote_1 = require("../../../../../effects/Antidote");
class Antidote extends Skill_1.Skill {
    constructor() {
        super(...arguments);
        this.name = 'cast antidote';
        this.format = 'Target';
        this.flagSkills = [character_1.SkillClassNames.Restoration];
        this.mpCost = () => 10;
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
        const effect = new Antidote_1.Antidote(baseEffect);
        effect.cast(user, target, this);
    }
}
Antidote.macroMetadata = {
    name: 'Antidote',
    macro: 'cast antidote',
    icon: 'miracle-medecine',
    color: '#0a0',
    mode: 'clickToTarget'
};
exports.Antidote = Antidote;
//# sourceMappingURL=Antidote.js.map