
import { filter, compact, sample } from 'lodash';
import { nonenumerable } from 'nonenumerable';

import { Character } from '../../../shared/models/character';
import { NPC } from '../../../shared/models/npc';
import { DefaultAIBehavior } from './default';
import { AttributeEffect, SpellEffect } from '../../base/Effect';
import { Item } from '../../../shared/models/item';
import { Boost, Haste, VitalEssence } from '../../effects';
import { Skill } from '../../base/Skill';

export class CrazedTonwinAIBehavior extends DefaultAIBehavior {

  private trigger75 = false;
  private trigger50 = false;
  private trigger25 = false;

  private possibleSpawnIds = [1, 2, 3];
  private brothers: NPC[] = [];
  private brotherIds = ['Shadow Takwin', 'Shadow Telwin', 'Shadow Terwin'];
  private brotherEffects = [BrotherlySword, BrotherlyShield, BrotherlySpeed];
  private brotherMessages = [
    'My shield for you, Brother!',
    'My sword for you, Brother!',
    'My speed for you, Brother!'
  ];

  public get livingBrothers(): NPC[] {
    return compact(filter(this.brothers, (ac: NPC) => ac && !ac.isDead()));
  }

  private async spawnBrother() {
    const npc = this.npc;

    const spawnId = sample(this.possibleSpawnIds);
    const brotherId = spawnId - 1;

    // make it so that brother can't spawn again
    this.possibleSpawnIds[brotherId] = null;
    this.possibleSpawnIds = compact(this.possibleSpawnIds);

    // spawn the brother
    const npcId = this.brotherIds[brotherId];

    const msgObject = { name: npc.name, message: `Brother ${npcId.split(' ')[1]}! Join me!`, subClass: 'chatter' };
    npc.sendClientMessageToRadius(msgObject, 10);

    const npcSpawner = npc.$$room.getSpawnerByName(`Brother Spawner ${spawnId}`);
    const brother = await npcSpawner.createNPC({ npcId });

    // give the brother effect
    const effect = new this.brotherEffects[brotherId]({ shouldShowMessage: false, ignoreDefenseLoss: true, ignoreStun: true });
    effect.cast(brother, npc, null);
    effect.cast(npc, brother, null);

    // make tonwin invuln
    const buff = new Invulnerable({});
    buff.cast(npc, npc, null, this);

    // open the door
    npc.$$room.state.toggleDoor(npc.$$room.state.getInteractableByName(`Tile Door ${spawnId}`), true);

    // add it to the array (for the invuln buff)
    this.brothers[brotherId] = brother;

    brother.$$ai.death.add(() => {
      this.brothers[brotherId] = null;
    });

    // add another message from the brother
    const brotherMessage = { name: npc.name, message: this.brotherMessages[brotherId], subClass: 'environment' };
    npc.sendClientMessageToRadius(brotherMessage, 10);
  }

  async mechanicTick() {

    const npc = this.npc;

    // oh yes, these acolytes can respawn
    if(npc.hp.gtePercent(90)) this.trigger75 = false;
    if(npc.hp.gtePercent(65)) this.trigger50 = false;
    if(npc.hp.gtePercent(40)) this.trigger25 = false;

    if(!this.trigger75 && npc.hp.ltPercent(75)) {
      this.trigger75 = true;

      await this.spawnBrother();
    }

    if(!this.trigger50 && npc.hp.ltPercent(50)) {
      this.trigger50 = true;

      await this.spawnBrother();
    }

    if(!this.trigger25 && npc.hp.ltPercent(25)) {
      this.trigger25 = true;

      await this.spawnBrother();
    }
  }

  death(killer: Character) {
    const npc = this.npc;

    const msgObject = { name: npc.name, message: `EeeaAAaarrrGGGgghhhh!`, subClass: 'chatter' };
    npc.sendClientMessageToRadius(msgObject, 50);
    npc.sendClientMessageToRadius('You hear a lock click in the distance.', 50);

    npc.$$room.state.getInteractableByName('Chest Door').properties.requireLockpick = false;
  }
}

class Invulnerable extends SpellEffect implements AttributeEffect {
  iconData = {
    name: 'skull-shield',
    bgColor: '#a06',
    color: '#fff',
    tooltipDesc: 'Invulnerable. Cannot receive damage from any source.'
  };

  @nonenumerable
  private aiRef: CrazedTonwinAIBehavior;

  cast(caster: NPC, target: NPC, skillRef?, ai?: CrazedTonwinAIBehavior) {
    this.flagPermanent(caster.uuid);
    this.aiRef = ai;
    target.applyEffect(this);
  }

  effectTick(char: Character) {
    if(this.aiRef.livingBrothers.length > 0) return;

    this.effectEnd(char);
    char.unapplyEffect(this);
  }

  modifyDamage(attacker: Character, defender: Character, opts: { attackerWeapon: Item, damage: number, damageClass: string }) {
    return 0;
  }
}

class BrotherlySpeed extends Haste {
  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.flagPermanent(caster.uuid);
    super.cast(caster, target, skillRef);
  }
}

class BrotherlyShield extends VitalEssence {
  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.flagPermanent(caster.uuid);
    this.potency = 30;
    super.cast(caster, target, skillRef);
  }
}

class BrotherlySword extends Boost {
  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.flagPermanent(caster.uuid);
    this.potency = 5;
    super.cast(caster, target, skillRef);
  }
}
