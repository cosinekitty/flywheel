/// <reference path="../src/flywheel.ts"/>
var FwDemo;
(function (FwDemo) {
    var SquarePixels = 70;
    var TheBoard = new Flywheel.Board();
    var RotateFlag = false;
    var BgDark = '#808080';
    var BgPale = '#a0b0c0';
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
        return '<img src="' + fn + '" width="' + SquarePixels + '" height="' + SquarePixels + '"/>';
    }
    function MakeImageContainer(x, y) {
        return '<div id="Square_' + x.toString() + y.toString() + '"' +
            ' style="position:absolute; left:' +
            (SquarePixels * x).toFixed() + 'px; top:' +
            (SquarePixels * (7 - y)).toFixed() + 'px;' +
            ' background-color: ' + (((x + y) & 1) ? BgPale : BgDark) + '; ' +
            ' width: ' + SquarePixels + 'px; ' +
            ' height: ' + SquarePixels + 'px; ' +
            '"></div>';
    }
    function InitBoardDisplay() {
        var x, y;
        var html = '';
        for (y = 0; y < 8; ++y) {
            for (x = 0; x < 8; ++x) {
                html += MakeImageContainer(x, y);
            }
        }
        $('#DivBoard').html(html);
    }
    function DrawBoard(board) {
        for (var y = 0; y < 8; ++y) {
            var ry = RotateFlag ? (7 - y) : y;
            for (var x = 0; x < 8; ++x) {
                var rx = RotateFlag ? (7 - x) : x;
                var sq = board.GetSquareByCoords(x, y);
                var img = MakeImageHtml(sq);
                $('#Square_' + rx.toString() + ry.toString()).html(img);
            }
        }
    }
    function InitPage() {
        InitBoardDisplay();
        DrawBoard(TheBoard);
    }
    FwDemo.InitPage = InitPage;
})(FwDemo || (FwDemo = {}));
$(FwDemo.InitPage);
