
import { Player } from '../../../shared/models/player';
import { DB } from '../../database';
import { GameWorld } from '../../rooms/GameWorld';

import { truncate, find } from 'lodash';

export class TeleportHelper {

  static async removeAllTeleports(username: string, charSlot: number): Promise<any> {
    return DB.$teleports.remove({
      username,
      charSlot
    }, { multi: true });
  }

  constructor(private room: GameWorld) {}

  private cannotTeleport(player: Player): boolean {
    return player.$$room.state.isTeleportRestricted(player);
  }

  private getTeleportLocation(player: Player, location: string): Promise<any> {
    return DB.$teleports.findOne({
      username: player.username,
      charSlot: player.charSlot,
      location
    });
  }

  async memorizeTeleport(player: Player, location: string): Promise<boolean> {

    location = truncate(location, { length: 20, omission: '' }).trim();

    if(!this.room.canMemorize || this.cannotTeleport(player)) {
      player.sendClientMessage('The surroundings swirl together in your head, making it hard to concentrate on this place.');
      return false;
    }

    const allCurrentTeleports = await this.listTeleports(player);
    if(allCurrentTeleports.length >= this.room.maxTeleportLocations) {
      player.sendClientMessage('You can\'t seem to remember any more locations.');
      return false;
    }

    const existingTeleportWithName = find(allCurrentTeleports, { location });
    if(existingTeleportWithName) {
      player.sendClientMessage(`You already have memorized a place named ${location}.`);
      return;
    }

    const teleport = {
      map: player.map,
      region: player.$$room.state.getSuccorRegion(player),
      x: player.x,
      y: player.y,
      z: (<any>player).z || 0
    };

    await DB.$teleports.insert({
      username: player.username,
      charSlot: player.charSlot,
      location,
      teleport
    });

    return true;
  }

  forgetTeleport(player: Player, location: string): Promise<any> {
    return DB.$teleports.remove({
      username: player.username,
      charSlot: player.charSlot,
      location
    });
  }

  listTeleports(player: Player): Promise<any> {
    return DB.$teleports.find({
      username: player.username,
      charSlot: player.charSlot
    }).toArray();
  }

  private doPlayerTeleport(player: Player, opts: { map: string, x: number, y: number, z: number }): void {

    player.sendClientMessage('Your vision blurs as you travel through the rift.');

    const { map, x, y, z } = opts;

    this.room.teleport(player, {
      newMap: map,
      x: x,
      y: y,
      zSet: z
    });
  }

  async teleportTo(player: Player, location: string): Promise<boolean> {
    if(this.cannotTeleport(player)) {
      player.sendClientMessage('Something distracts your focus.');
      return false;
    }

    const teleportLocation = await this.getTeleportLocation(player, location);
    if(!teleportLocation) {
      player.sendClientMessage(`You can\'t seem to recall the place at "${location}".`);
      return false;
    }

    player.hp.set(1);

    this.doPlayerTeleport(player, teleportLocation.teleport);

    return true;
  }

  async massTeleportTo(player: Player, location: string): Promise<boolean> {
    if(this.cannotTeleport(player)) {
      player.sendClientMessage('Something distracts your focus.');
      return false;
    }

    const teleportLocation = await this.getTeleportLocation(player, location);
    if(!teleportLocation) {
      player.sendClientMessage(`You can\'t seem to recall the place at "${location}".`);
      return false;
    }

    player.hp.set(1);

    const teleportees = player.$$room.state.getAllInRange(player, 0, [player.uuid]);
    this.doPlayerTeleport(player, teleportLocation.teleport);

    player.$$room.clock.setTimeout(() => {
      teleportees.forEach(target => {
        this.doPlayerTeleport(target, teleportLocation.teleport);
      });
    }, 1000);

    return true;
  }
}
