import { NPC } from '../../../../shared/models/npc';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Welcome to Land of the Rair!';

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      player.$$room.analyticsHelper.trackTutorial(player, 'Greeter:Hello');

      return `Welcome to Land of the Rair, ${player.name}!`;
    });

};
