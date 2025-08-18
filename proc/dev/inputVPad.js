/**
 * VirtualPadControl
 * タッチパットから方向とボタン入力コントロール
 * @description 
 * マウスやタッチパッドの入力を仮想ゲームパッドの入力に変換します。\
 * 画面上の仮想パッド領域とボタン領域へのタッチ/クリックを検出し、\
 * 方向（角度と距離）とボタンの押下状態として提供します。
 */
class inputVirtualPad {
    /**
     * @param {inputMouse} mouse inputMouseインスタンス 
     * @param {inputTouchPad} touchpad inputTouchPadインスタンス
     */
    constructor(mouse, touchpad) {
        //vControllerの入力位置設定

        const ResoX = 640;
        const ResoY = 400;

        let vCntlPos = {};

        vCntlPos.X = 0;
        vCntlPos.Y = 0;

        let Pad_Loc = {};

        Pad_Loc.X = 80;
        Pad_Loc.Y = ResoY - 80;
        Pad_Loc.R = 75;

        let Button_Loc = [];

        for (let i = 0; i <= 1; i++) {

            Button_Loc[i] = {};

            Button_Loc[i].X = ResoX - 200 + 80 * (i + 1);
            Button_Loc[i].Y = ResoY - 80;
            Button_Loc[i].R = 28;
            Button_Loc[i].ON = false;
        }


        for (let i = 0; i <= 1; i++) {

            Button_Loc[i + 2] = {};

            Button_Loc[i + 2].X = ResoX - 80;
            Button_Loc[i + 2].Y = (ResoY - 120) + 80 * i;
            Button_Loc[i + 2].R = 28;
            Button_Loc[i + 2].ON = false;
        }

        let pos = [];

        let now_vdeg = 0;
        let now_vbutton = [];
        let now_vdistance = -1;

        let viewf = false;

        /**
         * @typedef {object} vPadState 仮想ゲームパッド状態
         * @property {number} deg　仮想パッド方向
         * @property {boolean[]} button 仮想ボタン押下状態
         * @property {number} distance　仮想パッド距離
         */
        /**
         * @method
         * @returns {vPadState} 仮想ゲームパッド状態
         * @example
         * //input mouse_state, touchpad_state
         * //return deg = 0 -359 ,button[0-n] = false or true;
         * //       distance
         * @description
         * マウスとタッチパッドの最新の入力状態を処理し、仮想パッドの入力を更新します。\
         * 仮想パッドの中心からの角度、距離、そして仮想ボタンの押下状態を計算し\
         * その結果を返します。
         */
        this.check = function () {
            let ts = touchpad.check_last();
            let ms = mouse.check_last();

            pos = [];
            if (ts.pos.length <= 0) {
                if (ms.button != -1) {
                    pos.push({ x: ms.x, y: ms.y });
                    viewf = true;
                }
                else
                    viewf = false;
            } else {
                pos = ts.pos;
                viewf = true;
            }

            now_vdeg = 0;
            now_vbutton = [];

            let bn = Button_Loc.length - 1;

            for (let j = 0; j <= bn; j++) now_vbutton[j] = false;

            now_vdistance = -1;

            let tr = 0; // deg;
            let dst = -1;

            if (pos.length > 0) {
                for (let i = 0; i < pos.length; i++) {
                    let wdst = dist(pos[i].x, pos[i].y, Pad_Loc.X, Pad_Loc.Y);

                    if (Pad_Loc.R > wdst) {
                        //パッドに複数点入力の場合は最後のものを優先
                        tr = Math.floor(target_r(Pad_Loc.X, Pad_Loc.Y, pos[i].x, pos[i].y));
                        dst = wdst;
                    }

                    for (let j = 0; j <= bn; j++) {
                        if (Button_Loc[j].R > dist(Button_Loc[j].X, Button_Loc[j].Y, pos[i].x, pos[i].y)) {
                            now_vbutton[j] = true;
                        } else {
                            // now_vbutton[j] = false;
                        }
                    }
                }
            }

            now_vdeg = tr;
            now_vdistance = dst;

            let state = {};

            state.button = now_vbutton;
            state.deg = tr; // deg;
            state.distance = dst; //dstns;

            return state;
        };

        /**
         * @method
         * @returns {vPadState} 仮想ゲームパッド状態
         * @description
         * 最後に計算された仮想パッドの入力状態を、値をリセットせずに返します。\
         * このメソッドは、前フレームの状態を参照したい場合や、\
         * 値のリセットが不要な場合に利用されます。
         */
        this.check_last = function () {

            let state = {};

            state.button = now_vbutton;
            state.deg = now_vdeg; // deg;
            state.distance = now_vdistance; //dstns;

            return state;
        };

        /**
         * @method
         * @param {DisplayControl} context 描画先 
         * @description
         * 画面上に仮想ゲームパッドのグラフィックを描画します。\
         * 方向パッドとボタンの形状、そして現在の入力状態を示すインジケータが表示され、\
         * タッチやマウス操作に視覚的なフィードバックを提供します。
        */
        this.draw = function (context) {

            if (!viewf) return;

            let st = this.check_last();

            let bn = Button_Loc.length - 1;

            let cl = {};
            cl.x = Pad_Loc.X;
            cl.y = Pad_Loc.Y;
            cl.r = Pad_Loc.R;
            cl.bt = Button_Loc;
            cl.draw = function (device) {
                let context = device;

                context.beginPath();
                context.arc(this.x, this.y, this.r, 0, 2 * Math.PI, true);
                context.fillStyle = "gray"; //"black";
                context.globalAlpha = 0.5;
                context.fill();
                for (let i = 0; i <= this.bt.length - 1; i++) {

                    context.beginPath();
                    context.arc(this.bt[i].X, this.bt[i].Y, this.bt[i].R, 0, 2 * Math.PI, true);
                    context.fillStyle = "gray"; //"black";

                    context.fill();
                }

            };
            context.putFunc(cl);

            let s = "p " + pos.length + "/";

            if (st.distance > 0) {

                s = s + "d " + st.deg + ":" + st.distance;

                let cl = {};
                cl.x = Pad_Loc.X;
                cl.y = Pad_Loc.Y;
                cl.vx = Math.cos(ToRadian(st.deg - 90)) * Pad_Loc.R; //st.distance;
                cl.vy = Math.sin(ToRadian(st.deg - 90)) * Pad_Loc.R; //st.distance;

                cl.sr = ((st.deg + 225) % 360 / 180) * Math.PI;
                cl.draw = function (device) {
                    let context = device;
                    context.beginPath();
                    context.strokeStyle = "orange";
                    context.lineWidth = 60;
                    context.arc(this.x, this.y, 40, this.sr, this.sr + (1 / 2) * Math.PI, false);
                    context.stroke();
                };
                context.putFunc(cl);
            }

            for (let j = 0; j <= bn; j++) {
                if (st.button[j]) {
                    s = s + "b" + j + " ";

                    let cl = {};
                    cl.x = Pad_Loc.X;
                    cl.y = Pad_Loc.Y;
                    cl.r = Pad_Loc.R;
                    cl.bt = Button_Loc[j];
                    cl.draw = function (device) {
                        let context = device;

                        context.beginPath();
                        //context.arc(Button_Loc[j].X, Button_Loc[j].Y, Button_Loc[j].R - 5, 0, 2 * Math.PI, true);
                        context.arc(this.bt.X, this.bt.Y, this.bt.R - 5, 0, 2 * Math.PI, true);
                        context.fillStyle = "orange";
                        context.fill();
                    };
                    context.putFunc(cl);
                }
            }
        };

        //自分( x,y )から目標( tx, ty )の
        //	方向角度を調べる(上が角度0の0-359)
        function target_r(x, y, tx, ty) {
            let r;

            let wx = tx - x;
            let wy = ty - y;

            if (wx == 0) {
                if (wy >= 0) r = 180; else r = 0;
            } else {
                r = ToDegree(Math.atan(wy / wx));

                if ((wx >= 0) && (wy >= 0)) r = 90 + r;
                if ((wx >= 0) && (wy < 0)) r = 90 + r;
                if ((wx < 0) && (wy < 0)) r = 270 + r;
                if ((wx < 0) && (wy >= 0)) r = 270 + r;
            }

            return r;
        }

        //角度からラジアンに変換
        //
        function ToRadian(d){
            return (d * (Math.PI / 180.0));
        };

        //ラジアンから角度に変換
        //
        function ToDegree(r) {
            return (r * (180.0 / Math.PI));
        }

        //2点間の距離
        function dist(x, y, tx, ty) {

            return Math.floor(Math.sqrt(Math.pow(Math.abs(x - tx), 2) + Math.pow(Math.abs(y - ty), 2)));
        }
    }
}