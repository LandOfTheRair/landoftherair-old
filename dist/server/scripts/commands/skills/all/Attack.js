"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skill_1 = require("../../../../base/Skill");
const combat_helper_1 = require("../../../../helpers/combat-helper");
class Attack extends Skill_1.Skill {
    constructor() {
        super(...arguments);
        this.name = 'attack';
        this.requiresLearn = false;
        this.range = (attacker) => {
            const weapon = attacker.rightHand;
            if (!weapon)
                return 0;
            if (weapon.twoHanded && attacker.leftHand)
                return -1;
            return weapon.attackRange;
        };
    }
    execute(user, { gameState, args }) {
        if (!args)
            return false;
        const range = this.range(user);
        if (range === -1)
            return user.sendClientMessage('You need to have your left hand empty to use that weapon!');
        const possTargets = user.$$room.getPossibleMessageTargets(user, args);
        const target = possTargets[0];
        if (!target)
            return user.sendClientMessage('You do not see that person.');
        if (target.distFrom(user) > range)
            return user.sendClientMessage('That target is too far away!');
        this.use(user, target);
    }
    use(user, target) {
        combat_helper_1.CombatHelper.physicalAttack(user, target, { attackRange: this.range(user) });
    }
}
Attack.macroMetadata = {
    name: 'Attack',
    macro: 'attack',
    icon: 'blade-drag',
    color: '#530000',
    mode: 'lockActivation'
};
exports.Attack = Attack;
//# sourceMappingURL=Attack.js.map