//**************************************************************
// VirtualPadControl
// タッチパットから方向とボタン入力コントロール
//**************************************************************
function inputVirtualPad(mouse, touchpad) {

    //vControllerの入力位置設定

    const ResoX = 640;
    const ResoY = 400;

    var vCntlPos = {};

    vCntlPos.X = 0;
    vCntlPos.Y = 0;

    var Pad_Loc = {};

    Pad_Loc.X = 80
    Pad_Loc.Y = ResoY-80
    Pad_Loc.R = 75

    var Button_Loc = [];

    for (var i = 0; i <= 1; i++) {

        Button_Loc[i] = {};

        Button_Loc[i].X = ResoX-200 + 80 * (i + 1);
        Button_Loc[i].Y = ResoY-80;
        Button_Loc[i].R = 28;
        Button_Loc[i].ON = false;
    }


    for (var i = 0; i <= 1; i++) {

        Button_Loc[i + 2] = {};

        Button_Loc[i + 2].X = ResoX-80;
        Button_Loc[i + 2].Y = (ResoY-120) + 80 * i;
        Button_Loc[i + 2].R = 28;
        Button_Loc[i + 2].ON = false;
    }


    var pos = [];

    //var pos_x = [];
    //var pos_y = [];

    //var now_button;
    //var button = -1;

    var now_vdeg = 0;
    var now_vbutton = [];
    var now_vdistance = -1;

    var viewf = false;

    this.check = function () {
        //input mouse_state, touchpad_state
        //return deg = 0 -359 ,button[0-n] = false or true;
        //       distance
        var ts = touchpad.check_last();
        var ms = mouse.check_last();

        pos = [];
        if (ts.pos.length <= 0){
            if (ms.button != -1){
                pos.push( {x : ms.x,  y: ms.y });
                //pos[0].x = ms.x;
                //pos[0].y = ms.y;
                viewf = true;
            }else
                viewf = false;
        }else{
            pos = ts.pos;
            viewf = true;
        }

        now_vdeg = 0;
        now_vbutton = [];

        for (var j = 0; j <= bn; j++) now_vbutton[j] = false;

        now_vdistance = -1;

        var bn = Button_Loc.length - 1;

        var tr = 0; // deg;
        var dst = -1;

        if (pos.length > 0) {
            for (var i = 0; i < pos.length; i++) {
                var wdst = dist(pos[i].x, pos[i].y, Pad_Loc.X, Pad_Loc.Y);

                if (Pad_Loc.R > wdst) {
                    //パッドに複数点入力の場合は最後のものを優先
                    tr = Math.floor(target_r(Pad_Loc.X, Pad_Loc.Y, pos[i].x, pos[i].y));
                    dst = wdst;
                }

                for (var j = 0; j <= bn; j++) {
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

        var state = {};

        state.button = now_vbutton;
        state.deg = tr; // deg;
        state.distance = dst //dstns;

        return state;
    }

    this.check_last = function () {

        var state = {};

        state.button = now_vbutton;
        state.deg = now_vdeg; // deg;
        state.distance = now_vdistance; //dstns;

        return state;
    }

    this.draw = function (context) {

        if (!viewf) return;

        var st = this.check_last();

        var bn = Button_Loc.length - 1;

        //var cx = 320;
        //var cy = 320;

        //context.fillStyle = "black";
        //context.fill(0, 0, cx, cy, "black");
        //context.fillStyle = "white";
        //context.fill(5, 5, cx - 10, cy - 10, "white");

        var cl = {};
        cl.x = Pad_Loc.X;
        cl.y = Pad_Loc.Y;
        cl.r = Pad_Loc.R;
        cl.bt = Button_Loc;
        cl.draw = function(device){
            var context = device;
            
            context.beginPath();
            context.arc(this.x, this.y, this.r, 0, 2 * Math.PI, true);
            context.fillStyle = "gray";//"black";
            context.globalAlpha = 0.5;
            context.fill();
            //context.beginPath();
            //context.arc(this.x, this.y, this.r - 5, 0, 2 * Math.PI, true);
            //context.fillStyle = "white";
            //context.fill();

            for (var i = 0; i <= this.bt.length-1; i++) {

                context.beginPath();
                context.arc(this.bt[i].X, this.bt[i].Y, this.bt[i].R, 0, 2 * Math.PI, true);
                context.fillStyle = "gray";//"black";
                //context.globalAlpha = 0.5;
                context.fill();
                //context.beginPath();
                //context.arc(this.bt[i].X, this.bt[i].Y, this.bt[i].R - 5, 0, 2 * Math.PI, true);
                //context.fillStyle = "white";
                //context.fill();
            }

        }
        context.putFunc(cl);

        var s = "p " + pos.length + "/";

        if (st.distance > 0) {

            s = s + "d " + st.deg + ":" + st.distance;

            var cl = {};
            cl.x = Pad_Loc.X;
            cl.y = Pad_Loc.Y;
            cl.vx = Math.cos(ToRadian(st.deg - 90)) * Pad_Loc.R//st.distance;
            cl.vy = Math.sin(ToRadian(st.deg - 90)) * Pad_Loc.R//st.distance;

            cl.sr = ((st.deg+225)%360/180)* Math.PI;
            //cl.sr = (((Math.floor(st.deg/45)*45)+225)%360/180)* Math.PI;
            cl.draw = function(device){ 
                var context = device;
                /*
                context.beginPath();
                context.strokeStyle = "black";
                context.lineWidth = 2;
                context.moveTo(this.x, this.y);
                context.lineTo(this.x + this.vx, this.y +this.vy);
                context.stroke();
                */
                context.beginPath();
                context.strokeStyle = "orange";
                context.lineWidth = 60;
                context.arc(this.x, this.y, 40, this.sr, this.sr+(1/2) * Math.PI, false);
                context.stroke();
            }
            context.putFunc(cl);
        }

        for (var j = 0; j <= bn; j++) {
            if (st.button[j]) {
                s = s + "b" + j + " ";
                
                var cl = {};
                cl.x = Pad_Loc.X;
                cl.y = Pad_Loc.Y;
                cl.r = Pad_Loc.R;
                cl.bt = Button_Loc[j];
                cl.draw = function(device){
                    var context = device;

                    context.beginPath();
                    //context.arc(Button_Loc[j].X, Button_Loc[j].Y, Button_Loc[j].R - 5, 0, 2 * Math.PI, true);
                    context.arc(this.bt.X, this.bt.Y, this.bt.R - 5, 0, 2 * Math.PI, true);
                    context.fillStyle = "orange";
                    context.fill();
                }
                context.putFunc(cl);
            }
        }
        //context.fillStyle = "green";
        //context.print(s, 12, 32);
        // 移動した座標を取得
    }
    //自分( x,y )から目標( tx, ty )の
    //	方向角度を調べる(上が角度0の0-359)
    function target_r(x, y, tx, ty) {
        var r;

        var wx = tx - x;
        var wy = ty - y;

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
    ToRadian = (d) => {
        return (d * (Math.PI / 180.0));
    }

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