
import { sample } from 'lodash';

import { NPC } from '../../../shared/models/npc';
import { Holiday, HolidayHelper } from '../../../shared/helpers/holiday-helper';
import { RollerHelper } from '../../../shared/helpers/roller-helper';
import { Player } from '../../../shared/models/player';
import { CombatHelper } from '../../helpers/world/combat-helper';

export const globalSetup = async (npc: NPC) => {
};

export const globalResponses = (npc: NPC) => {

  if(npc.hostility === 'Never' && HolidayHelper.isHoliday(Holiday.Halloween)) {

    const talkedTo = {};

    const talkTo = (player: Player) => {
      talkedTo[player.uuid] = true;
    };

    npc.parser.addCommand('trick or treat')
      .set('syntax', ['trick or treat'])
      .set('logic', (args, { player }) => {
        if(npc.distFrom(player) > 0) return 'Please move closer.';

        if(!player.rightHand || player.rightHand.name !== 'Halloween Basket') return 'What, do you think I just give candy out for free? Scram!';

        if(talkedTo[player.uuid]) return 'Hey, one per person! Come back later and I might have extra!';

        if(player.leftHand) return 'You need to have a free hand for this candy!';

        talkTo(player);

        if(RollerHelper.XInOneHundred(20)) {

          if(RollerHelper.XInOneHundred(30)) {
            player.loseExpOrSkill({ lostXPMin: 100, lostXPMax: 1000 });
          } else {
            CombatHelper.dealOnesidedDamage(player, {
              damage: 10,
              damageClass: 'physical',
              damageMessage: 'You were hit by surprise!',
              suppressIfNegative: true
            });
          }

          return 'Ha ha, tricked ya!';
        }

        let item = sample([
          'Halloween Candy - Lollipops',
          'Halloween Candy - Gummies',
          'Halloween Candy - Wrapped',
          'Halloween Candy - Jellies',
          'Halloween Candy - Mints'
        ]);

        if(RollerHelper.XInOneHundred(10)) {
          item = 'Halloween Candy Pile';
        }

        npc.$$room.npcLoader.loadItem(item)
          .then(newItem => {
            player.setLeftHand(newItem);
          });

        return 'Here ya go! Happy holidays!';
      });

  }
};
