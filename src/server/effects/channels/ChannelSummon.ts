
import { ChanneledSpellEffect } from '../../base/Effect';
import { Character, StatName } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { NPC } from '../../../shared/models/npc';

export class ChannelSummon extends ChanneledSpellEffect {

  iconData = {
    name: 'dark-squad',
    bgColor: '#050',
    color: '#fff',
    tooltipDesc: 'Channeling summon.'
  };

  private summonCreature: string;
  private numSummons: number;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    super.cast(caster, target, skillRef);

    if(!this.duration) this.duration = 1;

    caster.applyEffect(this);
  }

  effectEnd(char: Character) {
    if(this.duration !== 0) return;

    const defaultSpawner = {
      maxCreatures: this.numSummons,
      respawnRate: 0,
      initialSpawn: this.numSummons,
      spawnRadius: 0,
      randomWalkRadius: 30,
      leashRadius: 50,
      shouldStrip: false,
      stripOnSpawner: true,
      removeWhenNoNPCs: true,
      npcIds: [this.summonCreature]
    };

    char.$$room.createSpawner(defaultSpawner, char);
  }
}
