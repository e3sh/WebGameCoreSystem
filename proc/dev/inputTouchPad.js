// touchPadControl 
//**************************************************************
/**
 * touchPadControl
 * @class
 * @classdesc
 * タッチパッド（またはタッチスクリーン）からの入力を管理します。<br>\
 * タッチ開始、移動、終了、キャンセルイベントを処理し、<br>\
 * 複数のタッチポイントの位置を追跡します。
 * @todo スワイプやピンチインアウトの検出
 */
class inputTouchPad {
    /**
     * @constructor
     * @param {string} canvas_id CanvasId
     * @example
     * GameCoreでCanvasIdが指定されます。
     */
    constructor(canvas_id) {

        let pos = [];

        let tr = { x: 1, y: 1, offset_x: 0 };

        let el = document.getElementById(canvas_id);
        //let cvs = document;
        //this.o_Left = el.width ;//offsetLeft;
        //this.o_Top = el.height;//offsetTop;
        let viewf = false;

        //iPodTouch用(マルチポイントタッチ)
        el.addEventListener('touchstart', ViewTrue,
            { passive: false });
        el.addEventListener('touchmove', ViewTrue,
            { passive: false });
        el.addEventListener('touchend', ViewFalse,
            { passive: false });
        el.addEventListener('touchcancel', ViewFalse,
            { passive: false });

        function ViewTrue(e) {
            e.preventDefault();
            touchposget(e);
            viewf = true;
        }

        function ViewFalse(e) {
            e.preventDefault();
            touchposget(e);
            viewf = false;
        }

        /**
         * @method
         * @param {GameCore} g GameCoreインスタンス
         * @description
         * フルスクリーンモードかどうかに応じてタッチ座標の変換を調整します。<br>\
         * これにより、実際の画面解像度と描画Canvasの解像度が異なる場合でも、<br>\
         * 正確なタッチ位置をゲーム内で取得できます。
         */
        this.mode = function (g) {

            if (document.fullscreenElement) {
                let cw = el.clientWidth; //document.documentElement.clientWidth;
                let ch = el.clientHeight; //document.documentElement.clientHeight;
                let pixr = window.devicePixelRatio;

                let scw = g.systemCanvas.width;
                let sch = g.systemCanvas.height;

                let rt = ch / sch;

                tr.x = rt; tr.y = rt; tr.offset_x = ((scw * rt) - cw) / rt / 2;
            } else {
                tr.x = 1; tr.y = 1; tr.offset_x = 0;
            }
        };

        function touchposget(event) {

            pos = [];

            if (event.touches.length > 0) {
                for (let i = 0; i < event.touches.length; i++) {
                    let t = event.touches[i];

                    pos[i] = {};

                    pos[i].x = (t.pageX / tr.x) + tr.offset_x;
                    pos[i].y = (t.pageY / tr.y);
                    pos[i].id = t.identifier;
                    //pos[i].count = 0;//work
                }
            }
        }

        /**
         * @typedef {object} touchpadState タッチパネル状態
         * @property {object[]} pos
         * @property {number} pos[].x x座標　
         * @property {number} pos[].y y座標
         * @property {number} pos[].id touch.identifier
         * @see https://developer.mozilla.org/ja/docs/Web/API/Touch
         * 
         */
        /**
         * @method
         * @returns {touchpadState} タッチパネル状態 
         * @description
         * 現在のタッチ入力状態を返します。<br>\
         * 複数のタッチポイントがある場合、各ポイントのX、Y座標と<br>\
         * IDを含む配列として提供されます。
         */
        this.check = function () {
            let state = {};

            state.pos = pos;
            return state;
        };

        /**
         * @method
         * @returns {touchpadState} タッチパネル状態
         * @description
         * 最後に記録されたタッチ入力状態を、値をリセットせずに返します。<br>\
         * このメソッドは、前フレームの状態を参照したい場合や、<br>\
         * 値のリセットが不要な場合に利用されます。
         */
        this.check_last = function () {
            let state = {};

            state.pos = pos;
            return state;
        };

        /**
         * @method
         * @param {DisplayControl} context 表示するDisplayControlを指定
         * @description
         * 現在アクティブなタッチポイントの位置に視覚的な円形インジケータを描画します。<br>\
         * デバッグや、タッチ操作のフィードバックを表示したい場合に利用でき、<br>\
         * 描画機能を持つオブジェクトを`putFunc`で登録します。
         */
        this.draw = function (context) {

            if (!viewf) return;

            let st = this.check_last();

            let s = "p " + pos.length + "/";

            for (let j = 0; j <= pos.length - 1; j++) {
                s = s + "b" + j + " ";

                let cl = {};
                cl.x = pos[j].x;
                cl.y = pos[j].y;
                cl.r = 16;
                cl.draw = function (device) {
                    let context = device;

                    context.beginPath();
                    context.arc(this.x, this.y, this.r, 0, 2 * Math.PI, true);
                    //context.fillStyle = "orange";
                    //context.fill();
                    context.strokeStyle = "white";
                    context.lineWidth = 2;
                    context.stroke();
                };
                context.putFunc(cl);

            }
            //context.fillStyle = "green";
            //context.print(s, 12, 16);
            // 移動した座標を取得
        };
    }
}
