
import { GameWorld } from './GameWorld';

export class InstancedDungeon extends GameWorld {

  public partyOwner: string;

  get canMemorize(): boolean {
    return false;
  }

  get canPartyAction(): boolean {
    return false;
  }

  async onInit(options): Promise<void> {
    if(options.party) {
      this.partyOwner = options.party;

      // no party in an instanced dungeon means you probably quit in it
    } else {
      options.skipMostOfLoad = true;
    }

    await super.onInit(options);

    this.autoDispose = true;
  }

  async onJoin(client, options): Promise<boolean> {
    await super.onJoin(client, options);

    const player = this.state.findPlayer(options.username);
    if(!player.partyName || (this.partyOwner && player.partyName !== this.partyOwner)) {
      this.kickOut(player);
      return false;
    }

    return true;
  }

  async onLeave(client): Promise<any> {
    const player = this.state.findPlayerByClientId(client.id);
    if(!player) return;

    const { kickMap, kickX, kickY } = this.exitPoint;
    player.map = kickMap;
    player.x = kickX;
    player.y = kickY;

    super.onLeave(client);
  }

  requestJoin(options): boolean {
    return !this.partyOwner || this.partyOwner === options.party;
  }

  // don't save boss timers for now
  protected saveBossTimers() {}
}
