
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
    this.potency = this.potency || 1;
    this.flagPermanent(caster.uuid);
    this.flagCasterName(caster.name);
    this.effectInfo.damage = this.potency * 50;
    this.iconData.tooltipDesc = `Pulsing ${this.effectInfo.damage} necrotic damage in a 1x1.`;
    caster.applyEffect(this);
  }

  effectStart(char: Character) {
    char.sendClientMessage('A pungent aura envelops you.');
  }

  effectEnd(char: Character) {
    char.sendClientMessage('Your pungent aura recedes.');
  }

  effectTick(char: Character) {
    const damage = this.potency * 50;

    const caster = char.$$room.state.findPlayer(this.effectInfo.caster);

    char.$$room.state.getAllHostilesInRange(char, 1).forEach(target => {

      CombatHelper.magicalAttack(caster, target, {
        effect: this,
        defMsg: `You are nauseous!`,
        damage: damage,
        damageClass: 'necrotic'
      });
    });
  }
}
