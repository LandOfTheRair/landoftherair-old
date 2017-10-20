import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/npc-loader';

const FLOWER = 'Yzalt Bogweed';
const QUESTNAME = 'Heniz Botanist Regeneration';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.leftHand = await NPCLoader.loadItem(FLOWER);
  npc.rightHand = await NPCLoader.loadItem(FLOWER);
  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {

      if(player.level < 7) return 'You are not yet experienced enough to receive my blessing!';

      if(player.hasPermanentCompletionFor(QUESTNAME)) return `You've already brought me flowers, ${player.name}!`;

      if(NPCLoader.checkPlayerHeldItem(player, FLOWER, 'right')
      && NPCLoader.checkPlayerHeldItem(player, FLOWER, 'left')) {
        NPCLoader.takePlayerItem(player, FLOWER, 'right');
        NPCLoader.takePlayerItem(player, FLOWER, 'left');
        player.gainStat('mpregen', 1);
        player.permanentlyCompleteQuest(QUESTNAME);
        return `Ah, thank you ${player.name}! Here, enjoy your increased mana regeneration.`;
      }

      return `Well hello there, adventurer! I am a roaming botanist and I seek the flowers of the Heniz. If you can bring me two, I can increase your natural mana regeneration using a technique I learned from my master!`;
    });
};
