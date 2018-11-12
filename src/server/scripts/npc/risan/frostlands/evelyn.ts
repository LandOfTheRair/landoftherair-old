import { NPC } from '../../../../../shared/models/npc';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Risan Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 1) return 'Please move closer.';

      if(npc.$$room.npcLoader.checkPlayerHeldItem(player, 'Risan Love Story')) {
        const book = player.rightHand;
        if(!book.bookPages)             return 'Well, have you found anything yet?';

        if(book.hasPageCount(6)) {
          npc.$$room.npcLoader.putItemInPlayerHand(player, `Secondwind Ring`);

          return `Oh. Oh no. He\'s been taken, but at least he\'s alive! I\'ll try to get some help. Thank you! 
          Here is our wedding ring... it\'s the least I can do for you giving us a second chance!`;
        }

        if(book.hasPageCount(5))  return 'Hmm... it looks like there\'s a bit more missing at the end.';

        if(!book.hasPageCount(5)) return 'Aiieee! Please don\'t tell me that\'s all of it!';
      }

      return 'Adventurer, adventurer! HELP me! My husband is missing!';
    });

  npc.parser.addCommand('help')
    .set('syntax', ['help'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 1) return 'Please move closer.';
      if(player.rightHand) return 'Empty your right hand and you can help me!';

      npc.$$room.npcLoader.putItemInPlayerHand(player, `Risan Love Story`);

      return `Yes! Please take this book, it was addressed to me, but found in the floes. It must be from my husband! He was last seen heading to confront the brigands. 
      I hope nothing bad happened!`;
    });
};
