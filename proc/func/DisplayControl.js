// DisplayControlクラス
/**
 * 色指定文字列
 * @typedef {string} Color 色指定文字列
 * @example
 * "blue","red","green" etc
 * @see https://developer.mozilla.org/ja/docs/Web/CSS/color_value
 */

/**
 * CanvasRenderingContext2D
 * @typedef {CanvasRenderingContext2D} DeviceContext
 * @see https://developer.mozilla.org/ja/docs/Web/API/CanvasRenderingContext2D
*/

/**
 * ImageData
 * @typedef {HTMLImageElement} Img Texture画像情報
 * @see https://developer.mozilla.org/ja/docs/Web/API/HTMLImageElement
 */

/**
 * 画面表示コントロール(CanvasLayerControl)クラス
 * @class
 * @param {DeviceContext} ctx mainCanvasCtx
 * @param {number} c_w pixel width
 * @param {number} c_h pixel height
 * @param {number} ix display offset x
 * @param {number} iy display offset y
 * @description
 * 実際の画面表示サイズはCSSのSTYLEで <br>\
 * 指定してあるのでここでは、操作する解像度を指定する。 <br>\
 * <br>\
 * HTML Canvas要素への画面表示を制御するクラスです。 <br>\
 * オフスクリーンバッファを使用し、指定された解像度で描画を行い、<br>\
 * 実際のCanvas要素に最終的な描画結果を反映させます。
 * @todo FontFace
 */
class DisplayControl {

    /**
     * OffscreenbufferController 
     * @member
     * @type {offScreenTypeC} 
     */
    buffer;
    /**
     * canvas.width
     * @member
     * @type {number}
     */
    cw;
    /**
     * canvas.height
     * @member
     * @type {number}
     */
    ch;
    /**
     * 加算合成を使用する
     * @member
     * @type {boolean}
     * @todo 現在は効果なし/削除予定
     * @deprecaed
     */
    lighter_enable;

    /**
     * 背景色(fillcolor)
     * @member
     * @type {Color}
     */
    backgroundcolor;

    device; //privete
    intervalTime; //private access->get/set

    /**
     * @param {DeviceContext} ctx canvas2Dcontext
     * @param {number} c_w width
     * @param {number} c_h height
     * @param {number} ix offset x
     * @param {number} iy offset y
     * @description
     * DisplayControlクラスのインスタンスを初期化します。 <br>\
     * 描画コンテキスト、幅、高さ、オフセットなどのパラメータを設定し　<br>\
     * オフスクリーンバッファと表示デバイスを準備します
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
     * @description
     * 画面の更新間隔（フレーム数）を設定します。 <br>\
     * 0を指定すると自動更新（画面クリア）が抑止され、 <br>\
     * 手動での更新制御が可能になります。
     */
    setInterval(num) {

        const _setInterval =(num)=>{ 
            if (num == 0) {
                this.buffer.flip(false);
            } else {
                this.buffer.flip(true);
            }
            this.intervalTime = num;
        }
        _setInterval(num);
    };
    /**
     * 背景色設定
     * @param {Color} str 表示色
     * null,""指定で透過色でクリア
     * @description
     * 画面の背景色を設定します。<br>\
     * `null`または空文字列を指定すると、背景は透過色でクリアされ、<br>\
     * 重ねて表示する際に前の描画が残ります。
     */
    setBackgroundcolor(str) { const _setBgc =(str)=>{ this.backgroundcolor = str;}; _setBgc(str); };
    /**
     * 表示間隔設定値取得
     * @returns {number} 更新間隔(フレーム)
     * @description
     * 現在設定されている画面の更新間隔（フレーム数）を取得します。
     */
    getInterval() { const _getInterval =()=>{ return this.intervalTime;}; return _getInterval(); };
    /**
     * 背景色設定値取得
     * @returns {Color} 表示色
     * @description
     * 現在設定されている画面の背景色を取得します。<br>\
     * 設定された色指定文字列を返します。
     */
    getBackgroundcolor() { const _getBgc =()=>{return this.backgroundcolor;}; return _getBgc(); };

    //-------------------------------------------------------------
    /**
     * マップチップ用パターン描画
     * @param {Img} gr Image
     * @param {object} ptn パターン番号（またはx,y,w,hの入ったオブジェクト）
     * @param {number} x 表示位置
     * @param {number} y 表示位置
     * @param {number} w 表示幅
     * @param {number} h 表示高さ
     * @description
     * マップチップなどのパターン画像を画面に描画します。<br>\
     * 元画像からの切り出し位置、サイズ、表示位置、表示幅、高さを指定し、<br>\
     * オフスクリーンバッファに描画します。
     */
    putPattern(gr, ptn, x, y, w, h) {

        const _putPtn =(gr, ptn, x, y, w, h)=>{
            this.buffer.drawImgXYWHXYWH(
                gr,
                ptn.x, ptn.y, ptn.w, ptn.h,
                x, y, w, h
            );
        }
        _putPtn(gr, ptn, x, y, w, h);

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
     * @param {Color} c color
     * @description
     * 指定された文字列を画面に表示します。<br>\
     * 文字列、X座標、Y座標、表示色（省略時は"limegreen"）を指定し、<br>\
     * オフスクリーンバッファにテキストを描画します。<br>\
     * フォント展開やベクター表示であることを考えると<br>\
     * 毎フレーム書き換える用途での使用は限定して<br>\
     * あまり更新しない画面での使用を推奨します
     */
    print(str, x, y, c) {

        if (!Boolean(c)) { c = "limegreen"; }

        const _print =(str, x, y, c)=>{
            this.buffer.fillText(str, x, y, c);
        }
        _print(str, x, y, c);
    };

    /**
     * @typedef {string} FontTextStyle テキストスタイル
     * @example
     * "bold 48px serif"
     * @description
     *  CSS の font の記述子と同じ構文
     * @see https://developer.mozilla.org/ja/docs/Web/CSS/font
     */
    /**
     * フォントの指定
     * @param {FontTextStyle} [str="16px 'Arial'"] フォントスタイル
     * @description
     * print methodで使用するフォントを変更します
     * @todo 指定した効果が発生しない2025/08/20　
     */
    assignFont(str="16px 'Arial'"){
        const _assignFont =(str)=>{
            this.device.font = str;
        }
        _assignFont(str);
    }
    //------------------------------------------------------------
    /**
     * 画像イメージを直接取得して表示させる。
     * @param {Img} gr 画像(イメージデータ)
     * @param {number} x 表示位置座標
     * @param {number} y 表示位置座標
     * @description 
     * 元画像のサイズそのままに、オフスクリーンバッファへ描画します。
     */
    putImage(gr, x, y) {

        const _putImg = (gr, x, y) =>{
            this.buffer.drawImgXY(gr, x, y);
        }
        _putImg(gr, x, y);

    };
    //------------------------------------------------------------
    /**
     * 画像イメージを直接取得して表示させる。（ほぼテスト用）
     * @param {Img} gr 画像(イメージデータ)
     * @param {number} x 表示位置座標
     * @param {number} y 表示位置座標
     * @param {number} w 表示幅
     * @param {number} h 表示高さ
     * @description
     * 画像イメージを指定されたサイズで<br>\
     * オフスクリーンバッファへ描画します。
    */
    putImage2(gr, x, y, w, h) {

        const _putImg2 = (gr, x, y, w, h) =>{ 
            this.buffer.drawImgXYWH(gr, x, y, w, h);
        }
        _putImg2(gr, x, y, w, h);
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
     * @description
     * 画像イメージを変形行列（Transform）を適用して表示します。<br>\
     * 画像データと変換座標（m11, m12, m21, m22）を指定し、<br>\
     * 画像を自由に拡大・縮小・回転・せん断して描画できます。
    */
    putImageTransform(gr, x, y, m11, m12, m21, m22) {

        const _putImgTr = (gr, x, y, m11, m12, m21, m22)=>{
            this.buffer.putImageTransform(gr, x, y, m11, m12, m21, m22);
        }
        _putImgTr(gr, x, y, m11, m12, m21, m22);
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
        const _tr = (m11, m12, m21, m22) =>{
            this.buffer.Transform(m11, m12, m21, m22, 0, 0);
        }
        _tr(m11, m12, m21, m22);
    };
    //------------------------------------------------------------
    /**
     * 表示機能有り(draw)objectで表示コマンドを登録して表示
     * @param {PutFuncCustomDraw} cl 表示機能有り(draw)object
     * @description
     * `draw(device)`関数を持つカスタム描画オブジェクトを登録し、実行します。
    */
    putFunc(cl) {
        const _putFunc =(cl)=>{
        //ここで登録するクラスには表示の為に"draw( device )" functionを必ず登録
            this.buffer.putFunc(cl);
        }
        _putFunc(cl);
    };
    //---------------------------------------------------------
    /**
     * 画面消去(クリア）
     * @param {Color} c_str クリア背景色
     * @description
     * 画面全体を消去（クリア）します。<br>\
     * オプションで背景色を指定して塗りつぶすことも可能で、<br>\
     * `setInterval(0)`設定時以外は、毎フレーム自動的に呼び出されます。
    */
    clear(c_str) {
        const _clear = (c_str) =>{
            if (this.flip()) {

                this.buffer.allClear(0, 0, this.cw, this.ch);

                if (c_str === void 0) { c_str = this.backgroundcolor; }
                if (Boolean(c_str)) {
                    this.buffer.fillRect(0, 0, this.cw, this.ch, c_str);
                }
            }
        }
        _clear(c_str);
    };
    //-----------------------------------------------------
    /**
     * 部分クリア(色指定で部分塗りつぶし）
     * @param {number} x 表示位置座標
     * @param {number} y 表示位置座標
     * @param {number} w 表示幅
     * @param {number} h 表示高さ
     * @param {Color} c_str 塗り潰し色
     * @description
     * 画面の指定された範囲を色で塗りつぶします。<br>\
     * X座標、Y座標、幅、高さ、塗りつぶし色を指定し、<br>\
     * RGBA形式で半透明色も指定可能です。
    */
    fill(x, y, w, h, c_str) {
        const _fill = (x, y, w, h, c_str)=>{

            this.buffer.fillRect(x, y, w, h, c_str);
        }
        _fill(x, y, w, h, c_str);
    };
    //----------------------------------------------------------
    /**
     * offScreenのクリア
     * @description
     * オフスクリーンバッファをクリアします。<br>\
     * `enable_reset_flag`が`true`の場合に実行され、<br>\
     * バッファの内容を消去して初期状態に戻します。
    */
    reset() {
        const _reset =()=>{
            this.buffer.reset();
        }
        _reset();
    };
    //----------------------------------------------------------
    /**
     * (flameloopで実行用）offScreenのクリア
     * @description
     * フレームループ内で実行されることを想定したオフスクリーンバッファのクリア関数です。<br>\
     * `enable_reset_flag`が`true`の場合、`reset`メソッドを呼び出して<br>\
     * バッファをクリアします。
    */
    reflash() { 
        const _reflash =()=>{    
            this.buffer.reflash(); 
        }
        _reflash();
    
    };
    //----------------------------------------------------------
    /**
     * 描画
     * @description
     * オフスクリーンバッファの内容をメインのCanvasに反映させます。<br>\
     * この処理により、オフスクリーンで描画された全ての要素が<br>\
     * ユーザーに見える形で画面に表示されます。
    */
    draw() {
        const _draw =()=>{
            this.buffer.draw(this.device);
        }
        _draw();
    };
    //----------------------------------------------------------
    /**
     * 書き込み処理回数の取得
     * @returns {number} draw実行毎の回数
     * @description
     * 前回の`draw`メソッド呼び出し以降に実行された描画関数の回数を返します。<br>\
     * これにより、1フレームあたりの描画負荷の目安を把握できます。
    */
    count() {
        const _c = ()=>{
            return this.buffer.count();
        }
        return _c();
    };
    //----------------------------------------------------------
    /**
     * 書き込み処理回数最大値の取得
     * @returns {number} 最大値
     * @description
     * 記録された描画関数呼び出し回数の最大値を返します。<br>\
     * これは、各フレームにおける描画負荷のピーク値を示し、<br>\
     * パフォーマンス最適化の参考にできます。
    */
    max() {
        const _m =()=>{
            return this.buffer.max();
        }
        return _m();
    };
}



