import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/npc-loader';

const TERWIN_RING = 'Terwin Ring';
const GUARD_KEY = 'Rylt Guard Key';
const ENCHANTED_GUARD_KEY = 'Rylt Guard Key Enchanted';
const TONWIN_SWORD = 'Tonwin Sword';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.rightHand = await NPCLoader.loadItem(TERWIN_RING);
  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `Hello, I'm Terwin. Traitor to the crown, betrayer of brothers, you know, whatever. I just want to get OUT of here.`;
    });

  npc.parser.addCommand('out')
    .set('syntax', ['out'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `Yes, my brother TONWIN trapped me here. He's the real TRAITOR, if ya ask me.`;
    });

  npc.parser.addCommand('traitor')
    .set('syntax', ['traitor'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `TONWIN branded all three of his brothers as traitors. It's scary how a system designed to protect can be perverted so badly.`;
    });

  npc.parser.addCommand('tonwin')
    .set('syntax', ['tonwin'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `You could say that I hate my brother. If you bring me PROOF of his death, I can reward you. You'll need my HELP to get to him, though.`;
    });

  npc.parser.addCommand('help')
    .set('syntax', ['help'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(NPCLoader.checkPlayerHeldItem(player, GUARD_KEY)) {
        NPCLoader.takePlayerItem(player, GUARD_KEY);

        NPCLoader.loadItem(ENCHANTED_GUARD_KEY)
          .then(item => {
            player.setRightHand(item);
          });

        return `Here ya go! Now go kill my brother and set me free!`;
      }

      return `Yes, bring me the key of the guards who restrain me, and I can enchant it to give you access to the dungeon floor Tonwin escaped to.`;
    });

  npc.parser.addCommand('proof')
    .set('syntax', ['proof'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(NPCLoader.checkPlayerHeldItem(player, TONWIN_SWORD)) {
        NPCLoader.takePlayerItem(player, TONWIN_SWORD);

        NPCLoader.loadItem(TERWIN_RING)
          .then(item => {
            player.setRightHand(item);
          });

        return `Take our family heirloom, and I will take my freedom. You have my thanks.`;
      }

      return `I need proof of my brother's demise!`;
    });
};
