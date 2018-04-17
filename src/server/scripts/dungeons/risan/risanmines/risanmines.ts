
import { GameWorld } from '../../../../rooms/GameWorld';

export const events = async (room: GameWorld) => {

  room.addEvent('on:crazedmist', ({ player }) => {
    player.sendClientMessage('You hear a clicking noise.');
  });

};
