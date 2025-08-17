/**
 * offScreenクラス
 * (offscreen buffer)
 * 
 * @description
 * DisplayControlのoffscreen buffer
 * offScreenCanvasに随時描画
 * 全画面表示する為にOffscreenCanvasをLayerとして
 * mainのCanvasにまとめて重ね表示させる
 */
class offScreenTypeC {
    /**
     * @param {number} w canvas width pixel
     * @param {number} h canvas height pixel
     * @param {number} ix screen offset x 
     * @param {number} iy screen offset y  
     */
    constructor(w, h, ix, iy) {
        //w : width, h:height
        const element = new OffscreenCanvas(w, h);

        const offset_x = ix;
        const offset_y = iy;

        let efcnt = 0; //CallFunctionCount
        let efmax = 0; //CallFunctionCount(Max)

        const device = element.getContext("2d");

        let enable_draw_flag = true;
        let enable_reset_flag = true;

        let _2DEffectEnable = false; //default off
        let view_angle = 0;

        //[Mode Functions]
        /**
         * MODE CHANGE ENNABLE_DRAW_FLAG
         * @param {boolean} flg set enable_draw_flag
         * @returns {boolean} get enable_draw_flag
         * @todo 現在は効果なし/使用箇所確認後、削除予定
         */
        this.view = function (flg) {
            if (typeof flg == "boolean") {
                enable_draw_flag = flg;
            }
            return enable_draw_flag;
        };
        /**
         * MODE CHANGE ENNABLE_FLIP_FLAG
         * @param {boolean} flg set enable_flip_flag
         * @returns {boolean} get enable_flip_flag
         * @todo 現在は効果なし/使用箇所確認後、削除予定
         */
        this.flip = function (flg) {
            if (typeof flg == "boolean") {
                enable_reset_flag = flg;
            }
            return enable_draw_flag;
        };
        /**
         * FULLSCREEN ROTATE FUNCTION
         * @param {numver} r rotate angle
         * @desc this function effect eneble :_2DEffectEnable:true
         */
        this.turn = function (r) {
            if (_2DEffectEnable)
                view_angle = r;
        };
        /**
         * 2D FULLSCREEN EFFECT FUNCTION ENABLE
         * @param {boolean} f ENABLE FLAG
         *
         */
        this._2DEF = function (f) {
            _2DEffectEnable = f;

            if (f) {
                //回転で枠外が乱れるのでBackbufferを縦横2倍にする
                element = new OffscreenCanvas(w * 2, h * 2);
                //書き込み位置の原点(0,0)を中心近くに寄せる
                device = element.getContext("2d");
                device.translate(w / 2, h / 2);
            } else {
                element = new OffscreenCanvas(w, h);
                device = element.getContext("2d");
                device.translate(0, 0);
            }
        };
        //[Draw Functions]
        //-------------------------------------------------------------
        //SP_PUT
        /**
         * 変形ありの画像出力(SpritePut)(背景回転)FullParameter
         * @method
         * @param {ImageData} img 画像データ
         * @param {number} sx source x　元画像での位置x
         * @param {number} sy source y　元画像での位置y
         * @param {number} sw source w　元画像の幅
         * @param {number} sh source h　元画像の高さ
         * @param {number} dx destination x　出力画像の位置x
         * @param {number} dy destination y　出力画像の位置Y
         * @param {number} dw destination w  出力画像の幅
         * @param {number} dh destination h　出力画像の高さ
         * @param {number} m11 transform param
         * @param {number} m12 transform param
         * @param {number} m21 transform param
         * @param {number} m22 transform param
         * @param {number} tx target x　変形時の出力先x
         * @param {number} ty target y　変型時の出力先y
         * @param {number} alpha alpha 透明度指定(0-255)/不透明255
         * @param {number} r radian　方向上を基準0にした回転方向(0-359)
         * @returns {void}
         */
        this.spPut = function (img, sx, sy, sw, sh, dx, dy, dw, dh, m11, m12, m21, m22, tx, ty, alpha, r) {

            device.save();
            if (_2DEffectEnable) { tx += w / 2; ty += h / 2; };
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
        };
        //-------------------------------------------------------------
        //DRAWIMG_XYWH_XYWH
        /**
         * 画像出力(サイズ変更有)
         * @method
         * @param {ImageData} img 画像データ
         * @param {number} sx source x　元画像での位置x
         * @param {number} sy source y　元画像での位置y
         * @param {number} sw source w　元画像の幅
         * @param {number} sh source h　元画像の高さ
         * @param {number} dx destination x　出力画像の位置x
         * @param {number} dy destination y　出力画像の位置Y
         * @param {number} dw destination w  出力画像の幅
         * @param {number} dh destination h　出力画像の高さ
         * @returns {void}
         */
        this.drawImgXYWHXYWH = function (img, sx, sy, sw, sh, dx, dy, dw, dh) {

            device.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);

            efcnt++;
        };
        //-------------------------------------------------------------
        //FILLTEXT
        /**
         * 文字表示
         * @method
         * @param {string} str 表示文字列 
         * @param {number} x 表示座標x
         * @param {number} y 表示座標y
         * @param {string} c 表示色 (省略の場合"limegreen")
         */
        this.fillText = function (str, x, y, c) {

            if (!Boolean(c)) { c = "limegreen"; }

            device.fillStyle = c;
            device.fillText(str, x, y);

            efcnt++;
        };
        //------------------------------------------------------------
        //DRAWIMG_XY
        /**
         * 画像出力(元画像そのまま)
         * @method
         * @param {ImageData} img 画像データ
         * @param {number} sx 表示位置x
         * @param {number} sy 表示位置y
         * @returns {void}
         */
        this.drawImgXY = function (img, sx, sy) {

            device.drawImage(img, sx, sy);

            efcnt++;
        };
        //------------------------------------------------------------
        //DRAWIMG_XYWH
        /**
         * 画像出力(元画像全体をサイズ変更)
         * @method 
         * @param {ImageData} img 画像データ
         * @param {number} sx source x　表示位置x
         * @param {number} sy source y　表示位置y
         * @param {number} sw source w　幅
         * @param {number} sh source h　高さ
         * @returns {void}
         */ 
        this.drawImgXYWH = function (img, sx, sy, sw, sh) {

            device.drawImage(img, sx, sy, sw, sh);

            efcnt++;
        };
        //------------------------------------------------------------
        //PUTIMAGETRANSFORM
        /**
         * 画像出力(元画像全体を変形して表示)
         * @method 
         * @param {ImageData} img 画像データ
         * @param {number} x 表示位置x
         * @param {number} y 表示位置y
         * @param {number} m11 transform param
         * @param {number} m12 transform param
         * @param {number} m21 transform param
         * @param {number} m22 transform param
         * @returns {void}
         */
        //use img, m11, m12, m21, m22, tx, ty
        //------------------------------------------------------------
        this.putImageTransform = function (img, x, y, m11, m12, m21, m22) {

            device.save();

            device.setTransform(m11, m12, m21, m22, x, y);
            device.drawImage(img, 0, 0);

            device.restore();

            efcnt++;
        };
        //---------------------------------------------------------
        //TRANSFORM
        /**
         * 変形(emptyFunction)
         * @method 
         * @param {number} m11 transform param
         * @param {number} m12 transform param
         * @param {number} m21 transform param
         * @param {number} m22 transform param
         * @returns {void}
         * @todo　削除予定
         * @deprecaed
         */
        this.transform = function (m11, m12, m21, m22) {
            //dummy
            efcnt++;
        };
        //------------------------------------------------------------
        // PUTFUNC
        /**
         * カスタム描画表示(CanvasMethodを実行)
         * @method 
         * @param {object} cl draw(device)を含むオブジェクト
         * @summary CanvasMethodを登録して表示させる。
         * device: canvas2D Context
         * @example
         * cl = { x: 100, y:100, r:30, c:"red",
         *      draw:(d)=>{
         *          d.beginPath();
         *          d.strokeStyle = this.c;
         *          d.lineWidth = 1;
         *          d.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
         *          d.stroke();
         *          }
         *      }
         * @returns {void}
         */
        this.putFunc = function (cl) {

            cl.draw(device);
            //ここで登録するクラスには表示の為に"draw( device )" functionを必ず登録
            efcnt++;
        };

        //---------------------------------------------------------
        //ALLCLEAR
        /**
         * 指定範囲の消去（クリア)
         * @method 
         * @param {number} sx 指定位置x
         * @param {number} sy 指定位置y
         * @param {number} sw 幅
         * @param {number} sh 高さ
         * @returns {void}
         */
        this.allClear = function (sx, sy, sw, sh) {

            device.save();

            device.setTransform(1, 0, 0, 1, 0, 0);
            device.clearRect(sx, sy, sw, sh);

            device.restore();

            efcnt++;
        };

        //-----------------------------------------------------
        //FILLRECT
        /**
         * 指定範囲の消去（クリア)
         * @method 
         * @param {number} sx 指定位置x
         * @param {number} sy 指定位置y
         * @param {number} sw 幅
         * @param {number} sh 高さ
         * @param {string} color 塗り潰し色(省略で透明色) 
         * @returns {void}
        */
        this.fillRect = function (sx, sy, sw, sh, color) {

            if (Boolean(color)) {
                device.fillStyle = color;
                device.fillRect(sx, sy, sw, sh);
            } else {
                device.clearRect(sx, sy, sw, sh);
            }

            efcnt++;
        };

        //----------------------------------------------------------
        //RESET
        // 
        /**
         * offScreenバッファのクリア
         * @method 
         * @returns {void}
         */
        this.reset = function () {

            if (enable_reset_flag) {
                this.allClear(0, 0, w, h);
            }

            efcnt++;
        };

        //----------------------------------------------------------
        //REFLASH
        /**
         * (flameloopで実行用）offScreenバッファのクリア
         * @method 
         * @returns {void}
         */
        this.reflash = function () {

            if (enable_reset_flag) {
                this.reset();
            }
            efcnt++;
        };

        //----------------------------------------------------------
        //DRAW
        /**
         * 描画処理
         * OffscreenCanvasをCanvasへ反映
         * @method 
         * @param {CanvasContext} outdev 出力先のCanvas2DContext(MainCanvas)
         * @returns {void}
         */
        this.draw = function (outdev) {
            //2024/04/29 new Function turn
            if (enable_draw_flag) {
                if (!_2DEffectEnable) {
                    //outdev.clearRect(0, 0, w, h);
                    outdev.drawImage(element, offset_x, offset_y);
                } else {
                    let w = element.width;
                    let h = element.height;

                    outdev.fillStyle = "green";
                    outdev.fillRect(0, 0, w / 2, h / 2);

                    //outdev.clearRect(0, 0, w/2, h/2);
                    outdev.save();
                    outdev.translate(w / 4, h / 4);
                    outdev.rotate((Math.PI / 180) * ((view_angle) % 360));

                    outdev.drawImage(element, offset_x - w / 2, offset_y - h / 2);
                    //outdev.drawImage(element, offset_x, offset_y);
                    outdev.restore();
                    //console.log("e" + view_angle%360);
                    device.fillStyle = "red";
                    device.fillRect(-w / 4, -h / 4, w, h);
                }
            }
            if (efmax < efcnt) efmax = efcnt;
            efcnt = 0; //Drawコール毎の呼び出し数の記録の為、メインキャンバスに反映毎に0にする
        };
        //----------------------------------------------------------
        //COUNT
        /**
         * 前回のDrawコールから現在までのFunction呼び出し回数を返す
         * @returns {number} function call count par frame
         */
        this.count = function () {
            //return function call count par frame
            return efcnt;
        };
        //----------------------------------------------------------
        //MAX
        /**
         * Function呼び出し回数の最大値を返す
         * @returns {number} function call count par frame
         */
        this.max = function () {
            //return function call count par frame maxim
            return efmax;
        };
    }
}



