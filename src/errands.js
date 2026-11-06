// errands.js: your errand tracker. You write this file, starting in module 2.
//
// cli.js calls the command functions at the bottom (add, list, search, done).
// The helpers above them do the real work, and the lab tests check them.
// Each function says what it must return. Run npm run where to see what is next.

// The errands while the program runs. They are gone when it stops.
const errands = [];
let nextId = 1;

// ---- Helpers ----

// Lab 2.10. One errand as one line.
// { id: 1, text: 'Buy rice', done: false } gives '#1 [ ] Buy rice'
// { id: 4, text: 'Pay the bill', done: true } gives '#4 [x] Pay the bill'
export function formatErrand(errand) {
}

// Lab 2.10. Every errand on its own line, then 'You have 2 errands'
// ('You have 1 errand' for one). An empty list gives 'No errands yet.'
export function formatList(list) {
}

// Lab 2.12. How many errands in the list are not done.
export function countOpen(list) {
}

// Lab 2.12. The errands whose text contains the query, ignoring upper and
// lower case. Bring your searchErrands from chapter 2.8.
export function searchErrands(list, query) {
}

// ---- Commands (cli.js calls these) ----

// Lab 2.10. Add an errand with the next id and return 'Added #1: Buy rice'.
// Refuse empty text (or only spaces) with 'Errand text cannot be empty.'
export function add(text) {
}

// Lab 2.10: list('') returns formatList of every errand.
// Capstone 2: list('open') and list('done').
export function list(which) {
}

// Lab 2.12. Return the matching errands, one line each, then '1 found'.
// No match: 'No errands match "milk".'
export function search(query) {
}

// Lab 2.12. idText is what was typed, for example '2'.
// Return 'Done #2: Pay the bill', 'No errand #9.' or '#2 is already done.'
export function done(idText) {
}
