import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/character/npc-loader';

const SPIDER_EGG = 'Tower Spider Egg';
const FLOWER = 'Tower Goblood';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(NPCLoader.checkPlayerHeldItemEitherHand(player, SPIDER_EGG) && NPCLoader.checkPlayerHeldItemEitherHand(player, FLOWER)) {
        NPCLoader.takePlayerItemFromEitherHand(player, SPIDER_EGG);
        NPCLoader.takePlayerItemFromEitherHand(player, FLOWER);

        NPCLoader.loadItem('Antanian Magic Potion')
          .then(item => {
            item.binds = true;
            player.setRightHand(item);
          });

        return 'Thanks! I hope you enjoy my concoction.';
      }

      return `Hail, adventurer. I know that because you don't look like you're from these parts. 
      Anyway, I'm a chef and I create my cuisine from, er, "interesting" ingredients. 
      For example, did you know if you mix a spider egg and an ounce of Goblood, it neutralizes the poison and increases the magic potential of the drinker? 
      That was a happy accident.`;
    });
};
