
import { Party, PartyPlayer } from '../../../shared/models/party';

import { find, extend } from 'lodash';
import { Lobby } from '../../rooms/Lobby';

export class PartyArbiter {

  private parties: { [key: string]: Party } = {};

  private get redis() {
    return this.room.redisClient;
  }

  constructor(private room: Lobby) {
    this.initListeners();
  }

  private initListeners() {

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

    this.redis.on('party:requestsync', () => {
      this.redis.emit('party:sync', { parties: this.parties, roomName: 'Arbiter' });
    });

  }

  private _redisCreateParty(leader: PartyPlayer, partyName: string) {
    this.parties[partyName] = new Party();
    this.parties[partyName].init(leader, partyName);
  }

  private _redisJoinParty(joiner: PartyPlayer, partyName: string) {
    if(!this.parties[partyName]) return;

    this.parties[partyName].join(joiner);
  }

  private _redisLeaveParty(leaver: PartyPlayer, partyName: string) {
    const party = this.parties[partyName];

    if(!party) return;

    party.leave(leaver);
    if(party.canBeDeleted) {
      this.removeParty(party);
    }
  }

  private _redisKickFromParty(leader: PartyPlayer, kickee: PartyPlayer, partyName: string) {
    if(!this.parties[partyName]) return;

    this.parties[partyName].kickMember(leader, kickee.username);
  }

  private _redisChangePartyLeader(leader: PartyPlayer, newLeader: string, partyName: string) {
    const party = this.parties[partyName];
    if(!party || !party.isLeader(leader.username)) return;

    party.changeLeader(leader, newLeader);
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

}
