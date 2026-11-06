// seed.js: picks the three sample errands the buggy tracker starts with,
// from your GitHub user name. Two learners get different errands, so their
// bug logs show different output. The capstone checker works it out again
// from the repository owner, so a copied log does not match.

import crypto from 'node:crypto';

const TEXTS = [
  'Buy rice', 'Pay the electricity bill', 'Return the library book', 'Call the plumber',
  'Book a dentist visit', 'Renew the bus pass', 'Buy a birthday card', 'Pick up the parcel',
  'Top up the phone', 'Wash the car', 'Send the rent', 'Buy eggs and bread',
  'Fix the bike light', 'Water the plants', 'Print the form', 'Charge the power bank',
  'Collect the laundry', 'Buy cooking oil', 'Reply to the landlord', 'Pay the internet bill',
  'Take out the bins', 'Buy school shoes', 'Post the letter', 'Clean the fridge',
  'Get a haircut', 'Buy medicine for Mum', 'Return the drill', 'Order a gas cylinder',
  'Pay the water bill', 'Buy a notebook', 'Visit the bank', 'Get passport photos',
  'Buy tea and sugar', 'Call the electrician', 'Book train tickets', 'Fix the tap',
  'Buy a phone charger', 'Pick up the glasses', 'Buy fruit', 'Clean the fan',
];

export function seedFor(owner) {
  const name = String(owner).trim().toLowerCase();
  const picked = [];
  let round = 0;
  while (picked.length < 3) {
    const hash = crypto.createHash('sha256').update(name + ':' + round).digest();
    const text = TEXTS[hash.readUInt32BE(0) % TEXTS.length];
    if (!picked.includes(text)) picked.push(text);
    round = round + 1;
  }
  return { owner: name, errands: picked };
}
