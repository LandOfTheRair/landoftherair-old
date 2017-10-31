
import { drawNormal } from './_armor';

console.log('=========== ARMOR STAT AVERAGES ===========');

drawNormal()
  .then(data => console.log(data))
  .then(() => process.exit(0));
