"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skill_1 = require("../../../../base/Skill");
const combat_helper_1 = require("../../../../helpers/combat-helper");
class Throw extends Skill_1.Skill {
    constructor() {
        super(...arguments);
        this.name = 'throw';
        this.format = 'Hand Target';
        this.requiresLearn = false;
        this.range = (attacker) => {
            return 5;
        };
    }
    execute(user, { gameState, args }) {
        if (!args)
            return false;
        const [handCheck, targetId] = args.split(' ');
        if (!targetId)
            return false;
        const possTargets = user.$$room.getPossibleMessageTargets(user, targetId);
        const target = possTargets[0];
        if (!target)
            return user.sendClientMessage('You do not see that person.');
        if (target.distFrom(user) > this.range(user))
            return user.sendClientMessage('That target is too far away!');
        const hand = handCheck.toLowerCase();
        if (hand !== 'left' && hand !== 'right')
            return false;
        if (!user[`${hand}Hand`])
            return user.sendClientMessage('You do not have anything to throw in that hand!');
        this.use(user, target, { throwHand: hand });
    }
    use(user, target, opts = {}) {
        const { throwHand } = opts;
        combat_helper_1.CombatHelper.physicalAttack(user, target, { isThrow: true, throwHand, attackRange: this.range(user) });
    }
}
Throw.macroMetadata = {
    name: 'Throw',
    macro: 'throw right',
    icon: 'thrown-spear',
    color: '#530000',
    mode: 'lockActivation'
};
exports.Throw = Throw;
//# sourceMappingURL=Throw.js.map