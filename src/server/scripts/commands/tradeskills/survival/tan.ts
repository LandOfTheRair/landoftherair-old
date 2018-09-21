
import { includes, clamp } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { SharpWeaponClasses } from '../../../../../shared/models/item';
import { SkillClassNames } from '../../../../../shared/models/character';
import { RollerHelper } from '../../../../../shared/helpers/roller-helper';

export class Tan extends Command {

  public name = 'tan';
  public format = '';

  async execute(player: Player, { room, args }) {

    const ground = player.$$room.state.getGroundItems(player.x, player.y);
    if(!ground.Corpse || !ground.Corpse.length) return player.sendClientMessage('There are no corpses here!');
    if(!player.rightHand || !includes(SharpWeaponClasses, player.rightHand.itemClass)) return player.sendClientMessage('You must be holding something sharp to tan!');

    player.rightHand.loseCondition(100, () => player.recalculateStats());

    ground.Corpse.forEach(corpse => {
      if(corpse.$$isPlayerCorpse) {
        player.sendClientMessage(`You cannot tan players, you monster!`);
        return;
      }

      if(!includes(corpse.$$playersHeardDeath, player.username)) {
        player.sendClientMessage(`You didn't have a hand in killing the ${corpse.desc.split('the corpse of a ')[1]}!`);
        return;
      }

      if(!corpse.tansFor) {
        player.sendClientMessage(`You can't make anything out of ${corpse.desc}!`);
        return;
      }

      const corpseNPC = player.$$room.state.findNPC(corpse.npcUUID);
      if(corpseNPC) corpseNPC.restore();
      else          player.$$room.removeItemFromGround(corpse);

      const curSkill = player.calcSkillLevel(SkillClassNames.Survival);
      const maxSkill = player.$$room.maxSkill;
  
      const diff = maxSkill - curSkill;

      // 5 skills below or worse - 0% chance to tan. 5 skills above or better - 100% chance to tan
      let pctChance = Math.abs(clamp(diff, -5, 5) - 5) * 10;

      if(RollerHelper.XInOneHundred(pctChance)) {
        player.$$room.npcLoader.loadItem(corpse.tansFor)
          .then(item => {
            item.setOwner(player);
            player.$$room.addItemToGround(player, item);
          });
  
        player.sendClientMessage(`You successfully tanned ${corpse.desc}!`);
      } else {
        player.sendClientMessage(`You failed to tan ${corpse.desc}.`);
      }
    });
  }

}
