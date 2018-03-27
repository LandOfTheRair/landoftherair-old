
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
      npcIds: [this.summonCreature],

      npcCreateCallback: (npc: NPC) => {

        // match the player
        npc.allegianceReputation = char.allegianceReputation;
        npc.allegianceReputation.Enemy = -100000;
        npc.allegiance = char.allegiance;
        npc.alignment = char.alignment;
        npc.hostility = 'Faction';
        npc.level = char.level;

        // boost stats
        const skills = char.allSkills;
        Object.keys(skills).forEach(skill => {
          npc._gainSkill(skill, skills[skill]);
        });

        const stats = char.baseStats;
        Object.keys(stats).forEach((stat: StatName) => {
          npc.gainStat(stat, stats[stat]);
        });

        npc.recalculateStats();
      }
    };

    char.$$room.createSpawner(defaultSpawner, char);
  }
}
