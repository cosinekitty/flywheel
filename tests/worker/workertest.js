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
/// <reference path="../../src/flywheel.ts"/>
var FlyWorkerTest;
(function (FlyWorkerTest) {
    var Test = (function () {
        function Test() {
        }
        Test.Run = function () {
            Test.Ping();
            Test.MateSearches();
        };
        Test.MakeWorker = function () {
            return new Worker('../../src/flyworker.js');
        };
        Test.Ping = function () {
            var span = window.document.getElementById('PingText');
            span.innerText = 'Sending message to worker';
            var worker = Test.MakeWorker();
            worker.onmessage = function (response) {
                if (response.data.status === 'pong') {
                    console.log('Ping received ' + response.data.tag);
                    span.innerText = 'OK: ' + response.data.tag;
                    span.className = 'PassedTest';
                }
            };
            worker.postMessage({ verb: 'ping', tag: '1' });
            worker.postMessage({ verb: 'ping', tag: '2' });
            worker.postMessage({ verb: 'ping', tag: '3' });
        };
        Test.MateSearches = function () {
            var worker = Test.MakeWorker();
            worker.onmessage = function (response) {
                console.log(response.data);
                var span = window.document.getElementById(response.data.origin.spanid);
                var answer = response.data.bestMove;
                if (answer === response.data.origin.correct) {
                    span.innerText = 'OK: [' + response.data.bestPath + ']';
                    span.className = 'PassedTest';
                }
                else {
                    span.innerText = 'FAILURE: expected ' + response.data.origin.correct + ' but found [' + response.data.bestPath + ']';
                }
            };
            worker.postMessage({ verb: 'MateSearch', limit: 1, game: 'e4 f6 d4 g5', correct: 'd1h5', spanid: 'MateText001' });
            worker.postMessage({ verb: 'MateSearch', limit: 1, game: 'e4 e5 Bc4 Nc6 Qf3 a5', correct: 'f3f7', spanid: 'MateText002' });
            worker.postMessage({
                verb: 'MateSearch',
                limit: 3,
                fen: '3qr2k/pbpp2pp/1p5N/3Q2b1/2P1P3/P7/1PP2PPP/R4RK1 w - - 0 1',
                correct: 'd5g8',
                spanid: 'MateText003' });
            worker.postMessage({
                verb: 'MateSearch',
                limit: 3,
                fen: '8/8/P5P1/q6p/kb1p3P/5P2/1KP2Q2/3B4 w - - 0 1',
                correct: 'c2c4',
                spanid: 'MateText004' });
        };
        return Test;
    })();
    FlyWorkerTest.Test = Test;
})(FlyWorkerTest || (FlyWorkerTest = {}));
//# sourceMappingURL=workertest.js.map