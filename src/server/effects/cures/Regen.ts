
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { CombatHelper } from '../../helpers/world/combat-helper';
import { Skill } from '../../base/Skill';

export class Regen extends SpellEffect {

  iconData = {
    name: 'star-swirl',
    color: '#00a',
    tooltipDesc: 'Constantly restoring health.'
  };

  maxSkillForSkillGain = 15;
  skillMults = [[0, 0.25], [11, 0.5], [21, 1]];

  private shouldBurst: boolean;

  cast(caster: Character, target: Character, skillRef?: Skill) {

    this.setPotencyAndGainSkill(caster, skillRef);

    if(caster !== target) {
      this.effectMessage(caster, `You are regenerating ${target.name}!`);
    }

    this.aoeAgro(caster, 30);

    const damage = -(this.getTotalDamageRolls(caster) * (this.getTotalDamageDieSize(caster) / 4));

    this.duration = this.duration || 10;
    this.updateDurationBasedOnTraits(caster);

    this.shouldBurst = !!caster.getTraitLevel('RegenerativeRefrain');

    this.effectInfo = { damage, caster: caster.uuid };
    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'Your body begins to repair itself more quickly!');

    this.iconData.tooltipDesc = `Constantly restoring ${Math.abs(this.effectInfo.damage)} health.`;
  }

  effectTick(char: Character) {
    const caster = char.$$room.state.findCharacter(this.effectInfo.caster);

    CombatHelper.magicalAttack(caster, char, {
      effect: this,
      atkMsg: caster === char ? `You are regenerating health!` : '',
      defMsg: `You are regenerating health!`,
      damage: this.effectInfo.damage,
      damageClass: 'heal'
    });

  }

  effectEnd(char: Character) {
    if(this.shouldBurst) {
      const caster = char.$$room.state.findCharacter(this.effectInfo.caster);

      CombatHelper.magicalAttack(caster, char, {
        effect: this,
        atkMsg: caster === char ? `Your regeneration spell bursted!` : '',
        defMsg: `Your regeneration spell bursted!`,
        damage: this.effectInfo.damage * 3,
        damageClass: 'heal'
      });
    }

    this.effectMessage(char, 'Your body is no longer regenerating quickly.');
  }
}
