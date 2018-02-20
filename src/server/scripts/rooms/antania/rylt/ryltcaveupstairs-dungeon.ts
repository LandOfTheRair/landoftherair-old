
export const setup = async (room) => {

  const gold = await room.itemCreator.getGold(500000);

  const chest1 = room.state.getInteractableByName('Chest 1');
  chest1.searchItems = [gold];

};
