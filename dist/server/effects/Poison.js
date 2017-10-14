"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Effect_1 = require("../base/Effect");
const character_1 = require("../../models/character");
const combat_helper_1 = require("../helpers/combat-helper");
const dice = require("dice.js");
class Poison extends Effect_1.SpellEffect {
    constructor() {
        super(...arguments);
        this.iconData = {
            name: 'poison-gas',
            color: '#0a0'
        };
        this.maxSkillForSkillGain = 7;
        this.skillFlag = () => character_1.SkillClassNames.Restoration;
    }
    cast(caster, target, skillRef) {
        this.setPotencyAndGainSkill(caster, skillRef);
        let mult = 0.15;
        if (this.potency > 0)
            mult = 0.35;
        if (this.potency > 11)
            mult = 1;
        if (this.potency > 21)
            mult = 3;
        const wisCheck = Math.max(1, Math.floor(mult * this.getCasterStat(caster, 'wis')));
        const damage = +dice.roll(`${this.potency || 1}d${wisCheck}`);
        this.duration = this.duration || +dice.roll(`${this.potency}d5`);
        this.effectInfo = { damage, caster: caster.uuid };
        target.applyEffect(this);
        this.effectMessage(caster, `You poisoned ${target.name}!`);
    }
    effectStart(char) {
        this.effectMessage(char, 'You were poisoned!');
    }
    effectTick(char) {
        const caster = char.$$room.state.findPlayer(this.effectInfo.caster);
        combat_helper_1.CombatHelper.magicalAttack(caster, char, {
            effect: this,
            defMsg: `You are poisoned!`,
            damage: this.effectInfo.damage,
            damageClass: 'necrotic'
        });
    }
    effectEnd(char) {
        this.effectMessage(char, 'Your body flushed the poison out.');
    }
}
exports.Poison = Poison;
//# sourceMappingURL=Poison.js.map