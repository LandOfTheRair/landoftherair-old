import { NPC } from '../../../../../shared/models/npc';

const FLOWER = 'Frostlands Gourd';
const QUESTNAME = 'Risan Frostlands Botanist Regeneration';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.leftHand = await npc.$$room.npcLoader.loadItem(FLOWER);
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Risan Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(player.level < 14) return 'You are not yet experienced enough to receive my blessing!';

      if(player.hasPermanentCompletionFor(QUESTNAME)) return `You've already received my blessing, ${player.name}!`;

      const EARRING = `Frostlands ${player.baseClass} Earring`;

      if(npc.$$room.npcLoader.checkPlayerHeldItemEitherHand(player, FLOWER)
      && npc.$$room.npcLoader.checkPlayerHeldItemEitherHand(player, EARRING)) {
        npc.$$room.npcLoader.takePlayerItemFromEitherHand(player, FLOWER);
        npc.$$room.npcLoader.takePlayerItemFromEitherHand(player, EARRING);

        player.gainBaseStat('hpregen', 1);
        player.gainBaseStat('mpregen', 1);
        player.permanentlyCompleteQuest(QUESTNAME);
        return `Ah, thank you ${player.name}! Here, enjoy your increased regeneration. I've been meaning to check out this chic style!`;
      }

      return `Well hello there, adventurer! I am a roaming botanist, and I'm quite new to these lands. 
      I'm interested in the frozen gourds, and the ear fashion of the land.
      If you can bring me the gourd and your matching earring, I can increase your natural regeneration!`;
    });
};
