import { NPC } from '../../../../shared/models/npc';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Encruster\'s Guild';

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.rightHand = await npc.$$room.npcLoader.loadItem('Antanian Shortsword');
  npc.leftHand = await npc.$$room.npcLoader.loadItem('Antanian Purple Gem');

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
      player.$$room.analyticsHelper.trackTutorial(player, 'Encruster:Hello');

      return `Hello, ${player.name}! Welcome to Land of the Rair. 
      I am an encruster, and I can do two things for you: make your gear distinguishable, and add stats to your gear! 
      If you hold a gem and item in your hand, I can add various stats to the item! Find my brethren in the world and they can help you!`;
    });

};
