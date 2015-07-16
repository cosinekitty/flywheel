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
        WhitePawn,  WhiteKnight,  WhiteBishop,  WhiteRook,  WhiteQueen,  WhiteKing,
        BlackPawn,  BlackKnight,  BlackBishop,  BlackRook,  BlackQueen,  BlackKing,
        OffBoard
    }

    export enum NeutralPiece {      // represents a chess piece without specifying whether it is Black or White
        Empty,
        Pawn, Knight, Bishop, Rook, Queen, King
    }

    export enum Side {
        Neither, White, Black
    }

    class Utility {
        public static IsInitialized:boolean = Utility.StaticInit();
        public static WhitePieces: { [neutral:number]: Square };
        public static BlackPieces: { [neutral:number]: Square };
        public static SidePieces: { [side:number]: { [neutral:number]: Square } };
        public static Neutral: { [square:number]: NeutralPiece };
        public static PieceSide: { [square:number]: Side };

        private static StaticInit():boolean {
            Utility.PieceSide = {};
            Utility.WhitePieces = {};
            Utility.BlackPieces = {};
            Utility.SidePieces = {};
            Utility.Neutral = {};

            Utility.PieceSide[Square.Empty] = Side.Neither;
            Utility.PieceSide[ Utility.WhitePieces[NeutralPiece.Pawn]   = Square.WhitePawn   ] = Side.White;
            Utility.PieceSide[ Utility.WhitePieces[NeutralPiece.Knight] = Square.WhiteKnight ] = Side.White;
            Utility.PieceSide[ Utility.WhitePieces[NeutralPiece.Bishop] = Square.WhiteBishop ] = Side.White;
            Utility.PieceSide[ Utility.WhitePieces[NeutralPiece.Rook]   = Square.WhiteRook   ] = Side.White;
            Utility.PieceSide[ Utility.WhitePieces[NeutralPiece.Queen]  = Square.WhiteQueen  ] = Side.White;
            Utility.PieceSide[ Utility.WhitePieces[NeutralPiece.King]   = Square.WhiteKing   ] = Side.White;

            Utility.PieceSide[ Utility.BlackPieces[NeutralPiece.Pawn]   = Square.BlackPawn   ] = Side.Black;
            Utility.PieceSide[ Utility.BlackPieces[NeutralPiece.Knight] = Square.BlackKnight ] = Side.Black;
            Utility.PieceSide[ Utility.BlackPieces[NeutralPiece.Bishop] = Square.BlackBishop ] = Side.Black;
            Utility.PieceSide[ Utility.BlackPieces[NeutralPiece.Rook]   = Square.BlackRook   ] = Side.Black;
            Utility.PieceSide[ Utility.BlackPieces[NeutralPiece.Queen]  = Square.BlackQueen  ] = Side.Black;
            Utility.PieceSide[ Utility.BlackPieces[NeutralPiece.King]   = Square.BlackKing   ] = Side.Black;

            Utility.Neutral[Square.Empty] = NeutralPiece.Empty;
            Utility.Neutral[Square.WhitePawn]   = Utility.Neutral[Square.BlackPawn]   = NeutralPiece.Pawn;
            Utility.Neutral[Square.WhiteKnight] = Utility.Neutral[Square.BlackKnight] = NeutralPiece.Knight;
            Utility.Neutral[Square.WhiteBishop] = Utility.Neutral[Square.BlackBishop] = NeutralPiece.Bishop;
            Utility.Neutral[Square.WhiteRook]   = Utility.Neutral[Square.BlackRook]   = NeutralPiece.Rook;
            Utility.Neutral[Square.WhiteQueen]  = Utility.Neutral[Square.BlackQueen]  = NeutralPiece.Queen;
            Utility.Neutral[Square.WhiteKing]   = Utility.Neutral[Square.BlackKing]   = NeutralPiece.King;

            Utility.SidePieces[Side.White] = Utility.WhitePieces;
            Utility.SidePieces[Side.Black] = Utility.BlackPieces;

            return true;
        }

        public static SidedPieceCharacter(p:Square):string {
            switch (p) {
                case Square.Empty:          return '.';
                case Square.WhitePawn:      return 'P';
                case Square.WhiteKnight:    return 'N';
                case Square.WhiteBishop:    return 'B';
                case Square.WhiteRook:      return 'R';
                case Square.WhiteQueen:     return 'Q';
                case Square.WhiteKing:      return 'K';
                case Square.BlackPawn:      return 'p';
                case Square.BlackKnight:    return 'n';
                case Square.BlackBishop:    return 'b';
                case Square.BlackRook:      return 'r';
                case Square.BlackQueen:     return 'q';
                case Square.BlackKing:      return 'k';
                default:
                    throw 'Invalid square contents: ' + p;
            }
        }

        public static UnsidedPieceCharacter(p:Square):string {
            return Utility.SidedPieceCharacter(p).toUpperCase();
        }

        public static NeutralPieceCharacter(p:NeutralPiece):string {
            switch (p) {
                case NeutralPiece.Empty:    return '.';
                case NeutralPiece.Pawn:     return 'P';
                case NeutralPiece.Knight:   return 'N';
                case NeutralPiece.Bishop:   return 'B';
                case NeutralPiece.Rook:     return 'R';
                case NeutralPiece.Queen:    return 'Q';
                case NeutralPiece.King:     return 'K';
                default:
                    throw 'Invalid neutral piece: ' + p;
            }
        }
    }

    export enum Score {
        Draw            =           0,
        Invalid         = -2100000000,
        NegInf          = -2000000000,
        PosInf          =  2000000000,
        CheckmateLoss   = -1100000000,
        CheckmateWin    =  1100000000,
        ForcedLoss      = -1000000000,
        ForcedWin       =  1000000000,
    }

    export class Move {
        public source: number;          // the board offset of the piece being moved
        public dest: number;            // the board offset where the piece will end up
        public prom: NeutralPiece;      // if not a pawn promotion, Empty. otherwise, the piece being promoted to
        public score: Score;            // if not null, how good/bad the move is from the moving side's point of view
        public ply: number;             // sanity check that the move pertains to the same ply counter on the board

        public constructor(source:number, dest:number, prom:NeutralPiece = NeutralPiece.Empty, score:number = null, ply:number = null) {
            this.source = source;
            this.dest = dest;
            this.prom = prom;
            this.score = score;
            this.ply = ply;
        }

        public Clone(): Move {
            return new Move(this.source, this.dest, this.prom, this.score, this.ply);
        }

        public toString(): string {      // convert the move to long algebraic form: 'e2e4' or 'e7e8q' (promotion)
            var notation:string = Board.Algebraic(this.source) + Board.Algebraic(this.dest);
            switch (this.prom) {
                case NeutralPiece.Empty:   break;
                case NeutralPiece.Queen:   notation += 'q';    break;
                case NeutralPiece.Rook:    notation += 'r';    break;
                case NeutralPiece.Bishop:  notation += 'b';    break;
                case NeutralPiece.Knight:  notation += 'n';    break;
                default:    throw 'Invalid pawn promotion piece ' + this.prom;
            }
            return notation;
        }
    }

    class MoveState {       // represents the information needed to undo a move from the chess board
        public move: Move;
        public capture: Square;
        public whiteCanCastleKingSide: boolean;
        public whiteCanCastleQueenSide: boolean;
        public blackCanCastleKingSide: boolean;
        public blackCanCastleQueenSide: boolean;
        public epCaptureOffset: number;     // if the move was an en passant capture, where the pawn was removed
        public epTarget: number;            // if previous move was pawn pushed 2 squares, the square it hopped over; otherwise 0
        public castlingRookSource: number;  // if castling move, where the rook came from
        public castlingRookDest: number;    // if castling move, where the rook landed
        public playerWasInCheck: boolean;
        public numQuietPlies: number;

        public constructor(move:Move,
                           capture:Square,
                           wkc:boolean,
                           wqc:boolean,
                           bkc:boolean,
                           bqc:boolean,
                           check:boolean,
                           numQuietPlies:number,
                           epTarget:number) {
            this.move = move;
            this.capture = capture;
            this.whiteCanCastleKingSide = wkc;
            this.whiteCanCastleQueenSide = wqc;
            this.blackCanCastleKingSide = bkc;
            this.blackCanCastleQueenSide = bqc;
            this.playerWasInCheck = check;
            this.numQuietPlies = numQuietPlies;
            this.epTarget = epTarget;
        }
    }

    /*
        The 8x8 chess board is represented as a one-dimensional array.
        This allows for a very simple and efficient way of representing
        locations and directions of things on the board, using only a single integer index.
        To simplify bounds checking, there is a belt of "OffBoard" values surrounding
        the 8x8 board squares.  Because of the way knights move, the board is represented
        as 10 columns and 12 rows, such that a knight on the inside 8x8 grid can never
        jump outside the array.

        +-----------------------------------------------+
        |  110   111 112 113 114 115 116 117 118   119  |
        |  100   101 102 103 104 105 106 107 108   109  |
        |                                               |
        |   90    91  92  93  94  95  96  97  98    99  |  8
        |   80    81  82  83  84  85  86  87  88    89  |  7
        |   70    71  72  73  74  75  76  77  78    79  |  6
        |   60    61  62  63  64  65  66  67  68    69  |  5
        |   50    51  52  53  54  55  56  57  58    59  |  4
        |   40    41  42  43  44  45  46  47  48    49  |  3
        |   30    31  32  33  34  35  36  37  38    39  |  2
        |   20    21  22  23  24  25  26  27  28    29  |  1
        |                                               |
        |   10    11  12  13  14  15  16  17  18    19  |  ^-- ranks
        |    0     1   2   3   4   5   6   7   8     9  |
        +-----------------------------------------------+
                   a   b   c   d   e   f   g   h   <-- files
    */

    enum Direction {     // values that can be added to an offset to obtain another offset in the board
        East        =   1,
        NorthEast   =  11,
        North       =  10,
        NorthWest   =   9,
        West        =  -1,
        SouthWest   = -11,
        South       = -10,
        SouthEast   =  -9,

        Knight1     =  12,
        Knight2     =  21,
        Knight3     =  19,
        Knight4     =   8,
        Knight5     = -12,
        Knight6     = -21,
        Knight7     = -19,
        Knight8     =  -8,
    }

    export enum GameStatus {
        InProgress,
        Draw,
        WhiteWins,
        BlackWins,
    }

    export enum DrawType {
        Stalemate,              // current player cannot move but is not in check
        InsufficientMaterial,   // neither side possesses material sufficient to deliver checkmate
        ThreefoldRepetition,    // same position occurred 3 times
        FiftyMoveRule,          // 50 moves without a capture or a pawn advance
    }

    export class GameResult {
        public status:GameStatus;
        public drawType:DrawType;

        constructor(status:GameStatus, drawType:DrawType = null) {
            this.status = status;
            this.drawType = drawType;
        }
    }

    export class Board {
        //-----------------------------------------------------------------------------------------------------
        // Class/static stuff
        private static IsInitialized:boolean = Board.StaticInit();      // simulate class static constructor
        private static OffsetTable: { [alg:string]: number };   // OffsetTable['a1'] = 21
        private static AlgTable: { [ofs:number]: string };      // AlgTable[21] = 'a1'
        private static ValidOffsetList: number[];
        private static RankNumber: { [ofs:number]: number };    // RankNumber[21] = 1

        private static StaticInit(): boolean {
            Board.OffsetTable = {};
            Board.AlgTable = {};
            Board.ValidOffsetList = [];
            Board.RankNumber = {};
            for (let y:number = 0; y < 8; ++y) {
                let rank:string = '12345678'.charAt(y);
                for (let x:number = 0; x < 8; x++) {
                    let alg:string = 'abcdefgh'.charAt(x) + rank;
                    let ofs:number = 21 + x + (10*y);
                    Board.OffsetTable[alg] = ofs;
                    Board.AlgTable[ofs] = alg;
                    Board.ValidOffsetList.push(ofs);
                    Board.RankNumber[ofs] = 1 + y;
                }
            }
            return true;
        }

        private static MakeBoardArray(): Square[] {
            // It is up to the initializer to fill in valid values for the interior 8x8 squares.
            // Just make all 120 squares "off board" to start out.
            let square: Square[] = [];
            for (let i:number = 0; i < 120; ++i) {
                square.push(Square.OffBoard);
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

        public static Algebraic(ofs:number):string {
            let alg:string = Board.AlgTable[ofs];
            if (!alg) {
                throw "Invalid board offset " + ofs;
            }
            return alg;
        }

        //-----------------------------------------------------------------------------------------------------
        // Object/member stuff

        private sideToMove: Side;       // is it White's turn to move or Black's turn to move?
        private enemy: Side;            // the opponent of the side whose turn it is (cached for speed)
        private square: Square[];       // contents of the board - see comments and diagram above
        private whiteKingOfs: number;   // the offset of the White King
        private blackKingOfs: number;   // the offset of the Black King
        private whiteCanCastleKingSide: boolean;
        private whiteCanCastleQueenSide: boolean;
        private blackCanCastleKingSide: boolean;
        private blackCanCastleQueenSide: boolean;
        private currentPlayerInCheck: boolean;
        private addMoves: { [square:number]: (movelist:Move[], source:number) => void };      // table of move generator functions for each kind of piece
        private moveStack: MoveState[];
        private numQuietPlies: number;  // number of plies that have elapsed without a capture or a pawn move
        private fullMoveNumber: number; // starts at 1 for beginning of game, incremented after each Black move
        private epTarget: number;       // board offset behind a pawn just pushed 2 squares, otherwise 0
        private initialFen: string;     // if defined, the FEN for the starting position

        public constructor(fen:string = null) {
            this.Init();
            if (fen) {
                this.SetForsythEdwardsNotation(fen);
            } else {
                this.Reset();
            }
        }

        public Clone():Board {
            let copy:Board = new Board(this.initialFen);
            for (let info of this.moveStack) {
                copy.PushMove(info.move);
            }
            return copy;
        }

        public GetSquare(alg:string):Square {
            return this.square[Board.Offset(alg)];
        }

        public IsWhiteToMove(): boolean {
            return this.sideToMove === Side.White;
        }

        public IsBlackToMove(): boolean {
            return this.sideToMove === Side.Black;
        }

        public CanPopMove():boolean {
            return this.moveStack.length > 0;
        }

        public LegalMoves(): Move[] {           // FIXFIXFIX: allow passing in a scoring function to assist move ordering
            let rawlist:Move[] = this.RawMoves();
            let movelist:Move[] = [];
            for (let raw of rawlist) {
                // Before we make a move, we have to set the move.ply
                // to match the current number of turns that have been played
                // on the board.  This is an inexpensive way to catch bugs
                // where a caller tries to play a move for the wrong board position.
                raw.ply = this.moveStack.length;

                // Test each move for legality by making the move and
                // looking to see if the player who just moved is in check.
                this.PushMove(raw);
                if (!this.IsPlayerInCheck(this.enemy)) {
                    movelist.push(raw);
                }
                this.PopMove();
            }
            return movelist;
        }

        public GetNonStalemateDrawType(): DrawType {
            // FIXFIXFIX - detect draws by threefold repetition
            // FIXFIXFIX - detect draws by insufficient material
            // FIXFIXFIX - detect draws by 50-move rule
            return null;    // non-stalemate draw not detected
        }

        public GetGameResult(): GameResult {
            if (this.CurrentPlayerCanMove()) {
                let drawType:DrawType = this.GetNonStalemateDrawType();
                if (drawType !== null) {
                    return new GameResult(GameStatus.Draw, drawType);
                }
                return new GameResult(GameStatus.InProgress);
            }

            if (this.IsCurrentPlayerInCheck()) {
                return new GameResult(this.IsWhiteToMove() ? GameStatus.BlackWins : GameStatus.WhiteWins);
            }

            return new GameResult(GameStatus.Draw, DrawType.Stalemate);
        }

        public CurrentPlayerCanMove():boolean {
            for (let source of Board.ValidOffsetList) {
                var sq:Square = this.square[source];
                if (Utility.PieceSide[sq] === this.sideToMove) {
                    let movelist:Move[] = [];
                    this.addMoves[sq].call(this, movelist, source);
                    for (let move of movelist) {
                        move.ply = this.moveStack.length;
                        this.PushMove(move);
                        let legal:boolean = !this.IsPlayerInCheck(this.enemy);
                        this.PopMove();
                        if (legal) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        public IsCurrentPlayerInCheck():boolean {
            if (this.currentPlayerInCheck === undefined) {
                this.currentPlayerInCheck = this.IsPlayerInCheck(this.sideToMove);
            }
            return this.currentPlayerInCheck;
        }

        public IsCurrentPlayerCheckmated():boolean {
            return this.IsCurrentPlayerInCheck() && !this.CurrentPlayerCanMove();
        }

        private IsPlayerInCheck(side:Side): boolean {
            if (side === Side.White) {
                return this.IsAttackedByBlack(this.whiteKingOfs);
            } else {
                return this.IsAttackedByWhite(this.blackKingOfs);
            }
        }

        private IsAttackedByWhite(ofs:number): boolean {
            if (this.square[ofs + Direction.SouthWest] === Square.WhitePawn) return true;
            if (this.square[ofs + Direction.SouthEast] === Square.WhitePawn) return true;

            if (this.square[ofs + Direction.East     ] === Square.WhiteKing) return true;
            if (this.square[ofs + Direction.NorthEast] === Square.WhiteKing) return true;
            if (this.square[ofs + Direction.North    ] === Square.WhiteKing) return true;
            if (this.square[ofs + Direction.NorthWest] === Square.WhiteKing) return true;
            if (this.square[ofs + Direction.West     ] === Square.WhiteKing) return true;
            if (this.square[ofs + Direction.SouthWest] === Square.WhiteKing) return true;
            if (this.square[ofs + Direction.South    ] === Square.WhiteKing) return true;
            if (this.square[ofs + Direction.SouthEast] === Square.WhiteKing) return true;

            if (this.square[ofs + Direction.Knight1] === Square.WhiteKnight) return true;
            if (this.square[ofs + Direction.Knight2] === Square.WhiteKnight) return true;
            if (this.square[ofs + Direction.Knight3] === Square.WhiteKnight) return true;
            if (this.square[ofs + Direction.Knight4] === Square.WhiteKnight) return true;
            if (this.square[ofs + Direction.Knight5] === Square.WhiteKnight) return true;
            if (this.square[ofs + Direction.Knight6] === Square.WhiteKnight) return true;
            if (this.square[ofs + Direction.Knight7] === Square.WhiteKnight) return true;
            if (this.square[ofs + Direction.Knight8] === Square.WhiteKnight) return true;

            if (this.IsAttackedFromDir(ofs, Direction.East,  Square.WhiteQueen, Square.WhiteRook))   return true;
            if (this.IsAttackedFromDir(ofs, Direction.West,  Square.WhiteQueen, Square.WhiteRook))   return true;
            if (this.IsAttackedFromDir(ofs, Direction.North, Square.WhiteQueen, Square.WhiteRook))   return true;
            if (this.IsAttackedFromDir(ofs, Direction.South, Square.WhiteQueen, Square.WhiteRook))   return true;

            if (this.IsAttackedFromDir(ofs, Direction.NorthEast, Square.WhiteQueen, Square.WhiteBishop)) return true;
            if (this.IsAttackedFromDir(ofs, Direction.NorthWest, Square.WhiteQueen, Square.WhiteBishop)) return true;
            if (this.IsAttackedFromDir(ofs, Direction.SouthEast, Square.WhiteQueen, Square.WhiteBishop)) return true;
            if (this.IsAttackedFromDir(ofs, Direction.SouthWest, Square.WhiteQueen, Square.WhiteBishop)) return true;

            return false;
        }

        private IsAttackedByBlack(ofs:number): boolean {
            if (this.square[ofs + Direction.NorthWest] === Square.BlackPawn) return true;
            if (this.square[ofs + Direction.NorthEast] === Square.BlackPawn) return true;

            if (this.square[ofs + Direction.East     ] === Square.BlackKing) return true;
            if (this.square[ofs + Direction.NorthEast] === Square.BlackKing) return true;
            if (this.square[ofs + Direction.North    ] === Square.BlackKing) return true;
            if (this.square[ofs + Direction.NorthWest] === Square.BlackKing) return true;
            if (this.square[ofs + Direction.West     ] === Square.BlackKing) return true;
            if (this.square[ofs + Direction.SouthWest] === Square.BlackKing) return true;
            if (this.square[ofs + Direction.South    ] === Square.BlackKing) return true;
            if (this.square[ofs + Direction.SouthEast] === Square.BlackKing) return true;

            if (this.square[ofs + Direction.Knight1] === Square.BlackKnight) return true;
            if (this.square[ofs + Direction.Knight2] === Square.BlackKnight) return true;
            if (this.square[ofs + Direction.Knight3] === Square.BlackKnight) return true;
            if (this.square[ofs + Direction.Knight4] === Square.BlackKnight) return true;
            if (this.square[ofs + Direction.Knight5] === Square.BlackKnight) return true;
            if (this.square[ofs + Direction.Knight6] === Square.BlackKnight) return true;
            if (this.square[ofs + Direction.Knight7] === Square.BlackKnight) return true;
            if (this.square[ofs + Direction.Knight8] === Square.BlackKnight) return true;

            if (this.IsAttackedFromDir(ofs, Direction.East,  Square.BlackQueen, Square.BlackRook))   return true;
            if (this.IsAttackedFromDir(ofs, Direction.West,  Square.BlackQueen, Square.BlackRook))   return true;
            if (this.IsAttackedFromDir(ofs, Direction.North, Square.BlackQueen, Square.BlackRook))   return true;
            if (this.IsAttackedFromDir(ofs, Direction.South, Square.BlackQueen, Square.BlackRook))   return true;

            if (this.IsAttackedFromDir(ofs, Direction.NorthEast, Square.BlackQueen, Square.BlackBishop)) return true;
            if (this.IsAttackedFromDir(ofs, Direction.NorthWest, Square.BlackQueen, Square.BlackBishop)) return true;
            if (this.IsAttackedFromDir(ofs, Direction.SouthEast, Square.BlackQueen, Square.BlackBishop)) return true;
            if (this.IsAttackedFromDir(ofs, Direction.SouthWest, Square.BlackQueen, Square.BlackBishop)) return true;

            return false;
        }

        private IsAttackedFromDir(ofs:number, dir:number, piece1:Square, piece2:Square):boolean {
            ofs += dir;
            while (this.square[ofs] === Square.Empty) {
                ofs += dir;
            }
            return (this.square[ofs] === piece1) || (this.square[ofs] === piece2);
        }

        public MoveHistory(): Move[] {
            // Make a clone of the moves in the move stack.
            let history:Move[] = [];
            for (let info of this.moveStack) {
                history.push(info.move.Clone());
            }
            return history;
        }

        public AlgHistory(): string {
            let history:string = '';
            for (let info of this.moveStack) {
                if (history.length > 0) {
                    history += ' ';
                }
                history += info.move.toString();
            }
            return history;
        }

        public PgnHistory(): string {   // terse list of moves without PGN header, newlines, or move numbers
            // We need the board to be in the state it was before
            // each move was made in order to format each move in PGN.
            // Therefore, we need to start with a board at the beginning of the game,
            // then for each move, format the move, then make the move.
            // Any exception that occurred in the middle of this procedure could corrupt
            // the board state.  Therefore, instead of modifying this Board object,
            // we create a temporary board object to make all the moves in.
            let tempBoard:Board = new Board(this.initialFen);
            let history:string = '';
            for (let info of this.moveStack) {
                if (history.length > 0) {
                    history += ' ';
                }
                history += tempBoard.PgnFormat(info.move);
                tempBoard.PushMove(info.move);
            }
            return history;
        }

        private static FilterCheckSuffix(notation:string):string {
            if (notation.length > 0) {
                let lastChar:string = notation[notation.length - 1];
                if (lastChar === '+' || lastChar === '#') {
                    return notation.substr(0, notation.length - 2);
                }
            }
            return notation;
        }

        public PushNotation(notation: string, legal:Move[] = this.LegalMoves(), callDepth:number = 0): boolean {
            // Some programs may generate notation that omits '+' or '#' notation
            // where it should exist in PGN, and others may include it where we don't
            // generate it in plain long algebraic notation.
            // The PGN spec says that neither character counts for disambiguation,
            // so it is a safe comparison to ignore these suffixes.
            // So we filter out all check/checkmate suffixes for the sake of comparison.
            notation = Board.FilterCheckSuffix(notation);

            // Look for algebraic notation first, because it is simpler.
            // Ignore in recursive calls, where we are trying to match PGN only.
            if (callDepth === 0) {
                for (let move of legal) {
                    if (move.toString() === notation) {
                        this.PushMove(move);
                        return true;
                    }
                }
            }

            // Getting here means we could not find algebraic match.
            // Look for PGN match, a more costly operation.

            if (notation.length >= 2 && notation.length <= 7) {     // PGN notation is always 2..7 characters
                for (let move of legal) {
                    let pgn:string = Board.FilterCheckSuffix(this.PgnFormat(move, legal));
                    if (pgn === notation) {
                        this.PushMove(move);
                        return true;
                    }
                }

                // There was no exact algebraic or PGN match.
                // I have seen cases where a PGN file generated by other software
                // will have a move like "Ngf3", even though "Nf3" was unambiguous.
                // Let's try to hack around that here by checking for that case and using recursion.
                // Note that in a case like "Na1b3", we may recurse twice:  "Na1b3" -> "N1b3" -> "Nb3".
                // If deleting the second character generates a truly ambiguous move, it will never match
                // any PGN string we generate above in the comparison loop, so we will always return
                // false after either 1 or 2 recursions.
                if (notation.length >= 4 && callDepth < 2) {
                    // long enough to contain an unnecessary source rank/file/square disambiguator
                    if (/^[NBRQK][a-h1-8]/.test(notation)) {
                        // Remove rank/file character and recurse.
                        let shorter:string = notation.charAt(0) + notation.substr(2);
                        if (this.PushNotation(shorter, legal, 1+callDepth)) {
                            return true;
                        }
                    }
                }
            }

            if (callDepth > 0) {
                return false;   // we want the topmost recursive caller to report an error on the original notation
            }

            throw 'Move notation is not valid/legal: "' + notation + '"';
        }

        public PushHistory(history:string):void {
            if (history) {
                let notationArray:string[] = history.split(' ');
                for (let notation of notationArray) {
                    this.PushNotation(notation);
                }
            }
        }

        public PushMove(move: Move): void {
            // Before risking corruption of the board state, verify
            // that the move passed in pertains to the same number of turns
            // (called "ply number") that have been applied to the board.
            // The LegalMoves() function copies the ply number from the board
            // position into each move it generates.
            if (move.ply !== this.moveStack.length) {
                throw 'Board is at ply number ' + this.moveStack.length + ' but move is for ply ' + move.ply;
            }

            // Perform the state changes needed by the vast majority of moves.
            let dir:number = move.dest - move.source;
            let piece:Square = this.square[move.source];
            let capture:Square = this.square[move.dest];
            this.square[move.dest] = piece;
            this.square[move.source] = Square.Empty;

            // Preserve information needed for PopMove() to undo this move.
            var info:MoveState = new MoveState(
                move.Clone(),   // clone the move so we protect from any caller side-effects
                capture,
                this.whiteCanCastleKingSide,
                this.whiteCanCastleQueenSide,
                this.blackCanCastleKingSide,
                this.blackCanCastleQueenSide,
                this.currentPlayerInCheck,
                this.numQuietPlies,
                this.epTarget);

            this.moveStack.push(info);

            ++this.numQuietPlies;   // assume this is a quiet ply unless we see a pawn move or a capture

            this.currentPlayerInCheck = undefined;  // we no longer know if the current player is in check
            this.epTarget = 0;      // assume no en passant target unless this is a pawn moving 2 squares

            if (capture !== Square.Empty) {
                this.numQuietPlies = 0;
            }

            // Now check for the special cases: castling, en passant, pawn promotion.
            if (move.prom !== NeutralPiece.Empty) {
                // Pawn promotion. Override what we put in the destination square.
                this.square[move.dest] = Utility.SidePieces[this.sideToMove][move.prom];
                // A pawn is moving, so reset the quiet ply counter.
                this.numQuietPlies = 0;
            } else {
                let neutralPiece:NeutralPiece = Utility.Neutral[piece];
                if (neutralPiece === NeutralPiece.Pawn) {
                    // A pawn is moving, so reset the quiet ply counter.
                    this.numQuietPlies = 0;
                    // Is this an en passant capture?
                    if (capture === Square.Empty) {
                        if (dir === Direction.NorthEast || dir === Direction.SouthEast) {
                            // Pawn is moving like a eastward capture, but target square was empty.
                            // Assume this is an en passant capture.
                            info.epCaptureOffset = move.source + Direction.East;
                            this.square[info.epCaptureOffset] = Square.Empty;
                        } else if (dir === Direction.NorthWest || dir === Direction.SouthWest) {
                            // Pawn is moving like a westward capture, but target square was empty.
                            // Assume this is an en passant capture.
                            info.epCaptureOffset = move.source + Direction.West;
                            this.square[info.epCaptureOffset] = Square.Empty;
                        } else if (dir === 2*Direction.North) {
                            // A White pawn is moving 2 squares forward.
                            // This might indicate an en passant opportunity for Black's next turn.
                            this.epTarget = move.source + Direction.North;
                        } else if (dir === 2*Direction.South) {
                            // A Black pawn is moving 2 squares forward.
                            // This might indicate an en passant opportunity for White's next turn.
                            this.epTarget = move.source + Direction.South;
                        }
                    }
                } else if (neutralPiece === NeutralPiece.King) {
                    // Any king move disables castling for that player.
                    // We also keep the king offset variables up to date.
                    if (piece === Square.WhiteKing) {
                        this.whiteCanCastleKingSide = this.whiteCanCastleQueenSide = false;
                        this.whiteKingOfs = move.dest;
                    } else {
                        this.blackCanCastleKingSide = this.blackCanCastleQueenSide = false;
                        this.blackKingOfs = move.dest;
                    }
                    if (dir === 2*Direction.East) {
                        // Assume this is kingside castling.  Move the rook around the king.
                        info.castlingRookSource = move.source + 3*Direction.East;
                        info.castlingRookDest   = move.source + Direction.East;
                        this.square[info.castlingRookDest] = this.square[info.castlingRookSource];
                        this.square[info.castlingRookSource] = Square.Empty;
                    } else if (dir === 2*Direction.West) {
                        // Assume this is queenside castling.  Move the rook around the king.
                        info.castlingRookSource = move.source + 4*Direction.West;
                        info.castlingRookDest   = move.source + Direction.West;
                        this.square[info.castlingRookDest] = this.square[info.castlingRookSource];
                        this.square[info.castlingRookSource] = Square.Empty;
                    }
                } else if (piece === Square.WhiteRook) {
                    if (move.source === 21) {
                        this.whiteCanCastleQueenSide = false;
                    } else if (move.source === 28) {
                        this.whiteCanCastleKingSide = false;
                    }
                } else if (piece === Square.BlackRook) {
                    if (move.source === 91) {
                        this.blackCanCastleQueenSide = false;
                    } else if (move.source === 98) {
                        this.blackCanCastleKingSide = false;
                    }
                }
            }

            // Any move into a player's rook home square destroys castling for that player on that side of the board.
            // Here is an example of the tricky bug this prevents:
            // 1. White Bishop captures a Black Rook at h8.
            // 2. Later, White moves the Bishop away from h8.
            // 3. Black moves his other rook to h8.
            // 4. If we didn't set blackCanCastleKingSide=false in step #1, we might think Black could castle kingside!
            switch (move.dest) {
                case 21: this.whiteCanCastleQueenSide = false;  break;
                case 28: this.whiteCanCastleKingSide  = false;  break;
                case 91: this.blackCanCastleQueenSide = false;  break;
                case 98: this.blackCanCastleKingSide  = false;  break;
            }

            // After each move by Black, we increment the full move number.
            if (this.sideToMove === Side.Black) {
                ++this.fullMoveNumber;
            }

            // Toggle the side to move...
            let swap:Side = this.sideToMove;
            this.sideToMove = this.enemy;
            this.enemy = swap;
        }

        public PopMove(): Move {
            if (this.moveStack.length === 0) {
                throw 'PopMove: move stack is empty!';
            }

            var info:MoveState = this.moveStack.pop();

            // Reverse the actions we performed in PushMove().

            // Toggle the side to move back to where it was.
            let swap:Side = this.sideToMove;
            this.sideToMove = this.enemy;
            this.enemy = swap;

            // Decrement the full move number each time we undo a move by Black.
            if (this.sideToMove === Side.Black) {
                --this.fullMoveNumber;
            }

            // Restore castling flags.
            this.whiteCanCastleKingSide  = info.whiteCanCastleKingSide;
            this.whiteCanCastleQueenSide = info.whiteCanCastleQueenSide;
            this.blackCanCastleKingSide  = info.blackCanCastleKingSide;
            this.blackCanCastleQueenSide = info.blackCanCastleQueenSide;

            // Restore king positions if we are undoing a king move.
            if (info.move.dest === this.whiteKingOfs) {
                this.whiteKingOfs = info.move.source;
            } else if (info.move.dest === this.blackKingOfs) {
                this.blackKingOfs = info.move.source;
            }

            // Restore any knowledge we might have had about the player being in check.
            this.currentPlayerInCheck = info.playerWasInCheck;

            // Put the pawn/capture halfmove clock back where it was.
            this.numQuietPlies = info.numQuietPlies;

            if (info.move.prom === NeutralPiece.Empty) {
                // This move is NOT a pawn promotion.
                // Put the piece that moved back in its source square.
                this.square[info.move.source] = this.square[info.move.dest];
            } else {
                // This move is a pawn promotion.
                // To undo pawn promotion, we change the promoted piece back into a pawn.
                this.square[info.move.source] = Utility.SidePieces[this.sideToMove][NeutralPiece.Pawn];
            }

            // Put whatever was in the destination square back there.
            // This could be an enemy piece or an empty square.
            // Quirk: info.capture is empty for en passant captures.
            this.square[info.move.dest] = info.capture;

            if (info.epCaptureOffset) {
                // This was an en passant capture, so restore the captured pawn to the board.
                this.square[info.epCaptureOffset] = Utility.SidePieces[this.enemy][NeutralPiece.Pawn];
            } else if (info.castlingRookSource) {
                // This was a castling move, so we need to restore the involved rook.
                this.square[info.castlingRookSource] = Utility.SidePieces[this.sideToMove][NeutralPiece.Rook];
                this.square[info.castlingRookDest] = Square.Empty;
            }

            // Restore en passant state.
            this.epTarget = info.epTarget;

            return info.move;   // return the popped move back to the caller, for algorithmic symmetry.
        }

        private RawMoves(): Move[] {
            // Generate a list of all moves, without regard to whether the player would be in check.
            let movelist:Move[] = [];
            for (let source of Board.ValidOffsetList) {
                var sq:Square = this.square[source];
                if (Utility.PieceSide[sq] === this.sideToMove) {
                    this.addMoves[sq].call(this, movelist, source);
                }
            }
            return movelist;
        }

        private AddMoves_Pawn(movelist:Move[], source:number):void {
            // Pawns are the most complicated of all pieces!
            // They capture differently than they move,
            // they can move 2 squares if starting on their home rank,
            // they can be promoted, and they can capture "en passant"
            // depending on what the opponent just moved.
            // They also move and capture different directions based on
            // whether they are White or Black.
            let rank:number = Board.RankNumber[source];
            let dir:Direction;
            let deltaRank:number;
            let promRank:number;
            let homeRank:number;
            if (this.sideToMove === Side.White) {
                dir = Direction.North;
                deltaRank = 1;
                homeRank = 2;
                promRank = 8;
            } else {
                dir = Direction.South;
                deltaRank = -1;
                homeRank = 7;
                promRank = 1;
            }

            // Check for moving one square forward.
            if (this.square[source + dir] === Square.Empty) {
                if (rank + deltaRank === promRank) {
                    // Pawn promotion found: generate 4 moves, one for each promotion piece.
                    movelist.push(new Move(source, source + dir, NeutralPiece.Queen));
                    movelist.push(new Move(source, source + dir, NeutralPiece.Rook));
                    movelist.push(new Move(source, source + dir, NeutralPiece.Bishop));
                    movelist.push(new Move(source, source + dir, NeutralPiece.Knight));
                } else {
                    // Not a pawn promotion... just a normal move.
                    movelist.push(new Move(source, source + dir));

                    // See if the pawn can also move 2 squares forward.
                    if ((rank === homeRank) && (this.square[source + 2*dir] === Square.Empty)) {
                        movelist.push(new Move(source, source + 2*dir));
                    }
                }
            }

            // Check for capturing to the east.
            var edest:number = source + dir + Direction.East;
            if (Utility.PieceSide[this.square[edest]] === this.enemy) {
                if (rank + deltaRank === promRank) {
                    // Pawn promotion as the pawn captures eastward.
                    movelist.push(new Move(source, edest, NeutralPiece.Queen));
                    movelist.push(new Move(source, edest, NeutralPiece.Rook));
                    movelist.push(new Move(source, edest, NeutralPiece.Bishop));
                    movelist.push(new Move(source, edest, NeutralPiece.Knight));
                } else {
                    // Normal capture - not a promotion.
                    movelist.push(new Move(source, edest));
                }
            } else if (edest === this.epTarget) {
                // En passant capture to the east.
                movelist.push(new Move(source, edest));
            }

            // Check for capturing to the west.
            var wdest:number = source + dir + Direction.West;
            if (Utility.PieceSide[this.square[wdest]] === this.enemy) {
                if (rank + deltaRank === promRank) {
                    // Pawn promotion as the pawn captures westward.
                    movelist.push(new Move(source, wdest, NeutralPiece.Queen));
                    movelist.push(new Move(source, wdest, NeutralPiece.Rook));
                    movelist.push(new Move(source, wdest, NeutralPiece.Bishop));
                    movelist.push(new Move(source, wdest, NeutralPiece.Knight));
                } else {
                    // Normal capture - not a promotion.
                    movelist.push(new Move(source, wdest));
                }
            } else if (wdest === this.epTarget) {
                // En passant capture to the west.
                movelist.push(new Move(source, wdest));
            }
        }

        private AddMoves_Knight(movelist:Move[], source:number):void {
            this.DirAddMove(movelist, source, source + Direction.Knight1);
            this.DirAddMove(movelist, source, source + Direction.Knight2);
            this.DirAddMove(movelist, source, source + Direction.Knight3);
            this.DirAddMove(movelist, source, source + Direction.Knight4);
            this.DirAddMove(movelist, source, source + Direction.Knight5);
            this.DirAddMove(movelist, source, source + Direction.Knight6);
            this.DirAddMove(movelist, source, source + Direction.Knight7);
            this.DirAddMove(movelist, source, source + Direction.Knight8);
        }

        private AddMoves_Bishop(movelist:Move[], source:number):void {
            this.RayAddMoves(movelist, source, Direction.NorthEast);
            this.RayAddMoves(movelist, source, Direction.NorthWest);
            this.RayAddMoves(movelist, source, Direction.SouthEast);
            this.RayAddMoves(movelist, source, Direction.SouthWest);
        }

        private AddMoves_Rook(movelist:Move[], source:number):void {
            this.RayAddMoves(movelist, source, Direction.East);
            this.RayAddMoves(movelist, source, Direction.North);
            this.RayAddMoves(movelist, source, Direction.West);
            this.RayAddMoves(movelist, source, Direction.South);
        }

        private AddMoves_Queen(movelist:Move[], source:number):void {
            this.RayAddMoves(movelist, source, Direction.East);
            this.RayAddMoves(movelist, source, Direction.NorthEast);
            this.RayAddMoves(movelist, source, Direction.North);
            this.RayAddMoves(movelist, source, Direction.NorthWest);
            this.RayAddMoves(movelist, source, Direction.West);
            this.RayAddMoves(movelist, source, Direction.SouthWest);
            this.RayAddMoves(movelist, source, Direction.South);
            this.RayAddMoves(movelist, source, Direction.SouthEast);
        }

        private AddMoves_King(movelist:Move[], source:number):void {
            let canCastleKingSide: boolean;
            let canCastleQueenSide: boolean;
            if (this.sideToMove === Side.White) {
                canCastleKingSide = this.whiteCanCastleKingSide &&
                    (this.square[26] === Square.Empty) &&
                    (this.square[27] === Square.Empty) &&
                    !this.IsAttackedByBlack(26);

                canCastleQueenSide = this.whiteCanCastleQueenSide &&
                    (this.square[24] === Square.Empty) &&
                    (this.square[23] === Square.Empty) &&
                    (this.square[22] === Square.Empty) &&
                    !this.IsAttackedByBlack(24);

                if (canCastleKingSide || canCastleQueenSide) {
                    if (!this.IsCurrentPlayerInCheck()) {
                        if (canCastleKingSide) {
                            movelist.push(new Move(25, 27));
                        }
                        if (canCastleQueenSide) {
                            movelist.push(new Move(25, 23));
                        }
                    }
                }
            } else {
                canCastleKingSide = this.blackCanCastleKingSide &&
                    (this.square[96] === Square.Empty) &&
                    (this.square[97] === Square.Empty) &&
                    !this.IsAttackedByWhite(96);

                canCastleQueenSide = this.blackCanCastleQueenSide &&
                    (this.square[94] === Square.Empty) &&
                    (this.square[93] === Square.Empty) &&
                    (this.square[92] === Square.Empty) &&
                    !this.IsAttackedByWhite(94);

                if (canCastleKingSide || canCastleQueenSide) {
                    if (!this.IsCurrentPlayerInCheck()) {
                        if (canCastleKingSide) {
                            movelist.push(new Move(95, 97));
                        }
                        if (canCastleQueenSide) {
                            movelist.push(new Move(95, 93));
                        }
                    }
                }
            }

            this.DirAddMove(movelist, source, source + Direction.East);
            this.DirAddMove(movelist, source, source + Direction.NorthEast);
            this.DirAddMove(movelist, source, source + Direction.North);
            this.DirAddMove(movelist, source, source + Direction.NorthWest);
            this.DirAddMove(movelist, source, source + Direction.West);
            this.DirAddMove(movelist, source, source + Direction.SouthWest);
            this.DirAddMove(movelist, source, source + Direction.South);
            this.DirAddMove(movelist, source, source + Direction.SouthEast);
        }

        private DirAddMove(movelist:Move[], source:number, dest:number):void {
            // Knights or Kings can move to an empty square or a square that contains the opposite color piece,
            // but NOT to squares that contain the same color piece or squares that are off the board.
            if (this.square[dest] === Square.Empty || Utility.PieceSide[this.square[dest]] === this.enemy) {
                movelist.push(new Move(source, dest));
            }
        }

        private RayAddMoves(movelist:Move[], source:number, dir:Direction):void {
            // Queens, rooks, and bishops make moves along a series of squares in a given direction.
            // They can move any number of empty squares in a given direction.
            // If they hit any non-empty square (including going off the board), they are blocked.
            let dest:number = source + dir;
            while (this.square[dest] === Square.Empty) {
                movelist.push(new Move(source, dest));
                dest += dir;
            }

            // If the non-empty blocking square contains an enemy piece, capturing that piece is another valid move.
            if (Utility.PieceSide[this.square[dest]] === this.enemy) {
                movelist.push(new Move(source, dest));
            }
        }

        private Init(): void {
            this.square = Board.MakeBoardArray();

            // Create a lookup table of functions that append possible moves for each kind of piece.
            // The caller must detect which side has the move and call only for that side's pieces.
            this.addMoves = {};
            this.addMoves[Square.WhitePawn]   = this.addMoves[Square.BlackPawn]   = this.AddMoves_Pawn;
            this.addMoves[Square.WhiteKnight] = this.addMoves[Square.BlackKnight] = this.AddMoves_Knight;
            this.addMoves[Square.WhiteBishop] = this.addMoves[Square.BlackBishop] = this.AddMoves_Bishop;
            this.addMoves[Square.WhiteRook]   = this.addMoves[Square.BlackRook]   = this.AddMoves_Rook;
            this.addMoves[Square.WhiteQueen]  = this.addMoves[Square.BlackQueen]  = this.AddMoves_Queen;
            this.addMoves[Square.WhiteKing]   = this.addMoves[Square.BlackKing]   = this.AddMoves_King;
        }

        public Reset(): void {
            this.initialFen = undefined;
            this.sideToMove = Side.White;
            this.enemy = Side.Black;
            this.moveStack = [];
            this.numQuietPlies = 0;
            this.fullMoveNumber = 1;
            this.whiteCanCastleKingSide  = true;
            this.whiteCanCastleQueenSide = true;
            this.blackCanCastleKingSide  = true;
            this.blackCanCastleQueenSide = true;
            this.epTarget = 0;

            let x:number = Board.Offset('a1');
            this.square[x++] = Square.WhiteRook;
            this.square[x++] = Square.WhiteKnight;
            this.square[x++] = Square.WhiteBishop;
            this.square[x++] = Square.WhiteQueen;
            this.square[x++] = Square.WhiteKing;
            this.square[x++] = Square.WhiteBishop;
            this.square[x++] = Square.WhiteKnight;
            this.square[x++] = Square.WhiteRook;

            x = Board.Offset('a2');
            for (let i:number = 0; i < 8; ++i, ++x) {
                this.square[x] = Square.WhitePawn;
                this.square[x + 10] = Square.Empty;
                this.square[x + 20] = Square.Empty;
                this.square[x + 30] = Square.Empty;
                this.square[x + 40] = Square.Empty;
                this.square[x + 50] = Square.BlackPawn;
            }

            x = Board.Offset('a8');
            this.square[x++] = Square.BlackRook;
            this.square[x++] = Square.BlackKnight;
            this.square[x++] = Square.BlackBishop;
            this.square[x++] = Square.BlackQueen;
            this.square[x++] = Square.BlackKing;
            this.square[x++] = Square.BlackBishop;
            this.square[x++] = Square.BlackKnight;
            this.square[x++] = Square.BlackRook;

            this.Update();
        }

        private Update():void {     // Must be called after changing the internals of the board
            // Search the board's contents for the kings.
            // Verify that exactly one White King and exactly one Black King are present
            // and store their locations.
            this.whiteKingOfs = undefined;
            this.blackKingOfs = undefined;

            for (let ofs of Board.ValidOffsetList) {
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

            if (this.IsPlayerInCheck(this.enemy)) {
                throw 'Illegal position: side not having the turn is in check.';
            }
        }

        public GetForsythEdwardsNotation(): string {
            let fen:string = '';

            /*
                http://www.thechessdrum.net/PGN_Reference.txt

                16.1.3.1: Piece placement data

                The first field represents the placement of the pieces on the board.  The board
                contents are specified starting with the eighth rank and ending with the first
                rank.  For each rank, the squares are specified from file a to file h.  White
                pieces are identified by uppercase SAN piece letters ("PNBRQK") and black
                pieces are identified by lowercase SAN piece letters ("pnbrqk").  Empty squares
                are represented by the digits one through eight; the digit used represents the
                count of contiguous empty squares along a rank.  A solidus character "/" is
                used to separate data of adjacent ranks.
            */

            for (let y:number = 7; y >= 0; --y) {
                let emptyCount:number = 0;
                for (let x:number = 0; x <= 7; ++x) {
                    let ofs:number = 21 + x + (10*y);
                    let piece:Square = this.square[ofs];
                    if (piece === Square.Empty) {
                        ++emptyCount;
                    } else {
                        if (emptyCount > 0) {
                            fen += emptyCount.toFixed();
                            emptyCount = 0;
                        }
                        fen += Utility.SidedPieceCharacter(piece);
                    }
                }
                if (emptyCount > 0) {
                    fen += emptyCount.toFixed();
                }
                if (y > 0) {
                    fen += '/';
                }
            }

            /*
                16.1.3.2: Active color

                The second field represents the active color.  A lower case "w" is used if
                White is to move; a lower case "b" is used if Black is the active player.
            */
            fen += (this.sideToMove === Side.White) ? ' w ' : ' b ';

            /*
                16.1.3.3: Castling availability

                The third field represents castling availability.  This indicates potential
                future castling that may of may not be possible at the moment due to blocking
                pieces or enemy attacks.  If there is no castling availability for either side,
                the single character symbol "-" is used.  Otherwise, a combination of from one
                to four characters are present.  If White has kingside castling availability,
                the uppercase letter "K" appears.  If White has queenside castling
                availability, the uppercase letter "Q" appears.  If Black has kingside castling
                availability, the lowercase letter "k" appears.  If Black has queenside
                castling availability, then the lowercase letter "q" appears.  Those letters
                which appear will be ordered first uppercase before lowercase and second
                kingside before queenside.  There is no white space between the letters.
            */
            let castling:number = 0;
            if (this.whiteCanCastleKingSide) {
                fen += 'K';
                ++castling;
            }

            if (this.whiteCanCastleQueenSide) {
                fen += 'Q';
                ++castling;
            }

            if (this.blackCanCastleKingSide) {
                fen += 'k';
                ++castling;
            }

            if (this.blackCanCastleQueenSide) {
                fen += 'q';
                ++castling;
            }

            if (castling === 0) {
                fen += '-';
            }

            fen += ' ';

            /*
                16.1.3.4: En passant target square

                The fourth field is the en passant target square.  If there is no en passant
                target square then the single character symbol "-" appears.  If there is an en
                passant target square then is represented by a lowercase file character
                immediately followed by a rank digit.  Obviously, the rank digit will be "3"
                following a white pawn double advance (Black is the active color) or else be
                the digit "6" after a black pawn double advance (White being the active color).

                An en passant target square is given if and only if the last move was a pawn
                advance of two squares.  Therefore, an en passant target square field may have
                a square name even if there is no pawn of the opposing side that may
                immediately execute the en passant capture.
            */
            if (this.epTarget === 0) {
                fen += '-';
            } else {
                fen += Board.Algebraic(this.epTarget);
            }

            /*
                16.1.3.5: Halfmove clock

                The fifth field is a nonnegative integer representing the halfmove clock.
                This number is the count of halfmoves (or ply) since the last pawn advance or
                capturing move.  This value is used for the fifty move draw rule.
            */
            fen += ' ' + this.numQuietPlies.toFixed() + ' ';

            /*
                16.1.3.6: Fullmove number

                The sixth and last field is a positive integer that gives the fullmove number.
                This will have the value "1" for the first move of a game for both White and
                Black.  It is incremented by one immediately after each move by Black.
            */
            fen += this.fullMoveNumber.toFixed();

            return fen;
        }

        public SetForsythEdwardsNotation(fen:string): void {
            // Example FEN:
            // 3qr2k/pbpp2pp/1p5N/3Q2b1/2P1P3/P7/1PP2PPP/R4RK1 w - - 0 1
            let field:string[] = fen.split(' ');
            if (field.length != 6) {
                throw "FEN must have 6 space-delimited fields.";
            }
            let rowArray:string[] = field[0].split('/');
            if (rowArray.length != 8) {
                throw "FEN board must have 8 slash-delimited rows.";
            }

            let newsq:Square[] = Board.MakeBoardArray();
            for (let y=0; y < 8; ++y) {
                let row:string = rowArray[7-y];    // rows are stored starting with Black's side of the board
                let x=0;
                for (let i=0; i < row.length; ++i) {
                    let repeat:number = 1;
                    let piece:Square = Square.Empty;
                    switch (row[i]) {
                        case '1':   repeat = 1;  break;
                        case '2':   repeat = 2;  break;
                        case '3':   repeat = 3;  break;
                        case '4':   repeat = 4;  break;
                        case '5':   repeat = 5;  break;
                        case '6':   repeat = 6;  break;
                        case '7':   repeat = 7;  break;
                        case '8':   repeat = 8;  break;

                        case 'p':   piece = Square.BlackPawn;       break;
                        case 'n':   piece = Square.BlackKnight;     break;
                        case 'b':   piece = Square.BlackBishop;     break;
                        case 'r':   piece = Square.BlackRook;       break;
                        case 'q':   piece = Square.BlackQueen;      break;
                        case 'k':   piece = Square.BlackKing;       break;

                        case 'P':   piece = Square.WhitePawn;       break;
                        case 'N':   piece = Square.WhiteKnight;     break;
                        case 'B':   piece = Square.WhiteBishop;     break;
                        case 'R':   piece = Square.WhiteRook;       break;
                        case 'Q':   piece = Square.WhiteQueen;      break;
                        case 'K':   piece = Square.WhiteKing;       break;

                        default:    throw 'Invalid character in FEN board';
                    }
                    while (repeat > 0) {
                        if (x > 7) {
                            throw 'Too many squares in FEN row';
                        }
                        newsq[21 + (10*y) + x] = piece;
                        ++x;
                        --repeat;
                    }
                }
                if (x !== 8) {
                    throw 'There must be exactly 8 squares on each row of the FEN.';
                }
            }

            let friend:Side;
            let enemy:Side;
            switch (field[1]) {
                case 'w':
                    friend = Side.White;
                    enemy  = Side.Black;
                    break;

                case 'b':
                    friend = Side.Black;
                    enemy  = Side.White;
                    break;

                default:
                    throw 'Side specifier must be "w" or "b" in FEN.';
            }

            // Parse castle enable flags.
            let castling = field[2];
            if (castling.length === 0 || !/-|K?Q?k?q?/.test(castling)) {
                throw 'Invalid castling specifier in FEN.';
            }
            let wk:boolean = (castling.indexOf('K') >= 0);
            let wq:boolean = (castling.indexOf('Q') >= 0);
            let bk:boolean = (castling.indexOf('k') >= 0);
            let bq:boolean = (castling.indexOf('q') >= 0);

            // Parse en passant target offset.
            let ep:number = 0;
            if (field[3] !== '-') {
                if (/[a-h][36]/.test(field[3])) {
                    ep = Board.Offset(field[3]);
                } else {
                    throw 'Invalid en passant target in FEN.';
                }
            }

            // Parse halfmove clock.
            let quietPlies = parseInt(field[4], 10);
            if (isNaN(quietPlies) || quietPlies < 0 || quietPlies > 100) {
                throw 'Invalid halfmove clock (number of quiet plies) in FEN.';
            }

            // Parse fullmove number.
            let fullMoveNumber = parseInt(field[5], 10);
            if (isNaN(fullMoveNumber) || fullMoveNumber < 1) {
                throw 'Invalid fullmove number in FEN.';
            }

            // If we get here, it means the FEN is presumed valid.
            // Mutate the board based on what we found.

            this.square = newsq;
            this.initialFen = fen;
            this.whiteCanCastleKingSide  = wk;
            this.whiteCanCastleQueenSide = wq;
            this.blackCanCastleKingSide  = bk;
            this.blackCanCastleQueenSide = bq;
            this.moveStack = [];
            this.sideToMove = friend;
            this.enemy = enemy;
            this.epTarget = ep;
            this.numQuietPlies = quietPlies;
            this.fullMoveNumber = fullMoveNumber;

            this.Update();
        }

        private static IsLegal(move:Move, legalMoveList:Move[]):boolean {
            for (let legal of legalMoveList) {
                if (move.source === legal.source && move.dest === legal.dest && move.prom === legal.prom) {
                    return true;
                }
            }
            return false;
        }

        public PgnFormat(move:Move, legalMoveList:Move[] = this.LegalMoves()): string {
            if (!Board.IsLegal(move, legalMoveList)) {
                // It is important to prevent board corruption.
                // PushMove/PopMove can leave the board in a mangled state if the move is illegal.
                throw 'Illegal move passed to PgnFormat';
            }
            let pgn:string = '';

            this.PushMove(move);
            let check:boolean = this.IsCurrentPlayerInCheck();
            let immobile:boolean = this.CurrentPlayerCanMove();
            this.PopMove();

            let dir:number = move.dest - move.source;
            let piece:NeutralPiece = Utility.Neutral[this.square[move.source]];

            if (piece === NeutralPiece.King && dir === 2 * Direction.East) {
                pgn = 'O-O';
            } else if (piece === NeutralPiece.King && dir === 2 * Direction.West) {
                pgn = 'O-O-O';
            } else {
                let pieceSymbol:string = Utility.UnsidedPieceCharacter(this.square[move.source]);
                let alg1:string = Board.AlgTable[move.source];
                let alg2:string = Board.AlgTable[move.dest];
                let file1:string = alg1.charAt(0);
                let rank1:string = alg1.charAt(1);
                let file2:string = alg2.charAt(0);
                let capture:NeutralPiece = Utility.Neutral[this.square[move.dest]];
                if (piece === NeutralPiece.Pawn && file1 !== file2 && capture === NeutralPiece.Empty) {
                    // Adjust for en passant capture
                    capture = NeutralPiece.Pawn;
                }

                // Central to PGN is the concept of "ambiguous" notation.
                // We want to figure out the minimum number of characters needed
                // to unambiguously encode the chess move.
                // Create a compact list that contains only moves with the same
                // destination and moving piece.
                // Include only pawn promotions to the same promoted piece.
                let compact:Move[] = [];
                for (let cmove of legalMoveList) {
                    if ((cmove.dest === move.dest) && (cmove.prom === move.prom)) {
                        let cpiece:NeutralPiece = Utility.Neutral[this.square[cmove.source]];
                        if (cpiece === piece) {
                            compact.push(cmove);
                        }
                    }
                }

                // compact now contains moves to same dest by same piece (with same promotion if promotion)
                if (compact.length === 0) {
                    throw 'PGN compactor found 0 moves';    // should have been caught by legal move check above!
                }

                let needSourceFile:boolean = false;
                let needSourceRank:boolean = false;
                if (compact.length > 1) {
                    /*
                        [The following is quoted from http://www.very-best.de/pgn-spec.htm, section 8.2.3.]

                        In the case of ambiguities (multiple pieces of the same type moving to the same square),
                        the first appropriate disambiguating step of the three following steps is taken:

                        First, if the moving pieces can be distinguished by their originating files,
                        the originating file letter of the moving piece is inserted immediately after
                        the moving piece letter.

                        Second (when the first step fails), if the moving pieces can be distinguished by
                        their originating ranks, the originating rank digit of the moving piece is inserted
                        immediately after the moving piece letter.

                        Third (when both the first and the second steps fail), the two character square
                        coordinate of the originating square of the moving piece is inserted immediately
                        after the moving piece letter.
                    */
                    let fileCount:number = 0;
                    let rankCount:number = 0;
                    for (let cmove of compact) {
                        let calg:string = Board.Algebraic(cmove.source);
                        let cfile:string = calg.charAt(0);
                        let crank:string = calg.charAt(1);
                        if (cfile === file1) {
                            ++fileCount;
                        }
                        if (crank === rank1) {
                            ++rankCount;
                        }
                    }

                    if (fileCount === 1) {
                        needSourceFile = true;
                    } else {
                        needSourceRank = true;
                        if (rankCount > 1) {
                            needSourceFile = true;
                        }
                    }
                }

                if (piece === NeutralPiece.Pawn) {
                    // A piece designator is never used for pawns.
                    // For example, a pawn moving from e2 to e4 is represented as "e4".
                    if (capture != NeutralPiece.Empty) {
                        // When a pawn makes a capture, include its original file letter before the 'x'.
                        // For example, a pawn at e4 capturing something at d5 is represented as "exd5".
                        needSourceFile = true;
                    }
                } else {
                    pgn += pieceSymbol;
                }

                if (needSourceFile) {
                    pgn += file1;
                }

                if (needSourceRank) {
                    pgn += rank1;
                }

                if (capture != NeutralPiece.Empty) {
                    pgn += 'x';
                }

                pgn += alg2;        // append the notation for the destination square
                if (move.prom != NeutralPiece.Empty) {
                    pgn += '=' + Utility.NeutralPieceCharacter(move.prom);
                }
            }

            if (check) {
                // If a move causes checkmate, put '#' at the end.
                // Otherwise, if the move merely causes check, put '+' at the end.
                pgn += immobile ? '#' : '+';
            }

            return pgn;
        }
    }

    //-------------------------------------------------------------------------------------------------------
    export class BestPath {
        public move: Move[] = [];
        public score: Score = Score.NegInf;

        public Clone(): BestPath {
            let copy:BestPath = new BestPath();
            copy.score = this.score;
            for (let m of this.move) {
                copy.move.push(m.Clone());
            }
            return copy;
        }

        public Truncate():void {
            this.move.length = 0;
        }
    }

    export class Thinker {
        public static MateSearch(board:Board, maxLimit:number): BestPath {
            // Search for a forced checkmate with the specified search limit.
            // First we must determine if the game is over, either because there
            // are no legal moves, or because of the various types of non-stalemate draws.
            let bestPath:BestPath = new BestPath();

            for (let limit=1; limit <= maxLimit; ++limit) {
                // FIXFIXFIX: omit moves that lead to forced loss from further consideration.
                bestPath.score = Thinker.InternalMateSearch(board, limit, 0, bestPath, Score.NegInf, Score.PosInf);
                if (bestPath.score >= Score.ForcedWin) {
                    break;
                }
            }

            return bestPath;
        }

        private static InternalMateSearch(board:Board,
                                          limit:number,
                                          depth:number,
                                          bestPath:BestPath,
                                          alpha:Score,
                                          beta:Score): Score {
            bestPath.Truncate();

            if (depth >= limit) {
                // Recursion cutoff: quickly determine game result and return corresponding score.
                if (board.IsCurrentPlayerInCheck() && !board.CurrentPlayerCanMove()) {
                    // See notes below about postponement adjustment.
                    return Score.CheckmateLoss + depth;
                }
                return Score.Draw;
            }

            let legal:Move[] = board.LegalMoves();
            if (legal.length === 0) {
                // Either checkmate or stalemate, depending on whether the current player is in check.
                // Postponement adjustment:
                // Losing by checkmate is "better" the further it happens in the future.
                // This motivates avoiding being checkmated as long as possible,
                // and it also motivates checkmating the opponent as soon as possible.
                // Without this adjustment, the Thinker might indefinitely postpone a forced win!
                return board.IsCurrentPlayerInCheck() ? (Score.CheckmateLoss + depth) : Score.Draw;
            }

            if (board.GetNonStalemateDrawType() !== null) {
                // There are legal moves, but we found another type of draw like
                // threefold repetition, insufficient material, etc.
                return Score.Draw;
            }

            bestPath.score = Score.NegInf;
            let bestScore:Score = Score.NegInf;
            let currPath:BestPath = new BestPath();

            for (let move of legal) {
                board.PushMove(move);
                // Tricky: we negate the return value, flip and negate the alpha-beta window.
                // This is a "negamax" search -- whatever is good for one player is bad for the other.
                let score:Score = -Thinker.InternalMateSearch(board, limit, 1+depth, currPath, -beta, -alpha);
                board.PopMove();

                if (score > bestScore) {
                    bestScore = score;
                    bestPath.score = score;
                    bestPath.move.length = 0;
                    if (score >= beta) {
                        // PRUNE: opponent has better choices than the move that led to this position.
                        break;
                    }
                    bestPath.move.push(move);
                    for (let futureMove of currPath.move) {
                        bestPath.move.push(futureMove);
                    }
                }

                if (score > alpha) {
                    alpha = score;
                }
            }

            return bestScore;
        }
    }
}
