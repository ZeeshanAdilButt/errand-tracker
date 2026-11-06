# Errand tracker

A small command-line errand tracker that you build yourself in the Dev Weekends Level 1 course (Code Foundations, by Zeeshan Adil). It grows in four steps, one per module:

1. **Bug log.** Run the finished but buggy tracker in `bug-hunt/`, trace three of its bugs to their causes, and fix them.
2. **Tracker v1.** Write your own tracker in `src/errands.js`: add, list, search and done.
3. **Tracker v2.** Save the errands in a SQLite file, so they are still there tomorrow.
4. **Tracker v3.** Move the code into an `Errand` class and an `ErrandStore` class, with your own tests.

Each step ends with a tag: `capstone-1` to `capstone-4`.

## Commands you will use

| Command | What it does |
|---|---|
| `npm run doctor` | checks Node, SQLite, Git and this repository, and says the one thing to fix |
| `npm run where` | says which lab you are on and what to do next |
| `npm run tracker-v0` | runs the buggy tracker (module 1) |
| `npm start` | runs your own tracker (module 2 on) |
| `npm run lab-2.10` | runs one lab's tests (each lab has its own) |
| `npm run capstone-2` | runs a capstone's checks before you tag it |
| `npm run check-tag -- capstone-2` | says whether your tag is made the right way and is on GitHub |

When you push a `capstone-N` tag, GitHub Actions runs the same checks (see the Actions tab).

Replace this README with your own in module 2: what your tracker does, a sample session from your own run, and how to run it.
