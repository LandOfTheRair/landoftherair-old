
import { includes } from 'lodash';

import { NPC } from '../../../../../shared/models/npc';
import { Currency } from '../../../../../shared/interfaces/holiday';
import { SantasPresents } from '../../../../quests';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Frosty Friends';

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Christmas Gift - Rainbow');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Risan Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  const updatePlayerPresentCount = (player, num: number) => {

    SantasPresents.updateProgress(player, { giftBoost: num });

    const { gifts } = player.getQuestData(SantasPresents);

    // 5: carrot
    if(gifts >= 5 && gifts - num < 5) {
      npc.$$room.npcLoader.putItemInPlayerHand(player, 'Christmas Carrot');
    }

    // 50: gem
    if(gifts >= 50 && gifts - num < 50) {
      npc.$$room.npcLoader.putItemInPlayerHand(player, 'Christmas Gem');
    }

    // 150: coal
    if(gifts >= 150 && gifts - num < 150) {
      npc.$$room.npcLoader.putItemInPlayerHand(player, 'Christmas Coal');
    }

    // 250: wil pot
    if(gifts >= 250 && gifts - num < 250) {
      npc.$$room.npcLoader.putItemInPlayerHand(player, 'Antanian Willpower Potion');
    }

    // 500: snowglobe
    if(gifts >= 500 && gifts - num < 500) {
      npc.$$room.npcLoader.putItemInPlayerHand(player, 'Christmas Snowglobe');
    }

    if(SantasPresents.isComplete(player)) {
      SantasPresents.completeFor(player);
    }
  };

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(!player.hasQuest(SantasPresents)) player.startQuest(SantasPresents);

      if(!player.rightHand) return `Ho ho ho! Can you bring me some presents, and help me save Christmas? Maybe from your SACK to mine? 
      Bring me a lot of gifts and I can reward you!`;

      if(includes(player.rightHand.name, 'Christmas Gift -')) {
        player.setRightHand(null);
        player.earnCurrency(Currency.Christmas, 15);

        updatePlayerPresentCount(player, 1);
        return 'Thanks for the gift! Here\'s 15 tokens in return!';
      }

      return `Ho ho ho! Can you bring me some presents, and help me save Christmas? Maybe from your SACK to mine? 
      Bring me a lot of gifts and I can reward you!`;
    });

  npc.parser.addCommand('sack')
    .set('syntax', ['sack'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(player.rightHand) return 'Please empty your right hand, I might have something for you!';

      if(!player.hasQuest(SantasPresents)) player.startQuest(SantasPresents);

      const giftIndexes = npc.$$room.npcLoader.getItemsFromPlayerSackByName(player, 'Christmas Gift -', true);
      npc.$$room.npcLoader.takeItemsFromPlayerSack(player, giftIndexes);

      const tokensGained = giftIndexes.length * 15;
      player.earnCurrency(Currency.Christmas, tokensGained);

      updatePlayerPresentCount(player, giftIndexes.length);

      return `Woah, thanks! Here's ${tokensGained} tokens for your presents.`;
    });
};
