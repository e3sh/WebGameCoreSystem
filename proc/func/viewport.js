//viewport
//x, y, w, h
//repeat  //折り返し表示の有無　overflow してる場合反対側に表示するか
//size(w,h);//
//repeat(mode);
//setPos(px,py);実座標をスプライト座標としてviewportの左上をどこに置くか指定
//viewtoReal(x,y)ビューポート変換後の画面表示座標
//（スプライト座標！＝画面表示座標とする処理
//戻り値｛x:,y:表示座標,in:(true:表示範囲内(false:表示範囲外)}
/**
 * スプライト座標！＝画面表示座標とする処理
 * ワールド座標系として管理して表示する場合
 * これを通してビューポート内にあるスプライトのみ表示する
 */
class viewport {

    /**
     * homeposition x (leftup)
     * @type {number}
     */
    x;
    /**
     * homeposition y (leftup)
     * @type {number}
     */
    y;
    /**
     * viewport size width
     * @type {number}
     */
    w;
    /**
     * viewport size height
     * @type {number}
     */
    h;
    /**
     * border size x 
     * @type {number}
     */
    ix;
    /**
     * border size y
     * @type {number}
     */
    iy;

    constructor() {

        let x_, y_, w_, h_, ix_, iy_, repeat_ = true;
        x_ = 0; y_ = 0, ix_ = 0, iy_ = 0;

        this.x = 0;
        this.y = 0;
        this.w = w_;
        this.h = h_;
        this.ix = ix_;
        this.iy = iy_;

        const update = () => {
            this.x = x_;
            this.y = y_;
            this.w = w_;
            this.h = h_;
            this.ix = ix_;
            this.iy = iy_;
        }

        /**
         * Repeat Mode Enable
         * @method
         * @param {boolean} mode setRepeatMode
         * @default true
         * @description
         * - viewport外の場合折り返し処理するかどうか
         * - 折り返し表示の有無　overflow してる場合反対側に表示するか
         */
        this.repeat = function (mode = true) {
            repeat_ = mode;
        };
        /**
         * Set viewport size 
         * @method
         * @param {number} w 幅 
         * @param {number} h 高さ
         * @description
         * - viewportのサイズを設定する
         * - 通常は実画面解像度
         */
        this.size = function (w, h) {
            w_ = w; h_ = h;
            update();
        };
        /**
         * SetHomePotition
         * @method
         * @param {number} x homeposion 
         * @param {number} y homeposion
         * @description
         * - world座標におけるviewportの現在基準位置を設定
         * - 左上が基準となります
         */
        this.setPos = function (x, y) {
            x_ = x; y_ = y;
            update();
        };

        /**
         * set border margin
         * @method
         * @param {number} w margin width
         * @param {number} h margin height
         * @description
         * - 表示外判定の為の縦横余白を設定します
         * - 余白外に出るまでviewport内と判定されます
         */
        this.border = function (w, h) {
            ix_ = w; iy_ = h;
            update();
        };

        /**
         * viewport.viewtoReal Result
         * @typedef {object} viewportResult チェック結果
         * @property {number} x viewport内での座標x
         * @property {number} y viewport内での座標y
         * @property {boolean} in viewport+marginの中かどうか
         * @description ワールド座標から実画面座標に変換
         */
        /**
         * in viewport check and positionConvert
         * @method
         * @param {number} sx world座標x
         * @param {number} sy world座標y
         * @returns {viewportResult}
         * @description 
         * - 指定するワールド座標はスプライトの座標を想定
        */
        this.viewtoReal = function (sx, sy) {
            let rx = sx + x_;
            let ry = sy + y_;
            let f = false;

            if (repeat_) { // repeat true;
                if (rx < 0) rx = w_ + rx;
                if (rx > w_) rx = rx % w_;
                if (ry < 0) ry = h_ + ry;
                if (ry > h_) ry = ry % h_;
            }

            f = (rx + ix_ < 0 || rx > w_ + ix_ || ry + iy_ < 0 || ry > h_ + iy_) ? false : true;

            //console.log("x" + x_ + ",y" + y_ + ",w" + w_);
            return { x: rx, y: ry, in: f };
        };

    }
}