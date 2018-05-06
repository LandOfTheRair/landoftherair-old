
import { ResourceSpawner } from '../global/resource';

export class RandomAntanianTreeSpawner extends ResourceSpawner {

  constructor(room, opts, properties: any = {}) {
    properties.resourceIds = [
      { chance: 20, result: 'Small Antanian Dying Tree' },
      { chance: 1, result: 'Large Antanian Dying Tree' }
    ];

    super(room, opts, properties);
  }

}
