
import { Effect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { CombatHelper } from '../../helpers/world/combat-helper';

export class NecroticAura extends Effect {

  iconData = {
    name: 'bell-shield',
    bgColor: '#0a0',
    tooltipDesc: 'Pulsing necrotic damage.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.flagPermanent(caster.uuid);
    this.potency = this.potency || 1;
    this.effectInfo.damage = this.potency * 50;
    caster.applyEffect(this);
  }

  effectTick(char: Character) {
    const damage = this.potency * 50;
    char.$$room.state.getAllHostilesInRange(char, 1).forEach(target => {
      const caster = char.$$room.state.findPlayer(this.effectInfo.caster);

      CombatHelper.magicalAttack(caster, target, {
        effect: this,
        defMsg: `You are nauseous!`,
        damage: damage,
        damageClass: 'necrotic'
      });
    });
  }
}
