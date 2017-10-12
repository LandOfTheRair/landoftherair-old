"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skill_1 = require("../../../../../base/Skill");
const character_1 = require("../../../../../../models/character");
const TrueSight_1 = require("../../../../../effects/TrueSight");
class TrueSight extends Skill_1.Skill {
    constructor() {
        super(...arguments);
        this.name = 'cast truesight';
        this.flagSkills = [character_1.SkillClassNames.Conjuration];
        this.mpCost = () => 25;
        this.range = () => 5;
    }
    execute(user, { gameState, args, effect }) {
        const target = this.getTarget(user, args, true);
        if (!target)
            return;
        if (!this.tryToConsumeMP(user, effect))
            return;
        this.use(user, target);
    }
    use(user, target) {
        const effect = new TrueSight_1.TrueSight({});
        effect.cast(user, target);
    }
}
TrueSight.macroMetadata = {
    name: 'TrueSight',
    macro: 'cast truesight',
    icon: 'all-seeing-eye',
    color: '#00a',
    mode: 'clickToTarget'
};
exports.TrueSight = TrueSight;
//# sourceMappingURL=TrueSight.js.map