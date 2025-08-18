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
 * スプライト座標！＝画面表示座標とする処理\
 * ワールド座標系として管理して表示する場合\
 * これを通してビューポート内にあるスプライトのみ表示する
 * @description
 * ワールド座標系と実際の画面表示座標系の変換を管理するクラスです。\
 * ゲーム内のスプライトがどの位置にあり、画面のどこに表示されるべきか、\
 * また、表示範囲内にあるかどうかの判定を行います。
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
         * ビューポートの繰り返しモードを有効/無効にします。\
         * このモードが`true`の場合、画面外に出たオブジェクトが反対側から現れるように\
         * 座標が折り返して計算されます。
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
         * ビューポートの表示領域の幅と高さを設定します。\
         * 通常、これはゲームの実際の画面解像度に合わせて設定され、\
         * 表示可能な範囲を定義します。
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
         * ワールド座標系におけるビューポートの基準位置（左上）を設定します。\
         * この位置を移動させることで、ゲームの世界をスクロールさせたり\
         * カメラの視点を変更したりできます。
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
         * 表示範囲の判定に使用する、ビューポート周囲の余白を設定します。\
         * オブジェクトがこの余白範囲から外に出るまで\
         * ビューポート内に存在すると判定されます。
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
         * ワールド座標を実際の画面表示座標に変換し、ビューポート内にあるかを判定します。\
         * スプライトなどのワールド座標をこのメソッドに通すことで、\
         * 正しい画面上の位置と表示可否の情報を取得できます。
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