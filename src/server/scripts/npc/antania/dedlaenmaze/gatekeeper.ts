import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/character/npc-loader';

const MINO_HORN = 'Dedlaen Minotaur Horn';
const DEDLAEN_CITY_KEY = 'Dedlaen City Key';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.rightHand = await NPCLoader.loadItem('Maze Longsword');
  npc.gear.Armor = await NPCLoader.loadItem('Tower Breastplate');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(NPCLoader.checkPlayerHeldItem(player, MINO_HORN, 'right')) {

        NPCLoader.takePlayerItem(player, MINO_HORN);

        NPCLoader.loadItem(DEDLAEN_CITY_KEY)
          .then(item => {
            player.setRightHand(item);
          });

        return 'Well, I see I shouldn\'t have underestimated you. Here you go! Don\'t die out there.';
      }

      return `Hmmm. You look like a capable adventurer. Whaddya say, you wanna get past this door? 
      If you bring me a minotaur horn - which I hear are pretty valuable - I think I could look the other way, just this once.`;
    });
};
