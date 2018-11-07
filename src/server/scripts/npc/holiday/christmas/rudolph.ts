import { NPC } from '../../../../../shared/models/npc';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Frosty Friends';

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Christmas Reindeer Skin');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      if(npc.$$room.npcLoader.checkPlayerHeldItem(player, 'Christmas Egg Nog')) {
        npc.$$room.npcLoader.takePlayerItem(player, 'Christmas Egg Nog');

        player.setHandsBusy();

        npc.$$room.npcLoader.loadItem('Christmas Pipe')
          .then(newItem => {
            player.setRightHand(newItem);

            player.setHandsFree();
          });

        return 'Why thank you! This might help you keep warm... it wasn\'t helping me much...';
      }

      return '*sniffle* Hello there... I\'m having trouble keeping warm, can you bring me something good to drink?';
    });
};
