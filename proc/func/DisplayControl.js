// DisplayControlクラス

/**
 * 画面表示コントロール(CanvasLayerControl)クラス
 *  
 * @param {DeviceContext} ctx canvas2Dcontext
 * @param {number} c_w pixel width
 * @param {number} c_h pixel height
 * @param {number} ix display offset x
 * @param {number} iy display offset y
 * 
 * 実際の画面表示サイズはCSSのSTYLEで
 * 指定してあるのでここでは、操作する解像度を指定する。
 * 
 */
class DisplayControl {

    /**
     * @type {@offScreenTypeC} OffscreenbufferController 
     */
    buffer;
    /**
     * canvas.width
     * @type {number}
     */
    cw;
    /**
     * canvas.height
     * @type {number}
     */
    ch;
    /**
     * 加算合成を使用する
     * @type {boolean}
     * @todo 現在は効果なし/削除予定
     * @deprecaed
     */
    lighter_enable;

    /**
     * @type {string} fillcolor
     */
    backgroundcolor;

    device; //privete
    intervalTime; //private access->get/set

    /**
     * @param {canvas2DContext} ctx canvas2Dcontext
     * @param {number} c_w width
     * @param {number} c_h height
     * @param {number} ix offset x
     * @param {number} iy offset y
     */
    constructor(ctx, c_w, c_h, ix, iy) {

        const buffer_ = new offScreenTypeC(c_w, c_h, ix, iy); //offScreenCanvas版(2023/03-)

        this.buffer = buffer_;

        const dev = ctx; //canvas.getContext("2d");
        this.device = dev;

        this.cw = c_w; //canvas.width;
        this.ch = c_h; //canvas.height;

        dev.font = "16px 'Arial'";

        this.lighter_enable = true; //現在無効

        this.view = buffer_.view;
        this.flip = buffer_.flip;

        let intv = 1;
        this.intervalTime = intv;
        let bgcolor = "";
        this.backgroundcolor = bgcolor;
    }

    /**
     * 表示間隔設定(フレーム)
     * @param {number} num 更新間隔
     * 0指定で自動更新(clear)抑止
     */
    setInterval(num) {
        if (num == 0) {
            this.buffer.flip(false);
        } else {
            this.buffer.flip(true);
        }
        this.intervalTime = num;
    };
    /**
     * 背景色設定
     * @param {string} str 表示色
     * null,""指定で透過色でクリア
     */
    setBackgroundcolor(str) { this.backgroundcolor = str; };
    /**
     * 現在の表示間隔(フレーム)設定値取得
     * @returns {number} 更新間隔(フレーム)
     */
    getInterval() { return this.intervalTime; };
    /**
     * 現在の背景色設定値取得
     * @returns {string} 表示色
     */
    getBackgroundcolor() { return this.backgroundcolor; };

    //-------------------------------------------------------------
    /**
     * マップチップ用パターン描画
     * @param {Img} gr Image
     * @param {object} ptn パターン番号（またはx,y,w,hの入ったオブジェクト）
     * @param {number} x 表示位置
     * @param {number} y 表示位置
     * @param {number} w 表示幅
     * @param {number} h 表示高さ
     * 引数（省略不可
     */
    putPattern(gr, ptn, x, y, w, h) {

        this.buffer.drawImgXYWHXYWH(
            gr,
            ptn.x, ptn.y, ptn.w, ptn.h,
            x, y, w, h
        );
    };
    //-------------------------------------------------------------
    /**
     * マップチップ用パターン切り取り配列の登録
     * @param {Img} gr Image
     * @param {object} bgpth パターン配列（x,y,w,hの入ったオブジェクト）
     * @todo　用途不明
     */
    setBgPattern(bgptn) {

        bgPtn = bgptn;
    };
    //-------------------------------------------------------------
    /**
     * 文字列の表示(fillText)
     * @param {string} str MessageText
     * @param {number} x position
     * @param {number} y position
     * @param {string} c color
     * @todo Fontの指定
     */
    print(str, x, y, c) {

        if (!Boolean(c)) { c = "limegreen"; }

        this.buffer.fillText(str, x, y, c);
    };
    //------------------------------------------------------------
    /**
     * 画像イメージを直接取得して表示させる。
     * @param {Img} gr 画像(イメージデータ)
     * @param {number} x 表示位置座標
     * @param {number} y 表示位置座標
     */
    putImage(gr, x, y) {

        this.buffer.drawImgXY(gr, x, y);
    };
    //------------------------------------------------------------
    /**
     * 画像イメージを直接取得して表示させる。（ほぼテスト用）
     * @param {Img} gr 画像(イメージデータ)
     * @param {number} x 表示位置座標
     * @param {number} y 表示位置座標
     * @param {number} w 表示幅
     * @param {number} h 表示高さ
    */
    putImage2(gr, x, y, w, h) {

        this.buffer.drawImgXYWH(gr, x, y, w, h);
    };
    //------------------------------------------------------------
    /**
     * 画像イメージを直接取得して表示させる。（Transform付き）
     * @param {Img} gr 画像(イメージデータ)
     * @param {number} x 表示位置座標
     * @param {number} y 表示位置座標
     * @param {number} m11 変換座標
     * @param {number} m12 変換座標
     * @param {number} m21 変換座標
     * @param {number} m22 変換座標
    */
    putImageTransform(gr, x, y, m11, m12, m21, m22) {

        this.buffer.putImageTransform(gr, x, y, m11, m12, m21, m22);
    };
    //---------------------------------------------------------
    /**
     * Transform(OffscreenBuffer全体の変形)
     * @param {number} m11 変換座標
     * @param {number} m12 変換座標
     * @param {number} m21 変換座標
     * @param {number} m22 変換座標
    */
    transform(m11, m12, m21, m22) {

        this.buffer.Transform(m11, m12, m21, m22, 0, 0);
    };
    //------------------------------------------------------------
    /**
     * 表示機能有り(draw)objectで表示コマンドを登録して表示
     * @param {object} cl 表示機能有り(draw)object
    */
    putFunc(cl) {

        //ここで登録するクラスには表示の為に"draw( device )" functionを必ず登録
        this.buffer.putFunc(cl);
    };
    //---------------------------------------------------------
    /**
     * 画面消去(クリア）
     * @param {string} c_str クリア背景色
     * nullの場合はクリアのみで塗りつぶしは無し
    */
    clear(c_str) {

        if (this.flip()) {

            this.buffer.allClear(0, 0, this.cw, this.ch);

            if (c_str === void 0) { c_str = this.backgroundcolor; }
            if (Boolean(c_str)) {
                this.buffer.fillRect(0, 0, this.cw, this.ch, c_str);
            }
        }
    };
    //-----------------------------------------------------
    /**
     * 部分クリア(色指定で部分塗りつぶし）
     * @param {number} x 表示位置座標
     * @param {number} y 表示位置座標
     * @param {number} w 表示幅
     * @param {number} h 表示高さ
     * @param {string} c_str 塗り潰し色
     * (rgbaで指定すると半透明色指定可能)
    */
    fill(x, y, w, h, c_str) {

        this.buffer.fillRect(x, y, w, h, c_str);
    };
    //----------------------------------------------------------
    /**
     * offScreenのクリア
    */
    reset() {

        this.buffer.reset();
    };
    //----------------------------------------------------------
    /**
     * (flameloopで実行用）offScreenのクリア
    */
    reflash() { this.buffer.reflash(); };
    //----------------------------------------------------------
    /**
     * 描画
    */
    draw() {

        this.buffer.draw(this.device);
    };
    //----------------------------------------------------------
    /**
     * 書き込み処理回数の取得
     * @returns {number} draw実行毎の回数
    */
    count() {

        return this.buffer.count();
    };
    //----------------------------------------------------------
    /**
     * 書き込み処理回数最大値の取得
     * @returns {number} 最大値
    */
    max = function () {

        return this.buffer.max();
    };
}



