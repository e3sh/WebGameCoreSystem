/**
 * offScreenクラス
 * (offscreen buffer)
 * @class DisplayControl.offScreenTypeC
 * @classdesc
 * DisplayControlクラスの内部で利用されるオフスクリーンバッファを管理します<br>\
 * 実際の描画はここで行われ、その後メインCanvasにまとめて転送されることで、<br>\
 * 描画パフォーマンスと複雑なグラフィック効果を実現します。<br>\
 * <br>\
 * //全画面表示する為、mainのCanvasにまとめて重ね表示
 */
class offScreenTypeC {
    /**
     * @param {number} w 作成サイズ幅指定
     * @param {number} h 作成サイズ高さ指定
     * @param {number} ix 水平方向オフセット 
     * @param {number} iy 垂直方向オフセット  
     * @description
     * offScreenTypeCインスタンスを初期化し、指定された幅と高さでオフスクリーンCanvasを作成します。<br>\
     * 2D描画コンテキストを取得し、オフセットや描画フラグなどの内部状態を設定します。
     */
    constructor(w, h, ix, iy) {
        //w : width, h:height
        let element = new OffscreenCanvas(w, h);//2DEFで更新する場合があるのでconstはNG

        const offset_x = ix;
        const offset_y = iy;

        let efcnt = 0; //CallFunctionCount
        let efmax = 0; //CallFunctionCount(Max)

        let device = element.getContext("2d");//2DEFで更新有

        let enable_draw_flag = true;
        let enable_reset_flag = true;

        let _2DEffectEnable = false; //default off
        let view_angle = 0;

        //[Mode Functions]
        /**
         * MODE CHANGE ENNABLE_DRAW_FLAG
         * @method
         * @param {boolean} [flg=null] enable_draw_flag
         * @returns {boolean} 現在値
         * @todo 現在は効果なし/使用箇所確認後、削除予定
         * @description
         * オフスクリーンバッファをメインCanvasに描画するかどうかを制御します。<br>\
         * `true`を設定すると描画が有効になり、`false`で無効になりますが、<br>\
         * 現在の実装では効果が限定的である可能性があります。
         */
        this.view = function (flg) {
            if (typeof flg == "boolean") {
                enable_draw_flag = flg;
            }
            return enable_draw_flag;
        };
        /**
         * MODE CHANGE ENNABLE_FLIP_FLAG
         * @method
         * @param {boolean} [flg=null] enable_flip_flag
         * @returns {boolean} 現在値
         * @todo 現在は効果なし/使用箇所確認後、削除予定
         * @description
         * オフスクリーンバッファが自動的にクリアされるかどうかを制御します。<br>\
         * `true`を設定するとクリアが有効になり、`false`で無効になりますが、<br>\
         * 現在の実装では効果が限定的である可能性があります。
         */
        this.flip = function (flg) {
            if (typeof flg == "boolean") {
                enable_reset_flag = flg;
            }
            return enable_draw_flag;
        };
        /**
         * FULLSCREEN ROTATE FUNCTION
         * @method
         * @param {numver} r rotate angle
         * @desc 
         * this function effect eneble :_2DEffectEnable:true<br><br>\
         * <br>\
         * フルスクリーン2Dエフェクトが有効な場合、オフスクリーンバッファ全体を回転させます。<br>\
         * 指定された角度でバッファの内容が変換され、<br>\
         * 画面全体に回転効果を適用します。
         */
        this.turn = function (r) {
            if (_2DEffectEnable)
                view_angle = r;
        };
        /**
         * 2D FULLSCREEN EFFECT FUNCTION ENABLE
         * @method
         * @param {boolean} f ENABLE FLAG
         * @description
         * フルスクリーン2Dエフェクトの有効/無効を切り替えます。<br>\
         * 有効にした場合、回転時の枠外乱れを防ぐためバッファサイズを2倍に拡張し、<br>\
         * 描画原点を中心に移動させます
         * @todo 縦横2倍ではなく縦横を長辺の2倍にしないと足りない<br>\
         * 回転機能をあらためて使う案件が出てきたら補正する
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
         * @param {Img} img 画像データ
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
         * @description
         * 画像を変形（回転、反転、拡大・縮小）させながら描画します。<br>\
         * 元画像の切り出し範囲、表示位置、変形パラメータ、アルファ値、回転角を細かく指定し、<br>\
         * 複雑なスプライト描画を可能にします。
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
         * @param {Img} img 画像データ
         * @param {number} sx source x　元画像での位置x
         * @param {number} sy source y　元画像での位置y
         * @param {number} sw source w　元画像の幅
         * @param {number} sh source h　元画像の高さ
         * @param {number} dx destination x　出力画像の位置x
         * @param {number} dy destination y　出力画像の位置Y
         * @param {number} dw destination w  出力画像の幅
         * @param {number} dh destination h　出力画像の高さ
         * @returns {void}
         * @description
         * 画像の一部を切り出して、指定された位置とサイズで描画します<br>\
         * 元画像（source）のX, Y, 幅, 高さ、<br>\
         * そして描画先（destination）のX, Y, 幅, 高さを指定します。
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
         * @param {Color} c 表示色 (省略の場合"limegreen")
         * @description
         * 指定された文字列をオフスクリーンバッファに描画します。<br>\
         * 文字列、X座標、Y座標、そして表示色をパラメータとして受け取り、<br>\
         * バッファの描画コンテキストでテキストを描画します。
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
         * @param {Img} img 画像データ
         * @param {number} sx 表示位置x
         * @param {number} sy 表示位置y
         * @returns {void}
         * @description
         * 画像全体を元のサイズそのままに、指定された位置に描画します。<br>\
         * 画像データと表示位置のX, Y座標を指定する、<br>\
         * 最もシンプルな画像描画メソッドです。
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
         * @param {Img} img 画像データ
         * @param {number} sx source x　表示位置x
         * @param {number} sy source y　表示位置y
         * @param {number} sw source w　幅
         * @param {number} sh source h　高さ
         * @returns {void}
         * @description
         * 画像全体を、指定された幅と高さに拡大・縮小して描画します。<br>\
         * 画像データ、表示位置のX, Y座標、そして描画したい幅と高さを指定し<br>\
         * 画像サイズを調整して表示します。
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
         * @param {Img} img 画像データ
         * @param {number} x 表示位置x
         * @param {number} y 表示位置y
         * @param {number} m11 transform param
         * @param {number} m12 transform param
         * @param {number} m21 transform param
         * @param {number} m22 transform param
         * @returns {void}
         * @description
         * 画像全体に変形行列を適用して描画します。<br>\
         * 画像データ、表示位置X, Y、そして変換行列のパラメータを指定し<br>\
         * 画像の回転、拡大・縮小、せん断などをまとめて適用できます。
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
         * @description
         * オフスクリーンバッファの描画コンテキストに変形行列を適用します。<br>\
         * 現在は機能しないダミー関数です。
         */
        this.transform = function (m11, m12, m21, m22) {
            //dummy
            efcnt++;
        };
        //------------------------------------------------------------
        // PUTFUNC
        /**
         * CustomDrawObject
         * @typedef {object} PutFuncCustomDraw draw(device)を含むオブジェクト
         * @property {function} draw 必須 {DeviceContext}を引数に呼び出される
         * @property {*} any 任意のプロパティ 
         * @summary CanvasMethodを登録して表示させる。
         * device: {DeviceContext} 
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
         */

        /**
         * カスタム描画表示(CanvasMethodを実行)
         * @method 
         * @param {PutFuncCustomDraw} cl draw(device)を含むオブジェクト
         * @returns {void}
         * @description
         * `draw(device)`メソッドを持つカスタム描画オブジェクトを登録し、実行します。<br>\
         * この機能により、開発者はCanvasの低レベルな描画APIを直接利用して<br>\
         * グラフィック処理をオフスクリーンバッファ上で行うことができます。
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
         * @description
         * オフスクリーンバッファの指定された矩形範囲を完全に消去します。<br>\
         * X, Y座標、幅, 高さを指定し、<br>\
         * 既存の描画内容をクリアします。
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
         * @description
         * オフスクリーンバッファの指定された矩形範囲を色で塗りつぶします。<br>\
         * X, Y座標、幅, 高さ、そして塗りつぶし色を指定し、<br>\
         * 色を指定しない場合はその範囲をクリアします。
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
         * @description
         * オフスクリーンバッファ全体をクリアします。<br>\
         * `enable_reset_flag`が`true`の場合にのみ実行され、<br>\
         * バッファの内容を初期状態に戻します。
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
         * @description
         * ゲームのフレームループ内で呼び出されることを想定した<br>\
         * オフスクリーンバッファのクリア機能です。<br>\
         * `enable_reset_flag`が`true`であれば、`reset`メソッドを呼び出します。
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
         * @description
         * オフスクリーンバッファに描画された内容を、出力先のメインCanvasに転送します。<br>\
         * 2Dエフェクトが有効な場合は、回転などの効果を適用しながら<br>\
         * メインCanvasに反映させます。
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
         * @description
         * 前回の`draw`メソッドが呼び出されてから現在までに、<br>\
         * オフスクリーンバッファに対して行われた描画関数の呼び出し回数を返します。<br>\
         * これにより、1フレームあたりの描画操作の数を把握できます。
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
         * @description
         * オフスクリーンバッファへの描画関数呼び出し回数の最大値を返します。<br>\
         * これは、フレーム間で最も多くの描画操作が行われた際の記録であり<br>\
         * 描画負荷のピークを把握するのに役立ちます。
         */
        this.max = function () {
            //return function call count par frame maxim
            return efmax;
        };
    }
}



