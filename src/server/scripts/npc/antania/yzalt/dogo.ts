import { NPC } from '../../../../../shared/models/npc';

const CHILD_DOLL = 'Steffen LostChild Doll';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Good Aligner';

  npc.gainBaseStat('stealth', 20);

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(player.alignment === 'Good') return 'You are already a disciple of good!';

      let lostChild: NPC = null;
      npc.$$room.state.getAllInRange(npc, 0).forEach((possibleTarget: NPC) => {
        if(possibleTarget.npcId === 'Steffen LostChild')
        lostChild = possibleTarget;
      });

      if(lostChild && npc.$$room.npcLoader.checkPlayerHeldItemEitherHand(player, CHILD_DOLL)) {
        npc.$$room.npcLoader.takePlayerItemFromEitherHand(player, CHILD_DOLL);

        player.changeAlignment('Good');

        const msgObject = { name: npc.name, message: `Thank you, ${player.name}!`, subClass: 'chatter' };
        npc.sendClientMessageToRadius(msgObject, 8);
        lostChild.die(npc, true);

        return 'You have helped a child return home this day. Truly, you are deserving of the mark of good.';
      }

      if(player.rightHand) {
        if(player.rightHand.name === CHILD_DOLL) return 'Yes, bring to me the lost child!';
        return 'Empty your right hand if you wish to embark on the search for good!';
      }

      npc.$$room.npcLoader.loadItem(CHILD_DOLL)
        .then(item => {
          player.setRightHand(item);
        });

      return 'I am Dogo, the bastion of good. Bring to me a child in need. That will be your good deed.';
    });

};
