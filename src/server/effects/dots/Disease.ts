
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { CombatHelper } from '../../helpers/world/combat-helper';
import { Skill } from '../../base/Skill';
import { RollerHelper } from '../../../shared/helpers/roller-helper';

export class Disease extends SpellEffect {

  iconData = {
    name: 'death-juice',
    color: '#0a0',
    tooltipDesc: 'Constantly receiving disease damage.'
  };

  maxSkillForSkillGain = 25;
  skillMults = [[0, 2], [6, 2.5], [11, 3], [16, 3.5], [21, 4]];

  private critBonus: number;
  private healerDebilitate: number;

  cast(caster: Character, target: Character, skillRef?: Skill) {

    this.setPotencyAndGainSkill(caster, skillRef);

    const mult = this.getMultiplier();

    const calcMod = Math.max(1, this.getCoreStat(caster) - target.getTotalStat('con'));

    const wisCheck = Math.max(1, Math.floor(mult * calcMod));
    const totalPotency = this.getTotalDamageRolls(caster);
    const damage = RollerHelper.diceRoll(totalPotency, wisCheck);

    this.duration = this.duration || this.potency * 2;

    const natureSpirit = caster.getTraitLevelAndUsageModifier('NatureSpirit');
    this.critBonus = natureSpirit;

    this.duration += caster.getTraitLevel('NatureSpirit');

    if(caster.getTraitLevel('DebilitatingDisease')) {
      this.healerDebilitate = Math.max(1, Math.round(this.potency / 4));
    }

    this.effectInfo = { damage, caster: caster.uuid };
    this.flagCasterName(caster.name);
    target.applyEffect(this);
    this.effectMessage(caster, { message: `You diseased ${target.name}!`, sfx: 'spell-debuff-give' });
  }

  effectStart(char: Character) {
    this.effectMessage(char, { message: 'You were diseased!', sfx: 'spell-debuff-receive' });

    if(this.healerDebilitate) {
      this.iconData.tooltipDesc = `${this.iconData.tooltipDesc} -${this.healerDebilitate} CON/WIL, -${this.healerDebilitate * 3} Accuracy.`;
      this.loseStat(char, 'wil', this.healerDebilitate);
      this.loseStat(char, 'con', this.healerDebilitate);
      this.loseStat(char, 'accuracy', this.healerDebilitate * 3);
    }
  }

  effectTick(char: Character) {
    const caster = char.$$room.state.findCharacter(this.effectInfo.caster);

    let isCrit = false;

    if(RollerHelper.XInOneHundred(this.critBonus * 100)) {
      isCrit = true;
    }

    CombatHelper.magicalAttack(caster, char, {
      effect: this,
      atkMsg: `${char.name} is ${isCrit ? 'critically ' : ''}diseased!`,
      defMsg: `You are ${isCrit ? 'critically ' : ''}diseased!`,
      damage: this.effectInfo.damage * (isCrit ? 3 : 1),
      damageClass: 'disease',
      isOverTime: true
    });

  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your body recovered from the disease.');
  }
}
