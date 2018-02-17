import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/npc-loader';
import { HenizFindSedgwick } from '../../../../quests/antania/Yzalt/HenizFindSedgwick';

import { sample } from 'lodash';
import { KillRanata } from '../../../../quests/antania/Yzalt/KillRanata';
import { SteffenFindSedgwick } from '../../../../quests/antania/Yzalt/SteffenFindSedgwick';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.allegiance = 'Pirates';

  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

const HENIZ_HELM = 'Heniz DarkVision Helm';

const allKeywords = [
  'apples', 'hocus', 'bogstench', 'wasteland', 'regicide', 'bogweed', 'sewers'
];

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(player.alignment !== 'Evil') return 'You do not appear to adhere to the principles of the Heniz. Leave this place.';

      if(player.isHostileTo(npc.allegiance)) return 'You are hated by our people, I will not speak with you.';
      if(!player.isFriendlyTo(npc.allegiance)) return 'Who are you? I only speak with known heroes of our people.';

      if(player.hasQuest(HenizFindSedgwick)) {
        if(HenizFindSedgwick.isComplete(player)) {
          HenizFindSedgwick.completeFor(player);

          return `You found him, and... and what? There is no secret? 
          He must have been using that info to push forward in the ranks!
          No matter, I will deal with him later. Let us talk about RANATA.`;
        }

        return HenizFindSedgwick.incompleteText(player);
      }

      if(player.hasQuest(KillRanata)) {
        if(KillRanata.isComplete(player)) {
          if(player.rightHand) return 'Please empty your right hand.';

          KillRanata.completeFor(player);

          NPCLoader.loadItem(HENIZ_HELM)
            .then(item => {
              player.setRightHand(item);
            });

          return `I wish it didn't have to end this way, but thank you for dealing with this threat. 
          Here is the treasure of the Heniz - it will let you see in the darkest depths. 
          It's must for those of the trickster descent like us.`;
        }

        return KillRanata.incompleteText(player);
      }

      if(!player.hasQuest(KillRanata) && player.hasPermanentCompletionFor('HenizFindSedgwick')) {
        return `You've found Sedgwick, so let's talk about RANATA.`;
      }

      return `Greetings, Heniz-kin! I am the elder of the Heniz, Ergorat. 
      You've become quite well-acclimated with our kind recently, so I have a favor to ask of you.
      Are you interested in furthering our fruitful relationship? Tell me YES, I think I can trust you.`;
    });

  npc.parser.addCommand('yes')
    .set('syntax', ['yes'])
    .set('logic', (args, { player }) => {

      if(player.alignment !== 'Evil') return 'You do not appear to adhere to the principles of the Heniz. Leave this place.';

      if(player.isHostileTo(npc.allegiance)) return 'You are hated by our people, I will not speak with you.';
      if(!player.isFriendlyTo(npc.allegiance)) return 'Who are you? I only speak with known heroes of our people.';

      player.startQuest(HenizFindSedgwick);
      player.cancelNonPermanentQuest(SteffenFindSedgwick);

      const keyword = sample(allKeywords);
      HenizFindSedgwick.updateProgress(player, { keyword });

      return `You might have heard of our former general, Sedgwick. You might have seen his grave, too.
      The grave is a lie - we've exiled him for his betrayal to our people.
      However, he is the only one who's seen the lair of Ranata, Lord of the Madhouse, and he claims there is a secret to entering, which he shared with no one.
      Ranata is causing us some trouble with his rat-kin, and we need you to stop him. 
      Go find Sedgwick and tell him "${keyword}", he'll know what it means.`;
    });

  npc.parser.addCommand('ranata')
    .set('syntax', ['ranata'])
    .set('logic', (args, { player }) => {
      if(player.alignment !== 'Evil') return 'You do not appear to adhere to the principles of the Heniz. Leave this place.';

      if(player.isHostileTo(npc.allegiance)) return 'You are hated by our people, I will not speak with you.';
      if(!player.isFriendlyTo(npc.allegiance)) return 'Who are you? I only speak with known heroes of our people.';

      player.startQuest(KillRanata);

      return `Ranata has been the scourge of our people for decades. He takes our forces and corrupts them using some kind of sick magic. 
      It's entirely possible that he's eaten too much of the magical fruit. 
      We can't have him taking our people any more, so please go take care of him in any way you deem necessary.`;
    });

};
