import { NPC } from '../../../../shared/models/npc';
import { NPCLoader } from '../../../helpers/character/npc-loader';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');
  npc.rightHand = await NPCLoader.loadItem('Antanian Shortsword');
  npc.leftHand = await NPCLoader.loadItem('Antanian Purple Gem');

  npc.rightHand.encrust = {
    desc: 'a small purple gem',
    stats: {},
    sprite: 213,
    value: 300
  };

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      return `Hello, ${player.name}! Welcome to Land of the Rair. 
      I am an encruster, and I can do two things for you: make your gear distinguishable, and add stats to your gear! 
      If you hold a gem and item in your hand, I can add various stats to the item! Find my brethren in the world and they can help you!`;
    });

};
