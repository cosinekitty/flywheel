var FwDemo;
(function (FwDemo) {
    'use strict';
    var MoveStateType;
    (function (MoveStateType) {
        MoveStateType[MoveStateType["OpponentTurn"] = 0] = "OpponentTurn";
        MoveStateType[MoveStateType["SelectSource"] = 1] = "SelectSource";
        MoveStateType[MoveStateType["SelectDest"] = 2] = "SelectDest";
        MoveStateType[MoveStateType["GameOver"] = 3] = "GameOver";
    })(MoveStateType || (MoveStateType = {}));
    ;
    var PlayStopStateType;
    (function (PlayStopStateType) {
        PlayStopStateType[PlayStopStateType["Play"] = 0] = "Play";
        PlayStopStateType[PlayStopStateType["Stop"] = 1] = "Stop";
        PlayStopStateType[PlayStopStateType["Pause"] = 2] = "Pause";
    })(PlayStopStateType || (PlayStopStateType = {}));
    ;
    var SquarePixels = 70;
    var TheBoard = new Flywheel.Board();
    var RotateFlag = false;
    var MoveState = MoveStateType.SelectSource;
    var SourceSquareInfo;
    var BgDark = '#8FA679';
    var BgPale = '#D4CEA3';
    var PrevTurnEnabled = false;
    var NextTurnEnabled = false;
    var PlayStopEnabled = false;
    var PlayStopState = PlayStopStateType.Play;
    var BoardDiv;
    // The chess board stores the history, but we need to be able to redo
    // moves that have been undone.
    var GameHistory = [];
    var GameHistoryIndex = 0;
    function TriStateDir(enabled, hover) {
        if (enabled) {
            return hover ? 'shadow2' : 'shadow1';
        }
        return 'shadow0';
    }
    function PrevButtonImage(hover) {
        return TriStateDir(PrevTurnEnabled, hover) + '/media-step-backward-4x.png';
    }
    function NextButtonImage(hover) {
        return TriStateDir(NextTurnEnabled, hover) + '/media-step-forward-4x.png';
    }
    function PlayStopImage(hover) {
        // Figure out which kind of image to show: play, pause, stop.
        var fn;
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
    function MakeImageHtml(s) {
        var fn;
        switch (s) {
            case Flywheel.Square.WhitePawn:
                fn = 'wp';
                break;
            case Flywheel.Square.WhiteKnight:
                fn = 'wn';
                break;
            case Flywheel.Square.WhiteBishop:
                fn = 'wb';
                break;
            case Flywheel.Square.WhiteRook:
                fn = 'wr';
                break;
            case Flywheel.Square.WhiteQueen:
                fn = 'wq';
                break;
            case Flywheel.Square.WhiteKing:
                fn = 'wk';
                break;
            case Flywheel.Square.BlackPawn:
                fn = 'bp';
                break;
            case Flywheel.Square.BlackKnight:
                fn = 'bn';
                break;
            case Flywheel.Square.BlackBishop:
                fn = 'bb';
                break;
            case Flywheel.Square.BlackRook:
                fn = 'br';
                break;
            case Flywheel.Square.BlackQueen:
                fn = 'bq';
                break;
            case Flywheel.Square.BlackKing:
                fn = 'bk';
                break;
            default:
                return '';
        }
        fn = '../pieces/merida/png/' + fn + '.png';
        return '<img src="' + fn + '" width="' + SquarePixels + '" height="' + SquarePixels + '">';
    }
    function MakeFileLabel(x) {
        return '<div class="RankFileText" id="FileLabel_' + x.toFixed() + '"' +
            ' style="position: absolute; top: ' + (SquarePixels * 8 + 8).toFixed() + 'px; ' +
            ' left: ' + (SquarePixels * x + (SquarePixels >> 1) - 4).toFixed() + 'px; ">x</div>';
    }
    function MakeRankLabel(y) {
        return '<div class="RankFileText" id="RankLabel_' + y.toFixed() + '"' +
            ' style="position: absolute; left:-20px; top:' +
            (SquarePixels * y + (SquarePixels >> 1) - 7).toFixed() + 'px;' +
            '">y</div>';
    }
    function SquareSelector(x, y) {
        return 'Square_' + x.toFixed() + y.toFixed();
    }
    function SquareDiv(x, y) {
        return document.getElementById(SquareSelector(x, y));
    }
    function MakeImageContainer(x, y) {
        return '<div id="' + SquareSelector(x, y) + '"' +
            ' class="ChessSquare"' +
            ' style="position:absolute; left:' +
            (SquarePixels * x).toFixed() + 'px; top:' +
            (SquarePixels * (7 - y)).toFixed() + 'px;' +
            ' background-color: ' + (((x + y) & 1) ? BgPale : BgDark) + '; ' +
            ' width: ' + SquarePixels + 'px; ' +
            ' height: ' + SquarePixels + 'px; ' +
            '"></div>';
    }
    function MakeSpriteContainer() {
        return '<div id="DivMoveSprite" style="display:none; z-index:1; width:' + SquarePixels + 'px; height:' + SquarePixels + 'px; ' +
            'position:absolute; left:0px; top:' + (SquarePixels * 7).toFixed() + 'px;"></div>';
    }
    function InitBoardDisplay() {
        var x, y;
        var mediaGroupDx = -15;
        var mediaHorSpacing = 60;
        var html = '<img id="RotateButton" src="shadow1/loop-circular-8x.png" alt="Rotate board" style="position:absolute; width:76px; height:64px; top:' +
            (SquarePixels * 8 + 45) + 'px; left: 1px;" title="Rotate board">\n';
        html += '<img id="PrevTurnButton" src="' + PrevButtonImage(false) + '" style="position:absolute; width:44px; height:44px; top:' +
            (SquarePixels * 8 + 55) + 'px; left:' + (SquarePixels * 4 - mediaHorSpacing + mediaGroupDx) + 'px;" title="Previous turn">\n';
        html += '<img id="PlayPauseStopButton" src="' + PlayStopImage(false) + '" style="position:absolute; width:44px; height:44px; top:' +
            (SquarePixels * 8 + 55) + 'px; left:' + (SquarePixels * 4 + 3 + mediaGroupDx) + 'px;" title="">\n';
        html += '<img id="NextTurnButton" src="' + NextButtonImage(false) + '" style="position:absolute; width:44px; height:44px; top:' +
            (SquarePixels * 8 + 55) + 'px; left:' + (SquarePixels * 4 + mediaHorSpacing + mediaGroupDx) + 'px;" title="Next turn">\n';
        for (y = 0; y < 8; ++y) {
            for (x = 0; x < 8; ++x) {
                html += MakeImageContainer(x, y);
            }
        }
        for (x = 0; x < 8; ++x) {
            html += MakeFileLabel(x);
        }
        for (x = 0; x < 8; ++x) {
            html += MakeRankLabel(x);
        }
        html += MakeSpriteContainer();
        BoardDiv.innerHTML = html;
    }
    function AlgCoords(alg) {
        var chessX = 'abcdefgh'.indexOf(alg.charAt(0));
        var chessY = '12345678'.indexOf(alg.charAt(1));
        var screenX = RotateFlag ? (7 - chessX) : chessX;
        var screenY = RotateFlag ? (7 - chessY) : chessY;
        return {
            alg: alg,
            chessX: chessX,
            chessY: chessY,
            screenX: screenX,
            screenY: screenY,
            selector: SquareSelector(screenX, screenY),
        };
    }
    function MoveCoords(move) {
        var sourceAlg = Flywheel.Board.Algebraic(move.source);
        var destAlg = Flywheel.Board.Algebraic(move.dest);
        return { source: AlgCoords(sourceAlg), dest: AlgCoords(destAlg) };
    }
    function ForEachSquareDiv(visitor) {
        for (var x = 0; x < 8; ++x) {
            for (var y = 0; y < 8; ++y) {
                visitor(SquareDiv(x, y));
            }
        }
    }
    function ClassList(elem) {
        if (elem.className) {
            return elem.className.split(/\s+/g);
        }
        return [];
    }
    function RemoveClass(elem, classname) {
        var classlist = ClassList(elem);
        var updated = [];
        var found = false;
        for (var _i = 0, classlist_1 = classlist; _i < classlist_1.length; _i++) {
            var cn = classlist_1[_i];
            if (cn === classname) {
                found = true;
            }
            else {
                updated.push(cn);
            }
        }
        if (found) {
            elem.className = updated.join(' ');
        }
        return elem;
    }
    function AddClass(elem, classname) {
        var classlist = ClassList(elem);
        var found = false;
        for (var _i = 0, classlist_2 = classlist; _i < classlist_2.length; _i++) {
            var cn = classlist_2[_i];
            if (cn === classname) {
                found = true;
                break;
            }
        }
        if (!found) {
            classlist.push(classname);
            elem.className = classlist.join(' ');
        }
        return elem;
    }
    function HasClass(elem, classname) {
        for (var _i = 0, _a = ClassList(elem); _i < _a.length; _i++) {
            var cn = _a[_i];
            if (cn === classname) {
                return true;
            }
        }
        return false;
    }
    function BeginPieceDrag(sourceInfo) {
        var imgSource = sourceInfo.squareDiv.children[0];
        var x0 = sourceInfo.pageX;
        var y0 = sourceInfo.pageY;
        imgSource.style.display = 'none'; // hide the origin image while animating
        // Create a "sprite" image for the purposes of animation.
        // It will follow the mouse around.
        var divSprite = document.getElementById('DivMoveSprite');
        divSprite.style.left = sourceInfo.squareDiv.style.left;
        divSprite.style.top = sourceInfo.squareDiv.style.top;
        divSprite.style.display = '';
        var imgSprite = document.createElement('img');
        imgSprite.setAttribute('src', imgSource.getAttribute('src'));
        imgSprite.setAttribute('width', SquarePixels.toFixed());
        imgSprite.setAttribute('height', SquarePixels.toFixed());
        imgSprite.style.zIndex = '1';
        imgSprite.style.position = 'absolute';
        divSprite.appendChild(imgSprite);
        sourceInfo.dragged = {
            imgSource: imgSource,
            imgSprite: imgSprite,
            hasLeftSourceSquare: false,
            mouseUpOnSourceSquare: false,
        };
        var hoveredSquareDiv;
        BoardDiv.onmousemove = function (e) {
            var bc = BoardCoords(e);
            if (bc) {
                // Update the sprite location.
                var dx = e.pageX - x0;
                var dy = e.pageY - y0;
                imgSprite.style.left = dx.toFixed() + 'px';
                imgSprite.style.top = dy.toFixed() + 'px';
                // This animation interferes with receiving proper
                // mouse hover events (onmouseover, onmouseout).
                // Replicate those events here.
                if (hoveredSquareDiv !== bc.squareDiv) {
                    if (hoveredSquareDiv) {
                        RemoveClass(hoveredSquareDiv, 'ChessSquareHover');
                    }
                    if (HasClass(bc.squareDiv, 'UserCanSelect')) {
                        AddClass(bc.squareDiv, 'ChessSquareHover');
                    }
                    hoveredSquareDiv = bc.squareDiv;
                    if (!sourceInfo.dragged.hasLeftSourceSquare) {
                        if (bc.squareDiv !== sourceInfo.squareDiv) {
                            sourceInfo.dragged.hasLeftSourceSquare = true;
                        }
                    }
                }
            }
        };
    }
    function EndPieceDrag(sourceInfo) {
        BoardDiv.onmousemove = null;
        if (sourceInfo && sourceInfo.dragged) {
            sourceInfo.dragged.imgSource.style.display = ''; // unhide the origin image (it's about to be moved anyway)
        }
        var divSprite = document.getElementById('DivMoveSprite');
        divSprite.innerHTML = ''; // erase the sprite image
        divSprite.style.display = 'none';
    }
    function SetMoveState(state, sourceInfo) {
        MoveState = state;
        if (sourceInfo) {
            BeginPieceDrag(sourceInfo);
        }
        else {
            EndPieceDrag(SourceSquareInfo);
        }
        SourceSquareInfo = sourceInfo;
        // Make all squares unselectable.
        ForEachSquareDiv(function (div) { return RemoveClass(div, 'UserCanSelect'); });
        var legal = TheBoard.LegalMoves();
        if (state === MoveStateType.SelectSource) {
            // Mark all squares that contain a piece the user can move with 'UserCanSelect' class.
            for (var _i = 0, legal_1 = legal; _i < legal_1.length; _i++) {
                var move = legal_1[_i];
                var coords = MoveCoords(move);
                var div = document.getElementById(coords.source.selector);
                AddClass(div, 'UserCanSelect');
            }
        }
        else if (state == MoveStateType.SelectDest) {
            for (var _a = 0, legal_2 = legal; _a < legal_2.length; _a++) {
                var move = legal_2[_a];
                var coords = MoveCoords(move);
                if (coords.source.selector === SourceSquareInfo.selector) {
                    var div = document.getElementById(coords.dest.selector);
                    AddClass(div, 'UserCanSelect');
                }
            }
        }
    }
    function DrawBoard(board) {
        for (var y = 0; y < 8; ++y) {
            var ry = RotateFlag ? (7 - y) : y;
            document.getElementById('RankLabel_' + ry.toFixed()).textContent = ('87654321'.charAt(y));
            document.getElementById('FileLabel_' + ry.toFixed()).textContent = ('abcdefgh'.charAt(y));
            for (var x = 0; x < 8; ++x) {
                var rx = RotateFlag ? (7 - x) : x;
                var sq = board.GetSquareByCoords(x, y);
                var sdiv = SquareDiv(rx, ry);
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
        var screenX = Math.floor((e.pageX - BoardDiv.offsetLeft) / SquarePixels);
        var screenY = Math.floor(8.0 - ((e.pageY - BoardDiv.offsetTop) / SquarePixels));
        var chessX = RotateFlag ? (7 - screenX) : screenX;
        var chessY = RotateFlag ? (7 - screenY) : screenY;
        if (chessX < 0 || chessX > 7 || chessY < 0 || chessY > 7) {
            return null; // outside the board
        }
        var selector = SquareSelector(screenX, screenY);
        return {
            screenX: screenX,
            screenY: screenY,
            chessX: chessX,
            chessY: chessY,
            pageX: e.pageX,
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
        if (e.which === 1) {
            if (MoveState === MoveStateType.SelectSource) {
                var bc = BoardCoords(e);
                if (bc) {
                    if (HasClass(bc.squareDiv, 'UserCanSelect')) {
                        SetMoveState(MoveStateType.SelectDest, bc);
                    }
                }
            }
        }
    }
    function OnSquareMouseUp(e) {
        if (e.which === 1) {
            var bc = BoardCoords(e);
            if (bc) {
                if (MoveState === MoveStateType.SelectDest) {
                    // Support two styles of moving chess pieces:
                    // 1. Dragging pieces from source square to target square.
                    // 2. Clicking on source square, then clicking on target square.
                    // If the mouse lifts up in the same square as it went down,
                    // and the mouse has never left that square, treat it as style #2.
                    if (SourceSquareInfo.selector === bc.selector) {
                        if (!SourceSquareInfo.dragged.hasLeftSourceSquare && !SourceSquareInfo.dragged.mouseUpOnSourceSquare) {
                            SourceSquareInfo.dragged.mouseUpOnSourceSquare = true;
                            return; // remain in SelectDest state
                        }
                    }
                    // Find matching (source,dest) pair in legal move list, make move on board, redraw board.
                    var legal = TheBoard.LegalMoves();
                    var chosenMove = null;
                    for (var _i = 0, legal_3 = legal; _i < legal_3.length; _i++) {
                        var move = legal_3[_i];
                        var coords = MoveCoords(move);
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
                        }
                        else {
                            GameHistory = TheBoard.MoveHistory();
                            GameHistoryIndex = GameHistory.length;
                        }
                        DrawBoard(TheBoard);
                        var result = TheBoard.GetGameResult();
                        if (result.status === Flywheel.GameStatus.InProgress) {
                            // FIXFIXFIX - check for computer opponent
                            SetMoveState(MoveStateType.SelectSource);
                        }
                        else {
                            // Game is over!
                            SetMoveState(MoveStateType.GameOver);
                        }
                    }
                    else {
                        // Not a valid move, so cancel the current move and start over.
                        SetMoveState(MoveStateType.SelectSource);
                    }
                }
            }
        }
    }
    function InitControls() {
        BoardDiv.onmousedown = OnSquareMouseDown;
        BoardDiv.onmouseup = OnSquareMouseUp;
        for (var x = 0; x < 8; ++x) {
            for (var y = 0; y < 8; ++y) {
                var sq = SquareDiv(x, y);
                sq.onmouseover = OnSquareHoverIn;
                sq.onmouseout = OnSquareHoverOut;
            }
        }
        var rotateButton = document.getElementById('RotateButton');
        rotateButton.onclick = function () {
            RotateFlag = !RotateFlag;
            DrawBoard(TheBoard);
            SetMoveState(MoveStateType.SelectSource); // refresh clickable squares after rotation, and start move over (too complicated otherwise)
        };
        rotateButton.onmouseover = function () {
            rotateButton.setAttribute('src', 'shadow2/loop-circular-8x.png');
        };
        rotateButton.onmouseout = function () {
            rotateButton.setAttribute('src', 'shadow1/loop-circular-8x.png');
        };
        var prevTurnButton = document.getElementById('PrevTurnButton');
        prevTurnButton.onclick = function () {
            // click
            if (PrevTurnEnabled) {
                // TODO: Cancel any computer analysis here.
                TheBoard.PopMove();
                --GameHistoryIndex;
                DrawBoard(TheBoard);
                SetMoveState(MoveStateType.SelectSource);
            }
        };
        prevTurnButton.onmouseover = function () {
            prevTurnButton.setAttribute('src', PrevButtonImage(true));
        };
        prevTurnButton.onmouseout = function () {
            prevTurnButton.setAttribute('src', PrevButtonImage(false));
        };
        var nextTurnButton = document.getElementById('NextTurnButton');
        nextTurnButton.onclick = function () {
            // click
            if (NextTurnEnabled) {
                TheBoard.PushMove(GameHistory[GameHistoryIndex++]);
                DrawBoard(TheBoard);
                SetMoveState(MoveStateType.SelectSource);
            }
        };
        nextTurnButton.onmouseover = function () {
            nextTurnButton.setAttribute('src', NextButtonImage(true));
        };
        nextTurnButton.onmouseout = function () {
            nextTurnButton.setAttribute('src', NextButtonImage(false));
        };
        var playPauseStopButton = document.getElementById('PlayPauseStopButton');
        playPauseStopButton.onclick = function () {
            if (PlayStopEnabled) {
            }
        };
        playPauseStopButton.onmouseover = function () {
            playPauseStopButton.setAttribute('src', PlayStopImage(true));
        };
        playPauseStopButton.onmouseout = function () {
            playPauseStopButton.setAttribute('src', PlayStopImage(false));
        };
    }
    function InitPage() {
        BoardDiv = document.getElementById('DivBoard');
        InitBoardDisplay();
        DrawBoard(TheBoard);
        InitControls();
        SetMoveState(MoveStateType.SelectSource);
    }
    FwDemo.InitPage = InitPage;
})(FwDemo || (FwDemo = {}));
window.onload = FwDemo.InitPage;
