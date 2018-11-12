import { NPC } from '../../../../../shared/models/npc';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Risan Longsword');
  npc.leftHand = await npc.$$room.npcLoader.loadItem('Risan Wooden Shield');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Risan Breastplate');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 1) return 'Please move closer.';

      if(npc.$$room.npcLoader.checkPlayerHeldItem(player, 'Risan Love Story')) {
        const book = player.rightHand;

        if(book.hasPageCount(6)) {
          return `Yes, quickly, take that to Evelyn!`;
        }

        if(book.hasPageCount(5)) {
          npc.$$room.npcLoader.putItemInPlayerHand(player, `Risan Love Story Page 6`, 'left');
          return 'Oh, you\'ve found all of that dreadful thing! Here, let me give you a note. Put this in the back, she\'ll figure it out.';
        }

        if(!book.hasPageCount(5)) return 'Bring me that book when you\'ve finished it... I have something you want.';
      }

      return 'Oh... hello.';
    });
};
