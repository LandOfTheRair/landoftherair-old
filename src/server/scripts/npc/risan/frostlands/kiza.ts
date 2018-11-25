import { NPC } from '../../../../../shared/models/npc';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Club Shirt');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 1) return 'Please move closer.';

      if(player.level < 25) return 'You are not strong enough to be here!';

      if(npc.$$room.npcLoader.checkPlayerHeldItem(player, 'Frostlands Frozen Yeti Club')) {
        npc.$$room.npcLoader.takePlayerItemFromEitherHand(player, 'Frostlands Frozen Yeti Club');

        npc.$$room.npcLoader.putItemInPlayerHand(player, `Club Shirt`);

        return 'Excellent work. Good luck with your initiation!';
      }

      return 'Bring me the club of the frozen terror!';
    });
};
