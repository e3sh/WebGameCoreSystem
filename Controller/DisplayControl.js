// DisplayControlクラス
//

//変更したいところ多数
// image
// dsp = new DisplayControl()
//
// dsp.sprite.animation
// dsp.font.
// dsp.direct->
//     L offscreenbuffer -> display(canvas)
//
//

function DisplayControl(canvas_id, c_w, c_h) {
    //キャンバスID、キャンバス幅、高さ指定。画面表示サイズはCSSのSTYLEで
    //指定してあるのでここでは、操作する解像度を指定する。

    var buffer_ = new offScreen();

    //    alert("!");
    //キャラクタパターンテクスチャー
    //　以下はSprite及びSpriteFontに含ませ外部に出す
    var tex_p = new Image();
    tex_p.src = "pict/cha.png";

    var tex_c = new Image();
    tex_c.src = "pict/aschr.png"
    //↑↑

    //　以下はSprite及びSpriteFontに含ませ外部に出す
    var sp_ch_ptn = []; //スプライトキャラクタパターン
    //↑↑

    var canvas = document.getElementById(canvas_id);

    canvas.width = c_w;
    canvas.height = c_h;

    var device = canvas.getContext("2d");

    this.cw = canvas.width;
    this.ch = canvas.height;

    //　以下はSprite及びSpriteFontに含ませ外部に出す
    //画像の読込処理などはAssetの方でコントロールさせる。
    var spReady = false;
    var chReady = false;

    this.sprite_texture_ready = spReady;
    this.character_texture_ready = chReady;

    device.font = "16px 'Arial'";

    tex_p.onload = function () {
        spReady = true;
    }

    tex_c.onload = function () {
        chReady = true;
    }

    this.readystate_check = function () {
        this.sprite_texture_ready = spReady;
        this.character_texture_ready = chReady;
    }

   var sp_ptn = spdata();

    var bg_ptn = [];

    for (i = 0; i < 7; i++) {
        for (j = 0; j < 16; j++) {
            ptn = {
                x: 12 * j,
                y: 16 * i,
                w: 12,
                h: 16,
            }

            sp_ch_ptn.push(ptn);
        }
    }

    var sp_ch_ptn8 = []; //スプライトキャラクタパターン(8x8)

    for (i = 0; i < 7; i++) {
        for (j = 0; j < 16; j++) {
            ptn = {
                x: 8 * j,
                y: 8 * i + 128,
                w: 8,
                h: 8
            };
        sp_ch_ptn8.push(ptn);
    }
    }

    var sp8 = []; //spchrptn8(color)

    for (var t = 0; t <= 3; t++) {

        var ch = [];

        for (i = 0; i < 7; i++) {
            for (j = 0; j < 16; j++) {
                ptn = {
                    x: 8 * j + ((t % 2 == 0) ? 0 : 128),
                    y: 8 * i + 128 + ((t >= 2) ? 64 : 0),
                    w: 8,
                    h: 8
                };
                ch.push(ptn);
            }
        }
        sp8[t] = ch;
    }
    //↑↑


    //World => View変換を使用
    //this.view_tr_enable = false;

    //加算合成を使用する。
    this.lighter_enable = true;//現在無効

    //-------------------------------------------------------------
    ///スプライト描画
    ///引数（m,r,alpha,zは省略するとデフォルト使用）
    ///	Sp : スプライト番号	X,Y : 表示位置
    ///	M : 上下左右反転 ( 0 NORMAL 1:上下反転 2 :左右反転 )
    ///	R : 回転角度 (0 - 359 )
    ///	alpha: アルファ値（透明度）0:透明～255:不透明）
    ///	z: Zoom（拡大率）
    //-------------------------------------------------------------
    //表示位置はx,yが表示中心となるように表示されます。
    this.put = function (sp, x, y, m, r, alpha, z) {

        var d = sp_ptn[sp];

        //Debug(error回避)用
        if (!Boolean(d)) {
            buffer_.fillText(sp, x, y, "green");
            return
        }

        //var simple = true;

        if (!Boolean(m)) { m = 0; }
        if (!Boolean(r)) { r = 0; }
        if (!Boolean(alpha)) { alpha = 255; }
        if (!Boolean(z)) { z = 1.0; }

        var simple = ((m == 0) && (r == 0) && (alpha == 255));

        //var simple = false;
        if (simple) {
            buffer_.drawImgXYWHXYWH(
                tex_p,
                d.x,d.y,d.w,d.h,
                x + (-d.w / 2) * z,
                y + (-d.h / 2) * z,
                d.w * z,
                d.h * z
            );

        } else {

            var FlipV = 1.0;
            var FlipH = 1.0;

            switch (m) {
                case 0:
                    break;
                case 1:
                    FlipV = -1.0;
                    break;
                case 2:
                    FlipH = -1.0;
                    break;
                case 3:
                    FlipV = -1.0;
                    FlipH = -1.0;
                    break;
                default:
                    break;
            }

            //o.light_enable = this.light_enable;

            buffer_.spPut(
                tex_p,
                d.x,d.y,d.w,d.h,
                (-d.w / 2) * z,
                (-d.h / 2) * z,
                d.w * z,
                d.h * z,
                FlipH, 0, 0, FlipV,
                x, y,
                alpha, r
            );

        }
    }

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
    //ここからSpriteFontに

    //-------------------------------------------------------------
    /// スプライトを文字として表示(パターン配置をSpace～[~]のASCII配列と仮定で)
    /// 引数 S : 文字列 X,Y : 座標 z:zoom
    //-------------------------------------------------------------
    //表示位置はx,yが左上となるように表示されます。

    //    this.putchr = chr8x8put;
    this.putchr = function (str, x, y, z) {
        //    dummy = function (str, x, y, z) {

        var zflag = false;
        if (!Boolean(z)) {
            z = 1.0;

        } else {
            if (z != 1.0) zflag = true;
        }

        for (var i = 0, loopend = str.length; i < loopend; i++) {
            var n = str.charCodeAt(i);

            if ((n >= 32) && (n < 128)) { // space ～ "~" まで
                var d = sp_ch_ptn[n - 32];

                var wx  = x + i * (12 * z);
                var wy = y;
                if (zflag) {
                    wx += (-d.w / 2) * z;
                    wy += (-d.h / 2) * z;
                }

                buffer_.drawImgXYWHXYWH(
                    tex_c,
                    d.x,d.y,d.w,d.h,
                    wx, wy,
                    d.w*z, d.h*z
                );
            }
        }
        //
    }

    //-------------------------------------------------------------
    /// スプライトを文字として表示(パターン配置をSpace～[~]のASCII配列と仮定で)
    /// 引数 S : 文字列 X,Y : 座標
    //-------------------------------------------------------------
    //表示位置はx,yが左上となるように表示されます。
    this.putchr8 = chr8x8put;

    function chr8x8put(str, x, y) {

        for (i = 0; i < str.length; i++) {
            var n = str.charCodeAt(i);

            if ((n >= 32) && (n < 128)) { // space ～ "~" まで
                var d = sp_ch_ptn8[n - 32];

                buffer_.drawImgXYWHXYWH(
                    tex_c,
                    d.x,d.y,d.w,d.h,
                    x + i * 8,
                    y,
                    d.w, d.h);
            }
        }
        //
    }

    //-------------------------------------------------------------
    /// スプライトを文字として表示(パターン配置をSpace～[~]のASCII配列と仮定で)
    /// 引数 S : 文字列 X,Y : 座標 c:color (0:white 1:red 2:green 3:blue) z:zoom
    //-------------------------------------------------------------
    //表示位置はx,yが左上となるように表示されます。
    this.putchr8c = function (str, x, y, c, z) {

        if (!Boolean(z)) { z = 1.0; }

        for (i = 0; i < str.length; i++) {
            var n = str.charCodeAt(i);

            if ((n >= 32) && (n < 128)) { // space ～ "~" まで

                var d = sp8[c][n - 32];

                buffer_.drawImgXYWHXYWH(
                    tex_c,
                    d.x,d.y,d.w,d.h,
                    x + i * (8 * z) + (-d.w / 2) * z,
                    y + (-d.h / 2) * z,
                    d.w * z,
                    d.h * z
                );
            }
        }
        //
    }
    //ここまでSpriteFontに

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



