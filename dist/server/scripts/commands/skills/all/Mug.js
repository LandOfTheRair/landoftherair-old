"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skill_1 = require("../../../../base/Skill");
const character_1 = require("../../../../../models/character");
const combat_helper_1 = require("../../../../helpers/combat-helper");
const move_helper_1 = require("../../../../helpers/move-helper");
class Mug extends Skill_1.Skill {
    constructor() {
        super(...arguments);
        this.name = 'mug';
        this.format = 'Target';
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
            return user.sendClientMessage('You need a weapon in your hand to mug!');
        if (!this.checkPlayerEmptyHand(user))
            return;
        const thiefSkill = user.calcSkillLevel(character_1.SkillClassNames.Thievery);
        if (thiefSkill < 7)
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
        const res = combat_helper_1.CombatHelper.physicalAttack(user, target, { isMug: true, attackRange: this.range(user) });
        if (res.hit) {
            this.facilitateSteal(user, target);
        }
    }
}
Mug.macroMetadata = {
    name: 'Mug',
    macro: 'mug',
    icon: 'hooded-assassin',
    color: '#530000',
    mode: 'lockActivation'
};
exports.Mug = Mug;
//# sourceMappingURL=Mug.js.map