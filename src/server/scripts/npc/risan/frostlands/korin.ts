import { NPC } from '../../../../../shared/models/npc';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Club Helm');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Club Shirt');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {

      if(player.level < 25) return 'You are not strong enough to be here!';

      if(npc.$$room.npcLoader.checkPlayerHeldItem(player, 'Frostlands Frostfang Robe')) {
        npc.$$room.npcLoader.takePlayerItemFromEitherHand(player, 'Frostlands Frostfang Robe');

        npc.$$room.npcLoader.putItemInPlayerHand(player, `Club Helm`);

        return 'Excellent work. Good luck with your initiation!';
      }

      return 'Bring me the fur of the fanged terror!';
    });
};
