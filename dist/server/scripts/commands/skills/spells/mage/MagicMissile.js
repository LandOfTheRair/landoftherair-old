"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skill_1 = require("../../../../../base/Skill");
const character_1 = require("../../../../../../models/character");
const MagicMissile_1 = require("../../../../../effects/MagicMissile");
class MagicMissile extends Skill_1.Skill {
    constructor() {
        super(...arguments);
        this.name = 'cast magicmissile';
        this.format = 'Target';
        this.flagSkills = [character_1.SkillClassNames.Conjuration];
        this.mpCost = () => 5;
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
        const effect = new MagicMissile_1.MagicMissile(baseEffect);
        effect.cast(user, target, this);
    }
}
MagicMissile.macroMetadata = {
    name: 'MagicMissile',
    macro: 'cast magicmissile',
    icon: 'missile-swarm',
    color: '#0059bd',
    mode: 'lockActivation'
};
exports.MagicMissile = MagicMissile;
//# sourceMappingURL=MagicMissile.js.map