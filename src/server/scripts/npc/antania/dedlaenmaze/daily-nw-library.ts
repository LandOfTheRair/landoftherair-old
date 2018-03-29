import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/character/npc-loader';

const GHOST_PEARL = 'Dedlaen Transmute Pearl';
const VAMPIRE_HEART = 'Dedlaen Vampire Heart';
const DEDLAEN_MAZE_KEY = 'Dedlaen Maze Key';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.rightHand = await NPCLoader.loadItem(DEDLAEN_MAZE_KEY);
  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(NPCLoader.checkPlayerHeldItemEitherHand(player, GHOST_PEARL) && NPCLoader.checkPlayerHeldItemEitherHand(player, VAMPIRE_HEART)) {

        NPCLoader.takePlayerItemFromEitherHand(player, GHOST_PEARL);
        NPCLoader.takePlayerItemFromEitherHand(player, VAMPIRE_HEART);

        NPCLoader.loadItem(DEDLAEN_MAZE_KEY)
          .then(item => {
            player.setRightHand(item);
          });

        return 'Here you go. Maybe it\'ll do you more good than it will for me.';
      }

      return `Agh! I'm trapped in this maze and there's just no escaping that dreadful beast chasing me. 
      No matter how many of these keys I have, I just can't seem to find my way out. 
      Do me a favor and bring me the heart of the dark lord as well as the spectral pearl and I can reward you with some form of escape.`;
    });
};
