import { NPC } from '../../../../../shared/models/npc';

import { KillRebels, KillZombies } from '../../../../quests';
import { Holiday, HolidayHelper } from '../../../../../shared/helpers/holiday-helper';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Town Guard Captain';

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Antanian Halberd');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      if(player.hasQuest(KillRebels)) {
        if(KillRebels.isComplete(player)) {
          KillRebels.completeFor(player);

          return 'Thank you for taking care of that for me. Here\'s your reward, and if you need me, I\'ll be buried in paperwork...';
        }

        return KillRebels.incompleteText(player);
      }

      let msg = `Hello, ${player.name}! Don't mind me and this stack of paperwork, I've been having troubles with the PRISONERS lately.`;
      if(HolidayHelper.isHoliday(Holiday.Halloween)) {
        msg = `${msg} Also, we've been having a bit of ZOMBIE trouble lately...`;
      }

      return msg;
    });

  npc.parser.addCommand('prisoners')
    .set('syntax', ['prisoners'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';
      return `Why, yes. They've been doing nothing but trying to riot down there, as if they could actually get out. 
      Regardless, I could use some HELP containing them.`;
    });

  npc.parser.addCommand('zombie')
    .set('syntax', ['zombie'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      if(player.hasQuest(KillZombies)) {
        if(KillZombies.isComplete(player)) {
          KillZombies.completeFor(player);

          return 'Thanks. The effort is ongoing, and the results are truly troublesome, but with your help we\'ve made good progress today.';
        }

        return KillZombies.incompleteText(player);
      }

      if(!HolidayHelper.isHoliday(Holiday.Halloween)) return 'What? We have no such problems right now.';

      player.startQuest(KillZombies);

      return `Yes, there is a zombie invasion. Have you seen out in the streets? It's a bloodbath! Help us, please!`;
    });

  npc.parser.addCommand('help')
    .set('syntax', ['help'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      player.startQuest(KillRebels);

      return `Yes, please kill ${KillRebels.killsRequired} prisoners for me. Actually kill them. 
      There's no paperwork to deal with if they're no longer living, you see. Get it done, and get it done fast. 
      I'll give you a reward of 2,000 gold if you do -- 100 gold per prisoner killed.`;
    });

};
