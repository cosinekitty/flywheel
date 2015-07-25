/// <reference path="../src/flywheel.ts"/>

module FwDemo {
    enum MoveStateType {
        OpponentTurn,   // not user's turn (computer's turn)
        SelectSource,
        SelectDest,
        GameOver
        // may need another state for promotion
    };

    var SquarePixels:number = 70;
    var TheBoard:Flywheel.Board = new Flywheel.Board();
    var RotateFlag:boolean = false;
    var MoveState:MoveStateType = MoveStateType.SelectSource;
    var SourceSquareSelector:string = null;
    var BgDark = '#8FA679';
    var BgPale = '#D4CEA3';

    function MakeImageHtml(s:Flywheel.Square):string {
        let fn:string;
        switch (s) {
            case Flywheel.Square.WhitePawn:     fn = 'wp';  break;
            case Flywheel.Square.WhiteKnight:   fn = 'wn';  break;
            case Flywheel.Square.WhiteBishop:   fn = 'wb';  break;
            case Flywheel.Square.WhiteRook:     fn = 'wr';  break;
            case Flywheel.Square.WhiteQueen:    fn = 'wq';  break;
            case Flywheel.Square.WhiteKing:     fn = 'wk';  break;

            case Flywheel.Square.BlackPawn:     fn = 'bp';  break;
            case Flywheel.Square.BlackKnight:   fn = 'bn';  break;
            case Flywheel.Square.BlackBishop:   fn = 'bb';  break;
            case Flywheel.Square.BlackRook:     fn = 'br';  break;
            case Flywheel.Square.BlackQueen:    fn = 'bq';  break;
            case Flywheel.Square.BlackKing:     fn = 'bk';  break;

            default:
                return '';
        }

        fn = '../pieces/merida/png/' + fn + '.png';
        return '<img src="' + fn + '" width="' + SquarePixels + '" height="' + SquarePixels + '">';
    }

    function MakeFileLabel(x:number): string {
        return '<div class="RankFileText" id="FileLabel_' + x.toFixed() + '"' +
            ' style="position: absolute; top: ' + (SquarePixels*8 + 8).toFixed() + 'px; ' +
            ' left: ' + (SquarePixels*x + (SquarePixels >> 1) - 4).toFixed() + 'px; ">x</div>';
    }

    function MakeRankLabel(y:number): string {
        return '<div class="RankFileText" id="RankLabel_' + y.toFixed() + '"' +
            ' style="position: absolute; left:-20px; top:' +
            (SquarePixels*y + (SquarePixels >> 1) - 7).toFixed() + 'px;' +
            '">y</div>';
    }

    function MakeImageContainer(x:number, y:number) {
        return '<div id="Square_' + x.toString() + y.toString() + '"' +
            ' class="ChessSquare"' +
            ' style="position:absolute; left:' +
            (SquarePixels * x).toFixed() + 'px; top:' +
            (SquarePixels * (7 - y)).toFixed() + 'px;' +
            ' background-color: ' + (((x+y)&1) ? BgPale : BgDark) + '; ' +
            ' width: ' + SquarePixels + 'px; ' +
            ' height: ' + SquarePixels + 'px; ' +
            '"></div>';
    }

    function InitBoardDisplay():void {
        var x, y;
        let html = '<img id="RotateButton" src="shadow1/loop-circular-8x.png" alt="Rotate board" style="position:absolute; width:76px; height:64px; top:3px; left:590px;" title="Rotate board">';
        for (y=0; y < 8; ++y) {
            for (x=0; x < 8; ++x) {
                html += MakeImageContainer(x, y);
            }
        }
        for (x=0; x < 8; ++x) {
            html += MakeFileLabel(x);
        }
        for (x=0; x < 8; ++x) {
            html += MakeRankLabel(x);
        }
        $('#DivBoard').html(html);
    }

    function AlgCoords(alg:string) {
        let chessX = 'abcdefgh'.indexOf(alg.charAt(0));
        let chessY = '12345678'.indexOf(alg.charAt(1));
        let screenX = RotateFlag ? (7-chessX) : chessX;
        let screenY = RotateFlag ? (7-chessY) : chessY;

        return {
            alg: alg,
            chessX: chessX,
            chessY: chessY,
            screenX: screenX,
            screenY: screenY,
            selector: '#Square_' + screenX.toFixed() + screenY.toFixed()
        };
    }

    function MoveCoords(move:Flywheel.Move) {
        let sourceAlg = Flywheel.Board.Algebraic(move.source);
        let destAlg   = Flywheel.Board.Algebraic(move.dest);
        return { source:AlgCoords(sourceAlg), dest:AlgCoords(destAlg) };
    }

    function SetMoveState(state:MoveStateType) {
        MoveState = state;

        // Make all squares unselectable.
        $('.ChessSquare').removeClass('UserCanSelect');
        let legal:Flywheel.Move[] = TheBoard.LegalMoves();
        if (state === MoveStateType.SelectSource) {
            // Mark all squares that contain a piece the user can move with 'UserCanSelect' class.
            for (let move of legal) {
                let coords = MoveCoords(move);
                $(coords.source.selector).addClass('UserCanSelect');
            }
        } else if (state == MoveStateType.SelectDest) {
            for (let move of legal) {
                let coords = MoveCoords(move);
                $(coords.dest.selector).addClass('UserCanSelect');
            }
        }
    }

    function DrawBoard(board:Flywheel.Board):void {
        for (let y=0; y < 8; ++y) {
            let ry = RotateFlag ? (7 - y) : y;
            $('#RankLabel_' + ry.toFixed()).text('87654321'.charAt(y));
            $('#FileLabel_' + ry.toFixed()).text('abcdefgh'.charAt(y));
            for (let x=0; x < 8; ++x) {
                let rx = RotateFlag ? (7 - x) : x;
                let sq:Flywheel.Square = board.GetSquareByCoords(x, y);
                let img:string = MakeImageHtml(sq);
                let sdiv = $('#Square_' + rx.toString() + ry.toString());
                sdiv.html(img);
            }
        }
    }

    let BoardCoords = function(e) {
        let divOfs = $('#DivBoard').offset();
        let screenX:number = Math.floor((e.pageX - divOfs.left) / SquarePixels);
        let screenY:number = Math.floor(8.0 - ((e.pageY - divOfs.top)  / SquarePixels));
        let chessX:number = RotateFlag ? (7-screenX) : screenX;
        let chessY:number = RotateFlag ? (7-screenY) : screenY;

        if (chessX < 0 || chessX > 7 || chessY < 0 || chessY > 7) {
            return null;    // outside the board
        }

        return {
            screenX: screenX,   // cartesian square coordinates as seen on the screen
            screenY: screenY,

            chessX: chessX,     // chess board coordinates from White's point of view (includes rotation)
            chessY: chessY,

            selector: '#Square_' + screenX.toFixed() + screenY.toFixed()
        };
    }

    function OnSquareHoverIn() {
        if ($(this).hasClass('UserCanSelect')) {
            $(this).addClass('ChessSquareHover');
        }
    }

    function OnSquareHoverOut() {
        $(this).removeClass('ChessSquareHover');
    }

    function OnSquareClicked(e) {
        if (e.which === 1) {        // primary mouse button
            let bc = BoardCoords(e);
            if (bc) {
                if (MoveState === MoveStateType.SelectSource) {
                    if ($(this).hasClass('UserCanSelect')) {
                        // Are we selecting source square or destination square?
                        SourceSquareSelector = '#' + this.id;
                        SetMoveState(MoveStateType.SelectDest);
                    }
                } else if (MoveState === MoveStateType.SelectDest) {
                    // Find matching (source,dest) pair in legal move list, make move on board, redraw board.
                    let legal:Flywheel.Move[] = TheBoard.LegalMoves();
                    let chosenMove:Flywheel.Move = null;
                    for (let move of legal) {
                        let coords = MoveCoords(move);
                        if (coords.dest.selector === '#' + this.id) {
                            if (coords.source.selector === SourceSquareSelector) {
                                // !!! FIXFIXFIX - check for pawn promotion, prompt for promotion piece
                                chosenMove = move;
                            }
                        }
                    }

                    if (chosenMove) {
                        TheBoard.PushMove(chosenMove);
                        DrawBoard(TheBoard);
                        let result = TheBoard.GetGameResult();
                        if (result.status === Flywheel.GameStatus.InProgress) {
                            // FIXFIXFIX - check for computer opponent
                            SetMoveState(MoveStateType.SelectSource);
                        } else {
                            // Game is over!
                            SetMoveState(MoveStateType.GameOver);
                            // FIXFIXFIX - decorate the board with a result message.
                        }
                    } else {
                        // Not a valid move, so cancel the current move and start over.
                        SetMoveState(MoveStateType.SelectSource);
                    }
                } else {
                    // Move state does not allow clicking on squares
                }
            }
        }
    }

    function InitControls() {
        var boardDiv = $('#DivBoard');
        boardDiv.mousedown(function(e){
            if (e.which === 1) {    // left (primary) mouse button
                let bc = BoardCoords(e);
                if (bc) {
                    //$(bc.selector).addClass('ChessSquareShadow');
                }
            }
        });

        for (let x=0; x < 8; ++x) {
            for (let y=0; y < 8; ++y) {
                let sq = $('#Square_' + x.toFixed() + y.toFixed());
                sq.hover(OnSquareHoverIn, OnSquareHoverOut).click(OnSquareClicked);
            }
        }

        var rotateButton = $('#RotateButton');
        rotateButton.click(function(){
            RotateFlag = !RotateFlag;
            DrawBoard(TheBoard);
            SetMoveState(MoveState);    // refresh clickable squares
        }).hover(function(){
            // hover in
            rotateButton.prop('src', 'shadow2/loop-circular-8x.png');
        }, function(){
            // hover out
            rotateButton.prop('src', 'shadow1/loop-circular-8x.png');
        });
    }

    export function InitPage() {
        InitBoardDisplay();
        DrawBoard(TheBoard);
        InitControls();
        SetMoveState(MoveStateType.SelectSource);
    }
}

$(FwDemo.InitPage);
