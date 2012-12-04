// DisplayControlクラス
//

function DisplayControl(canvas_id, c_w, c_h) {
    //キャンバスID、キャンバス幅、高さ指定。画面表示サイズはCSSのSTYLEで
    //指定してあるのでここでは、操作する解像度を指定する。

    var buffer_ = new offScreen();
    //var buffer_ = new offScreenTypeB(c_w, c_h);

    this.buffer = buffer_;

    var canvas = document.getElementById(canvas_id);

    canvas.width = c_w;
    canvas.height = c_h;

    var device = canvas.getContext("2d");

    this.cw = canvas.width;
    this.ch = canvas.height;

    device.font = "16px 'Arial'";

    //加算合成を使用する。
    this.lighter_enable = true;//現在無効

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

        buffer_.allClear(0, 0, canvas.width, canvas.height);

        if (Boolean(c_str)) {
            buffer_.fillRect(0, 0, canvas.width, canvas.height, c_str);
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
}



