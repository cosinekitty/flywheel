## Flywheel - An HTML5/Javascript chess engine

Flywheel is a purge Javascript chess engine (still in development).

## Running unit tests

The unit tests exercise the Flywheel engine.  Some of the tests require Javascript Workers, which means most browsers  for security reasons will refuse to run them directly from the local filesystem.  The easiest way to 

````
cd ~
git clone https://github.com/cosinekitty/flywheel.git
cd flywheel
python -m SimpleHTTPServer 5432
````

Then you can run the unit tests in your browser: 
<a href="http://localhost:5432/tests/board/">http://localhost:5432/tests/board/</a>
