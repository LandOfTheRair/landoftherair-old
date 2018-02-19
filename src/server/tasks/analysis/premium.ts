
import { drawPremium } from './_premium';

console.log('=========== PREMIUM PURCHASES ===========');

drawPremium()
  .then(data => console.log(data))
  .then(() => process.exit(0));
