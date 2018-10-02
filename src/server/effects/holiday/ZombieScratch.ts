
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { NPC } from '../../../shared/models/npc';

export class ZombieScratch extends SpellEffect {

  private casterUUID: string;

  iconData = {
    name: 'bleeding-wound',
    color: '#a00',
    tooltipDesc: 'Scratched by a zombie. Will transform if not killed quickly enough.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.duration = 30;
    this.flagCasterName(caster.name);
    this.casterUUID = caster.uuid;
    target.applyEffect(this);
    this.effectMessage(caster, `You zombie-scratched ${target.name}!`);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'You were scratched by a zombie!');
  }

  effectEnd(char: Character) {
    if(char.hp.atMinimum()) return;

    char.sendClientMessageToRadius(`${char.name} undergoes a horrific transformation!`);

    const scratcher = char.$$room.state.findNPC(this.casterUUID);
    if(char) scratcher.removeAgro(char);

    char.hp.toMaximum();
    char.resetAgro(true);
    char.name = 'zombie';
    char.allegiance = 'Enemy';
    char.sprite = 1465;
    char.alignment = 'Evil';
    char.monsterClass = 'Undead';
    (<NPC>char).npcId = 'Halloween Zombie';
    (<NPC>char).hostility = 'Always';
    (<NPC>char).usableSkills.push('ShredTenPercent', 'HalloweenZombieScratch');

    (<NPC>char).drops = (<NPC>char).drops || [];
    (<NPC>char).drops.push(
      { result: 'Halloween Zombie Brain', chance: 1, maxChance: 4 },
      { result: 'Halloween Pumpkin Shield', chance: 1, maxChance: 15000 },
      { result: 'Halloween Moon Boots', chance: 1, maxChance: 75000 }
    );

    char.$$room.syncNPC(char);
  }
}
