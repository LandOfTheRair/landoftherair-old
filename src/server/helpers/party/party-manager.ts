
import { Player } from '../../../shared/models/player';
import { Party, PartyPlayer } from '../../../shared/models/party';
import { GameWorld } from '../../rooms/GameWorld';

import { map, find, extend } from 'lodash';

export class PartyManager {

  private parties: { [key: string]: Party } = {};

  private get redis() {
    return this.room.redisClient;
  }

  constructor(private room: GameWorld) {

    this.initListeners();
  }

  private initListeners() {

    const managerGameId = process.env.GAME_INSTANCE;

    this.redis.on('party:sync', ({ parties, gameId }) => {
      if(gameId !== managerGameId) return;

      this.parties = {};
      Object.keys(parties).forEach(partyName => {
        this.parties[partyName] = new Party(parties[partyName]);
      });
    });

    this.redis.on('party:create', ({ leader, partyName }) => {
      this._redisCreateParty(leader, partyName);
    });

    this.redis.on('party:join', ({ joiner, partyName }) => {
      this._redisJoinParty(joiner, partyName);
    });

    this.redis.on('party:leave', ({ leaver, partyName }) => {
      this._redisLeaveParty(leaver, partyName);
    });

    this.redis.on('party:kick', ({ leader, kickee, partyName }) => {
      this._redisKickFromParty(leader, kickee, partyName);
    });

    this.redis.on('party:changeleader', ({ leader, newLeader, partyName }) => {
      this._redisChangePartyLeader(leader, newLeader, partyName);
    });

    this.redis.on('party:updatemember', ({ member, partyName }) => {
      this._redisUpdateMember(member, partyName);
    });

    // this is dumb but whatever
    this.room.clock.setTimeout(() => {
      this.redis.emit('party:requestsync', {});
    }, 1000);

  }

  public stopEmitting() {
    this.redis.quit();
  }

  public getPartyByName(name: string): Party {
    return this.parties[name];
  }

  // this is awful.
  private delayedStatRecalculation(player: Player) {
    player.$$room.clock.setTimeout(() => player.recalculateStats(), 1000);
  }

  private sendPartyMessage(partyName: string, message: string) {
    const party = this.parties[partyName];
    if(!party) return;

    this.room.sendMessageToUsernames(map(party.members, 'username'), message);
  }

  public playerSendPartyMessage(player: Player, message: string) {
    const party = this.parties[player.partyName];
    if(!party) return;

    this.room.sendMessageToUsernames(map(party.members, 'username'), {
      name: `[party] ${player.name}`,
      message,
      subClass: 'chatter',
      grouping: 'chatter'
    });
  }

  public createParty(leader: Player, partyName: string) {
    const leaderMember = new PartyPlayer(leader);
    leader.partyName = partyName;
    this.delayedStatRecalculation(leader);

    this.redis.emit('party:create', { leader: leaderMember, partyName });
  }

  private _redisCreateParty(leader: PartyPlayer, partyName: string) {
    this.parties[partyName] = new Party();
    this.parties[partyName].init(leader, partyName);
  }

  public joinParty(joiner: Player, partyName: string) {
    const member = new PartyPlayer(joiner);
    if(!this.parties[partyName]) return;

    joiner.partyName = partyName;
    this.delayedStatRecalculation(joiner);

    this.redis.emit('party:join', { joiner: member, partyName });
  }

  private _redisJoinParty(joiner: PartyPlayer, partyName: string) {
    if(!this.parties[partyName]) return;

    this.parties[partyName].join(joiner);
    this.sendPartyMessage(partyName, `${joiner.name} has joined the "${partyName}" party!`);
  }

  public leaveParty(leaver: Player) {
    const member = new PartyPlayer(leaver);
    const partyName = leaver.partyName;

    leaver.sendClientMessage(`You left the "${partyName}" party!`);

    leaver.partyName = '';
    leaver.recalculateStats();

    this.redis.emit('party:leave', { leaver: member, partyName });
  }

  private _redisLeaveParty(leaver: PartyPlayer, partyName: string) {
    const party = this.parties[partyName];

    if(!party) return;

    const oldLeader = party.leader;

    party.leave(leaver);
    if(party.canBeDeleted) {
      this.removeParty(party);
    } else {
      if(oldLeader.username !== party.leader.username) {
        this.sendPartyMessage(partyName, `${party.leader.name} is the new party leader.`);
      }
    }

    this.sendPartyMessage(partyName, `${leaver.name} has left the "${partyName}" party!`);
  }

  public kickFromParty(leader: Player, kickee: Player) {
    const member = new PartyPlayer(leader);
    const kickeeMember = new PartyPlayer(kickee);

    const partyName = leader.partyName;

    if(!this.parties[partyName] || !this.parties[partyName].isLeader(leader.username)) return;
    kickee.partyName = '';
    kickee.recalculateStats();

    this.redis.emit('party:kick', { leader: member, kickee: kickeeMember, partyName });
  }

  private _redisKickFromParty(leader: PartyPlayer, kickee: PartyPlayer, partyName: string) {
    if(!this.parties[partyName]) return;

    this.parties[partyName].kickMember(leader, kickee.username);

    this.sendPartyMessage(partyName, `${kickee.name} was kicked from the "${partyName}" party!`);
  }

  public changeLeader(formerLeader: Player, newLeader: Player) {
    const member = new PartyPlayer(formerLeader);
    const partyName = formerLeader.partyName;

    if(!this.parties[partyName] || !this.parties[partyName].isLeader(formerLeader.username)) return;

    this.redis.emit('party:changeleader', { leader: member, newLeader: newLeader.username, partyName });
  }

  private _redisChangePartyLeader(leader: PartyPlayer, newLeader: string, partyName: string) {
    const party = this.parties[partyName];
    if(!party || !party.isLeader(leader.username)) return;

    party.changeLeader(leader, newLeader);

    this.sendPartyMessage(partyName, `${party.leader.name} is the new leader of the "${partyName}" party!`);
  }

  public updateMember(member: Player) {
    this.redis.emit('party:updatemember', { member: new PartyPlayer(member), partyName: member.partyName });
  }

  private _redisUpdateMember(member: PartyPlayer, partyName: string) {
    const party = this.parties[partyName];
    if(!party) return;

    const memberRef = find(party.members, { username: member.username });
    extend(memberRef, member);
  }

  private removeParty(party: Party) {
    delete this.parties[party.name];
  }

  public giveAccountSilver(accountName: string, silver: number) {
    this.redis.emit('account:gainsilver', { accountName, silver });
  }

}
