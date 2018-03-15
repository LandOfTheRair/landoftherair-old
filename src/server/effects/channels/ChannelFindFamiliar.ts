
import { some, last, includes } from 'lodash';

import { ChanneledSpellEffect, Effect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { MessageHelper } from '../../helpers/lobby/message-helper';
import { GenderHelper } from '../../helpers/character/gender-helper';
import { NPC } from '../../../shared/models/npc';

const animalHash = {
  deer: 'Mage Summon Deer',
  wolf: 'Mage Summon Wolf',
  bear: 'Mage Summon Bear',
  salamander: 'Mage Summon Salamander',
  chillspider: 'Mage Summon Chillspider'
};

// this hash is for boosting stats/etc of the summoned creature, so it's useful
const animalModHash = {
  deer: (npc: NPC, potency: number) => {
    npc.gainBaseStat('hp', Math.floor(potency * 2000));
  },
  wolf: (npc: NPC, potency: number) => {
    npc.gainBaseStat('hp', Math.floor(potency * 3000));
    npc.gainBaseStat('str', Math.floor(potency / 3));
  },
  bear: (npc: NPC, potency: number) => {
    npc.gainBaseStat('hp', Math.floor(potency * 4000));
    npc.gainBaseStat('str', Math.floor(potency / 5));
    npc.gainBaseStat('con', Math.floor(potency / 5));
  },
  salamander: (npc: NPC, potency: number) => {
    npc.gainBaseStat('hp', Math.floor(potency * 1500));
    npc.gainBaseStat('int', Math.floor(potency / 4));
  },
  chillspider: (npc: NPC, potency: number) => {
    npc.gainBaseStat('hp', Math.floor(potency * 3000));
    npc.gainBaseStat('str', Math.floor(potency / 4));
  }
};

class SummonedPet extends Effect {

  iconData = {
    name: 'eagle-emblem',
    color: '#a0a',
    tooltipDesc: 'Pet. Summoned by Player.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.iconData.tooltipDesc = `Pet. Summoned by ${caster.name}.`;
    this.flagPermanent(target.uuid);
    target.applyEffect(this);
  }
}

export class ActivePet extends Effect {

  iconData = {
    name: 'eagle-emblem',
    bgColor: '#a0a',
    color: '#fff',
    tooltipDesc: 'Sharing your physical essence with your summoned pet.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    caster.applyEffect(this);
  }

  effectStart(char: Character) {
    char.loseStat('weaponArmorClass', Math.floor(this.potency / 2));
    char.loseStat('armorClass', Math.floor(this.potency / 2));
    char.loseStat('defense', Math.floor(this.potency / 2));
    char.loseStat('offense', Math.floor(this.potency / 2));
    char.loseStat('accuracy', Math.floor(this.potency / 2));
  }

  effectTick(char: Character) {
    if(char.$$pets && some(char.$$pets, pet => !pet.isDead())) return;

    this.effectEnd(char);
    char.unapplyEffect(this);
  }

  effectEnd(char: Character) {
    char.killAllPets();

    char.gainStat('weaponArmorClass', Math.floor(this.potency / 2));
    char.gainStat('armorClass', Math.floor(this.potency / 2));
    char.gainStat('defense', Math.floor(this.potency / 2));
    char.gainStat('offense', Math.floor(this.potency / 2));
    char.gainStat('accuracy', Math.floor(this.potency / 2));
  }
}

export class ChannelFindFamiliar extends ChanneledSpellEffect {

  iconData = {
    name: 'eagle-emblem',
    bgColor: '#050',
    color: '#fff',
    tooltipDesc: 'Channeling FindFamiliar.'
  };

  private animalId: string;
  private animalStr: string;

  maxSkillForSkillGain = 17;

  cast(caster: Character, target: Character, skillRef?: Skill, animalStr?: string) {
    super.cast(caster, target, skillRef);

    this.setPotencyAndGainSkill(caster, skillRef);
    if(!this.duration) this.duration = 5;

    animalStr = animalStr.toLowerCase();

    const allPossibleAnimals = ['deer'];

    if(this.potency >= 5) allPossibleAnimals.push('wolf');
    if(this.potency >= 10) allPossibleAnimals.push('bear');
    if(this.potency >= 15) allPossibleAnimals.push('salamander');
    if(this.potency >= 20) allPossibleAnimals.push('chillspider');

    // can't cast for an animal at a higher skill
    if(!includes(allPossibleAnimals, animalStr)) animalStr = '';

    let resultingId = animalHash[animalStr];
    if(!resultingId) resultingId = animalHash[last(allPossibleAnimals)];

    this.animalStr = animalStr || last(allPossibleAnimals);
    this.animalId = resultingId;

    caster.applyEffect(this);
  }

  effectStart(char: Character) {
    MessageHelper.sendClientMessageToRadius(char, `${char.name} begins channeling find familiar.`);
    char.killAllPets();
  }

  effectEnd(char: Character) {
    if(this.duration !== 0) {
      MessageHelper.sendClientMessageToRadius(char, `${char.name} ceases channeling find familiar.`);
      return;
    }

    MessageHelper.sendClientMessageToRadius(char, `${char.name} finishes channeling find familiar for ${GenderHelper.hisher(char)} pet ${this.animalStr}!`);

    const defaultSpawner = {
      maxCreatures: 1,
      respawnRate: 0,
      initialSpawn: 1,
      spawnRadius: 0,
      randomWalkRadius: 30,
      leashRadius: 50,
      shouldStrip: false,
      stripOnSpawner: true,
      removeWhenNoNPCs: true,
      npcIds: [this.animalId],

      npcCreateCallback: (npc: NPC) => {

        // match the player
        npc.allegianceReputation = char.allegianceReputation;
        npc.allegianceReputation.Enemy = -100000;
        npc.allegiance = char.allegiance;
        npc.alignment = char.alignment;
        npc.hostility = 'Faction';
        npc.level = char.level;

        npc.name = `pet ${npc.name}`;

        // boost stats
        animalModHash[this.animalStr](npc, this.potency);

        // make them know each other
        char.$$pets = [npc];
        npc.$$owner = char;

        const summonedPet = new SummonedPet({});
        summonedPet.cast(char, npc);
      }
    };

    char.$$room.createSpawner(defaultSpawner, char);

    const activePet = new ActivePet({ potency: this.potency });
    activePet.duration = this.potency * 50;
    activePet.cast(char, char);
  }
}
