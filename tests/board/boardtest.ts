module FlyBoardTest {
    export class Test {
        public static Run(): void {
            let boardInitText = window.document.getElementById('BoardInitText');
            boardInitText.innerText = 'running';
            let board:Flywheel.Board = new Flywheel.Board();
            boardInitText.innerText = 'OK';
        }
    }
}
