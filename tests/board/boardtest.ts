module FlyBoardTest {
    export class Test {
        public static Run(): void {
            // Construct a chess board object.
            let boardInitText = window.document.getElementById('BoardInitText');
            boardInitText.innerText = 'running';
            let board:Flywheel.Board = new Flywheel.Board();
            if (board.IsWhiteToMove() !== true) {
                boardInitText.innerText = 'FAILURE: IsWhiteToMove did not return true.';
                return;
            }
            if (board.IsBlackToMove() !== false) {
                boardInitText.innerText = 'FAILURE: IsBlackToMove did not return false.';
                return;
            }
            boardInitText.innerText = 'OK';

            // Verify we can read the correct contents of each square.
            var boardContentsText = window.document.getElementById('BoardContentsText');
            boardContentsText.innerText = 'running';
            let contents = {
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

            let numSquaresChecked:number = 0;
            for (let alg in contents) {
                let checkSquare:Flywheel.Square = contents[alg];
                let testSquare:Flywheel.Square = board.GetSquare(alg);
                if (checkSquare != testSquare) {
                    boardContentsText.innerText = 'FAILURE: Expected ' + Flywheel.Square[checkSquare] + ' in ' + alg + ' but found ' + Flywheel.Square[testSquare];
                    return;
                }
                ++numSquaresChecked;
            }
            boardContentsText.innerText = 'OK: checked ' + numSquaresChecked + ' squares.';
        }
    }
}
