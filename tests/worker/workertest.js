/*
    workertest.ts  -  Unit test of Flywheel worker module.

    Flywheel - a TypeScript chess engine by Don Cross.
    https://github.com/cosinekitty/flywheel

    The MIT License (MIT)

    Copyright (c) 2015 Don Cross

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/
var FlyWorkerTest;
(function (FlyWorkerTest) {
    var Test = (function () {
        function Test() {
        }
        Test.Run = function () {
            var span = window.document.getElementById('PingText');
            span.innerText = 'Sending message to worker';
            var worker = new Worker('../../src/flyworker.js');
            worker.onmessage = function (response) {
                if (response.data === 'pong') {
                    span.innerText = 'OK';
                    span.className = 'PassedTest';
                }
            };
            worker.postMessage({ verb: 'ping' });
        };
        return Test;
    })();
    FlyWorkerTest.Test = Test;
})(FlyWorkerTest || (FlyWorkerTest = {}));
//# sourceMappingURL=workertest.js.map