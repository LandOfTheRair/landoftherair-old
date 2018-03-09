
import { ResourceSpawner } from '../global/resource';

export class GoldOreSpawner extends ResourceSpawner {

  constructor(room, opts, properties: any = {}) {
    properties.resourceIds = [
      { chance: 20, result: 'Basic Gold Vein' },
      { chance: 1, result: 'Rich Gold Vein' }
    ];

    super(room, opts, properties);
  }

}
