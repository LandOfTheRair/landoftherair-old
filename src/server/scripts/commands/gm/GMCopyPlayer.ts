
import { get, set, cloneDeep } from 'lodash';

import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { MessageHelper } from '../../../helpers/world/message-helper';
import { Item } from '../../../../shared/models/item';
import { AllNormalGearSlots, Character, StatName } from '../../../../shared/models/character';

export class GMCopyPlayer extends Command {

  public name = '@copyplayer';
  public format = '';

  async execute(player: Player, { args }) {
    if(!player.$$room.subscriptionHelper.isGM(player)) return;

    const possTargets = MessageHelper.getPossibleMessageTargets(player, args, false);
    if(!possTargets.length) return player.youDontSeeThatPerson(args);

    const target: Character = possTargets[0];
    if(!target) return false;

    if(target.baseClass !== player.baseClass) return player.sendClientMessage('Base Class does not match; cannot copy at this time.');

    // copy gear (belt, gear, hands)
    const belt = target.belt;
    const gearSlots = AllNormalGearSlots;

    for(let i = 0; i < belt.allItems.length; i++) {
      const item = belt.allItems[i];
      if(!item) {
        player.belt.takeItemFromSlot(i);
        continue;
      }

      const itemInst = new Item(item, { doRegenerate: true });
      itemInst.owner = player.uuid;
      player.belt.addItem(itemInst, i);
    }

    gearSlots.forEach(slot => {
      const item = get(target, slot);
      if(!item) {
        set(player, slot, null);
        return;
      }

      const itemInst = new Item(item, { doRegenerate: true });
      itemInst.owner = player.uuid;
      set(player, slot, itemInst);
    });

    player.clearAllEffects();
    player.tryToCastEquippedEffects();

    // copy stats
    Object.keys(target.baseStats).forEach(key => player.setBaseStat(<StatName>key, target.baseStats[key]));

    // copy level
    player.level = target.level;
    player.exp = target.exp;

    // copy hp/mp
    player.hp.maximum = target.hp.maximum;
    player.mp.maximum = target.mp.maximum;

    player.hp.toMaximum();
    player.mp.toMaximum();

    // copy skills
    Object.keys(target.allSkills).forEach(key => player.setSkill(key, target.allSkills[key]));

    // traits
    if(player.baseClass !== 'Undecided' && target.isPlayer()) {
      const tPlayer = <Player>target;
      player.skillTree.nodesClaimed = cloneDeep(tPlayer.skillTree.nodesClaimed);
      player.skillTree.levelsClaimed = cloneDeep(tPlayer.skillTree.levelsClaimed);
      player.skillTree.skillsClaimed = cloneDeep(tPlayer.skillTree.skillsClaimed);
    }
  }
}
