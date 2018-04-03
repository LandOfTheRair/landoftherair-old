import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/character/npc-loader';

const TURTLE_EGG = 'Dedlaen Dragon Turtle Egg';
const MINO_HORN = 'Dedlaen Minotaur Horn';
const GHOST_PEARL = 'Dedlaen Transmute Pearl';
const VAMPIRE_HEART = 'Dedlaen Vampire Heart';
const DEDLAES_RING = 'Dedlaes Revive Bracers';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.rightHand = await NPCLoader.loadItem('Smith Hammer');
  npc.gear.Armor = await NPCLoader.loadItem('Antanian Breastplate');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(NPCLoader.checkPlayerHeldItem(player, VAMPIRE_HEART)) {

        let indexes = [];

        [TURTLE_EGG, MINO_HORN, GHOST_PEARL].forEach(item => {
          const foundIndexes = NPCLoader.getItemsFromPlayerSackByName(player, item);
          if(foundIndexes.length === 0) return;
          indexes.push(foundIndexes[0]);
        });

        indexes = indexes.sort().reverse();

        if(indexes.length !== 3) return 'You do not have all of the items I asked for!';

        NPCLoader.takePlayerItem(player, VAMPIRE_HEART);
        NPCLoader.takeItemsFromPlayerSack(player, indexes);

        NPCLoader.loadItem(DEDLAES_RING)
          .then(item => {
            player.setRightHand(item);
          });

        return 'You\'ve earned this. It\'s very tough to make, but it is the most excellent pair of bracers a craftsman in this region can make!';
      }

      return `I am the greatest craftsman in the land, unfortunately stuck in this terrifying maze.
      Peer across the room and see my crafts line the walls. I can make you something too - the treasured bracers my family taught me to make.
      Bring me the egg of the beast, the heart of the dark one, the horn of the wanderer, and the pearl of the specter.
      Prove to me your courage by holding the heart in your hand whilst the others are in your sack!`;
    });
};
