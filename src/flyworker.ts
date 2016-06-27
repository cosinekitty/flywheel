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

'use strict';

importScripts('flywheel.js');

module FlyWorker {
    export class SearchResponse {
        public constructor(
            public origin:any,
            public bestPath:string,
            public bestMoveAlg:string,
            public score:number,
            public nodes:number)
        {
        }
    }

    export class Adapter {
        public static MateSearch(data:{fen:string, game:string, limit:number}):SearchResponse{
            let board:Flywheel.Board = new Flywheel.Board(data.fen);
            board.PushHistory(data.game);
            let thinker:Flywheel.Thinker = new Flywheel.Thinker();
            let bestPath:Flywheel.BestPath = thinker.MateSearch(board, data.limit);
            return Adapter.MakeSearchResponse(data, bestPath);
        }

        public static Search(data:{fen:string, game:string, timeLimitInSeconds:number}):SearchResponse{
            let board:Flywheel.Board = new Flywheel.Board(data.fen);
            board.PushHistory(data.game);
            let thinker:Flywheel.Thinker = new Flywheel.Thinker();
            let bestPath:Flywheel.BestPath = thinker.Search(board, data.timeLimitInSeconds);
            console.log(bestPath);
            return Adapter.MakeSearchResponse(data, bestPath);
        }

        private static AlgebraicPath(bestPath:Flywheel.BestPath):string {
            let algpath = '';
            if (bestPath.move.length > 0) {
                for (let move of bestPath.move) {
                    if (algpath !== '') {
                        algpath += ' ';
                    }
                    algpath += move.toString();
                }
            }
            return algpath;
        }

        private static MakeSearchResponse(data:any, bestPath:Flywheel.BestPath):SearchResponse {
            return {
                origin: data,
                bestPath: Adapter.AlgebraicPath(bestPath),
                bestMoveAlg: bestPath.move[0].toString(),
                score: bestPath.score,
                nodes: bestPath.nodes
            };
        }
    }
}

onmessage = function (message:MessageEvent) {
    switch (message.data.verb) {
        case 'ping':
            console.log('ping ' + message.data.tag);
            postMessage({origin: message.data, status: 'pong', tag: message.data.tag}, null);
            break;

        case 'MateSearch':  // {verb:'MateSearch', game:'e2e4 e5e7 ...', limit:5, fen:...}
            postMessage(FlyWorker.Adapter.MateSearch(message.data), null);
            break;

        case 'Search':
            console.log('Received Search');
            postMessage(FlyWorker.Adapter.Search(message.data), null);
            break;
    }
}
