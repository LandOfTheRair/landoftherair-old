"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skill_1 = require("../../../../base/Skill");
class Reveal extends Skill_1.Skill {
    constructor() {
        super(...arguments);
        this.name = 'reveal';
        this.format = '';
        this.requiresLearn = false;
    }
    execute(user, { gameState }) {
        this.use(user);
    }
    use(user) {
        const hidden = user.hasEffect('Hidden');
        if (!hidden)
            return user.sendClientMessage('You are not hidden!');
        user.unapplyEffect(hidden, true);
    }
}
exports.Reveal = Reveal;
//# sourceMappingURL=Reveal.js.map