// DisplayControlクラス
//

function DisplayControl(ctx, c_w, c_h, ix, iy, bt = "use") {
    //キャンバスID、キャンバス幅、高さ指定。画面表示サイズはCSSのSTYLEで
    //指定してあるのでここでは、操作する解像度を指定する。

    //var buffer_ = new offScreen();//複数のCanvasをLayerと使用する版(1枚Canvas使用にしたのでこちらにする場合は処理で調整が必要)
    //var buffer_ = new offScreenTypeB(c_w, c_h);//過去の遺物:↓が上位互換なのでこちらに移行
    //var buffer_ = new offScreenTypeC(c_w, c_h, ix, iy); //offScreenCanvas版(2023/03)

    var buffer_;

    if (typeof OffscreenCanvas !== "undefined") {//iPadで動かなかった為、判定追加
        // OffscreenCanvasが使用可能
        // ここにOffscreenCanvasを使用するコードを書く
        if (bt == "use"){ //debugの為、未使用指定できるように判定する。
            buffer_ = new offScreenTypeC(c_w, c_h, ix, iy); //offScreenCanvas版(2023/03)
        }else{
            buffer_ = new offScreen();
        }
    } else {
        buffer_ = new offScreen();
    }

    this.buffer = buffer_;

    //var canvas = document.getElementById(canvas_id);

    //canvas.width = c_w;
    //canvas.height = c_h;

    var device = ctx ;//canvas.getContext("2d");

    this.cw = c_w//canvas.width;
    this.ch = c_h//canvas.height;

    //this.dom = canvas;

    device.font = "16px 'Arial'";

    //加算合成を使用する。
    this.lighter_enable = true;//現在無効

    this.view = buffer_.view;
    this.flip = buffer_.flip;

    var intv = 1;
    var bgcolor = "";
 
    //以下のプロパティは内部では使用せず、外部参照し外から制御する為のパラメータ
    //this.interval = int; // 自動更新での更新間隔(0:自動更新なし　1:毎回　2～:間隔)
    //this.backgroundcolor = bgcolor; //defaultBackgroundcolor;

    this.setInterval = function( num ){
        if (num == 0) {
            buffer_.flip(false);
        }else{
            buffer_.flip(true);
        }
        intv = num;
     }
    this.setBackgroundcolor = function( str ){ bgcolor = str; this.backgroundcolor = bgcolor;}

    this.getInterval = function(){ return intv; }
    this.getBackgroundcolor = function(){ return bgcolor;}

    //-------------------------------------------------------------
    ///マップチップ用パターン描画
    ///引数（省略不可
    /// gr:Image()
    ///	ptn : パターン番号（またはx,y,w,hの入ったオブジェクト）
    /// X,Y : 表示位置
    ///	w,h: 表示幅/高さ
    //-------------------------------------------------------------

    this.putPattern = function (gr, ptn, x, y, w, h) {
        
        buffer_.drawImgXYWHXYWH(
            gr,
            ptn.x,ptn.y,ptn.w,ptn.h,
            x, y, w, h
        );
    }

    //-------------------------------------------------------------
    ///マップチップ用パターン切り取り配列の登録
    ///引数（省略不可
    ///	bgptn : パターン配列（x,y,w,hの入ったオブジェクト）
    //-------------------------------------------------------------
    this.setBgPattern = function (bgptn) {

        bg_ptn = bgptn;

    }

    //-------------------------------------------------------------
    ///文字列の表示
    ///引数 S:文字列 X,Y:座標 c:Color
    //-------------------------------------------------------------
    this.print = function (str, x, y, c) {

        if (!Boolean(c)) { c = "limegreen"; }

        buffer_.fillText(str,x,y,c);

    }

    //------------------------------------------------------------
    // 画像イメージを直接取得して表示させる。
    // 引数 G :画像(イメージデータ X,Y: 座標
    //------------------------------------------------------------
    this.putImage = function (gr, x, y) {

        buffer_.drawImgXY(gr, x, y);
    }

    //------------------------------------------------------------
    // 画像イメージを直接取得して表示させる。（ほぼテスト用）
    // 引数 G :画像(イメージデータ X,Y: 座標 w,h表示サイズ指定
    //------------------------------------------------------------
    this.putImage2 = function (gr, x, y, w, h) {

        buffer_.drawImgXYWH(gr, x, y, w, h);
    }

    //------------------------------------------------------------
    // 画像イメージを直接取得して表示させる。（Transform付き）
    // 引数 G :画像(イメージデータ) X,Y: 座標 m11,m12,m21,m22 変換座標
    //------------------------------------------------------------
    this.putImageTransform = function (gr, x, y, m11, m12, m21, m22) {

        buffer_.putImageTransform(gr, x, y, m11, m12, m21, m22);
    }

    //---------------------------------------------------------
    ///Transform
    //---------------------------------------------------------
    this.transform = function (m11, m12, m21, m22) {

        buffer_.Transform(m11, m12, m21, m22, 0, 0);
    }

    //------------------------------------------------------------
    // クラスで表示コマンドを登録して表示させる。
    // 引数 cl:class
    //------------------------------------------------------------
    this.putFunc = function (cl) {

        //ここで登録するクラスには表示の為に"draw( device )" functionを必ず登録
        buffer_.putFunc(cl);
    }

    //---------------------------------------------------------
    ///画面消去(クリア）
    //---------------------------------------------------------
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
    //部分クリア(色指定で部分塗りつぶし）
    //----------------------------------------------------
    this.fill = function (x, y, w, h, c_str) {

        buffer_.fillRect(x, y, w, h, c_str);
   }

    //----------------------------------------------------------
    //描画バッファ配列のリセット
    //----------------------------------------------------------
    this.reset = function () {

        buffer_.reset();
    }

    this.reflash = function () {buffer_.reflash();}

    //----------------------------------------------------------
    //描画
    //----------------------------------------------------------
    this.draw = function () {

        buffer_.draw(device);
    }

    //----------------------------------------------------------
    //
    //----------------------------------------------------------
    this.count = function () {

        return buffer_.count();
    }
    //----------------------------------------------------------
    //
    //----------------------------------------------------------
    this.max = function () {

        return buffer_.max();
    }

}



