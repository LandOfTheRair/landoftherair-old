import { NPC } from '../../../../../shared/models/npc';

const FLOWER = 'Yzalt Steffen Apple';
const QUESTNAME = 'Steffen Botanist Regeneration';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.leftHand = await npc.$$room.npcLoader.loadItem(FLOWER);
  npc.rightHand = await npc.$$room.npcLoader.loadItem(FLOWER);
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(player.level < 7) return 'You are not yet experienced enough to receive my blessing!';

      if(player.hasPermanentCompletionFor(QUESTNAME)) return `You've already brought me apples, ${player.name}!`;

      if(npc.$$room.npcLoader.checkPlayerHeldItem(player, FLOWER, 'right')
      && npc.$$room.npcLoader.checkPlayerHeldItem(player, FLOWER, 'left')) {
        npc.$$room.npcLoader.takePlayerItem(player, FLOWER, 'right');
        npc.$$room.npcLoader.takePlayerItem(player, FLOWER, 'left');
        player.gainStat('hpregen', 1);
        player.permanentlyCompleteQuest(QUESTNAME);
        return `Ah, thank you ${player.name}! Here, enjoy your increased health regeneration.`;
      }

      return `Well hello there, adventurer! I am a roaming botanist and I seek the apples of the Steffen. 
      If you can bring me two, I can increase your natural health regeneration using a technique I learned from my master!`;
    });
};
