## Flywheel - An HTML5/Javascript chess engine

[![Vanilla JS](vanilla-js-button.png)](http://vanilla-js.com/) Flywheel is a pure Javascript chess engine (still in development).

## Design goals

* Computer plays chess with adjustable skill level.
  * AI runs in Javascript background worker.
  * Strong enough to be a challenge for most people.
  * Can decrease strength so weaker players can beat it.
* Also enables creating chess-related HTML5 apps that don't play chess, but just need to know about chess rules.
* No built-in user interface - can be adapted to any UI you want.
* No dependencies on other Javascript libraries (pure Javascript/HTML5).
* Fully understands all rules of chess.
  * Generates a list of all legal moves for any chess position.
  * Verifies whether an externally-supplied move is legal or not.
  * Makes and unmakes moves on the board.
  * Determines whether the game has ended by
    * Checkmate
    * Unambiguous [draws](https://en.wikipedia.org/wiki/Draw_(chess)), i.e., other than by agreement (that's up to the user interface).
    * Draw by Stalemate.
    * Draw by [threefold repetition](https://en.wikipedia.org/wiki/Threefold_repetition).
    * Draw by [50-move rule](https://en.wikipedia.org/wiki/Fifty-move_rule).
    * Draw by insufficient material: neither player has material to checkmate the other.
* [Forsyth–Edwards Notation](https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation) (FEN): parse FEN into a chess position, and for any chess position, generate FEN.
* [Portable Game Notation](https://en.wikipedia.org/wiki/Portable_Game_Notation) (PGN): parse PGN from a game to reconstruct the game state, and generate PGN from a board position.

## Running unit tests

The unit tests exercise the Flywheel engine.  Some of the tests require Javascript Workers, which means most browsers,  for security reasons, will refuse to run them directly from the local filesystem.  Other tests will run fine from the local filesystem.  The easiest way to run all the tests consistently is to run a local http server.  I use Python 2.7 to serve content directly from the cloned repository, though there are many other ways.

````
cd ~
git clone https://github.com/cosinekitty/flywheel.git
cd flywheel
python -m SimpleHTTPServer 5432
````

Then you can run the unit tests in your browser: 

* <a href="http://localhost:5432/tests/board/">http://localhost:5432/tests/board/</a>
* <a href="http://localhost:5432/tests/worker/">http://localhost:5432/tests/worker/</a>

Here is what a successful test looks like:

![Successful unit test](https://raw.githubusercontent.com/cosinekitty/flywheel/fe748a54971dfec6d01ce879eecd4788174da24a/image/flywheel-unit-test-pass.png)
