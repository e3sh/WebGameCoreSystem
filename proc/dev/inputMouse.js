//InputMouse
//
/**
 * InputMouse
 * @description
 * マウスの入力を管理する機能を提供します。\
 * マウスの移動、ボタンのクリック、ホイールのスクロールイベントを捕捉し、\
 * マウスの位置、ボタンの状態、ホイールの移動量を追跡します。
 */
class inputMouse {
    /**
     * @param {string} element_ID　target getElementById(element_ID);
     * @example
     * element_IDにはGameCoreでCanvasのIDが指定されます。
     */
    constructor(element_ID) {

        let state = { x: 0, y: 0, button: 0, wheel: 0 };

        let x = 0;
        let y = 0;
        let button = -1;
        let wheel = 0;

        let tr = { x: 1, y: 1, offset_x: 0 };

        let el = document.getElementById(element_ID);

        //mouseevent
        el.addEventListener("mousemove",
            function (event) {
                x = event.clientX;
                y = event.clientY;
            },
            false);

        el.addEventListener("mousedown", function (event) { button = event.button; }, false);
        el.addEventListener("mouseup", function (event) { button = -1; }, false);
        el.addEventListener("mousewheel", function (event) { wheel = event.wheelDelta; }, false);

        //firefox用ホイールコントロール
        el.addEventListener("DOMMouseScroll", function (event) { wheel = event.detail; }, false);

        /**
         * @method
         * @param {GameCore} g GameCoreインスタンス
         * @description
         * フルスクリーンモードかどうかに応じてマウス座標の変換を調整します。\
         * これにより、実際の画面解像度と描画Canvasの解像度が異なる場合でも\
         * 正確なマウス位置をゲーム内で取得できます。
        */
        this.mode = function (g) {

            if (document.fullscreenElement) {
                let cw = document.documentElement.clientWidth;
                let ch = document.documentElement.clientHeight;
                let pixr = window.devicePixelRatio;

                let scw = g.systemCanvas.width;
                let sch = g.systemCanvas.height;

                let rt = ch / sch;

                tr.x = rt; tr.y = rt; tr.offset_x = ((scw * rt) - cw) / rt / 2;
            } else {
                tr.x = 1; tr.y = 1; tr.offset_x = 0;
            }
        };

        /**
         * @typedef {object} mouseState マウス状態
         * @property {number} x x座標
         * @property {number} y y座標
         * @property {number} button ボタン状態
         * @property {number} wheel ホイール移動量
         * @example
         * button -1:何も押してない　0:左ボタン　2:右ボタン　1:ホイール
         */

        /**
         * @method
         * @returns {mouseState} マウス状態
         * @description
         * 現在のマウスの入力状態（位置、ボタン、ホイール）を返します。\
         * ボタンの状態とホイールの移動量は、次回の呼び出しのためにリセットされます。
         * @todo ボタン同時押しの検出の為にbuttonsを評価するようにする
         * @todo 多ボタンマウスの動作について検討
         */
        this.check = function () {

            state.x = (x / tr.x) + tr.offset_x;
            state.y = (y / tr.y);
            state.button = button;
            state.wheel = wheel;

            if (button != 0) { button = -1; }
            wheel = 0;

            return state;
        };

        /**
         * @method
         * @returns {mouseState} マウス状態
         * @description
         * 最後に記録されたマウスの入力状態を、値をリセットせずに返します。\
         * このメソッドは、前フレームの状態を参照したい場合や、\
         * 値のリセットが不要な場合に利用されます。
         */
        this.check_last = function () {
            //state.x = x * tr.x + tr.offset_x;
            //state.y = y * tr.y;
            //state.button = button;
            //state.wheel = wheel;

            return state;
        };

        /**
         * @method
         * @param {DisplayControl} ctx 表示するDisplayControlを指定
         * @description
         * 現在のマウスカーソル位置に視覚的なインジケータを描画します。\
         * デバッグや、カスタムカーソルを表示したい場合に利用でき、\
         * 描画機能を持つオブジェクトを`putFunc`で登録します
         */
        this.draw = function (ctx) {

            let st = this.check_last();

            let cl = {};
            cl.x = st.x;
            cl.y = st.y;
            cl.draw = function (device) {
                let context = device;

                context.beginPath();
                context.moveTo(this.x, this.y);
                context.lineTo(this.x + 10, this.y + 10);
                context.globalAlpha = 1.0;
                context.strokeStyle = "white"; //"black";
                context.lineWidth = 3;
                context.stroke();
            };
            ctx.putFunc(cl);
        };
    }
}
