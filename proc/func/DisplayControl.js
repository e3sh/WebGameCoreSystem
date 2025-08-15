// DisplayControlクラス

/**
 * 画面表示コントロール(CanvasLayerControl)クラス
 *  
 * @param {DeviceContext} ctx 
 * @param {number} c_w pixel width
 * @param {number} c_h pixel height
 * @param {number} ix display offset x
 * @param {number} iy display offset y
 * 
 * 実際の画面表示サイズはCSSのSTYLEで
 * 指定してあるのでここでは、操作する解像度を指定する。
 * 
 */
function DisplayControl(ctx, c_w, c_h, ix, iy) {

    let buffer_;
    buffer_ = new offScreenTypeC(c_w, c_h, ix, iy); //offScreenCanvas版(2023/03-)

    /**
     * offscreenTypeC function (debug)
     * @type {screenbuffer} 
     */
    this.buffer = buffer_;

    let device = ctx ;//canvas.getContext("2d");

    /**
     * canvas.width
     * @type {number} 
     */
    this.cw = c_w//canvas.width;
    /**
     * canvas.height
     * @type {number} 
     */
    this.ch = c_h//canvas.height;

    device.font = "16px 'Arial'";

    /**
     * 加算合成を使用する
     * @type {boolean} 
     * @todo 現在は効果なし/削除予定
     * @deprecaed 
     */
    this.lighter_enable = true;//現在無効

    this.view = buffer_.view;
    this.flip = buffer_.flip;

    let intv = 1;
    let bgcolor = "";
 
    //以下のプロパティは内部では使用せず、外部参照し外から制御する為のパラメータ
    //this.interval = int; // 自動更新での更新間隔(0:自動更新なし　1:毎回　2～:間隔)
    //this.backgroundcolor = bgcolor; //defaultBackgroundcolor;

    /**
     * 表示間隔設定(フレーム)
     * @param {number} num 更新間隔
     * 0指定で自動更新(clear)抑止
     */
    this.setInterval = function( num ){
        if (num == 0) {
            buffer_.flip(false);
        }else{
            buffer_.flip(true);
        }
        intv = num;
     }
    /**
     * 背景色設定
     * @param {string} str 表示色
     * null,""指定で透過色でクリア
     */
    this.setBackgroundcolor = function( str ){ bgcolor = str; this.backgroundcolor = bgcolor;}
    /**
     * 現在の表示間隔(フレーム)設定値取得
     * @returns {number} 更新間隔(フレーム)
     */
    this.getInterval = function(){ return intv; }
    /**
     * 現在の背景色設定値取得
     * @returns {string} 表示色
     */
    this.getBackgroundcolor = function(){ return bgcolor;}
    
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
    this.putPattern = function (gr, ptn, x, y, w, h) {
        
        buffer_.drawImgXYWHXYWH(
            gr,
            ptn.x,ptn.y,ptn.w,ptn.h,
            x, y, w, h
        );
    }
    //-------------------------------------------------------------
    /**
     * マップチップ用パターン切り取り配列の登録
     * @param {Img} gr Image
     * @param {object} bgpth パターン配列（x,y,w,hの入ったオブジェクト）
     * @todo　用途不明
     */
    this.setBgPattern = function (bgptn) {

        bgPtn = bgptn;
    }
    //-------------------------------------------------------------
    /**
     * 文字列の表示(fillText) 
     * @param {string} str MessageText
     * @param {number} x position
     * @param {number} y position
     * @param {string} c color
     * @todo Fontの指定
     */
    this.print = function (str, x, y, c) {

        if (!Boolean(c)) { c = "limegreen"; }

        buffer_.fillText(str,x,y,c);
    }
    //------------------------------------------------------------
    /**
     * 画像イメージを直接取得して表示させる。
     * @param {Img} gr 画像(イメージデータ)
     * @param {number} x 表示位置座標
     * @param {number} y 表示位置座標
     */
    this.putImage = function (gr, x, y) {

        buffer_.drawImgXY(gr, x, y);
    }
    //------------------------------------------------------------
    /**
     * 画像イメージを直接取得して表示させる。（ほぼテスト用）
     * @param {Img} gr 画像(イメージデータ)
     * @param {number} x 表示位置座標
     * @param {number} y 表示位置座標
     * @param {number} w 表示幅
     * @param {number} h 表示高さ
    */
    this.putImage2 = function (gr, x, y, w, h) {

        buffer_.drawImgXYWH(gr, x, y, w, h);
    }
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
    this.putImageTransform = function (gr, x, y, m11, m12, m21, m22) {

        buffer_.putImageTransform(gr, x, y, m11, m12, m21, m22);
    }
    //---------------------------------------------------------
    /**
     * Transform(OffscreenBuffer全体の変形)
     * @param {number} m11 変換座標
     * @param {number} m12 変換座標
     * @param {number} m21 変換座標
     * @param {number} m22 変換座標
    */
    this.transform = function (m11, m12, m21, m22) {

        buffer_.Transform(m11, m12, m21, m22, 0, 0);
    }
    //------------------------------------------------------------
    /**
     * 表示機能有り(draw)objectで表示コマンドを登録して表示
     * @param {object} cl 表示機能有り(draw)object
    */
    this.putFunc = function (cl) {

        //ここで登録するクラスには表示の為に"draw( device )" functionを必ず登録
        buffer_.putFunc(cl);
    }
    //---------------------------------------------------------
    /**
     * 画面消去(クリア）
     * @param {string} c_str クリア背景色
     * nullの場合はクリアのみで塗りつぶしは無し
    */
    this.clear = function (c_str) {

        if (this.flip()){

            buffer_.allClear(0, 0, c_w, c_h);

            if (c_str === void 0){ c_str = bgcolor; }
            if (Boolean(c_str)) {
                buffer_.fillRect(0, 0, c_w, c_h, c_str);
            }
        }   
    }
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
    this.fill = function (x, y, w, h, c_str) {

        buffer_.fillRect(x, y, w, h, c_str);
    }
    //----------------------------------------------------------
    /**
     * offScreenのクリア
    */
    this.reset = function () {

        buffer_.reset();
    }
    //----------------------------------------------------------
    /**
     * (flameloopで実行用）offScreenのクリア
    */
    this.reflash = function () {buffer_.reflash();}
    //----------------------------------------------------------
    /**
     * 描画
    */
    this.draw = function () {

        buffer_.draw(device);
    }
    //----------------------------------------------------------
    /**
     * 書き込み処理回数の取得
     * @returns {number} draw実行毎の回数
    */
    this.count = function () {

        return buffer_.count();
    }
    //----------------------------------------------------------
    /**
     * 書き込み処理回数最大値の取得
     * @returns {number} 最大値
    */
    this.max = function () {

        return buffer_.max();
    }

}



