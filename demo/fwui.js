/// <reference path="../src/flywheel.ts"/>
var FwDemo;
(function (FwDemo) {
    var SquarePixels = 70;
    var TheBoard = new Flywheel.Board();
    var RotateFlag = false;
    var BgDark = '#8FA679';
    var BgPale = '#D4CEA3';
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
        var html = '<img id="RotateButton" src="shadow1/loop-circular-8x.png" alt="Rotate board" style="position:absolute; width:76px; height:64px; top:3px; left:590px;" title="Rotate board">';
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
        $('#DivBoard').html(html);
    }
    function DrawBoard(board) {
        for (var y = 0; y < 8; ++y) {
            var ry = RotateFlag ? (7 - y) : y;
            $('#RankLabel_' + ry.toFixed()).text('87654321'.charAt(y));
            $('#FileLabel_' + ry.toFixed()).text('abcdefgh'.charAt(y));
            for (var x = 0; x < 8; ++x) {
                var rx = RotateFlag ? (7 - x) : x;
                var sq = board.GetSquareByCoords(x, y);
                var img = MakeImageHtml(sq);
                $('#Square_' + rx.toString() + ry.toString()).html(img);
            }
        }
    }
    function InitControls() {
        var rotateButton = $('#RotateButton');
        rotateButton.click(function () {
            RotateFlag = !RotateFlag;
            DrawBoard(TheBoard);
        }).hover(function () {
            // hover in
            rotateButton.prop('src', 'shadow2/loop-circular-8x.png');
        }, function () {
            // hover out
            rotateButton.prop('src', 'shadow1/loop-circular-8x.png');
        });
    }
    function InitPage() {
        InitBoardDisplay();
        DrawBoard(TheBoard);
        InitControls();
    }
    FwDemo.InitPage = InitPage;
})(FwDemo || (FwDemo = {}));
$(FwDemo.InitPage);
