/// <reference path="../../src/flywheel.ts"/>
/// <reference path="game001.ts"/>
/// <reference path="game002.ts"/>
/// <reference path="game003.ts"/>
/// <reference path="game004.ts"/>
var FlyBoardTest;
(function (FlyBoardTest) {
    var Test = (function () {
        function Test() {
        }
        Test.Run = function () {
            var summary = window.document.getElementById('TestSummaryText');
            summary.innerText = 'FAILURE';
            summary.className = 'TestSummary FailedTest';
            var board = Test.InitBoard();
            board.SetDebugMode(true);
            if (!board)
                return;
            if (!Test.CheckInitBoardContents(board))
                return;
            if (!Test.TestInitLegalMoves(board))
                return;
            if (!Test.Castling(board))
                return;
            if (!Test.FenTest())
                return;
            if (!Test.GameTests(board))
                return;
            summary.innerText = 'All tests passed.';
            summary.className = 'TestSummary PassedTest';
        };
        Test.FenTest = function () {
            var span = window.document.getElementById('SetFenText');
            var board = new Flywheel.Board();
            var fenlist = [
                '3qr2k/pbpp2pp/1p5N/3Q2b1/2P1P3/P7/1PP2PPP/R4RK1 w - - 0 1'
            ];
            for (var _i = 0; _i < fenlist.length; _i++) {
                var fen = fenlist[_i];
                board.SetForsythEdwardsNotation(fen);
                var check = board.GetForsythEdwardsNotation();
                if (check !== fen) {
                    span.innerText = 'Set FEN to "' + fen + '", but got back "' + check + '"';
                    return false;
                }
            }
            span.innerText = 'OK: checked ' + fenlist.length + ' FEN strings.';
            span.className = 'PassedTest';
            return true;
        };
        Test.InitBoard = function () {
            // Construct a chess board object.
            var span = window.document.getElementById('BoardInitText');
            span.className = 'FailedTest';
            span.innerText = 'running';
            var board = new Flywheel.Board();
            if (board.IsWhiteToMove() !== true) {
                span.innerText = 'FAILURE: IsWhiteToMove did not return true.';
                return null;
            }
            if (board.IsBlackToMove() !== false) {
                span.innerText = 'FAILURE: IsBlackToMove did not return false.';
                return null;
            }
            span.innerText = 'OK: ' + board.GetHash();
            span.className = 'PassedTest';
            return board;
        };
        Test.CheckInitBoardContents = function (board) {
            // Verify we can read the correct contents of each square.
            var span = window.document.getElementById('BoardContentsText');
            span.className = 'FailedTest';
            span.innerText = 'running';
            var contents = {
                'a1': Flywheel.Square.WhiteRook,
                'b1': Flywheel.Square.WhiteKnight,
                'c1': Flywheel.Square.WhiteBishop,
                'd1': Flywheel.Square.WhiteQueen,
                'e1': Flywheel.Square.WhiteKing,
                'f1': Flywheel.Square.WhiteBishop,
                'g1': Flywheel.Square.WhiteKnight,
                'h1': Flywheel.Square.WhiteRook,
                'a2': Flywheel.Square.WhitePawn,
                'b2': Flywheel.Square.WhitePawn,
                'c2': Flywheel.Square.WhitePawn,
                'd2': Flywheel.Square.WhitePawn,
                'e2': Flywheel.Square.WhitePawn,
                'f2': Flywheel.Square.WhitePawn,
                'g2': Flywheel.Square.WhitePawn,
                'h2': Flywheel.Square.WhitePawn,
                'a3': Flywheel.Square.Empty,
                'b3': Flywheel.Square.Empty,
                'c3': Flywheel.Square.Empty,
                'd3': Flywheel.Square.Empty,
                'e3': Flywheel.Square.Empty,
                'f3': Flywheel.Square.Empty,
                'g3': Flywheel.Square.Empty,
                'h3': Flywheel.Square.Empty,
                'a4': Flywheel.Square.Empty,
                'b4': Flywheel.Square.Empty,
                'c4': Flywheel.Square.Empty,
                'd4': Flywheel.Square.Empty,
                'e4': Flywheel.Square.Empty,
                'f4': Flywheel.Square.Empty,
                'g4': Flywheel.Square.Empty,
                'h4': Flywheel.Square.Empty,
                'a5': Flywheel.Square.Empty,
                'b5': Flywheel.Square.Empty,
                'c5': Flywheel.Square.Empty,
                'd5': Flywheel.Square.Empty,
                'e5': Flywheel.Square.Empty,
                'f5': Flywheel.Square.Empty,
                'g5': Flywheel.Square.Empty,
                'h5': Flywheel.Square.Empty,
                'a6': Flywheel.Square.Empty,
                'b6': Flywheel.Square.Empty,
                'c6': Flywheel.Square.Empty,
                'd6': Flywheel.Square.Empty,
                'e6': Flywheel.Square.Empty,
                'f6': Flywheel.Square.Empty,
                'g6': Flywheel.Square.Empty,
                'h6': Flywheel.Square.Empty,
                'a7': Flywheel.Square.BlackPawn,
                'b7': Flywheel.Square.BlackPawn,
                'c7': Flywheel.Square.BlackPawn,
                'd7': Flywheel.Square.BlackPawn,
                'e7': Flywheel.Square.BlackPawn,
                'f7': Flywheel.Square.BlackPawn,
                'g7': Flywheel.Square.BlackPawn,
                'h7': Flywheel.Square.BlackPawn,
                'a8': Flywheel.Square.BlackRook,
                'b8': Flywheel.Square.BlackKnight,
                'c8': Flywheel.Square.BlackBishop,
                'd8': Flywheel.Square.BlackQueen,
                'e8': Flywheel.Square.BlackKing,
                'f8': Flywheel.Square.BlackBishop,
                'g8': Flywheel.Square.BlackKnight,
                'h8': Flywheel.Square.BlackRook,
            };
            var numSquaresChecked = 0;
            for (var alg in contents) {
                var checkSquare = contents[alg];
                var testSquare = board.GetSquare(alg);
                if (checkSquare != testSquare) {
                    span.innerText = 'FAILURE: Expected ' + Flywheel.Square[checkSquare] + ' in ' + alg + ' but found ' + Flywheel.Square[testSquare];
                    return false;
                }
                ++numSquaresChecked;
            }
            span.innerText = 'OK: checked ' + numSquaresChecked + ' squares.';
            span.className = 'PassedTest';
            return true;
        };
        Test.TestInitLegalMoves = function (board) {
            var span = window.document.getElementById('BoardInitLegal');
            span.className = 'FailedTest'; // assume failure or crash, unless everything works
            var movelist = board.LegalMoves();
            var correctMoves = {
                'a2a3': 1, 'a2a4': 1, 'b2b3': 1, 'b2b4': 1, 'c2c3': 1, 'c2c4': 1, 'd2d3': 1, 'd2d4': 1,
                'e2e3': 1, 'e2e4': 1, 'f2f3': 1, 'f2f4': 1, 'g2g3': 1, 'g2g4': 1, 'h2h3': 1, 'h2h4': 1,
                'b1a3': 1, 'b1c3': 1, 'g1f3': 1, 'g1h3': 1
            };
            var generatedMoves = {};
            for (var i = 0; i < movelist.length; ++i) {
                var alg = movelist[i].toString();
                if (!correctMoves[alg]) {
                    span.innerText = 'FAILURE: extraneous move ' + alg;
                    return false;
                }
                generatedMoves[alg] = 1;
            }
            for (var alg in correctMoves) {
                if (!generatedMoves[alg]) {
                    span.innerText = 'FAILURE: missing move ' + alg;
                    return false;
                }
            }
            span.innerText = 'OK: verified ' + movelist.length + ' moves.';
            span.className = 'PassedTest';
            return true;
        };
        Test.Castling = function (board) {
            var span = window.document.getElementById('CastlingText');
            span.className = 'FailedTest';
            var fen1 = board.GetForsythEdwardsNotation();
            if (fen1 !== 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') {
                span.innerText = 'Incorrect starting FEN: ' + fen1;
                return false;
            }
            board.PushNotation('e2e4'); // 1. e4
            board.PushNotation('e7e5'); //          e5
            board.PushNotation('g1f3'); // 2. Nf3
            board.PushNotation('b8c6'); //          Nc6
            board.PushNotation('f1b5'); // 3. Bb5
            board.PushNotation('g8f6'); //          Nf6
            board.PushNotation('O-O'); // 4. O-O
            var fen2 = board.GetForsythEdwardsNotation();
            if (fen2 !== 'r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4') {
                span.innerText = 'Incorrect post-castling FEN: ' + fen2;
                return false;
            }
            var algHistory = board.AlgHistory();
            if (algHistory != 'e2e4 e7e5 g1f3 b8c6 f1b5 g8f6 e1g1') {
                span.innerText = 'Incorrect algebraic game history: ' + algHistory;
                return false;
            }
            var pgnHistory = board.PgnHistory();
            if (pgnHistory != 'e4 e5 Nf3 Nc6 Bb5 Nf6 O-O') {
                span.innerText = 'Incorrect PGN game history: ' + pgnHistory;
                return false;
            }
            // Verify board cloner:
            var copy = board.Clone();
            var copyHistory = copy.PgnHistory();
            if (copyHistory !== pgnHistory) {
                span.innerText = 'Cloned board PGN history does not match original history: ' + copyHistory;
                return false;
            }
            span.innerText = 'OK';
            span.className = 'PassedTest';
            return true;
        };
        Test.FindMissingMove = function (legal1, legal2) {
            for (var _i = 0; _i < legal2.length; _i++) {
                var notation2 = legal2[_i];
                var found = false;
                for (var _a = 0; _a < legal1.length; _a++) {
                    var notation1 = legal1[_a];
                    if (notation1 === notation2) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    return notation2;
                }
            }
            return null;
        };
        Test.VerifyLegalMoves = function (board, span, legal) {
            var fen1 = board.GetForsythEdwardsNotation();
            var calcMoves = board.LegalMoves();
            var fen2 = board.GetForsythEdwardsNotation();
            if (fen1 !== fen2) {
                span.innerText = '(Step ' + Test.StepCount + ') Board corruption: before=[' + fen1 + '], after=[' + fen2 + ']';
                return false;
            }
            var calcLegal = [];
            for (var _i = 0; _i < calcMoves.length; _i++) {
                var move = calcMoves[_i];
                calcLegal.push(move.toString());
            }
            var missing = Test.FindMissingMove(calcLegal, legal);
            if (missing) {
                span.innerText = '(Step ' + Test.StepCount + ') Missing legal move ' + missing + ' in position ' + board.GetForsythEdwardsNotation();
                return false;
            }
            missing = Test.FindMissingMove(legal, calcLegal);
            if (missing) {
                span.innerText = '(Step ' + Test.StepCount + ') Extraneous legal move: ' + missing + ' in position ' + board.GetForsythEdwardsNotation();
                return false;
            }
            return true;
        };
        Test.TestGame = function (board, span, game) {
            for (var _i = 0; _i < game.length; _i++) {
                var turn = game[_i];
                if (turn.reset) {
                    board.Reset();
                }
                ++Test.StepCount; // Handy for setting conditional breakpoints to debug particular problems.
                // Verify that we agree with Chenard on the list of legal moves.
                if (!Test.VerifyLegalMoves(board, span, turn.legal))
                    return false;
                // move, fen, check, mobile, draw, legal
                board.PushNotation(turn.move);
                var calcfen = board.GetForsythEdwardsNotation();
                if (calcfen !== turn.fen) {
                    span.innerText = 'FEN mismatch: "' + calcfen + '" != "' + turn.fen + '"';
                    return false;
                }
                var check = board.IsCurrentPlayerInCheck();
                if (check !== turn.check) {
                    span.innerText = 'Calc check=' + check + ', but turn.check=' + turn.check;
                    return false;
                }
                var mobile = board.CurrentPlayerCanMove();
                if (mobile !== turn.mobile) {
                    span.innerText = 'Calc mobile=' + mobile + ', but turn.mobile=' + turn.mobile;
                    return false;
                }
            }
            return true;
        };
        Test.GameTests = function (board) {
            var span = window.document.getElementById('GameText');
            if (!Test.TestGame(board, span, game001))
                return false;
            if (!Test.TestGame(board, span, game002))
                return false;
            if (!Test.TestGame(board, span, game003))
                return false;
            if (!Test.TestGame(board, span, game004))
                return false;
            span.innerText = 'OK: checked ' + Test.StepCount.toFixed() + ' turns.';
            span.className = 'PassedTest';
            return true;
        };
        Test.StepCount = 0;
        return Test;
    })();
    FlyBoardTest.Test = Test;
})(FlyBoardTest || (FlyBoardTest = {}));
//# sourceMappingURL=boardtest.js.map