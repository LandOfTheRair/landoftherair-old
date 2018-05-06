
import { GameWorld } from '../../../../rooms/GameWorld';

export const events = async (room: GameWorld) => {

  const toggleDoors = (setTo: boolean) => {
    for(let i = 1; i <= 3; i++) {
      room.state.toggleDoor(room.state.getInteractableByName(`Tile Door ${i}`), setTo);
    }
  };

  room.addEvent('on:swwalltile', ({ player }) => {
    player.sendClientMessage('You hear a clicking noise.');
    toggleDoors(true);
  });

  room.addEvent('off:swwalltile', () => {
    toggleDoors(false);
  });

  const darkTiles = [
    [103, 184],
    [104, 184],
    [104, 183],
    [105, 183],
    [106, 183],
    [107, 183],
    [107, 182],
    [108, 182],
    [109, 182],
    [109, 181],
    [110, 181],
    [111, 181],
    [111, 180],
    [112, 180],
    [112, 179],
    [113, 179],
    [113, 178]
  ];

  darkTiles.forEach(([x, y]) => {
    room.state.addPermanentDarkness(x, y, 0);
  });
};
