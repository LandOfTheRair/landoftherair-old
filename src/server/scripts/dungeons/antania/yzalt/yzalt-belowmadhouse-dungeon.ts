
export const setup = async (room) => {

  const gold = await room.itemCreator.getGold(200000);
  const scale = await room.itemCreator.getItemByName('Ether Scale', room);
  const scale2 = await room.itemCreator.getItemByName('Ether Scale', room);

  const chest1 = room.state.getInteractableByName('Chest 1');
  chest1.searchItems = [
    gold, scale, scale2
  ];

  let tile1On = false;
  let tile2On = false;

  const tileCheck = (player) => {
    if(!tile1On || !tile2On) return;
    room.state.getInteractableByName(`Ranata Door`).properties.requireLockpick = false;
    player.sendClientMessageToRadius('You hear a clicking noise.', 50);
  };

  room.addEvent('on:swwalltile1', ({ player }) => {
    tile1On = true;
    tileCheck(player);
  });

  room.addEvent('off:swwalltile1', () => {
    tile1On = false;
  });

  room.addEvent('on:swwalltile2', ({ player }) => {
    tile2On = true;
    tileCheck(player);
  });

  room.addEvent('off:swwalltile2', () => {
    tile2On = false;
  });

  let shadesDead = 0;
  let shadesOrder = 1;

  room.addEvent('kill:npc', ({ npc }) => {
    if(npc.name !== 'shade') return;
    shadesDead++;

    const spawnerId = npc.spawner.name;
    const numberId = +spawnerId.split(' ')[2];

    if(numberId === shadesOrder) shadesOrder++;

    // check if +id === shadesOrder, if so, increment

    const ranata = room.state.findNPCByName('Ranata');

    if(shadesDead === 4) {
      if(shadesOrder === 5) {
        room.state.getInteractableByName(`Crypt Door`).properties.requireLockpick = false;
        ranata.sendClientMessageToRadius({ name: 'Ranata', message: 'Welcome to my domain, fools!', subClass: 'chatter' }, 50);

      } else {
        shadesDead = 0;
        shadesOrder = 1;

        room.clock.setTimeout(() => {
          for(let i = 1; i <= 4; i++) {
            const npcSpawner = npc.$$room.getSpawnerByName(`Shade Spawner ${i}`);
            npcSpawner.createNPC();
          }
        }, 4000);

        ranata.sendClientMessageToRadius({ name: 'Ranata', message: 'You\'ll never figure it out! Gwahaha!', subClass: 'chatter' }, 50);
      }
    }
  });

};
