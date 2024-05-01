// primaryBuffer
// (Draw primaryBuffer y)
// 画面表示順をソートして重ね表示の仕方を調整
// 2D3Dっぽくするには、yで(2023/08/12)
// 今日時点では未調整

function priorityBuffer(){

    //描画オブジェクトバッファ(性能により調整）
    var BUFFER_SIZE = 4000;

    //bufferCreate
    var buf_count = 0;
    var buffer = [];

    for (var i = 0; i < BUFFER_SIZE; i++) {
        buffer[i] = new ScreenSubClass();
    }

    var ef_item = [];
    var efmax = 0;

    function selectBuffer() {
        buf_count++
        if (buf_count >= BUFFER_SIZE) buf_count = 0;

        return buffer[buf_count];
    }

    /*
    //propatys (add 2023/01/11)
    var enable_draw_flag = true;
    var enable_reset_flag = true;
        
    this.view = function ( flg ){ //flg : bool
        if (typeof flg == "boolean") {
            enable_draw_flag = flg;
        }
        return enable_draw_flag;
    }

    this.flip = function( flg ){
        if (typeof flg == "boolean") {
            enable_reset_flag = flg;
        }
        return enable_draw_flag;
    }
    */

    //-------------------------------------------------------------
    //SP_PUT
    //use img, sx, sy, sw, sh, dx, dy, dw, dh, m11, m12, m21, m22, tx, ty, alpha, r
    //-------------------------------------------------------------
    this.spPut = function (img, sx, sy, sw, sh, dx, dy, dw, dh, m11, m12, m21, m22, tx, ty, alpha, r) {

        var o = selectBuffer();

        o.img = img;
        o.sx = sx;
        o.sy = sy;
        o.sw = sw;
        o.sh = sh;
        o.dx = dx;
        o.dy = dy;
        o.dw = dw;
        o.dh = dh;
        o.m11 = m11;
        o.m12 = m12;
        o.m21 = m21;
        o.m22 = m22;
        o.tx = tx;
        o.ty = ty;
        o.alpha = alpha;
        o.r = r;

        o.mode = SP_PUT;

        ef_item[ef_item.length] = o;

    }

    //-------------------------------------------------------------
    //DRAWIMG_XYWH_XYWH
    //use img, sx, sy, sw, sh, dx, dy, dw, dh
    //-------------------------------------------------------------
    this.drawImgXYWHXYWH = function (img, sx, sy, sw, sh, dx, dy, dw, dh) {

        var o = selectBuffer();

        o.img = img;
        o.sx = sx;
        o.sy = sy;
        o.sw = sw;
        o.sh = sh;
        o.dx = dx;
        o.dy = dy;
        o.dw = dw;
        o.dh = dh;

        o.mode = DRAWIMG_XYWH_XYWH;

        ef_item[ef_item.length] = o;

    }

    //-------------------------------------------------------------
    //FILLTEXT
    //use text, sx, sy, color
    //-------------------------------------------------------------
    this.fillText = function (str, x, y, c) {

        if (!Boolean(c)) { c = "limegreen"; }

        var o = selectBuffer();

        o.text = str;
        o.sx = x;
        o.sy = y;
        o.color = c;

        o.mode = FILLTEXT;

        ef_item[ef_item.length] = o;

    }
   
    //------------------------------------------------------------
    //DRAWIMG_XY
    //use img, sx, sy, sw, sh
    //------------------------------------------------------------
    this.drawImgXY = function (gr, x, y) {

        var o = selectBuffer();

        o.img = gr;
        o.sx = x;
        o.sy = y;

        o.mode = DRAWIMG_XY;

        ef_item[ef_item.length] = o;

    }

    //------------------------------------------------------------
    //DRAWIMG_XYWH
    //use img, sx, sy, sw, sh
    //------------------------------------------------------------
    this.drawImgXYWH = function (gr, x, y, w, h) {

        var o = selectBuffer();

        o.img = gr;
        o.sx = x;
        o.sy = y;
        o.sw = w;
        o.sh = h;

        o.mode = DRAWIMG_XYWH;

        ef_item[ef_item.length] = o;
    }

    //------------------------------------------------------------
    //PUTIMAGETRANSFORM
    //use img, m11, m12, m21, m22, tx, ty
    //------------------------------------------------------------
    this.putImageTransform = function (gr, x, y, m11, m12, m21, m22) {

        var o = selectBuffer();

        o.img = gr;
        o.tx = x;
        o.ty = y;
        o.m11 = m11;
        o.m12 = m12;
        o.m21 = m21;
        o.m22 = m22;

        o.mode = PUTIMAGETRANSFORM;

        ef_item[ef_item.length] = o;

    }

    //---------------------------------------------------------
    //TRANSFORM
    //use m11, m12, m21, m22, tx, ty
    //---------------------------------------------------------
    this.transform = function (m11, m12, m21, m22) {

        var o = selectBuffer();

        o.m11 = m11;
        o.m12 = m12;
        o.m21 = m21;
        o.m22 = m22;

        o.mode = TRANSFORM;

        ef_item[ef_item.length] = o;
    }

    //------------------------------------------------------------
    // クラスで表示コマンドを登録して表示させる。
    // 引数 cl:class
    //------------------------------------------------------------
    this.putFunc = function (cl) {

        //ここで登録するクラスには表示の為に"draw( device )" functionを必ず登録
        ef_item[ef_item.length] = cl;

    }

    //---------------------------------------------------------
    //ALLCLEAR
    //use sx, sy, sw, sh
    //---------------------------------------------------------
    this.allClear = function (x, y, w, h) {

        var o = selectBuffer();

        o.sx = x;
        o.sy = y;
        o.sw = w;
        o.sh = h;
 
        o.mode = ALLCLEAR;

        ef_item[ef_item.length] = o;
    }

    //-----------------------------------------------------
    //FILLRECT
    //use sx, sy, sw, sh, color
    //----------------------------------------------------
    this.fillRect = function (x, y, w, h, c_str) {

        var o = selectBuffer();

        o.sx = x;
        o.sy = y;
        o.sw = w;
        o.sh = h;

        o.color = c_str;

        o.mode = FILLRECT;

        ef_item[ef_item.length] = o;
    }

    //----------------------------------------------------------
    //描画バッファ配列のリセット
    //----------------------------------------------------------
    this.reset = function () {

        if (ef_item.length > BUFFER_SIZE) ef_item.length = 0; 

        ef_item = [];
        buf_count = 0;
        //
    }

    //----------------------------------------------------------
    //(flameloopで実行用）描画バッファ配列のリセット
    //----------------------------------------------------------
    this.reflash = function () {

        if (enable_reset_flag){
            this.reset();
        }
        //
    }

    //----------------------------------------------------------
    //描画
    //----------------------------------------------------------
    this.draw = function (device) {

        if (enable_draw_flag){
            for (var i = 0, loopend = ef_item.length; i < loopend; i++) {
                ef_item[i].draw(device);
            }
            if (efmax < ef_item.length) efmax = ef_item.length;
        }
    }
    //----------------------------------------------------------
    //
    //----------------------------------------------------------
    this.count = function () {

        return ef_item.length;
    }
    //----------------------------------------------------------
    //
    //----------------------------------------------------------
    this.max = function () {

        return efmax;
    }

    // offScreenItemClass

    var NON_DRAW = 0;
    var SP_PUT = 1;
    var DRAWIMG_XYWH_XYWH = 2;
    var DRAWIMG_XYWH = 3;
    var DRAWIMG_XY = 4;
    var FILLTEXT = 5;
    var PUTIMAGETRANSFORM = 6;
    var TRANSFORM = 7;
    var ALLCLEAR = 8;
    var FILLRECT = 9

    function ScreenSubClass() {

        this.img; this.text;
        this.sx; this.sy; this.sw; this.sh;
        this.dx; this.dy; this.dw; this.dh;
        this.color;
        //this.use_tranceform; this.light_enable;
        this.m11; this.m12; this.m21; this.m22;
        this.tx; this.ty;
        this.alpha; this.r;

        this.mode; // DrawMode;
    }

    // execute function array
    ScreenSubClass.prototype.func = [];
    ScreenSubClass.prototype.func[NON_DRAW] = function (device) {
        //use 

    }
    ScreenSubClass.prototype.func[SP_PUT] = function (device) {
        //use img, sx, sy, sw, sh, dx, dy, dw, dh, m11, m12, m21, m22, tx, ty, alpha, r
        device.save();

        device.setTransform(this.m11, this.m12, this.m21, this.m22, this.tx, this.ty);
        if (this.r != 0) { device.rotate(Math.PI / 180 * this.r); }

        if (this.alpha == 255) {
            device.globalCompositeOperation = "source-over";
        } else {
            //if (this.light_enable) device.globalCompositeOperation = "lighter"; //source-over
            device.globalAlpha = this.alpha * (1.0 / 255);
        }

        device.drawImage(this.img, this.sx, this.sy, this.sw, this.sh, this.dx, this.dy, this.dw, this.dh);

        device.restore();
    }
    ScreenSubClass.prototype.func[DRAWIMG_XYWH_XYWH] = function (device) {
        //use img, sx, sy, sw, sh, dx, dy, dw, dh
        device.drawImage(this.img, this.sx, this.sy, this.sw, this.sh, this.dx, this.dy, this.dw, this.dh);
    }
    ScreenSubClass.prototype.func[DRAWIMG_XYWH] = function (device) {
        //use img, sx, sy, sw, sh
        device.drawImage(this.img, this.sx, this.sy, this.sw, this.sh);
    }
    ScreenSubClass.prototype.func[DRAWIMG_XY] = function (device) {
        //use img, sx, sy, sw, sh
        device.drawImage(this.img, this.sx, this.sy);
    }
    ScreenSubClass.prototype.func[FILLTEXT] = function (device) {
        //use text, sx, sy, color
        device.fillStyle = this.color;
        device.fillText(this.text, this.sx, this.sy);
    }
    ScreenSubClass.prototype.func[PUTIMAGETRANSFORM] = function (device) {
        //use img, m11, m12, m21, m22, tx, ty
        device.save();

        device.setTransform(this.m11, this.m12, this.m21, this.m22, this.tx, this.ty);
        device.drawImage(this.img, 0, 0);

        device.restore();
    }
    ScreenSubClass.prototype.func[TRANSFORM] = function (device) {
        //use m11, m12, m21, m22, tx, ty

    }
    ScreenSubClass.prototype.func[ALLCLEAR] = function (device) {
        //use sx, sy, sw, sh
        
        /*
        device.save();

        device.setTransform(1, 0, 0, 1, 0, 0);
        device.clearRect(this.sx, this.sy, this.sw, this.sh);

        device.restore();
        */
    }
    ScreenSubClass.prototype.func[FILLRECT] = function (device) {
        //use sx, sy, sw, sh, color
        if (Boolean(this.color)) {
            device.fillStyle = this.color;
            device.fillRect(this.sx, this.sy, this.sw, this.sh);
        } else {
            device.clearRect(this.sx, this.sy, this.sw, this.sh);
        }
    }

    //execute draw
    ScreenSubClass.prototype.draw = function (device) {
        //use mode
        this.func[this.mode].call(this, device);
    }

    //
}



