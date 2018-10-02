import { nonenumerable } from 'nonenumerable';
import { Character } from '../../../../shared/models/character';
import { NPC } from '../../../../shared/models/npc';
import { CrazedSaraxaAIBehavior } from '../crazedsaraxa';
import { SpellEffect } from '../../../base/Effect';

export class AcolyteOverseer extends SpellEffect {
  iconData = {
    name: 'minions',
    bgColor: '#a06',
    color: '#fff',
    tooltipDesc: 'Receiving 4% healing per acolyte every 5 seconds.'
  };

  private ticks = 0;

  @nonenumerable
  private aiRef: CrazedSaraxaAIBehavior;

  cast(caster: NPC, target: NPC, skillRef?, ai?: CrazedSaraxaAIBehavior) {
    this.duration = 500;
    this.aiRef = ai;
    target.applyEffect(this);
  }

  effectTick(char: Character) {
    this.ticks++;

    const numLivingAcolytes = this.aiRef.livingAcolytes.length;
    if(numLivingAcolytes > 0) {
      if(this.ticks % 5 !== 0) return;
      char.hp.add(char.hp.maximum * 0.04 * numLivingAcolytes);
      return;
    }

    this.effectEnd(char);
    char.unapplyEffect(this);
  }
}
