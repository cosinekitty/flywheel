## Flywheel - An HTML5/Javascript chess engine

Flywheel is a pure Javascript chess engine (still in development).

## Running unit tests

The unit tests exercise the Flywheel engine.  Some of the tests require Javascript Workers, which means most browsers,  for security reasons, will refuse to run them directly from the local filesystem.  The easiest way to run the tests is to use Python 2.7 to serve content directly from the cloned repository:

````
cd ~
git clone https://github.com/cosinekitty/flywheel.git
cd flywheel
python -m SimpleHTTPServer 5432
````

Then you can run the unit tests in your browser: 
<a href="http://localhost:5432/tests/board/">http://localhost:5432/tests/board/</a>

Here is what a successful test looks like:

![Successful unit test](https://raw.githubusercontent.com/cosinekitty/flywheel/fe748a54971dfec6d01ce879eecd4788174da24a/image/flywheel-unit-test-pass.png)
