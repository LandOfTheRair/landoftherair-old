import { NPC } from '../../../../shared/models/npc';
import { NPCLoader } from '../../../helpers/npc-loader';

import { TestQuest } from '../../../quests/gm/TestArea/TestQuest';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {

      if(!player.hasQuest(TestQuest)) {
        player.startQuest(TestQuest);
        return `You have started TestQuest`;
      }

      return 'You have already started TestQuest';
    });

  npc.parser.addCommand('reset')
    .set('syntax', ['reset'])
    .set('logic', (args, { player }) => {
      delete player.permanentQuestCompletion.TestQuest;
      delete player.questProgress.TestQuest;
      delete player.activeQuests.TestQuest;

      return 'Reset TestQuest';
    });

  npc.parser.addCommand('canteleport')
    .set('syntax', ['canteleport'])
    .set('logic', (args, { player }) => {
      TestQuest.updateProgress(player, { canTeleport: true });

      return JSON.stringify(player.getQuestData(TestQuest));
    });

  npc.parser.addCommand('cancomplete')
    .set('syntax', ['cancomplete'])
    .set('logic', (args, { player }) => {
      TestQuest.updateProgress(player, { canComplete: true });

      return JSON.stringify(player.getQuestData(TestQuest));
    });

  npc.parser.addCommand('complete')
    .set('syntax', ['complete'])
    .set('logic', (args, { player }) => {
      if(TestQuest.isComplete(player)) {
        TestQuest.completeFor(player);
        return 'Completed TestQuest';
      }

      return 'Cannot complete TestQuest';
    });


};
