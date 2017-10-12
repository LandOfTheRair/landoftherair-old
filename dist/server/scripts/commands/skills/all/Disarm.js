"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skill_1 = require("../../../../base/Skill");
const character_1 = require("../../../../../models/character");
class Disarm extends Skill_1.Skill {
    constructor() {
        super(...arguments);
        this.name = 'disarm';
        this.requiresLearn = false;
        this.range = (attacker) => 0;
    }
    execute(user, { gameState, args }) {
        if (user.baseClass !== 'Thief')
            return user.sendClientMessage('Only Thieves can disarm traps!');
        const { x, y } = user.getXYFromDir(args);
        if (x === 0 && y === 0)
            return user.sendClientMessage('You can\'t disarm a trap from there!');
        const targetX = user.x + x;
        const targetY = user.y + y;
        const interactable = user.$$room.state.getInteractable(targetX, targetY, true, 'Trap');
        if (!interactable)
            return user.sendClientMessage('There is no trap there!');
        this.use(user, { x: targetX, y: targetY });
    }
    use(user, { x, y } = { x: 0, y: 0 }) {
        const trap = user.$$room.state.getInteractable(x, y, true, 'Trap');
        if (!trap)
            return user.sendClientMessage('There is no trap there!');
        const { setSkill, caster } = trap.properties;
        const mySkill = user.calcSkillLevel(character_1.SkillClassNames.Thievery);
        if (caster.username !== user.username) {
            if (mySkill <= setSkill)
                return user.sendClientMessage('You are unable to disarm the trap.');
            user.gainSkill(character_1.SkillClassNames.Thievery, 3);
        }
        user.$$room.state.removeInteractable(trap);
        user.sendClientMessage(`You disarmed the trap.`);
    }
}
exports.Disarm = Disarm;
//# sourceMappingURL=Disarm.js.map