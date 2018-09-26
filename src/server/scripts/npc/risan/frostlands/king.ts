import { NPC } from '../../../../../shared/models/npc';

const FROSTFANG_FUR = 'Frostlands Frostfang Robe';
const YETI_CLUB = 'Frostlands Frozen Yeti Club';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'King';

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Risan Royal Spear');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Frostlands Noble Robe');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 1) return 'Please move closer.';
      if(player.level < 25) return 'Hmm? Royal subject as you may be, I can do nothing for those who cannot help themselves.';

      if(npc.$$room.npcLoader.checkPlayerHeldItemEitherHand(player, FROSTFANG_FUR)
      && npc.$$room.npcLoader.checkPlayerHeldItemEitherHand(player, YETI_CLUB)) {
        npc.$$room.npcLoader.takePlayerItemFromEitherHand(player, FROSTFANG_FUR);
        npc.$$room.npcLoader.takePlayerItemFromEitherHand(player, YETI_CLUB);

        npc.$$room.npcLoader.loadItem(`Frostlands Royal ${player.baseClass} Gauntlets`)
          .then(item => {
            player.setRightHand(item);
          });

        return `You have done our kingdom a great deed today. Thank you, ${player.name}!`;
      }

      return 'Greetings, royal subject. What brings you to my KINGDOM?';
    });

  npc.parser.addCommand('kingdom')
    .set('syntax', ['kingdom'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 1) return 'Please move closer.';
      if(player.level < 25) return 'Hmm? Royal subject as you may be, I can do nothing for those who cannot help themselves.';

      return `Yes, I may not look it, but as far as you can see frost; you see the land in my possession. Sadly, we are overrun with all manner of BEASTS.`;
    });

  npc.parser.addCommand('beasts')
    .set('syntax', ['beasts'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 1) return 'Please move closer.';
      if(player.level < 25) return 'Hmm? Royal subject as you may be, I can do nothing for those who cannot help themselves.';

      return `Yeti, sabertooths, thermidors, and the frostsnakes. If you name it, we've got a problem with it. 
      Never you mind the crazed wildlife to the south. 
      In fact, we could use some help CULLING their numbers.`;
    });

  npc.parser.addCommand('culling')
    .set('syntax', ['culling'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 1) return 'Please move closer.';
      if(player.level < 25) return 'Hmm? Royal subject as you may be, I can do nothing for those who cannot help themselves.';

      return `Specifically, if you could rout the legendary Frostfang and bring me his hide, as well as as bringing us the SOURCE of the frozen winds of the yeti, 
      I think a handsomely royal reward would be in order.`;
    });

  npc.parser.addCommand('source')
    .set('syntax', ['source'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 1) return 'Please move closer.';
      if(player.level < 25) return 'Hmm? Royal subject as you may be, I can do nothing for those who cannot help themselves.';

      return `Oh yes, of course, no specific yeti has the source. They share it - they certainly don't make it easy. You'll know it when you see it.`;
    });
};
