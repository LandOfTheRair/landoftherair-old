
import { sample } from 'lodash';

import { NPC } from '../../../../../shared/models/npc';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Pilgrim Helpers';

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Thanksgiving Heal Bottle');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Risan Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      return `Hello, traveler! Would you like to help us prepare a feast to celebrate? 
      I can reward you with a cornucopia of sorts, just bring me four crimson leaves, six apples, and five ears of corn.
      Tell me CORNUCOPIA when you're ready!`;
    });

  npc.parser.addCommand('cornucopia')
    .set('syntax', ['cornucopia'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      const leafIndexes = npc.$$room.npcLoader.getItemsFromPlayerSackByName(player, 'Thanksgiving Leaf');
      const cornIndexes = npc.$$room.npcLoader.getItemsFromPlayerSackByName(player, 'Thanksgiving Corn');
      const appleIndexes = npc.$$room.npcLoader.getItemsFromPlayerSackByName(player, 'Yzalt Steffen Apple');

      if(leafIndexes.length < 4)  return 'It seems like you need a few more leaves?';
      if(cornIndexes.length < 5)  return 'You might need to bring a few more ears of corn!';
      if(appleIndexes.length < 6) return 'Can you bring a few more apples?';

      if(player.rightHand) return 'Please empty your right hand, so you may receive this bountiful gift!';

      const allSlots = cornIndexes.slice(0, 5)
              .concat(appleIndexes.slice(0, 6))
              .concat(leafIndexes.slice(0, 4));

      npc.$$room.npcLoader.takeItemsFromPlayerSack(player, allSlots);

      const item = sample([
        'Thanksgiving Heal Bottle (XS)',
        'Thanksgiving Heal Bottle (SM)',
        'Thanksgiving Heal Bottle (MD)',
        'Thanksgiving Heal Bottle'
      ]);

      player.setHandsBusy();

      npc.$$room.npcLoader.loadItem(item)
        .then(newItem => {
          player.setRightHand(newItem);

          player.setHandsFree();
        });

      return `Thank you for making our feast a success, ${player.name}!`;
    });
};
