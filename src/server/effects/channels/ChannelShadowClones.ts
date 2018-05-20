
import { some } from 'lodash';

import { ChanneledSpellEffect, Effect } from '../../base/Effect';
import { Character, StatName } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { NPC } from '../../../shared/models/npc';
import { Item } from '../../../shared/models/item';

class SummonedClone extends Effect {

  iconData = {
    name: 'dark-squad',
    color: '#000',
    tooltipDesc: 'Clone. Summoned by Player.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.iconData.tooltipDesc = `Clone. Summoned by ${caster.name}.`;
    this.flagPermanent(target.uuid);
    target.applyEffect(this);
  }
}

class ActiveClones extends Effect {

  iconData = {
    name: 'dark-squad',
    bgColor: '#000',
    color: '#fff',
    tooltipDesc: 'You have summoned backup.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    caster.applyEffect(this);
  }

  effectTick(char: Character) {
    if(char.$$pets && some(char.$$pets, pet => !pet.isDead())) return;

    this.effectEnd(char);
    char.unapplyEffect(this);
  }

  effectEnd(char: Character) {
    char.killAllPets();
  }
}

export class ChannelShadowClones extends ChanneledSpellEffect {

  iconData = {
    name: 'dark-squad',
    bgColor: '#050',
    color: '#fff',
    tooltipDesc: 'Channeling Shadow Clones.'
  };

  maxSkillForSkillGain = 17;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    super.cast(caster, target, skillRef);

    this.setPotencyAndGainSkill(caster, skillRef);
    if(!this.duration) this.duration = 5;

    // first, go down to a base of skill 10
    this.potency -= 10;

    // then divide by 5 to see the number of clones total
    this.potency = Math.floor(this.potency / 5);

    // min of 1, always
    this.potency = Math.max(this.potency, 1);

    caster.applyEffect(this);
  }

  effectStart(char: Character) {
    char.sendClientMessage('You begin calling for backup.');
    char.killAllPets();
  }

  effectEnd(char: Character) {
    if(this.duration !== 0) return;

    char.sendClientMessage('Your backup has arrived!');

    const defaultSpawner = {
      maxCreatures: this.potency,
      respawnRate: 0,
      initialSpawn: this.potency,
      spawnRadius: 0,
      randomWalkRadius: 30,
      leashRadius: 50,
      shouldStrip: false,
      stripOnSpawner: true,
      removeWhenNoNPCs: true,
      npcIds: ['Thief Shadow Clone'],

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
          npc.gainBaseStat(stat, stats[stat]);
        });

        const reversedPotency = (this.potency * 5) + 10;
        npc.gainBaseStat('hp', char.getBaseStat('hp') * reversedPotency);

        npc.recalculateStats();

        if(char.rightHand) {
          npc.rightHand = new Item(char.rightHand);
          npc.rightHand.tier = Math.max(1, (npc.rightHand.tier || 0) - 1);
        }

        if(char.leftHand) {
          npc.leftHand = new Item(char.leftHand);
          npc.leftHand.tier = Math.max(1, (npc.leftHand.tier || 0) - 1);
        }

        // make them know each other
        char.$$pets = char.$$pets || [];
        char.$$pets.push(npc);
        npc.$$owner = char;

        const summoned = new SummonedClone({});
        summoned.cast(char, npc);
      }
    };

    char.$$room.createSpawner(defaultSpawner, char);

    const activePet = new ActiveClones({ potency: this.potency });
    activePet.duration = this.potency * 50;
    activePet.cast(char, char);
  }
}
