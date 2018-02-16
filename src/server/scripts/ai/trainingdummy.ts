
import { NPC } from '../../../shared/models/npc';
import { random, sumBy, maxBy, sample, sampleSize, clamp, size } from 'lodash';

// username -> lastAttack hash (updated every attack)
const lastAttackTick = {

};

// username -> nextReportTick hash (updated on first attack)
const currentlyTicking = {

};

// username -> damageTotal
const tenSecDamageTotals = {

};

// username -> damageTotal
const runningDamageTotals = {

};

const reset = (username) => {
  delete lastAttackTick[username];
  delete currentlyTicking[username];
  delete runningDamageTotals[username];
  delete tenSecDamageTotals[username];
};

export const tick = (npc: NPC) => {

  // reset agro every tick
  npc.agro = {};

  Object.keys(currentlyTicking).forEach(username => {

    // no player? reset them, they left
    const player = npc.$$room.state.findPlayer(username);
    if(!player) {
      reset(username);
      return;
    }

    // lower the relative and absolute tick
    lastAttackTick[username]--;
    currentlyTicking[username]--;

    // every 10s give a report to the player
    if((currentlyTicking[username] % 10) === 0) {
      const totalDamageForPeriod = tenSecDamageTotals[username] || 0;
      const dpsInPeriod = Math.floor(totalDamageForPeriod / 10);

      // reset the ten second total
      delete tenSecDamageTotals[username];

      if(totalDamageForPeriod === 0) {
        reset(username);
        return;
      }

      player.sendClientMessage(`Dummy DPS Report: 10s: ${dpsInPeriod.toLocaleString()} DPS (total: ${totalDamageForPeriod.toLocaleString()})`);
    }

    if(currentlyTicking[username] <= 0) {

      const totalDamageForPeriod = runningDamageTotals[username];
      const dpsInPeriod = Math.floor(totalDamageForPeriod / 60);

      player.sendClientMessage(`Dummy DPS Report: 60s: ${dpsInPeriod.toLocaleString()} DPS (total: ${totalDamageForPeriod.toLocaleString()})`);
      reset(username);
    }
  });
};

export const damage = (npc: NPC, { damage, attacker }) => {
  const playerUsername = attacker.username;
  if(!playerUsername) return;

  lastAttackTick[playerUsername] = 60;

  currentlyTicking[playerUsername] = currentlyTicking[playerUsername] || 60;

  runningDamageTotals[playerUsername] = runningDamageTotals[playerUsername] || 0;
  runningDamageTotals[playerUsername] += damage;

  tenSecDamageTotals[playerUsername] = tenSecDamageTotals[playerUsername] || 0;
  tenSecDamageTotals[playerUsername] += damage;
};

export const death = (npc: NPC) => {
  npc.spawner.createNPC();
};
