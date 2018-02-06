import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/npc-loader';

const FLOWER = 'Tower Goblood';
const QUESTNAME = 'Tower Botanist Regeneration';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.rightHand = await NPCLoader.loadItem(FLOWER);
  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(player.level < 13) return 'You are not yet experienced enough to receive my blessing!';

      const GEM = `Tower ${player.baseClass} Gem`;

      if(player.hasPermanentCompletionFor(QUESTNAME)) return `You've already brought me a flower and gem, ${player.name}!`;

      if(NPCLoader.checkPlayerHeldItemEitherHand(player, FLOWER)
      && NPCLoader.checkPlayerHeldItemEitherHand(player, GEM)) {

        NPCLoader.takePlayerItemFromEitherHand(player, FLOWER);
        NPCLoader.takePlayerItemFromEitherHand(player, GEM);

        player.gainStat('hpregen', 1);
        player.gainStat('mpregen', 1);
        player.permanentlyCompleteQuest(QUESTNAME);

        return `Ah, thank you ${player.name}! Here, enjoy your increased regeneration.`;
      }

      return `Well hello there, adventurer! I am a roaming botanist and I seek both the flower of this land and the gem of your kind! Bring them both to me and I can conjure a spell to increase your regeneration!`;
    });
};
