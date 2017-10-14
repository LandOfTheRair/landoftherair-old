"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skill_1 = require("../../../../base/Skill");
const Hidden_1 = require("../../../../effects/Hidden");
class Hide extends Skill_1.Skill {
    constructor() {
        super(...arguments);
        this.name = 'hide';
        this.format = '';
        this.requiresLearn = false;
    }
    execute(user, { gameState }) {
        this.use(user);
    }
    use(user) {
        if (user.hasEffect('Hidden'))
            return user.sendClientMessage('You are already hidden!');
        if (!user.canHide())
            return user.sendClientMessage('You were unable to hide.');
        const effect = new Hidden_1.Hidden({});
        effect.cast(user, user, this);
    }
}
Hide.macroMetadata = {
    name: 'Hide',
    macro: 'hide',
    icon: 'hidden',
    color: '#cccccc',
    bgColor: '#000000',
    mode: 'autoActivate'
};
exports.Hide = Hide;
//# sourceMappingURL=Hide.js.map