"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skill_1 = require("../../../../base/Skill");
const character_1 = require("../../../../../models/character");
class Set extends Skill_1.Skill {
    constructor() {
        super(...arguments);
        this.name = 'set';
        this.requiresLearn = false;
        this.range = (attacker) => 0;
    }
    execute(user, { gameState, args }) {
        if (user.baseClass !== 'Thief')
            return user.sendClientMessage('Only Thieves can set traps!');
        const weapon = user.rightHand;
        if (!weapon || weapon.itemClass !== 'Trap')
            return user.sendClientMessage('You need a trap in your right hand to set it!');
        let xSet = 0;
        let ySet = 0;
        if (args) {
            const { x, y } = user.getXYFromDir(args);
            xSet = x;
            ySet = y;
        }
        const targetX = user.x + xSet;
        const targetY = user.y + ySet;
        const interactable = user.$$room.state.getInteractable(targetX, targetY, true, 'Trap');
        if (interactable)
            return user.sendClientMessage('There is already a trap there!');
        this.use(user, { x: targetX, y: targetY });
    }
    use(user, { x, y } = { x: 0, y: 0 }) {
        const trap = user.rightHand;
        user.setRightHand(null);
        user.gainSkill(character_1.SkillClassNames.Thievery, 3);
        user.$$room.placeTrap(x, y, user, trap);
        user.sendClientMessage(`You set the ${trap.effect.name} trap.`);
    }
}
exports.Set = Set;
//# sourceMappingURL=Set.js.map