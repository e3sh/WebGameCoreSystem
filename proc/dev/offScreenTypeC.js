// offScreenクラス
// (offscreen buffer)
//
// offScreenCanvasに随時描画
//(Chrome69＿Sep.2018でサポートとの事なので対応
//
//全画面表示する為にOffscreenのLayerをmainのCanvasに重ねてまとめて表示させる

function offScreenTypeC( w, h, ix, iy ){//typeOffscreenCanvas版
    //w : width, h:height
    let element = new OffscreenCanvas( w, h );

    const offset_x = ix;
    const offset_y = iy;

    //2018頃にOFFSCREENcanvasが実装されたみたいなのでOFFSCREENCとして実装
    let efcnt = 0; //CallFunctionCount(Debug)
    let efmax = 0; //(Reserve)
    
    let device = element.getContext("2d");

    let enable_draw_flag = true;
    let enable_reset_flag = true;

    let _2DEffectEnable = false;//default off
    let view_angle = 0;

    //[Mode Functions]

    /**
     * MODE CHANGE ENNABLE_DRAW_FLAG 
     * @param {boolean} flg set enable_draw_flag
     * @returns {boolean} get enable_draw_flag
     * @todo 現在は効果なし/使用箇所確認後、削除予定
     */
    this.view = function ( flg ){ //flg : bool
        if (typeof flg == "boolean") {
            enable_draw_flag = flg;
        }
        return enable_draw_flag;
    }
    /**
     * MODE CHANGE ENNABLE_FLIP_FLAG 
     * @param {boolean} flg set enable_flip_flag
     * @returns {boolean} get enable_flip_flag
     * @todo 現在は効果なし/使用箇所確認後、削除予定
     */
    this.flip = function( flg ){
        if (typeof flg == "boolean") {
            enable_reset_flag = flg;
        }
        return enable_draw_flag;
    }
    //2024/04/29 new Function turn
    /**
     * FULLSCREEN ROTATE FUNCTION 
     * @param {numver} r rotate angle
     * @desc this function effect eneble :_2DEffectEnable:true 
     */
    this.turn = function( r ){
        if  (_2DEffectEnable) 
            view_angle = r;
    }
    /**
     * 2D FULLSCREEN EFFECT FUNCTION ENABLE  
     * @param {boolean} f ENABLE FLAG
     *  
     */
    this._2DEF = function(f){
        _2DEffectEnable = f

        if (f) {
            //回転で枠外が乱れるのでBackbufferを縦横2倍にする
            element = new OffscreenCanvas( w*2, h*2 );
            //書き込み位置の原点(0,0)を中心近くに寄せる
            device = element.getContext("2d");
            device.translate(w/2,h/2);
        } else {
            element = new OffscreenCanvas( w, h );
            device = element.getContext("2d");
            device.translate(0, 0);
        }
    }
    //[Draw Functions]
    //-------------------------------------------------------------
    //SP_PUT
    //use img, sx, sy, sw, sh, dx, dy, dw, dh, m11, m12, m21, m22, tx, ty, alpha, r
    //-------------------------------------------------------------
    this.spPut = function (img, sx, sy, sw, sh, dx, dy, dw, dh, m11, m12, m21, m22, tx, ty, alpha, r) {

        device.save();
        if (_2DEffectEnable){tx+=w/2; ty+=h/2};
        device.setTransform(m11, m12, m21, m22, tx, ty);
        if (r != 0) { device.rotate(Math.PI / 180 * r); }

        if (alpha == 255) {
            device.globalCompositeOperation = "source-over";
        } else {
            //if (this.light_enable) device.globalCompositeOperation = "lighter"; //source-over
            device.globalAlpha = alpha * (1.0 / 255);
        }
        //if (_2DEffectEnable){device.translate(w/2,h/2);};
        device.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);

        device.restore();
        //device.setTransform( 1,0,0,1,0,0 );

        efcnt++; 
    }

    //-------------------------------------------------------------
    //DRAWIMG_XYWH_XYWH
    //use img, sx, sy, sw, sh, dx, dy, dw, dh
    //-------------------------------------------------------------
    this.drawImgXYWHXYWH = function (img, sx, sy, sw, sh, dx, dy, dw, dh) {

        device.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);

        efcnt++; 
    }

    //-------------------------------------------------------------
    //FILLTEXT
    //use text, sx, sy, color
    //-------------------------------------------------------------
    this.fillText = function (str, x, y, c) {

        if (!Boolean(c)) { c = "limegreen"; }

        device.fillStyle = c;
        device.fillText(str, x, y);

        efcnt++; 
    }
   
    //------------------------------------------------------------
    //DRAWIMG_XY
    //use img, sx, sy, sw, sh
    //------------------------------------------------------------
    this.drawImgXY = function (img, sx, sy) {
        
        device.drawImage(img, sx, sy);

        efcnt++; 
    }

    //------------------------------------------------------------
    //DRAWIMG_XYWH
    //use img, sx, sy, sw, sh
    //------------------------------------------------------------
    this.drawImgXYWH = function (img, sx, sy, sw, sh) {

        device.drawImage(img, sx, sy, sw, sh);

        efcnt++; 
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

        efcnt++; 
    }

    //---------------------------------------------------------
    //TRANSFORM
    //use m11, m12, m21, m22, tx, ty
    //---------------------------------------------------------
    this.transform = function (m11, m12, m21, m22) {
        //dummy
        efcnt++; 
    }

    //------------------------------------------------------------
    // クラスで表示コマンドを登録して表示させる。
    // 引数 cl:class
    //------------------------------------------------------------
    this.putFunc = function (cl) {

        cl.draw(device);
        //ここで登録するクラスには表示の為に"draw( device )" functionを必ず登録

        efcnt++; 
    }

    //---------------------------------------------------------
    //ALLCLEAR
    //use sx, sy, sw, sh
    //---------------------------------------------------------
    this.allClear = function (sx, sy, sw, sh) {

        device.save();

        device.setTransform(1, 0, 0, 1, 0, 0);
        device.clearRect(sx, sy, sw, sh);

        device.restore();

        efcnt++; 
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

        efcnt++; 
    }

    //----------------------------------------------------------
    //描画バッファ配列のリセット(offScreenバッファのクリア)
    //----------------------------------------------------------
    this.reset = function () {

        if (enable_reset_flag){
            this.allClear(0, 0, w, h);
        }

        efcnt++; 
    }

    //----------------------------------------------------------
    //(flameloopで実行用）offScreenバッファのクリア
    //----------------------------------------------------------
    this.reflash = function () {

        if (enable_reset_flag){
            this.reset();
        }
        efcnt++;
    }

    //----------------------------------------------------------
    //描画
    //----------------------------------------------------------
    this.draw = function ( outdev ) {
        //2024/04/29 new Function turn
        if (enable_draw_flag){
            if (!_2DEffectEnable){ 
                //outdev.clearRect(0, 0, w, h);
                outdev.drawImage(element, offset_x, offset_y);
            }else{
                let w = element.width;
                let h = element.height;

                outdev.fillStyle = "green";
                outdev.fillRect(0,0,w/2,h/2);

                //outdev.clearRect(0, 0, w/2, h/2);
                
                outdev.save();
                outdev.translate(w/4,h/4);
                outdev.rotate((Math.PI/180)*((view_angle)%360));
                
                outdev.drawImage(element, offset_x-w/2, offset_y-h/2);
                //outdev.drawImage(element, offset_x, offset_y);

                outdev.restore();
                //console.log("e" + view_angle%360);
                device.fillStyle = "red";
                device.fillRect(-w/4,-h/4,w,h);
            }
        }
        efcnt = 0; //Drawコール毎の呼び出し数の記録の為、メインキャンバスに反映毎に0にする
    }
    //----------------------------------------------------------
    //
    //----------------------------------------------------------
    this.count = function () {
        //return function call count par frame
        return efcnt;
    }

    //----------------------------------------------------------
    //
    //----------------------------------------------------------
    this.max = function () {
        //dummy
        return efmax;
    }
}



