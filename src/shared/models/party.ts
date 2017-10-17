
import { sumBy, reject, find, pull } from 'lodash';
import { Player } from './player';

export class PartyPlayer {
  name: string;
  username: string;
  baseClass: string;
  level: number;
  hpPercent: number;
  mpPercent: number;
  map: string;
  x: number;
  y: number;

  constructor(player: Player) {
    this.name = player.name;
    this.username = player.username;
    this.baseClass = player.baseClass;

    // these can change
    this.level = player.level;
    this.hpPercent = player.hp.asPercent();
    this.mpPercent = player.mp.asPercent();
    this.map = player.map;
    this.x = player.x;
    this.y = player.y;
  }

}

export class Party {
  private members: PartyPlayer[] = [];

  get name(): string {
    return this.partyName;
  }

  get leader(): PartyPlayer {
    return this.members[0];
  }

  get canGainPartyPoints(): boolean {
    return this.members.length > 2;
  }

  get canApplyPartyAbilities(): boolean {
    return this.members.length > 2;
  }

  get canBeDeleted(): boolean {
    return this.members.length === 0;
  }

  get averageLevel(): number {
    return Math.floor(sumBy(this.members, 'level') / this.members.length);
  }

  get allMembers(): PartyPlayer[] {
    return this.members;
  }

  constructor(leader: PartyPlayer, private partyName: string) {
    this.members = [leader];
  }

  public isLeader(username: string): boolean {
    return this.leader.username === username;
  }

  public findMemberByUsername(username: string): PartyPlayer {
    return find(this.members, { username });
  }

  public join(newMember: PartyPlayer): void {
    this.members.push(newMember);
  }

  public leave(oldMember: PartyPlayer): void {
    this.members = reject(this.members, mem => mem.username === oldMember.username);
  }

  public kickMember(kicker: PartyPlayer, kickee: string): void {
    if(!this.isLeader(kicker.username)) return;

    const newLeaderMember = this.findMemberByUsername(kickee);
    if(!newLeaderMember) return;

    pull(this.members, newLeaderMember);
  }

  public changeLeader(formerLeader: PartyPlayer, newLeader: string): void {
    if(!this.isLeader(formerLeader.username)) return;

    const newLeaderMember = this.findMemberByUsername(newLeader);
    if(!newLeaderMember) return;

    pull(this.members, newLeaderMember);

    this.members.unshift(newLeaderMember);
  }
}
