"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skill_1 = require("../../../../../base/Skill");
const character_1 = require("../../../../../../models/character");
const Revive_1 = require("../../../../../effects/Revive");
class Revive extends Skill_1.Skill {
    constructor() {
        super(...arguments);
        this.name = 'cast revive';
        this.format = '';
        this.flagSkills = [character_1.SkillClassNames.Restoration];
        this.mpCost = () => 50;
        this.range = () => 0;
    }
    execute(user, { gameState, args, effect }) {
        if (!this.tryToConsumeMP(user, effect))
            return;
        const targets = user.$$room.state.getPlayersInRange(user, 0, [user.uuid]).filter(target => target.dir === 'C');
        const target = targets[0];
        if (!target)
            return user.sendClientMessage('There is no one in need of revival here!');
        user.sendClientMessage(`You are reviving ${target.name}.`);
        target.sendClientMessage(`You have been revived by ${user.name}.`);
        this.use(user, target, effect);
    }
    use(user, target, baseEffect = {}) {
        const effect = new Revive_1.Revive(baseEffect);
        effect.cast(user, target, this);
    }
}
Revive.macroMetadata = {
    name: 'Revive',
    macro: 'cast revive',
    icon: 'quicksand',
    color: '#080',
    mode: 'autoActivate'
};
exports.Revive = Revive;
//# sourceMappingURL=Revive.js.map