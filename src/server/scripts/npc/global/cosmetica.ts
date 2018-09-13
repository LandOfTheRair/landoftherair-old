import { NPC } from '../../../../shared/models/npc';

import { includes, startCase } from 'lodash';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Silver Services';
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.rightHand = await npc.$$room.npcLoader.loadItem('Cosmetic Scroll - Ether Nebula');
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `Hey, ${player.name}! I'm Cosmetica - I can make your items more f~a~s~h~i~o~n~a~b~l~e!
      You can hold a cosmetic scroll in your left and an item in your right, and say IMBUE to add the cosmetic.
      BE CAREFUL! I will overwrite an existing cosmetic when imbuing.
      Alternatively, leave your left hand empty and I can EXTRACT a cosmetic - but not all cosmetics are extractable!
      Finally, I can take from your SILVER cosmetics and give those to you.
     `;
    });

  npc.parser.addCommand('imbue')
    .set('syntax', ['imbue'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(!player.rightHand) return 'You must hold an item in your right hand!';
      if(!player.leftHand) return 'You must hold a cosmetic scroll in your left hand!';
      if(!includes(player.leftHand.name, 'Cosmetic Scroll')) return 'You are not holding a cosmetic scroll!';
      if(player.rightHand.itemClass === 'Corpse') return 'That would be disrespectful.';
      if(player.rightHand.itemClass === 'Coin') return 'How about not.';

      player.rightHand.cosmetic = { name: player.leftHand.cosmetic.name };
      player.setLeftHand(null);

      return 'Thy will be done!';
    });

  npc.parser.addCommand('extract')
    .set('syntax', ['extract'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(!player.rightHand) return 'You must hold an item in your right hand!';
      if(player.leftHand) return 'Your left hand must be empty!';
      if(!player.rightHand.cosmetic) return 'That item is not cosmetized!';
      if(player.rightHand.cosmetic.isPermanent) return 'That cosmetic cannot be extracted!';
      if(!player.rightHand.isOwnedBy(player)) return 'That is not your item!';

      const cosmetic = startCase(player.rightHand.cosmetic.name);

      player.rightHand.cosmetic = null;

      player.$$room.npcLoader.loadItem(`Cosmetic Scroll - ${cosmetic}`)
        .then(item => {
          player.setLeftHand(item);
        });

      return 'Thy will be done! Beware, this scroll is not bound to you!';
    });

  npc.parser.addCommand('silver')
    .set('syntax', ['silver'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      const allAvailable = player.$$room.subscriptionHelper.getSilverCosmetics(player);

      if(Object.keys(allAvailable).length === 0) return 'You have no purchased cosmetics!';

      return `Just tell me "take <type>", where type is one of these: ${Object.keys(allAvailable).join(', ')}`;
    });

  npc.parser.addCommand('take')
    .set('syntax', ['take <string:take*>'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(player.rightHand) return 'You must empty your right hand!';

      const takeType = args['take*'];
      const allAvailable = player.$$room.subscriptionHelper.getSilverCosmetics(player);
      if(!allAvailable[takeType] || allAvailable[takeType] <= 0) return 'You do not have any cosmetics of that type!';

      let silverKey = '';
      let itemSuffix = '';

      switch(takeType) {
        case 'inversify':  { silverKey = 'CosmeticInversify' ; itemSuffix = 'Inversify'; break; }
        case 'ancientify': { silverKey = 'CosmeticAncientify'; itemSuffix = 'Ancientify'; break; }
        case 'etherpulse': { silverKey = 'CosmeticEtherPulse'; itemSuffix = 'Ether Pulse'; break; }
        case 'ghostether': { silverKey = 'CosmeticGhostEther'; itemSuffix = 'Ghost Ether'; break; }
      }

      if(!silverKey) return 'Invalid type! Not sure how we got here? You should probably report this.';


      player.$$room.npcLoader.loadItem(`Cosmetic Scroll - ${itemSuffix}`)
        .then(item => {
          player.setRightHand(item);
        });

      player.$$room.subscriptionHelper.decrementSilverPurchase(player.$$account, silverKey);

      return `Done! You have ${allAvailable[takeType] - 1} ${takeType} left! These scrolls are not bound to you, and your account will update when you log in next!`;
    });
};
