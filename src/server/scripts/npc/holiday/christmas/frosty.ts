import { NPC } from '../../../../../shared/models/npc';
import { Currency } from '../../../../../shared/interfaces/holiday';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Frosty Friends';

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      // senses
      if(npc.$$room.npcLoader.checkPlayerHeldItem(player, 'Christmas Coal')) {
        npc.$$room.npcLoader.takePlayerItem(player, 'Christmas Coal');

        player.earnCurrency(Currency.Christmas, 15, 'Frosty');
        player.sendClientMessage({ message: `Frosty hands you 15 holiday tokens!`, grouping: 'always' });

        return 'Thank you! I can see again!';
      }

      if(npc.$$room.npcLoader.checkPlayerHeldItem(player, 'Christmas Carrot')) {
        npc.$$room.npcLoader.takePlayerItem(player, 'Christmas Carrot');

        player.earnCurrency(Currency.Christmas, 75, 'Frosty');
        player.sendClientMessage({ message: `Frosty hands you 75 holiday tokens!`, grouping: 'always' });

        return 'Thank you! I can smell again!';
      }

      // items
      if(npc.$$room.npcLoader.checkPlayerHeldItems(player, 'Christmas Top Hat', 'Enchanting Brick - Enos')) {
        npc.$$room.npcLoader.takePlayerItemFromEitherHand(player, 'Christmas Top Hat');
        npc.$$room.npcLoader.takePlayerItemFromEitherHand(player, 'Enchanting Brick - Enos');

        npc.$$room.npcLoader.putItemInPlayerHand(player, 'Christmas Top Hat (Improved)');

        return 'Thank you! My magic is slowly returning!';
      }

      if(npc.$$room.npcLoader.checkPlayerHeldItems(player, 'Christmas Button Shield', 'Enchanting Brick - Enos')) {
        npc.$$room.npcLoader.takePlayerItemFromEitherHand(player, 'Christmas Button Shield');
        npc.$$room.npcLoader.takePlayerItemFromEitherHand(player, 'Enchanting Brick - Enos');

        npc.$$room.npcLoader.putItemInPlayerHand(player, 'Christmas Button Shield (Improved)');

        return 'Thank you! My magic is slowly returning!';
      }

      if(npc.$$room.npcLoader.checkPlayerHeldItems(player, 'Christmas Scarf', 'Enchanting Brick - Enos')) {
        npc.$$room.npcLoader.takePlayerItemFromEitherHand(player, 'Christmas Scarf');
        npc.$$room.npcLoader.takePlayerItemFromEitherHand(player, 'Enchanting Brick - Enos');

        npc.$$room.npcLoader.putItemInPlayerHand(player, 'Christmas Scarf (Improved)');

        return 'Thank you! My magic is slowly returning!';
      }

      if(npc.$$room.npcLoader.checkPlayerHeldItems(player, 'Christmas Candy Staff', 'Enchanting Brick - Enos')) {
        npc.$$room.npcLoader.takePlayerItemFromEitherHand(player, 'Christmas Candy Staff');
        npc.$$room.npcLoader.takePlayerItemFromEitherHand(player, 'Enchanting Brick - Enos');

        npc.$$room.npcLoader.putItemInPlayerHand(player, 'Christmas Candy Staff (Improved)');

        return 'Thank you! My magic is slowly returning!';
      }

      if(npc.$$room.npcLoader.checkPlayerHeldItems(player, 'Christmas Pipe', 'Enchanting Brick - Enos')) {
        npc.$$room.npcLoader.takePlayerItemFromEitherHand(player, 'Christmas Pipe');
        npc.$$room.npcLoader.takePlayerItemFromEitherHand(player, 'Enchanting Brick - Enos');

        npc.$$room.npcLoader.putItemInPlayerHand(player, 'Christmas Pipe (Improved)');

        return 'Thank you! My magic is slowly returning!';
      }

      return 'Hello, adventurer! Can you help me reclaim my MAGIC, or my SENSES?';
    });

  npc.parser.addCommand('magic')
    .set('syntax', ['magic'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      return `Yes... Jack has drained my magic reserves. If you can help, hold for me an Enos brick in your left hand, and my top hat, staff, scarf, or shield in your right.`;
    });

  npc.parser.addCommand('senses')
    .set('syntax', ['senses'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      return `Yes... my sight and smell have faded. If you can bring me a carrot, or some coal, I can reward you!`;
    });
};
