
import { ResourceSpawner } from '../global/resource';

export class RandomRisanTreeSpawner extends ResourceSpawner {

  constructor(room, opts, properties: any = {}) {
    properties.resourceIds = [
      { chance: 20, result: 'Small Risan Dying Tree' },
      { chance: 1, result: 'Large Risan Dying Tree' }
    ];

    super(room, opts, properties);
  }

}
