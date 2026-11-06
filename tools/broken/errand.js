// tools/broken/errand.js: an Errand that forgets its rule about empty text.
// The capstone 4 check swaps it in to see whether your own tests notice.
// The fields start with #, so only code inside this class can touch them.

// The one rule about text: it cannot be empty, even after removing spaces.
export function cleanText(text) {
  // Broken on purpose: this version lets empty text through.
  return String(text).trim();
}

export class Errand {
  #id;
  #text;
  #done;

  constructor(id, text, done = false) {
    this.#id = id;
    this.#text = cleanText(text);
    this.#done = done;
  }

  getId() {
    return this.#id;
  }

  getText() {
    return this.#text;
  }

  isDone() {
    return this.#done;
  }

  markDone() {
    if (this.#done) {
      throw new Error('#' + this.#id + ' is already done.');
    }
    this.#done = true;
  }

  markOpen() {
    if (!this.#done) {
      throw new Error('#' + this.#id + ' is not done.');
    }
    this.#done = false;
  }

  rename(newText) {
    this.#text = cleanText(newText);
  }

  toLine() {
    let tick = '[ ]';
    if (this.#done) {
      tick = '[x]';
    }
    return '#' + this.#id + ' ' + tick + ' ' + this.#text;
  }
}
