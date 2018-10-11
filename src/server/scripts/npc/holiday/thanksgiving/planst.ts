
import { random } from 'lodash';

import { NPC } from '../../../../../shared/models/npc';
import { Player } from '../../../../../shared/models/player';
import { Currency } from '../../../../../shared/helpers/holiday-helper';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Pilgrim Helpers';

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Thanksgiving Blunderbuss');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Risan Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  const currentNPCRefs = {};
  const currentTargets = {};
  const scores = {};
  const rounds = {};

  const cleanUpPlayerData = (player: Player) => {
    delete currentNPCRefs[player.uuid];
    delete currentTargets[player.uuid];
    delete scores[player.uuid];
    delete rounds[player.uuid];
  };

  const startTargetPractice = (player: Player) => {

    const spawnNPCS = async () => {

      rounds[player.uuid] = rounds[player.uuid] || 0;
      rounds[player.uuid]++;

      currentNPCRefs[player.uuid] = [];

      if(rounds[player.uuid] > 10) {
        player.receiveMessage(npc, `Well done! Come see me for your reward!`);

        npc.$$room.clock.setTimeout(() => {
          cleanUpPlayerData(player);
        }, 60000);
        return;
      }

      const realTargetNumber = random(1, 4);

      for(let i = 1; i <= 4; i++) {
        const npcSpawner = npc.$$room.getSpawnerByName(`Target Spawner ${i}`);
        const target = await npcSpawner.createNPC();

        target.name = `target ${i}`;
        target.affiliation = realTargetNumber === i ? 'Real Target' : 'Turkey Target';
        target.onlyVisibleTo = player.uuid;

        npc.$$room.syncNPC(target);
        currentNPCRefs[player.uuid].push(target);
      }

      currentTargets[player.uuid] = `target ${realTargetNumber}`;
      player.receiveMessage(npc, `Round ${rounds[player.uuid]}: Hit target ${realTargetNumber}!`);

      npc.$$room.clock.setTimeout(() => {
        currentNPCRefs[player.uuid].forEach(targ => targ.die(npc, true));

        npc.$$room.clock.setTimeout(() => {
          spawnNPCS();
        }, 3000);
      }, 5000);
    };

    spawnNPCS();
  };

  npc.$$room.addEvent('kill:npc', (opts) => {
    const checkNPC = opts.npc;
    const killer = opts.killer;

    if(checkNPC.npcId !== 'Thanksgiving Turkey Target') return;
    const targetNecessary = currentTargets[killer.uuid];

    scores[killer.uuid] = scores[killer.uuid] || 0;

    if(targetNecessary === checkNPC.name) {
      scores[killer.uuid]++;
    } else {
      scores[killer.uuid]--;
    }
  });

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(scores[player.uuid]) {
        if(rounds[player.uuid] >= 10) {
          const tokens = scores[player.uuid] * 10;
          player.earnCurrency(Currency.Thanksgiving, tokens, 'Koda');
          player.sendClientMessage(`Planst hands you ${tokens} holiday tokens!`);

          if(scores[player.uuid] === 10 && player.rightHand && player.rightHand.name === 'Thanksgiving Blunderbuss') {
            npc.$$room.npcLoader.loadItem('Thanksgiving Blunderbuss (Improved)')
              .then(newItem => {
                player.setRightHand(newItem);
              });
          }

          cleanUpPlayerData(player);

          return 'Well done! Here is your reward!';
        }

        return `Current score: ${scores[player.uuid]}`;
      }

      return 'Want a chance to upgrade your weak Mark-I Blunderbuss? Want a BlunderBOSS? Participate in my TARGET PRACTICE and I\'ll reward you with a better gun!';
    });

  npc.parser.addCommand('target practice')
    .set('syntax', ['target practice'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `Yep! I will throw out some targets for you to hit, then tell you which one is the correct target. 
      Hit all 10 correct targets, and talk to me afterwards, holding your old blunderbuss, to get a new one! 
      You still get tokens if you don't, though! Just tell me when you want to START!`;
    });

  npc.parser.addCommand('start')
    .set('syntax', ['start'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(!player.rightHand || (player.rightHand.name !== 'Thanksgiving Blunderbuss' && player.rightHand.name !== 'Thanksgiving Blunderbuss (Improved)')) {
        return 'You might want to hold a Blunderbuss Mark-I or Mark-II for this.';
      }

      if(currentTargets[player.uuid]) return 'You are already doing this event! Wait until it is over.';

      if(Object.keys(currentTargets).length >= 20) return 'Too many players are doing this event, please come back later!';

      startTargetPractice(player);
      return 'Good luck!';
    });
};
