
import { GameWorld } from '../../../../rooms/GameWorld';

export const events = async (room: GameWorld) => {

  const toggleDoors = () => {
    for(let i = 1; i <= 3; i++) {
      room.state.toggleDoor(room.state.getInteractableByName(`Tile Door ${i}`));
    }
  };

  room.addEvent('on:swwalltile', () => {
    toggleDoors();
  });

  room.addEvent('off:swwalltile', () => {
    toggleDoors();
  });
};
