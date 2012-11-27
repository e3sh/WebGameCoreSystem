// offScreenクラス
// (offscreen buffer)
//
// backBuffer用キャンバスに随時描画する。
//
// 処理がシンプルでいいのだが、 
// オフラインではIE以外でエラーになってしまう。
// （getImageDataのクロスオリジン制限によるもの）
// 
//

function offScreenTypeB( w, h ) {

    //描画オブジェクトバッファ

    var element = document.createElement("canvas");
    element.width = w;
    element.height = h;

    var device = element.getContext("2d");

    this.flip = function ( outdev ) {

        outdev.putImageData(device.getImageData(0, 0, element.width, element.height), 0, 0);
    }

    //-------------------------------------------------------------
    //SP_PUT
    //use img, sx, sy, sw, sh, dx, dy, dw, dh, m11, m12, m21, m22, tx, ty, alpha, r
    //-------------------------------------------------------------
    this.spPut = function (img, sx, sy, sw, sh, dx, dy, dw, dh, m11, m12, m21, m22, tx, ty, alpha, r) {

        device.save();

        device.setTransform(m11, m12, m21, m22, tx, ty);
        if (r != 0) { device.rotate(Math.PI / 180 * r); }

        if (alpha == 255) {
            device.globalCompositeOperation = "source-over";
        } else {
            //if (this.light_enable) device.globalCompositeOperation = "lighter"; //source-over
            device.globalAlpha = alpha * (1.0 / 255);
        }

        device.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);

        device.restore();
    }

    //-------------------------------------------------------------
    //DRAWIMG_XYWH_XYWH
    //use img, sx, sy, sw, sh, dx, dy, dw, dh
    //-------------------------------------------------------------
    this.drawImgXYWHXYWH = function (img, sx, sy, sw, sh, dx, dy, dw, dh) {

        device.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    }

    //-------------------------------------------------------------
    //FILLTEXT
    //use text, sx, sy, color
    //-------------------------------------------------------------
    this.fillText = function (str, x, y, c) {

        if (!Boolean(c)) { c = "limegreen"; }

        device.fillStyle = c;
        device.fillText(str, x, y);
    }
   
    //------------------------------------------------------------
    //DRAWIMG_XY
    //use img, sx, sy, sw, sh
    //------------------------------------------------------------
    this.drawImgXY = function (img, sx, sy) {
        
        device.drawImage(img, sx, sy);
    }

    //------------------------------------------------------------
    //DRAWIMG_XYWH
    //use img, sx, sy, sw, sh
    //------------------------------------------------------------
    this.drawImgXYWH = function (img, sx, sy, sw, sh) {

        device.drawImage(img, sx, sy, sw, sh);
    }

    //------------------------------------------------------------
    //PUTIMAGETRANSFORM
    //use img, m11, m12, m21, m22, tx, ty
    //------------------------------------------------------------
    this.putImageTransform = function (img, x, y, m11, m12, m21, m22) {

        device.save();

        device.setTransform(m11, m12, m21, m22, x, y);
        device.drawImage(img, 0, 0);

        device.restore();
    }

    //---------------------------------------------------------
    //TRANSFORM
    //use m11, m12, m21, m22, tx, ty
    //---------------------------------------------------------
    this.transform = function (m11, m12, m21, m22) {

    }

    //------------------------------------------------------------
    // クラスで表示コマンドを登録して表示させる。
    // 引数 cl:class
    //------------------------------------------------------------
    this.putFunc = function (cl) {

        cl.draw(device);
        //ここで登録するクラスには表示の為に"draw( device )" functionを必ず登録
    }

    //---------------------------------------------------------
    //ALLCLEAR
    //use sx, sy, sw, sh
    //---------------------------------------------------------
    this.allClear = function (x, y, w, h) {

        device.save();

        device.setTransform(1, 0, 0, 1, 0, 0);
        device.clearRect(x, y, w, h);

        device.restore();
    }

    //-----------------------------------------------------
    //FILLRECT
    //use sx, sy, sw, sh, color
    //----------------------------------------------------
    this.fillRect = function (sx, sy, sw, sh, color) {

        if (Boolean(color)) {
            device.fillStyle = color;
            device.fillRect(sx, sy, sw, sh);
        } else {
            device.clearRect(sx, sy, sw, sh);
        }
    }

    //----------------------------------------------------------
    //描画バッファ配列のリセット
    //----------------------------------------------------------
    this.reset = function () {
        //
    }

    //----------------------------------------------------------
    //描画
    //----------------------------------------------------------
    this.draw = function ( outdev ) {
        this.flip(outdev);
    }

    //----------------------------------------------------------
    //
    //----------------------------------------------------------
    this.count = function () {

        return 0;
    }
    //
}



