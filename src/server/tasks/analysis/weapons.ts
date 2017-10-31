

import { drawNormal, drawSpecial } from './_weapons';

console.log('=========== WEAPON STAT AVERAGES ===========');

drawNormal()
  .then(data => console.log(data))
  .then(() => drawSpecial())
  .then(data => console.log(data))
  .then(() => process.exit(0));
