
import { includes } from 'lodash';

import { NPC } from '../../../../../shared/models/npc';
import { Character } from '../../../../../shared/models/character';

const GOURD_REWARD = 'Dedlaen Militia Gourd';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Militia Man';

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Maze Longsword');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Tower Breastplate');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      let numItems = 0;

      npc.$$room.state.getAllInRange(npc, 4).forEach((char: Character) => {
        if(char.isPlayer()) return;
        if(!includes(['Dedlaen Escort Townee', 'Dedlaen Escort Guard'], (<NPC>char).npcId)) return;

        numItems++;
        char.die(npc, true);
      });

      if(numItems > 0) {
        for(let i = 0; i < numItems; i++) {
          npc.$$room.npcLoader.loadItem(GOURD_REWARD).then(item => {
            npc.$$room.addItemToGround(npc, item);
          });
        }
        return `Thank you, ${player.name}! You are a hero to this encampment! Here, I've dropped ${numItems} of my secret garden gourds for you. 
        I think they'll come in handy.`;
      }

      return `Help! Help! We've received intel that our camp in the northeast has been compromised! Can you escort the survivors here?`;
    });
};
