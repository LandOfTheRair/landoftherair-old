import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/npc-loader';
import { SteffenFindSedgwick } from '../../../../quests/antania/Yzalt/SteffenFindSedgwick';
import { KillRanata } from '../../../../quests/antania/Yzalt/KillRanata';

import { sample } from 'lodash';
import { HenizFindSedgwick } from '../../../../quests/antania/Yzalt/HenizFindSedgwick';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.allegiance = 'Royalty';

  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

const STEFFEN_HELM = 'Steffen Crown';

const allKeywords = [
  'apples', 'hocus', 'fratricide', 'castle', 'homlet', 'king', 'flowers', 'sewers'
];

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(player.alignment !== 'Good') return 'You are not gleaming with goodness. Remove yourself from my sight.';
      if(player.isHostileTo(npc.allegiance)) return 'Our people do not mesh with your kind.';
      if(!player.isFriendlyTo(npc.allegiance)) return 'Who are you? I only speak with known heroes of our people.';

      if(player.hasQuest(SteffenFindSedgwick)) {
        if(SteffenFindSedgwick.isComplete(player)) {
          SteffenFindSedgwick.completeFor(player);

          return `Thanks for finding our informant. I take it he told you how to get to RANATA?`;
        }

        return SteffenFindSedgwick.incompleteText(player);
      }

      if(player.hasQuest(KillRanata)) {
        if(KillRanata.isComplete(player)) {
          if(player.rightHand) return 'Please empty your right hand.';

          KillRanata.completeFor(player);

          NPCLoader.loadItem(STEFFEN_HELM)
            .then(item => {
              player.setRightHand(item);
            });

          return `Thank you for dealing with that vile lich. While it's not much, take my crown.
          It should help an adventurer like you more than an old coot like me.`;
        }

        return KillRanata.incompleteText(player);
      }

      if(!player.hasQuest(KillRanata) && player.hasPermanentCompletionFor('HenizFindSedgwick')) {
        return `You've found Sedgwick, so let's talk about RANATA.`;
      }

      return `Greetings, champion! 
      I am King Kranton, ruler of the Steffen - but you already knew that, didn't you? Ohohoho. 
      Let's get to the point, I need you to find our informant, Sedgwick.
      Will you help me?`;
    });

  npc.parser.addCommand('yes')
    .set('syntax', ['yes'])
    .set('logic', (args, { player }) => {

      if(player.alignment !== 'Good') return 'You are not gleaming with goodness. Remove yourself from my sight.';
      if(player.isHostileTo(npc.allegiance)) return 'Our people do not mesh with your kind.';
      if(!player.isFriendlyTo(npc.allegiance)) return 'Who are you? I only speak with known heroes of our people.';

      player.startQuest(SteffenFindSedgwick);
      player.cancelNonPermanentQuest(HenizFindSedgwick);

      const keyword = sample(allKeywords);
      SteffenFindSedgwick.updateProgress(player, { keyword });

      return `Good. Sedgwick and I go way back - way before he became General Sedgwick. 
      However, even further back is his relationship with Ranata, a lich that's been causing havoc for everyone - Heniz included. 
      The two are good friends, but I need you to kill Ranata - his rats and dark magic are ruining our civilization.
      Go find Sedgwick and tell him "${keyword}", and you'll be one step closer to Ranata`;
    });

  npc.parser.addCommand('ranata')
    .set('syntax', ['ranata'])
    .set('logic', (args, { player }) => {

      if(player.alignment !== 'Good') return 'You are not gleaming with goodness. Remove yourself from my sight.';
      if(player.isHostileTo(npc.allegiance)) return 'Our people do not mesh with your kind.';
      if(!player.isFriendlyTo(npc.allegiance)) return 'Who are you? I only speak with known heroes of our people.';

      player.startQuest(KillRanata);

      return `Yes, Ranata has turned into a vile lich. We don't know what to do with him anymore.
      It's our fault, unfortunately, because we gave him some of the apples given to us by the Nameless.
      Of course, don't tell that to Sedgwick, should you see him again - he'll be devastated.
      Because of the fruit, we need you to put down Ranata.`;
    });

};
