"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skill_1 = require("../../../../../base/Skill");
const character_1 = require("../../../../../../models/character");
class Identify extends Skill_1.Skill {
    constructor() {
        super(...arguments);
        this.name = 'cast identify';
        this.flagSkills = [character_1.SkillClassNames.Conjuration];
        this.mpCost = () => 15;
        this.range = () => 0;
    }
    execute(user, { gameState, args, effect }) {
        if (!user.rightHand)
            return user.sendClientMessage('You need to have something in your right hand to identify it.');
        if (!this.tryToConsumeMP(user, effect))
            return;
        this.use(user, effect);
    }
    use(user, baseEffect = { potency: 0 }) {
        const potency = 1 + Math.floor(baseEffect.potency || user.calcSkillLevel(character_1.SkillClassNames.Conjuration) / 10);
        user.sendClientMessage(user.rightHand.descTextFor(user, potency));
    }
}
Identify.macroMetadata = {
    name: 'Identify',
    macro: 'cast identify',
    icon: 'uncertainty',
    color: '#665600',
    mode: 'autoActivate'
};
exports.Identify = Identify;
//# sourceMappingURL=Identify.js.map