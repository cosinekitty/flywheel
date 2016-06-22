module FwDemo {
    'use strict';

    enum MoveStateType {
        OpponentTurn,   // not user's turn (computer's turn)
        SelectSource,
        SelectDest,
        GameOver
        // may need another state for promotion
    };

    enum PlayStopStateType {    // what icon should we show for the play/pause/stop button?
        Play,
        Stop,
        Pause
    };

    var SquarePixels:number = 70;
    var TheBoard:Flywheel.Board = new Flywheel.Board();
    var RotateFlag:boolean = false;
    var MoveState:MoveStateType = MoveStateType.SelectSource;
    var SourceSquareInfo;
    var BgDark = '#8FA679';
    var BgPale = '#D4CEA3';
    var PrevTurnEnabled:boolean = false;
    var NextTurnEnabled:boolean = false;
    var PlayStopEnabled:boolean = false;
    var PlayStopState:PlayStopStateType = PlayStopStateType.Play;

    // The chess board stores the history, but we need to be able to redo
    // moves that have been undone.
    var GameHistory:Flywheel.Move[] = [];
    var GameHistoryIndex:number = 0;

    function TriStateDir(enabled:boolean, hover:boolean):string {
        if (enabled) {
            return hover ? 'shadow2' : 'shadow1';
        }
        return 'shadow0';
    }

    function PrevButtonImage(hover:boolean):string {
        return TriStateDir(PrevTurnEnabled, hover) + '/media-step-backward-4x.png';
    }

    function NextButtonImage(hover:boolean):string {
        return TriStateDir(NextTurnEnabled, hover) + '/media-step-forward-4x.png';
    }

    function PlayStopImage(hover:boolean):string {
        // Figure out which kind of image to show: play, pause, stop.
        let fn:string;
        switch (PlayStopState) {
            case PlayStopStateType.Play:
                fn = 'media-play-4x.png';
                break;

            case PlayStopStateType.Stop:
                fn = 'media-stop-4x.png';
                break;

            case PlayStopStateType.Pause:
            default:
                fn = 'media-pause-4x.png';
                break;
        }

        // Figure out whether to show disabled, normal, or highlighted version.
        return TriStateDir(PlayStopEnabled, hover) + '/' + fn;
    }

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

        let mediaGroupDx = -15;
        let mediaHorSpacing = 60;

        let html = '<img id="RotateButton" src="shadow1/loop-circular-8x.png" alt="Rotate board" style="position:absolute; width:76px; height:64px; top:'+
            (SquarePixels*8 +45) + 'px; left: 1px;" title="Rotate board">\n';

        html += '<img id="PrevTurnButton" src="' + PrevButtonImage(false) + '" style="position:absolute; width:44px; height:44px; top:' +
            (SquarePixels*8 + 55) + 'px; left:' + (SquarePixels*4 - mediaHorSpacing + mediaGroupDx) + 'px;" title="Previous turn">\n';

        html += '<img id="PlayPauseStopButton" src="' + PlayStopImage(false) + '" style="position:absolute; width:44px; height:44px; top:' +
            (SquarePixels*8 + 55) + 'px; left:' + (SquarePixels*4 + 3 + mediaGroupDx) + 'px;" title="">\n';

        html += '<img id="NextTurnButton" src="' + NextButtonImage(false) + '" style="position:absolute; width:44px; height:44px; top:' +
            (SquarePixels*8 + 55) + 'px; left:' + (SquarePixels*4 + mediaHorSpacing + mediaGroupDx) + 'px;" title="Next turn">\n';

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
        document.getElementById('DivBoard').innerHTML = html;
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
            selector: 'Square_' + screenX.toFixed() + screenY.toFixed()
        };
    }

    function MoveCoords(move:Flywheel.Move) {
        let sourceAlg = Flywheel.Board.Algebraic(move.source);
        let destAlg   = Flywheel.Board.Algebraic(move.dest);
        return { source:AlgCoords(sourceAlg), dest:AlgCoords(destAlg) };
    }

    function ForEachSquareDiv(visitor: (elem:HTMLElement) => void):void {
        for (var x=0; x < 8; ++x) {
            for (var y=0; y < 8; ++y) {
                var id = 'Square_' + x.toFixed() + y.toFixed();
                var elem = document.getElementById(id);
                visitor(elem);
            }
        }
    }

    function ClassList(elem:HTMLElement):string[] {
        if (elem.className) {
            return elem.className.split(/\s+/g);
        }
        return [];
    }

    function RemoveClass(elem:HTMLElement, classname:string):HTMLElement {
        //if (elem.classList && elem.classList.remove) {
        //    elem.classList.remove(classname);
        //} else {
            var classlist = ClassList(elem);
            var updated = [];
            var found = false;
            for (var cn of classlist) {
                if (cn === classname) {
                    found = true;
                } else {
                    updated.push(cn);
                }
            }
            if (found) {
                elem.className = updated.join(' ');
            }
        //}
        return elem;
    }

    function AddClass(elem:HTMLElement, classname:string):HTMLElement {
        //if (elem.classList && elem.classList.add) {
        //    elem.classList.add(classname);
        //} else {
            var classlist = ClassList(elem);
            var found = false;
            for (var cn of classlist) {
                if (cn === classname) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                classlist.push(classname);
                elem.className = classlist.join(' ');
            }
        //}
        return elem;
    }

    function HasClass(elem:HTMLElement, classname:string):boolean {
        for (var cn of ClassList(elem)) {
            if (cn === classname) {
                return true;
            }
        }
        return false;
    }

    function SetMoveState(state:MoveStateType, sourceInfo?) {
        SourceSquareInfo = sourceInfo;
        MoveState = state;

        // Make all squares unselectable.
        ForEachSquareDiv((div) => RemoveClass(div, 'UserCanSelect'));

        let legal:Flywheel.Move[] = TheBoard.LegalMoves();
        if (state === MoveStateType.SelectSource) {
            // Mark all squares that contain a piece the user can move with 'UserCanSelect' class.
            for (let move of legal) {
                let coords = MoveCoords(move);
                let div = document.getElementById(coords.source.selector);
                AddClass(div, 'UserCanSelect');
            }
        } else if (state == MoveStateType.SelectDest) {
            for (let move of legal) {
                let coords = MoveCoords(move);
                if (coords.source.selector === SourceSquareInfo.selector) {
                    let div = document.getElementById(coords.dest.selector);
                    AddClass(div, 'UserCanSelect');
                }
            }
        }
    }

    function DrawBoard(board:Flywheel.Board):void {
        for (let y=0; y < 8; ++y) {
            let ry = RotateFlag ? (7 - y) : y;
            document.getElementById('RankLabel_' + ry.toFixed()).textContent = ('87654321'.charAt(y));
            document.getElementById('FileLabel_' + ry.toFixed()).textContent = ('abcdefgh'.charAt(y));
            for (let x=0; x < 8; ++x) {
                let rx = RotateFlag ? (7 - x) : x;
                let sq:Flywheel.Square = board.GetSquareByCoords(x, y);
                let sdiv = document.getElementById('Square_' + rx.toString() + ry.toString());
                sdiv.innerHTML = MakeImageHtml(sq);
            }
        }

        PrevTurnEnabled = board.CanPopMove();
        NextTurnEnabled = (GameHistoryIndex < GameHistory.length);

        document.getElementById('PrevTurnButton').setAttribute('src', PrevButtonImage(false));
        document.getElementById('NextTurnButton').setAttribute('src', NextButtonImage(false));
        document.getElementById('PlayPauseStopButton').setAttribute('src', PlayStopImage(false));
    }

    function BoardCoords(e) {
        let boardDiv = document.getElementById('DivBoard');
        let screenX:number = Math.floor((e.pageX - boardDiv.offsetLeft) / SquarePixels);
        let screenY:number = Math.floor(8.0 - ((e.pageY - boardDiv.offsetTop)  / SquarePixels));
        let chessX:number = RotateFlag ? (7-screenX) : screenX;
        let chessY:number = RotateFlag ? (7-screenY) : screenY;

        if (chessX < 0 || chessX > 7 || chessY < 0 || chessY > 7) {
            return null;    // outside the board
        }

        let selector:string = 'Square_' + screenX.toFixed() + screenY.toFixed();

        return {
            screenX: screenX,   // cartesian square coordinates as seen on the screen
            screenY: screenY,

            chessX: chessX,     // chess board coordinates from White's point of view (includes rotation)
            chessY: chessY,

            pageX: e.pageX,     // original mouse coordinates
            pageY: e.pageY,

            selector: selector,
            squareDiv: document.getElementById(selector),
        };
    }

    function OnSquareHoverIn() {
        if (HasClass(this, 'UserCanSelect')) {
            AddClass(this, 'ChessSquareHover');
        }
    }

    function OnSquareHoverOut() {
        RemoveClass(this, 'ChessSquareHover');
    }


    function OnSquareMouseDown(e) {
        if (e.which === 1) {        // primary mouse button
            let bc = BoardCoords(e);
            if (bc) {
                if (MoveState === MoveStateType.SelectSource) {
                    if (HasClass(bc.squareDiv, 'UserCanSelect')) {
                        SetMoveState(MoveStateType.SelectDest, bc);
                    }
                }
            }
        }
    }

    function OnSquareMouseUp(e) {
        if (e.which === 1) {        // primary mouse button
            let bc = BoardCoords(e);
            if (bc) {
                if (MoveState === MoveStateType.SelectDest) {
                    // Support two styles of moving chess pieces:
                    // 1. Dragging pieces from source square to target square.
                    // 2. Clicking on source square, then clicking on target square.
                    // If the mouse lifts up in the same square as it went down,
                    // and the mouse has never left that square, treat it as style #2.
                    if (SourceSquareInfo.selector === bc.selector) {
                        return;     // remain in SelectDest state
                    }

                    // Find matching (source,dest) pair in legal move list, make move on board, redraw board.
                    let legal:Flywheel.Move[] = TheBoard.LegalMoves();
                    let chosenMove:Flywheel.Move = null;
                    for (let move of legal) {
                        let coords = MoveCoords(move);
                        if (coords.dest.selector === bc.selector) {
                            if (coords.source.selector === SourceSquareInfo.selector) {
                                // !!! FIXFIXFIX - check for pawn promotion, prompt for promotion piece (make a list of such moves?)
                                chosenMove = move;
                            }
                        }
                    }

                    if (chosenMove) {
                        TheBoard.PushMove(chosenMove);
                        if ((GameHistoryIndex < GameHistory.length) && chosenMove.Equals(GameHistory[GameHistoryIndex])) {
                            // Special case: treat this move as a redo, so don't disrupt the history.
                            ++GameHistoryIndex;
                        } else {
                            GameHistory = TheBoard.MoveHistory();
                            GameHistoryIndex = GameHistory.length;
                        }
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
                }
            }
        }
    }

    function InitControls() {
        var boardDiv = document.getElementById('DivBoard');
        boardDiv.onmousedown = OnSquareMouseDown;
        boardDiv.onmouseup = OnSquareMouseUp;

        for (let x=0; x < 8; ++x) {
            for (let y=0; y < 8; ++y) {
                let sq = document.getElementById('Square_' + x.toFixed() + y.toFixed());
                sq.onmouseover = OnSquareHoverIn;
                sq.onmouseout = OnSquareHoverOut;
            }
        }

        var rotateButton = document.getElementById('RotateButton');
        rotateButton.onclick = function(){
            RotateFlag = !RotateFlag;
            DrawBoard(TheBoard);
            SetMoveState(MoveStateType.SelectSource);   // refresh clickable squares after rotation, and start move over (too complicated otherwise)
        };

        rotateButton.onmouseover = function(){
            rotateButton.setAttribute('src', 'shadow2/loop-circular-8x.png');
        };

        rotateButton.onmouseout = function(){
            rotateButton.setAttribute('src', 'shadow1/loop-circular-8x.png');
        };

        var prevTurnButton = document.getElementById('PrevTurnButton');
        prevTurnButton.onclick = function(){
            // click
            if (PrevTurnEnabled) {
                // TODO: Cancel any computer analysis here.
                TheBoard.PopMove();
                --GameHistoryIndex;
                DrawBoard(TheBoard);
                SetMoveState(MoveStateType.SelectSource);
            }
        };

        prevTurnButton.onmouseover = function(){
            prevTurnButton.setAttribute('src', PrevButtonImage(true));
        };

        prevTurnButton.onmouseout = function(){
            prevTurnButton.setAttribute('src', PrevButtonImage(false));
        };

        var nextTurnButton = document.getElementById('NextTurnButton');
        nextTurnButton.onclick = function(){
            // click
            if (NextTurnEnabled) {
                TheBoard.PushMove(GameHistory[GameHistoryIndex++]);
                DrawBoard(TheBoard);
                SetMoveState(MoveStateType.SelectSource);
            }
        };

        nextTurnButton.onmouseover = function(){
            nextTurnButton.setAttribute('src', NextButtonImage(true));
        };

        nextTurnButton.onmouseout = function(){
            nextTurnButton.setAttribute('src', NextButtonImage(false));
        };

        var playPauseStopButton = document.getElementById('PlayPauseStopButton');
        playPauseStopButton.onclick = function(){
            if (PlayStopEnabled) {
                // TODO: add code here to initiate AI thinking about the position.
            }
        };

        playPauseStopButton.onmouseover = function(){
            playPauseStopButton.setAttribute('src', PlayStopImage(true));
        };

        playPauseStopButton.onmouseout = function(){
            playPauseStopButton.setAttribute('src', PlayStopImage(false));
        };
    }

    export function InitPage() {
        InitBoardDisplay();
        DrawBoard(TheBoard);
        InitControls();
        SetMoveState(MoveStateType.SelectSource);
    }
}

window.onload = FwDemo.InitPage;
