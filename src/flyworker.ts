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

module FlyWorker {
    export class Worker {
        public static MateSearch(fen:string, game:string, limit:number):any {
            let board:Flywheel.Board = new Flywheel.Board(fen);
            board.PushHistory(game);
            let bestPath:Flywheel.BestPath = Flywheel.Thinker.MateSearch(board, limit);
            return bestPath;
        }
    }
}

if (typeof importScripts === 'function') {
    importScripts('flywheel.js');

    onmessage = function (message:MessageEvent) {
        switch (message.data.verb) {
            case 'ping':
                postMessage({origin:message.data, status:'pong', tag:message.data.tag}, null);
                break;

            case 'MateSearch':  // {verb:'MateSearch', game:'e2e4 e5e7 ...', limit:5, fen:...}
                let bestPath:Flywheel.BestPath = FlyWorker.Worker.MateSearch(
                    message.data.fen,
                    message.data.game,
                    message.data.limit);

                let algpath = '';
                let algmove = '';
                if (bestPath.move.length > 0) {
                    algmove = bestPath.move[0].toString();
                    for (let move of bestPath.move) {
                        if (algpath !== '') {
                            algpath += ' ';
                        }
                        algpath += move.toString();
                    }
                }
                postMessage({origin:message.data, bestPath:algpath, bestMove:algmove, score:bestPath.score}, null);
                break;
        }
    }
}