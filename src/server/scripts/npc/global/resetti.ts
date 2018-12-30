import { NPC } from '../../../../shared/models/npc';

import { includes, startCase } from 'lodash';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Silver Services';
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `Greetings to you, ${player.name}. I am Resetti, the Queen of Items! I can take an UPGRADE from your item so you can use it again!`;
    });

  /*
  npc.parser.addCommand('reset')
    .set('syntax', ['reset'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `Reset! Yes, this means you will permanently lose all upgrades, and your item will be made into it's "base form," whatever that means.
      To confirm, hold an item in your right hand and say "RESET YES".
      This is *irreversible* and your item will not be able to be restored.`;
    });

  npc.parser.addCommand('reset yes')
    .set('syntax', ['reset yes'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      if(!player.rightHand) return 'You are not holding an item in your right hand!';

      // TODO how do you handle RNG shit like quality and random stats?

      player.sendClientMessageFromNPC(npc, `You cannot tan players! What do I look like, a cannibal?`);
      return `Thy will be done.`;
    });
  */

  npc.parser.addCommand('upgrade')
    .set('syntax', ['upgrade'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `Hold an item in your right hand and say UPGRADE LIST. To take an upgrade back, say UPGRADE TAKE #, where # is the slot you want.`;
    });

  npc.parser.addCommand('upgrade list')
    .set('syntax', ['upgrade list'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      if(!player.rightHand) return 'You are not holding anything!';
      if(!player.rightHand.upgrades.length) return 'Your item has no upgrades!';

      player.sendClientMessageFromNPC(npc, `${player.name}, here are your items upgrades:`);
      for(let i = 0; i < player.rightHand.upgrades.length; i++) {
        player.sendClientMessageFromNPC(npc, `${i + 1}: ${player.rightHand.upgrades[i].name}`);
      }

      return `Say UPGRADE TAKE # to take an enchantment (have your left hand open).`;
    });

  npc.parser.addCommand('upgrade take')
    .set('syntax', ['upgrade take <string:upgrade*>'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      if(!player.rightHand) return 'You are not holding anything!';
      if(!player.rightHand.upgrades.length) return 'Your item has no upgrades!';

      const upgrade = +args['upgrade*'] - 1;
      const upgradeRef = player.rightHand.upgrades[upgrade];
      if(!upgradeRef) return 'You do not have an upgrade in that slot!';
      if(upgradeRef.permanent) return 'That upgrade is permanent!';

      player.rightHand.removeUpgrade(upgrade);

      npc.$$room.npcLoader.putItemInPlayerHand(player, upgradeRef.name, 'left');

      return `There you go!`;
    });

};
