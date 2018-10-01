
import { includes } from 'lodash';

import { NPC } from '../../../../../shared/models/npc';
import { Currency } from '../../../../../shared/helpers/holiday-helper';

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

      if(!player.rightHand) return 'If you want tokens, bring me brains and candy. I can also check out your SACK, if you have \'em there.';

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

      return 'Sorry man, I only deal in brains and candy. Maybe you got a SACK full of \'em?';
    });

  npc.parser.addCommand('sack')
    .set('syntax', ['sack'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      const brainIndexes = npc.$$room.npcLoader.getItemsFromPlayerSackByName(player, 'Halloween Zombie Brain');
      npc.$$room.npcLoader.takeItemsFromPlayerSack(player, brainIndexes);

      const pileIndexes = npc.$$room.npcLoader.getItemsFromPlayerSackByName(player, 'Halloween Candy Pile');
      npc.$$room.npcLoader.takeItemsFromPlayerSack(player, pileIndexes);

      const candyIndexes = npc.$$room.npcLoader.getItemsFromPlayerSackByName(player, 'Halloween Candy -', true);
      npc.$$room.npcLoader.takeItemsFromPlayerSack(player, candyIndexes);

      const tokensGained = candyIndexes.length + (pileIndexes.length * 10) + (brainIndexes.length * 5);
      player.earnCurrency(Currency.Halloween, tokensGained);

      return `Woah, dude, thanks! Here's ${tokensGained} tokens.`;
    });
};
