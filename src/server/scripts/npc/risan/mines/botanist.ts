import { NPC } from '../../../../../shared/models/npc';

const FLOWER = 'Mines Caveflower';
const QUESTNAME = 'Risan Mines Botanist Regeneration';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.leftHand = await npc.$$room.npcLoader.loadItem(FLOWER);
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(player.level < 14) return 'You are not yet experienced enough to receive my blessing!';

      if(player.hasPermanentCompletionFor(QUESTNAME)) return `You've already received my blessing, ${player.name}!`;

      const CLOAK = `Forest Spirit ${player.baseClass} Cloak`;

      if(npc.$$room.npcLoader.checkPlayerHeldItemEitherHand(player, FLOWER)
      && npc.$$room.npcLoader.checkPlayerHeldItemEitherHand(player, CLOAK)) {
        npc.$$room.npcLoader.takePlayerItemFromEitherHand(player, FLOWER);
        npc.$$room.npcLoader.takePlayerItemFromEitherHand(player, CLOAK);

        player.gainBaseStat('hpregen', 1);
        player.gainBaseStat('mpregen', 1);
        player.permanentlyCompleteQuest(QUESTNAME);
        return `Ah, thank you ${player.name}! Here, enjoy your increased regeneration. I've been meaning to check out this fashion...`;
      }

      return `Well hello there, adventurer! I am a roaming botanist, and I'm quite new to these lands. 
      I'm interested in the roots they use, and the cloaks the forestkin wear.
      If you can bring me the flower and your matching cloak, I can increase your natural regeneration!`;
    });
};
