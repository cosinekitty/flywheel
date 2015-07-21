/// <reference path="../src/flywheel.ts"/>

module FwDemo {
    var SquarePixels:number = 70;
    var TheBoard:Flywheel.Board = new Flywheel.Board();
    var RotateFlag:boolean = false;
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
        return '<img src="' + fn + '" width="' + SquarePixels + '" height="' + SquarePixels + '"/>';
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
        let html = '<div id="RotateButton" style="position:absolute; width:64px; height:64px; top:3px; left:590px;" title="Rotate board"><img class="ShadowFilter" src="../icon/loop-circular-8x.png" width="64" height="64" alt="Rotate board"></div>';
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

    function DrawBoard(board:Flywheel.Board):void {
        for (let y=0; y < 8; ++y) {
            let ry = RotateFlag ? (7 - y) : y;
            $('#RankLabel_' + ry.toFixed()).text('87654321'.charAt(y));
            $('#FileLabel_' + ry.toFixed()).text('abcdefgh'.charAt(y));
            for (let x=0; x < 8; ++x) {
                let rx = RotateFlag ? (7 - x) : x;
                let sq:Flywheel.Square = board.GetSquareByCoords(x, y);
                let img:string = MakeImageHtml(sq);
                $('#Square_' + rx.toString() + ry.toString()).html(img);
            }
        }
    }

    function InitControls() {
        $('#RotateButton').click(function(){
            RotateFlag = !RotateFlag;
            DrawBoard(TheBoard);
        });
    }

    export function InitPage() {
        InitBoardDisplay();
        DrawBoard(TheBoard);
        InitControls();
    }
}

$(FwDemo.InitPage);
