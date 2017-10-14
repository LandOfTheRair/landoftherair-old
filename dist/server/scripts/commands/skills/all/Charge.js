"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skill_1 = require("../../../../base/Skill");
const combat_helper_1 = require("../../../../helpers/combat-helper");
const move_helper_1 = require("../../../../helpers/move-helper");
class Charge extends Skill_1.Skill {
    constructor() {
        super(...arguments);
        this.name = 'charge';
        this.requiresLearn = false;
        this.range = (attacker) => {
            const weapon = attacker.rightHand;
            if (!weapon)
                return 0;
            if (weapon.twoHanded && attacker.leftHand)
                return -1;
            return weapon.attackRange + attacker.getTotalStat('move');
        };
    }
    execute(user, { gameState, args }) {
        if (!args)
            return false;
        const weapon = user.rightHand;
        if (!weapon)
            return user.sendClientMessage('You need a weapon in your hand to charge!');
        const userSkill = user.calcSkillLevel(weapon.type);
        const requiredSkill = user.baseClass === 'Warrior' ? 3 : 7;
        if (userSkill < requiredSkill)
            return user.sendClientMessage('You are not skilled enough to do that!');
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
        const xDiff = target.x - user.x;
        const yDiff = target.y - user.y;
        move_helper_1.MoveHelper.move(user, { room: user.$$room, gameState: user.$$room.state, x: xDiff, y: yDiff });
        combat_helper_1.CombatHelper.physicalAttack(user, target, { attackRange: this.range(user) });
    }
}
Charge.macroMetadata = {
    name: 'Charge',
    macro: 'charge',
    icon: 'running-ninja',
    color: '#530000',
    mode: 'lockActivation'
};
exports.Charge = Charge;
//# sourceMappingURL=Charge.js.map