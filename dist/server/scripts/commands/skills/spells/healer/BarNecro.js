"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skill_1 = require("../../../../../base/Skill");
const character_1 = require("../../../../../../models/character");
const BarNecro_1 = require("../../../../../effects/BarNecro");
class BarNecro extends Skill_1.Skill {
    constructor() {
        super(...arguments);
        this.name = 'cast barnecro';
        this.format = 'Target';
        this.flagSkills = [character_1.SkillClassNames.Restoration];
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
        const effect = new BarNecro_1.BarNecro(baseEffect);
        effect.cast(user, target, this);
    }
}
BarNecro.macroMetadata = {
    name: 'BarNecro',
    macro: 'cast barnecro',
    icon: 'rosa-shield',
    color: '#1b390e',
    mode: 'clickToTarget'
};
exports.BarNecro = BarNecro;
//# sourceMappingURL=BarNecro.js.map