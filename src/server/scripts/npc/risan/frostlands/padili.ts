
import { includes } from 'lodash';

import { NPC } from '../../../../../shared/models/npc';
import { ArmorClasses } from '../../../../../shared/interfaces/item';
import { MetalworkingHelper } from '../../../../helpers/tradeskill/metalworking-helper';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Frostlands Yeti Fur');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 1) return 'Please move closer.';

      return `Brrr! Sure is cold around here. Oh, don\'t mind me, I just look like a yeti because I took one of their furs and got a bit too much. 
      Anyway, I can line your armor with FUR and make it easier for you to survive in the cold too!`;
    });

  npc.parser.addCommand('fur')
    .set('syntax', ['fur'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 1) return 'Please move closer.';

      return `Shlep! Sure can do that. Only thing is, it counts towards your armor's enchantment limit. You should know what that means, 'cause I sure don't. Want to DO IT?
      Hold your fur in your left hand and your armor in your right.`;
    });

  npc.parser.addCommand('do it')
    .set('syntax', ['do it'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 1) return 'Please move closer.';

      const armor = player.rightHand;
      const fur = player.leftHand;

      if(!armor || !includes(ArmorClasses, armor.itemClass)) return 'Shnope. That is not armor. Sorry.';
      if(!fur || fur.itemClass !== 'Fur') return 'Shnope, you need fur. Come back later.';

      if(!armor.canUseInCombat(player)) return 'Shnope. You ain\'t able to use that armor. Can\'t help ya.';
      if(!fur.canUseInCombat(player)) return 'Shnope. You ain\'t able to use that fur. Can\'t help ya.';

      if(armor.enchantLevel >= 5) return 'Shnope. That armor is already too powerful.';

      MetalworkingHelper.doSpecificItemUpgrade(armor, fur);

      player.setLeftHand(null);

      return 'Shwelp. It is done. Enjoy!';
    });
};
