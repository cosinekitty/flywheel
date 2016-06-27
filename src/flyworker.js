/*
    flyworker.ts  -  Worker support for doing lengthy chess calculations in the background.

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
/// <reference path="flywheel.ts"/>
importScripts('flywheel.js');
var FlyWorker;
(function (FlyWorker) {
    'use strict';
    var SearchResponse = (function () {
        function SearchResponse(origin, bestPath, bestMoveAlg, score, nodes) {
            this.origin = origin;
            this.bestPath = bestPath;
            this.bestMoveAlg = bestMoveAlg;
            this.score = score;
            this.nodes = nodes;
        }
        return SearchResponse;
    }());
    FlyWorker.SearchResponse = SearchResponse;
    var Adapter = (function () {
        function Adapter() {
        }
        Adapter.MateSearch = function (data) {
            var board = new Flywheel.Board(data.fen);
            board.PushHistory(data.game);
            var thinker = new Flywheel.Thinker();
            thinker.SetMaxSearchLimit(data.limit);
            var bestPath = thinker.MateSearch(board);
            return Adapter.MakeSearchResponse(data, bestPath);
        };
        Adapter.Search = function (data) {
            var board = new Flywheel.Board(data.fen);
            board.PushHistory(data.game);
            var thinker = new Flywheel.Thinker();
            thinker.SetTimeLimit(data.timeLimitInSeconds);
            var bestPath = thinker.Search(board);
            return Adapter.MakeSearchResponse(data, bestPath);
        };
        Adapter.AlgebraicPath = function (bestPath) {
            var algpath = '';
            if (bestPath.move.length > 0) {
                for (var _i = 0, _a = bestPath.move; _i < _a.length; _i++) {
                    var move = _a[_i];
                    if (algpath !== '') {
                        algpath += ' ';
                    }
                    algpath += move.toString();
                }
            }
            return algpath;
        };
        Adapter.MakeSearchResponse = function (data, bestPath) {
            return {
                origin: data,
                bestPath: Adapter.AlgebraicPath(bestPath),
                bestMoveAlg: bestPath.move[0].toString(),
                score: bestPath.score,
                nodes: bestPath.nodes
            };
        };
        return Adapter;
    }());
    FlyWorker.Adapter = Adapter;
})(FlyWorker || (FlyWorker = {}));
onmessage = function (message) {
    'use strict';
    switch (message.data.verb) {
        case 'ping':
            postMessage({ origin: message.data, status: 'pong', tag: message.data.tag }, null);
            break;
        case 'MateSearch':
            postMessage(FlyWorker.Adapter.MateSearch(message.data), null);
            break;
        case 'Search':
            postMessage(FlyWorker.Adapter.Search(message.data), null);
            break;
    }
};
//# sourceMappingURL=flyworker.js.map