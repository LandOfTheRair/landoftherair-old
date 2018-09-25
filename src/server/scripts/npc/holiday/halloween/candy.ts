
import { includes } from 'lodash';

import { NPC } from '../../../../../shared/models/npc';
import { Currency } from '../../../../helpers/world/holiday-helper';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Halloween Helpers';

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Halloween Candy Pile');
  npc.leftHand = await npc.$$room.npcLoader.loadItem('Halloween Zombie Brain');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Risan Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(!player.rightHand) return 'If you want tokens, bring me brains and candy.';

      if(player.rightHand.name === 'Halloween Zombie Brain') {
        player.setRightHand(null);
        player.earnCurrency(Currency.Halloween, 5);
        return 'Thanks for the brains, chum. Here\'s 5 tokens, knock yourself out.';
      }

      if(player.rightHand.name === 'Halloween Candy Pile') {
        player.setRightHand(null);
        player.earnCurrency(Currency.Halloween, 10);
        return 'Thanks for the candy, chum. Here\'s 10 tokens, knock yourself out.';
      }

      if(includes(player.rightHand.name, 'Halloween Candy -')) {
        player.setRightHand(null);
        player.earnCurrency(Currency.Halloween, 1);
        return 'Thanks for the candy, chum. Here\'s a token, don\'t spend it all in one place, ya hear?';
      }

      return 'Sorry man, I only deal in brains and candy.'
    });
};
