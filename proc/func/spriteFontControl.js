// GameSpriteFontControl
//

function GameSpriteFontControl( g, fontParam ) {
 
    var buffer_ = g.screen[0].buffer;
    //buffer  (offScreen)
    this.useScreen = function (num) {

        buffer_ = g.screen[num].buffer;
    }

    var tex_c = fontParam.Image
    var sp_ch_ptn = fontParam.pattern;

    //未着手

    //set/useFont( id )で使用するSpriteFontを選んで
    //printで描画とするか？spprint？

    //文字の拡大縮小は別

    //systemFontで描画だけでもいいのでは
    //WebFontについて調べる等
    //systemFontだと描画が重いかも

    //文字表示は別Canvasにして
    //毎時書き換えないようにしておくほうが負荷は低い

    //-------------------------------------------------------------
    /// スプライトを文字として表示(パターン配置をSpace～[~]のASCII配列と仮定で)
    /// 引数 S : 文字列 X,Y : 座標 z:zoom
    //-------------------------------------------------------------
    //表示位置はx,yが左上となるように表示されます。拡大するとずれます。

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

                var wx = x + i * (d.w * z);
                var wy = y;
                if (zflag) {
                    wx += (-d.w / 2) * z;
                    wy += (-d.h / 2) * z;
                }

                buffer_.drawImgXYWHXYWH(
                    tex_c,
                    d.x, d.y, d.w, d.h,
                    wx, wy,
                    d.w * z, d.h * z
                );
            }
        }
        //
    }

}

