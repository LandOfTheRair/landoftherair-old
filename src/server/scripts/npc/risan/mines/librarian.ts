import { NPC } from '../../../../../shared/models/npc';

const BOOK = 'Risan Miner Book';
const HEART = 'Cyrena\'s Heart';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      if(player.level < 14) return 'Hmm? How did a weakling like you get here? Remove yourself from my sight.';

      if(npc.$$room.npcLoader.takePlayerItem(player, HEART, 'right')) {
        npc.$$room.npcLoader.takePlayerItem(player, HEART, 'right');

        npc.$$room.npcLoader.loadItem(`Librarian ${player.baseClass} Amulet`)
          .then(item => {
            player.setRightHand(item);
          });

        return `I'll be damned, the queen does exist. I can't offer you much, but I can offer you a fine bookmark from my collection.`;
      }

      if(npc.$$room.npcLoader.checkPlayerHeldItemEitherHand(player, BOOK)) {
        return `Well hello! It seems you aren't here to pilfer all my books like the rest, judging by your taste in books.
        In fact, that novella details some very real EVENTS that are taking place right now.`;
      }

      return `Mmm, yes? I don't get many visitors around here, what do you want?`;
    });

  npc.parser.addCommand('events')
    .set('syntax', ['events'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      if(player.level < 14) return 'Hmm? How did a weakling like you get here? Remove yourself from my sight.';

      return `Yes, indeed. It's quite strange, but the book mentions a miner and a dryad who find love and happiness.
      The Dryad Queen Cyrena is none too pleased, however, and she exiles the dryad from her coven.
      Doomed to live without the use of her magic, she can't even try to strike at the HEART of the forest queen.
      Instead, she gets her REVENGE by tainting their water supply.`;
    });

  npc.parser.addCommand('revenge')
    .set('syntax', ['revenge'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      if(player.level < 14) return 'Hmm? How did a weakling like you get here? Remove yourself from my sight.';

      return `Quite! So what happens next? Well, the dryad caused the whole coven to go insane.
      Something about her poison just set them off, and they started murdering each other, just like that.
      Their hatred was felt by the trees, and so the trees withered, just as the dryads had.
      Supposedly, Cyrena isolated her coven from the mortal eye, but no one knows if she even exists.`;
    });

  npc.parser.addCommand('heart')
    .set('syntax', ['heart'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      if(player.level < 14) return 'Hmm? How did a weakling like you get here? Remove yourself from my sight.';

      return `Yes, her heart, her very essence. If she were to exist, then the fall of her coven mirrors our current, erm, situation.
      The trees are decaying, the land is falling apart, surely you've seen that, yes?
      Well, I think - and that's assuming this forest queen is real - I think that if I had her heart, I could try to re-invigorate the tree spirits.
      What do you say, are you up for an impossible task? If so, bring me the heart of the forest queen.`;
    });
};
