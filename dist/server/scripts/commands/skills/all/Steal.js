"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skill_1 = require("../../../../base/Skill");
class Steal extends Skill_1.Skill {
    constructor() {
        super(...arguments);
        this.name = 'steal';
        this.format = 'Target';
        this.requiresLearn = false;
        this.range = () => 0;
    }
    execute(user, { gameState, args }) {
        if (!args)
            return false;
        if (!this.checkPlayerEmptyHand(user))
            return;
        const possTargets = user.$$room.getPossibleMessageTargets(user, args);
        const target = possTargets[0];
        if (!target)
            return user.sendClientMessage('You do not see that person.');
        if (target.distFrom(user) > this.range())
            return user.sendClientMessage('That target is too far away!');
        this.use(user, target);
    }
    use(user, target) {
        this.facilitateSteal(user, target);
    }
}
Steal.macroMetadata = {
    name: 'Steal',
    macro: 'steal',
    icon: 'take-my-money',
    color: '#7F6B00',
    mode: 'lockActivation'
};
exports.Steal = Steal;
//# sourceMappingURL=Steal.js.map