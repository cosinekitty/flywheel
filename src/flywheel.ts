/*
    flywheel.ts  -  a TypeScript chess engine by Don Cross.
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

module Flywheel {
    export enum Square {
        Empty,

        WhitePawn,
        WhiteKnight,
        WhiteBishop,
        WhiteRook,
        WhiteQueen,
        WhiteKing,

        BlackPawn,
        BlackKnight,
        BlackBishop,
        BlackRook,
        BlackQueen,
        BlackKing,

        OffBoard
    }

    /*
        The 8x8 chess board is represented as a one-dimensional array.
        This allows for a very simple and efficient way of representing
        locations and directions of things on the board, using only a single integer index.
        To simplify bounds checking, there is a belt of "OffBoard" values surrounding
        the 8x8 board squares.  Because of the way knights move, the board is represented
        as 10 columns and 12 rows, such that a knight on the inside 8x8 grid can never
        jump outside the array.

        +-------------------------------------------+
        |  110 111 112 113 114 115 116 117 118 119  |
        |  100 101 102 103 104 105 106 107 108 109  |
        |   90  91  92  93  94  95  96  97  98  99  |  8
        |   80  81  82  83  84  85  86  87  88  89  |  7
        |   70  71  72  73  74  75  76  77  78  79  |  6
        |   60  61  62  63  64  65  66  67  68  69  |  5
        |   50  51  52  53  54  55  56  57  58  59  |  4
        |   40  41  42  43  44  45  46  47  48  49  |  3
        |   30  31  32  33  34  35  36  37  38  39  |  2
        |   20  21  22  23  24  25  26  27  28  29  |  1
        |   10  11  12  13  14  15  16  17  18  19  |  ^-- ranks
        |    0   1   2   3   4   5   6   7   8   9  |
        +-------------------------------------------+
                 a   b   c   d   e   f   g   h   <-- files
    */

    export class Board {
        //-----------------------------------------------------------------------------------------------------
        // Class/static stuff
        private static OffsetTable: { [id:string]: number } = Board.InitTables();   // OffsetTable['a1'] = 21
        private static AlgTable: { [id:number]: string };   // AlgTable[21] = 'a1'
        private static ValidOffsetList: number[];

        private static InitTables(): { [id:string]:number } {
            let offsetTable:{[id:string]:number} = {};
            Board.AlgTable = {};
            Board.ValidOffsetList = [];
            for (let y:number = 0; y < 8; ++y) {
                let rank:string = '12345678'.charAt(y);
                for (let x:number = 0; x < 8; x++) {
                    let alg:string = 'abcdefgh'.charAt(x) + rank;
                    let ofs:number = 21 + x + (10*y);
                    offsetTable[alg] = ofs;
                    Board.AlgTable[ofs] = alg;
                    Board.ValidOffsetList.push(ofs);
                }
            }
            return offsetTable;
        }

        private static MakeEmptyBoardArray(): Square[] {
            let i: number;
            let square: Square[] = [];
            for (let y:number = 0; y < 12; ++y) {
                for (let x:number = 0; x < 10; ++x) {
                    square.push(((x>=1) && (x<=8) && (y>=2) && (y<=9)) ? Square.Empty : Square.OffBoard);
                }
            }
            return square;
        }

        private static Offset(alg:string):number {
            let ofs:number = Board.OffsetTable[alg];
            if (!ofs) {
                throw "Invalid algebraic location '" + alg + "': must be 'a1'..'h8'.";
            }
            return ofs;
        }

        //-----------------------------------------------------------------------------------------------------
        // Object/member stuff

        private square: Square[];   // contents of the board - see comments and diagram above
        private whiteKingOfs: number;   // the offset of the White King
        private blackKingOfs: number;   // the offset of the Black King

        public constructor() {
            this.Reset();
        }

        public Reset(): void {
            this.square = Board.MakeEmptyBoardArray();

            this.square[Board.Offset('a1')] = Square.WhiteRook;
            this.square[Board.Offset('b1')] = Square.WhiteKnight;
            this.square[Board.Offset('c1')] = Square.WhiteBishop;
            this.square[Board.Offset('d1')] = Square.WhiteQueen;
            this.square[Board.Offset('e1')] = Square.WhiteKing;
            this.square[Board.Offset('f1')] = Square.WhiteBishop;
            this.square[Board.Offset('g1')] = Square.WhiteKnight;
            this.square[Board.Offset('h1')] = Square.WhiteRook;

            let whitePawnBase:number = Board.Offset('a2');
            let blackPawnBase:number = Board.Offset('a7');
            for (let x:number=0; x < 8; ++x) {
                this.square[whitePawnBase + x] = Square.WhitePawn;
                this.square[blackPawnBase + x] = Square.BlackPawn;
            }

            this.square[Board.Offset('a8')] = Square.BlackRook;
            this.square[Board.Offset('b8')] = Square.BlackKnight;
            this.square[Board.Offset('c8')] = Square.BlackBishop;
            this.square[Board.Offset('d8')] = Square.BlackQueen;
            this.square[Board.Offset('e8')] = Square.BlackKing;
            this.square[Board.Offset('f8')] = Square.BlackBishop;
            this.square[Board.Offset('g8')] = Square.BlackKnight;
            this.square[Board.Offset('h8')] = Square.BlackRook;

            this.Update();
        }

        private Update():void {     // Must be called after changing the internals of the board
            // Search the board's contents for the kings.
            // Verify that exactly one White King and exactly one Black King are present
            // and store their locations.
            this.whiteKingOfs = undefined;
            this.blackKingOfs = undefined;

            for (let i=0; i < Board.ValidOffsetList.length; ++i) {
                let ofs = Board.ValidOffsetList[i];
                switch (this.square[ofs]) {
                    case Square.WhiteKing:
                        if (this.whiteKingOfs === undefined) {
                            this.whiteKingOfs = ofs;
                        } else {
                            throw 'Found more than one White King on the board.';
                        }
                        break;

                    case Square.BlackKing:
                        if (this.blackKingOfs === undefined) {
                            this.blackKingOfs = ofs;
                        } else {
                            throw 'Found more than one Black King on the board.';
                        }
                        break;
                }
            }

            if (this.whiteKingOfs === undefined) {
                throw 'There is no White King on the board.';
            }
            if (this.blackKingOfs === undefined) {
                throw 'There is no Black King on the board.';
            }
        }
    }
}
