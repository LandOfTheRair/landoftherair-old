
import { GameWorld } from './GameWorld';

export class InstancedDungeon extends GameWorld {

  public createdId = Date.now();
  public partyOwner: string;

  get exitPoint() {
    const { kickMap, kickX, kickY } = this.state.map.properties;
    return { kickMap, kickX, kickY };
  }

  async onInit(options): Promise<void> {
    if(options.party) {
      this.partyOwner = options.party;
    }

    await super.onInit(options);
  }

  async onJoin(client, options): Promise<boolean> {
    await super.onJoin(client, options);

    const player = this.state.findPlayer(options.username);
    if(!player.partyName || (this.partyOwner && player.partyName !== this.partyOwner)) {
      const { kickMap, kickX, kickY } = this.exitPoint;
      await this.teleport(player, { newMap: kickMap, x: kickX, y: kickY });
      return false;
    }

    return true;
  }

  requestJoin(options): boolean {
    return !this.partyOwner || this.partyOwner === options.party;
  }
}
