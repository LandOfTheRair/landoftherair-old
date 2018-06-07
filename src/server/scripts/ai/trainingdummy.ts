
import { DefaultAIBehavior } from './default';

export class TrainingDummyAIBehavior extends DefaultAIBehavior {

  private lastAttackTick = {};
  private currentlyTicking = {};
  private tenSecDamageTotals = {};
  private runningDamageTotals = {};

  private reset(username) {
    delete this.lastAttackTick[username];
    delete this.currentlyTicking[username];
    delete this.runningDamageTotals[username];
    delete this.tenSecDamageTotals[username];
  }

  tick() {}

  mechanicTick() {

    const npc = this.npc;

    // reset agro every tick
    npc.resetAgro(true);

    Object.keys(this.currentlyTicking).forEach(username => {

      // no player? reset them, they left
      const player = npc.$$room.state.findPlayer(username);
      if(!player) {
        this.reset(username);
        return;
      }

      // lower the relative and absolute tick
      this.lastAttackTick[username]--;
      this.currentlyTicking[username]--;

      // every 10s give a report to the player
      if((this.currentlyTicking[username] % 10) === 0) {
        const totalDamageForPeriod = this.tenSecDamageTotals[username] || 0;
        const dpsInPeriod = Math.floor(totalDamageForPeriod / 10);

        // reset the ten second total
        delete this.tenSecDamageTotals[username];

        if(totalDamageForPeriod === 0) {
          this.reset(username);
          return;
        }

        player.sendClientMessage(`Dummy DPS Report: 10s: ${dpsInPeriod.toLocaleString()} DPS (total: ${totalDamageForPeriod.toLocaleString()})`);
      }

      if(this.currentlyTicking[username] <= 0) {

        const totalDamageForPeriod = this.runningDamageTotals[username];
        const dpsInPeriod = Math.floor(totalDamageForPeriod / 60);

        player.sendClientMessage(`Dummy DPS Report: 60s: ${dpsInPeriod.toLocaleString()} DPS (total: ${totalDamageForPeriod.toLocaleString()})`);
        this.reset(username);
      }
    });
  }

  damageTaken({ damage, attacker }) {
    if(!attacker) return;

    const playerUsername = attacker.username;
    if(!playerUsername) return;

    this.lastAttackTick[playerUsername] = 60;

    this.currentlyTicking[playerUsername] = this.currentlyTicking[playerUsername] || 60;

    this.runningDamageTotals[playerUsername] = this.runningDamageTotals[playerUsername] || 0;
    this.runningDamageTotals[playerUsername] += damage;

    this.tenSecDamageTotals[playerUsername] = this.tenSecDamageTotals[playerUsername] || 0;
    this.tenSecDamageTotals[playerUsername] += damage;
  }

  death() {
    const npc = this.npc;

    npc.spawner.createNPC();
  }
}
