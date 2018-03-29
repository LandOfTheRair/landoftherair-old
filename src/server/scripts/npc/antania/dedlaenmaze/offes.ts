import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/character/npc-loader';

const TITANIUM = 'Tower Titanium Chunk';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.rightHand = await NPCLoader.loadItem('Tower Halberd Weak');
  npc.gear.Armor = await NPCLoader.loadItem('Tower Breastplate');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `Greetings traveler. My brother and I are in search of rare chunks of titanium. 
      For some reason, the living beings in this maze seem to carry an excess of them, compared to most other places we've looked. 
      If you can HELP me, I can add some defense to your gear.`;
    });

  npc.parser.addCommand('help')
    .set('syntax', ['help'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      return `Yah. If you can bring me a chunk, I can put some of it into your gear. 
      Unfortunately, titanium is pretty picky - it requires a base of reinforcement in your gear to already exist. 
      I only need one - the remainder of a chunk makes a tidy profit. Just tell me when you're ready for an UPGRADE.`;
    });

  npc.parser.addCommand('upgrade')
    .set('syntax', ['upgrade'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(NPCLoader.checkPlayerHeldItem(player, TITANIUM, 'left')) {

        const right = player.rightHand;
        if(!right) return 'Please hold an item in your right hand.';
        right.stats.offense = right.stats.offense || 0;
        if(right.stats.offense < 1) return 'That item is too weak for me to upgrade!';
        if(right.stats.offense > 1) return 'That item is too strong for me to upgrade!';

        NPCLoader.takePlayerItem(player, TITANIUM, 'left');

        right.stats.offense += 1;
        player.recalculateStats();

        return `Thanks, ${player.name}! I've upgraded your ${player.rightHand.itemClass.toLowerCase()}. This titanium will sell for a pretty penny, too.`;
      }

      return `Hold one titanium chunk in your left hand, and I'll fuse it with your gear. 
      Hold a piece of gear with one offensive add in your right hand, and it will help you better in combat!`;
    });
};
