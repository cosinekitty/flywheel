module FwDemo {
    'use strict';

    enum MoveStateType {
        OpponentTurn,   // not user's turn (computer's turn)
        SelectSource,
        SelectDest,
        SelectPromotionPiece,
        GameOver,
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
    var BoardDiv;
    var ResultTextDiv;

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

    function SquareSelector(x:number, y:number):string {
        return 'Square_' + x.toFixed() + y.toFixed();
    }

    function SquareDiv(x:number, y:number):HTMLElement {
        return document.getElementById(SquareSelector(x, y));
    }

    function MakeImageContainer(x:number, y:number):string {
        return '<div id="' + SquareSelector(x,y) + '"' +
            ' class="ChessSquare"' +
            ' style="position:absolute; left:' +
            (SquarePixels * x).toFixed() + 'px; top:' +
            (SquarePixels * (7 - y)).toFixed() + 'px;' +
            ' background-color: ' + (((x+y)&1) ? BgPale : BgDark) + '; ' +
            ' width: ' + SquarePixels + 'px; ' +
            ' height: ' + SquarePixels + 'px; ' +
            '"></div>';
    }

    function MakeSpriteContainer():string {
        return '<div id="DivMoveSprite" style="display:none; z-index:1; width:' + SquarePixels + 'px; height:' + SquarePixels + 'px; ' +
            'position:absolute; left:0px; top:' + (SquarePixels*7).toFixed() + 'px;"></div>';
    }

    function MakeResultTextDiv():HTMLElement {
        var div = document.createElement('div');
        div.id = 'DivResultText';
        div.className = 'GameResultText';
        div.style.width = (8 * SquarePixels).toFixed() + 'px';
        div.style.height = div.style.lineHeight = (8 * SquarePixels).toFixed() + 'px';
        div.style.display = 'none';
        return div;
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

        html += MakeSpriteContainer();

        BoardDiv.innerHTML = html;

        ResultTextDiv = MakeResultTextDiv();
        BoardDiv.appendChild(ResultTextDiv);
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
            selector: SquareSelector(screenX, screenY),
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
                visitor(SquareDiv(x, y));
            }
        }
    }

    function ClassList(elem:HTMLElement):string[] {
        var filt = [];
        if (elem.className) {
            for (let token of elem.className.split(/\s+/g)) {
                if (token) {
                    filt.push(token);
                }
            }
        }
        return filt;
    }

    function RemoveClass(elem:HTMLElement, classname:string):HTMLElement {
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
        return elem;
    }

    function AddClass(elem:HTMLElement, classname:string):HTMLElement {
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

    function BeginPieceDrag(sourceInfo):void {
        var imgSource = sourceInfo.squareDiv.children[0];
        var x0 = sourceInfo.pageX;
        var y0 = sourceInfo.pageY;

        imgSource.style.display = 'none';   // hide the origin image while animating

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

        BoardDiv.onmousemove = function(e) {
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
        }
    }

    function EndPieceDrag(sourceInfo):void {
        BoardDiv.onmousemove = null;
        if (sourceInfo && sourceInfo.dragged) {
            sourceInfo.dragged.imgSource.style.display = '';    // unhide the origin image (it's about to be moved anyway)
        }
        var divSprite = document.getElementById('DivMoveSprite');
        divSprite.innerHTML = '';   // erase the sprite image
        divSprite.style.display = 'none';
    }

    function SetMoveState(state:MoveStateType, sourceInfo?):void {
        EndPawnPromotion();
        MoveState = state;
        if (sourceInfo) {
            BeginPieceDrag(sourceInfo);
        } else {
            EndPieceDrag(SourceSquareInfo);
        }
        SourceSquareInfo = sourceInfo;

        // Make all squares unselectable.
        ForEachSquareDiv((div) => RemoveClass(div, 'UserCanSelect'));
        ForEachSquareDiv((div) => RemoveClass(div, 'ChessSquareHover'));

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

    function DrawResultText(result:Flywheel.GameResult):void {
        let rhtml:string;
        switch (result.status) {
            case Flywheel.GameStatus.Draw:
                rhtml = '&frac12;&ndash;&frac12;';
                break;

            case Flywheel.GameStatus.WhiteWins:
                rhtml = '1&ndash;0';
                break;

            case Flywheel.GameStatus.BlackWins:
                rhtml = '0&ndash;1';
                break;
        }

        if (rhtml) {
            ResultTextDiv.innerHTML = rhtml;
            ResultTextDiv.style.display = '';
        } else {
            ResultTextDiv.style.display = 'none';
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
                let sdiv = SquareDiv(rx, ry);
                sdiv.innerHTML = MakeImageHtml(sq);
            }
        }

        PrevTurnEnabled = board.CanPopMove();
        NextTurnEnabled = (GameHistoryIndex < GameHistory.length);

        document.getElementById('PrevTurnButton').setAttribute('src', PrevButtonImage(false));
        document.getElementById('NextTurnButton').setAttribute('src', NextButtonImage(false));
        document.getElementById('PlayPauseStopButton').setAttribute('src', PlayStopImage(false));

        let result = board.GetGameResult();
        DrawResultText(result);

        if (result.status === Flywheel.GameStatus.InProgress) {
            // FIXFIXFIX - check for computer opponent
            SetMoveState(MoveStateType.SelectSource);
        } else {
            // Game is over!
            SetMoveState(MoveStateType.GameOver);
        }
    }

    function BoardCoords(e) {
        let screenX:number = Math.floor((e.pageX - BoardDiv.offsetLeft) / SquarePixels);
        let screenY:number = Math.floor(8.0 - ((e.pageY - BoardDiv.offsetTop)  / SquarePixels));
        let chessX:number = RotateFlag ? (7-screenX) : screenX;
        let chessY:number = RotateFlag ? (7-screenY) : screenY;

        if (chessX < 0 || chessX > 7 || chessY < 0 || chessY > 7) {
            return null;    // outside the board
        }

        let selector:string = SquareSelector(screenX, screenY);

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
            if (MoveState === MoveStateType.SelectSource) {
                let bc = BoardCoords(e);
                if (bc) {
                    if (HasClass(bc.squareDiv, 'UserCanSelect')) {
                        SetMoveState(MoveStateType.SelectDest, bc);
                    }
                }
            }
        }
    }

    function CommitMove(move:Flywheel.Move):void {
        TheBoard.PushMove(move);
        if ((GameHistoryIndex < GameHistory.length) && move.Equals(GameHistory[GameHistoryIndex])) {
            // Special case: treat this move as a redo, so don't disrupt the history.
            ++GameHistoryIndex;
        } else {
            GameHistory = TheBoard.MoveHistory();
            GameHistoryIndex = GameHistory.length;
        }
        DrawBoard(TheBoard);
    }

    var PawnPromotionInfo = null;

    function BeginPawnPromotion(movelist:Flywheel.Move[]):void {
        // The user has clicked on a (source, dest) pair that indicates pawn promotion.
        // The 'promlist' passed in is a list of the 4 promotion moves to choose from.
        // They are all the same except the promotion piece is one of:
        // NeutralPiece.Queen, NeutralPiece.Rook, NeutralPiece.Bishop, NeutralPiece.Knight.
        // Enter a user interface state where the user can select which piece to promote the pawn to,
        // or he may opt to cancel the move.
        let source:number = movelist[0].source;
        let dest:number = movelist[0].dest;
        let destRank:number = Flywheel.Board.GetRankNumber(dest);
        let side:Flywheel.Side = (destRank === 8) ? Flywheel.Side.White : Flywheel.Side.Black;

        // Create a promotion menu div that sits on top of the board display.
        let menudiv = document.createElement('div');
        menudiv.className = 'PawnPromotionMenu';
        menudiv.style.top = (SquarePixels * 3.5).toFixed() + 'px';
        menudiv.style.left = (SquarePixels * 1.5).toFixed() + 'px';
        menudiv.style.width = (SquarePixels * 5).toFixed() + 'px';
        menudiv.style.height = (SquarePixels).toFixed() + 'px';
        menudiv.appendChild(PromotionOptionDiv(side, Flywheel.NeutralPiece.Queen,  movelist, 0));
        menudiv.appendChild(PromotionOptionDiv(side, Flywheel.NeutralPiece.Rook,   movelist, 1));
        menudiv.appendChild(PromotionOptionDiv(side, Flywheel.NeutralPiece.Bishop, movelist, 2));
        menudiv.appendChild(PromotionOptionDiv(side, Flywheel.NeutralPiece.Knight, movelist, 3));
        menudiv.appendChild(PromotionCancelDiv(4));
        BoardDiv.appendChild(menudiv);

        // Transition to pawn promotion state.
        SetMoveState(MoveStateType.SelectPromotionPiece);

        // Remember information needed to manage pawn promotion UI state.
        PawnPromotionInfo = {
            menudiv: menudiv,
        };
    }

    function EndPawnPromotion():void {
        // Remove pawn promotion menu div.
        if (PawnPromotionInfo) {
            BoardDiv.removeChild(PawnPromotionInfo.menudiv);
            PawnPromotionInfo = null;
        }
    }

    function PromotionOptionDiv(
        side:Flywheel.Side,
        prom:Flywheel.NeutralPiece,
        movelist:Flywheel.Move[],
        index:number
    ):HTMLElement {
        // Search for the matching promotion move in the movelist.
        // Keep that move in case this is the promotion option chosen by the user.
        var move:Flywheel.Move;
        for (var m of movelist) {
            if (m.prom === prom) {
                move = m;
                break;
            }
        }
        if (!move) {
            throw 'Could not find promotion to ' + prom;
        }

        var coords = MoveCoords(move);
        var sourceSquareDiv = document.getElementById(coords.source.selector);
        var destSquareDiv = document.getElementById(coords.dest.selector);

        sourceSquareDiv.innerHTML = MakeImageHtml(Flywheel.Square.Empty);
        destSquareDiv.innerHTML = MakeImageHtml(Flywheel.Board.GetSidedPiece(side, Flywheel.NeutralPiece.Pawn));

        var div = document.createElement('div');
        div.className = 'PawnPromotionOption';
        div.style.width = SquarePixels.toFixed() + 'px';
        div.style.height = SquarePixels.toFixed() + 'px';
        div.style.top = '0px';
        div.style.left = (index * SquarePixels).toFixed() + 'px';
        var piece:Flywheel.Square = Flywheel.Board.GetSidedPiece(side, prom);
        div.innerHTML = MakeImageHtml(piece);
        div.onclick = function() {
            CommitMove(move);
        }
        return div;
    }

    function PromotionCancelDiv(index:number):HTMLElement {
        var div = document.createElement('div');
        div.className = 'PawnPromotionOption';
        div.style.width = SquarePixels.toFixed() + 'px';
        div.style.height = SquarePixels.toFixed() + 'px';
        div.style.top = '0px';
        div.style.left = (index * SquarePixels).toFixed() + 'px';

        var icon = document.createElement('img');
        icon.setAttribute('src', '../icon/cancel-button.png');
        icon.setAttribute('width', SquarePixels.toFixed());
        icon.setAttribute('height', SquarePixels.toFixed());

        div.appendChild(icon);

        div.onclick = function() {
            DrawBoard(TheBoard);
        }

        return div;
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
                        if (!SourceSquareInfo.dragged.hasLeftSourceSquare && !SourceSquareInfo.dragged.mouseUpOnSourceSquare) {
                            SourceSquareInfo.dragged.mouseUpOnSourceSquare = true;
                            return;     // remain in SelectDest state
                        }
                    }

                    // Find matching (source,dest) pair in legal move list, make move on board, redraw board.
                    let legal:Flywheel.Move[] = TheBoard.LegalMoves();
                    let matchingMoveList:Flywheel.Move[] = [];
                    for (let move of legal) {
                        let coords = MoveCoords(move);
                        if (coords.dest.selector === bc.selector) {
                            if (coords.source.selector === SourceSquareInfo.selector) {
                                // Usually only one move will match, but when a player promotes a pawn,
                                // there will be 4 matching moves (Q, B, R, N).
                                matchingMoveList.push(move);
                            }
                        }
                    }

                    switch (matchingMoveList.length) {
                        case 0:
                            // Not a valid move, so cancel the current move and start over.
                            SetMoveState(MoveStateType.SelectSource);
                            break;

                        case 1:
                            // A non-promotion legal move is always unique based on (source, dest) pair.
                            CommitMove(matchingMoveList[0]);
                            break;

                        case 4:
                            // Assume this is a pawn promotion.
                            // There are 4 matching moves based on (source, dest) pair:
                            // one for each possible promotion piece (Queen, Rook, Bishop, Knight).
                            BeginPawnPromotion(matchingMoveList);
                            break;

                        default:
                            // This should be impossible if the legal move generator is working correctly!
                            throw 'Impossible number of matching moves = ' + matchingMoveList.length;
                    }
                }
            }
        }
    }

    function InitControls() {
        BoardDiv.onmousedown = OnSquareMouseDown;
        BoardDiv.onmouseup = OnSquareMouseUp;

        for (let x=0; x < 8; ++x) {
            for (let y=0; y < 8; ++y) {
                let sq = SquareDiv(x, y);
                sq.onmouseover = OnSquareHoverIn;
                sq.onmouseout = OnSquareHoverOut;
            }
        }

        var rotateButton = document.getElementById('RotateButton');
        rotateButton.onclick = function(){
            RotateFlag = !RotateFlag;
            DrawBoard(TheBoard);
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
        BoardDiv = document.getElementById('DivBoard');
        InitBoardDisplay();
        DrawBoard(TheBoard);
        InitControls();
    }
}

window.onload = FwDemo.InitPage;
