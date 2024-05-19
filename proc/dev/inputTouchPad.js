// touchPadControl 
//**************************************************************
function inputTouchPad(canvas_id) {

    let pos = [];

    let tr = {x:1, y:1, offset_x:0};

    let el = document.getElementById(canvas_id);
    //let cvs = document;

    //this.o_Left = el.width ;//offsetLeft;
    //this.o_Top = el.height;//offsetTop;

    let viewf = false;

    //iPodTouch用(マルチポイントタッチ)
    el.addEventListener('touchstart', ViewTrue
    , {passive: false });
    el.addEventListener('touchmove', ViewTrue
    , {passive: false });
    el.addEventListener('touchend', ViewFalse
    , {passive: false });
    el.addEventListener('touchcancel', ViewFalse
    , {passive: false });

    /*
    cvs.ontouchmove = function (event) {
        event.preventDefault();
        touchposget(event);
        viewf = true;
    }

    cvs.ontouchstart = function (event) {
        event.preventDefault();
        touchposget(event);

        viewf = true;
    }

    cvs.ontuochend = function (event) {
        event.preventDefault();
        touchposget(event);
        
        viewf = false;
    }

    cvs.ontouchcancel = function (event) {
        event.preventDefault();
        
        viewf = false;
    }
    */
    function ViewTrue(e){
        e.preventDefault();
        touchposget(e);
        viewf = true;
    }

    function ViewFalse(e){
        e.preventDefault();
        touchposget(e);
        viewf = false;
    }

    this.mode = function(g){

        if (document.fullscreenElement){ 
            let cw = el.clientWidth;//document.documentElement.clientWidth;
            let ch = el.clientHeight;//document.documentElement.clientHeight;
            let pixr = window.devicePixelRatio;

            let scw = g.systemCanvas.width;
            let sch = g.systemCanvas.height;

            let rt = ch/sch;
            
            tr.x = rt; tr.y = rt; tr.offset_x = ((scw*rt) - cw)/rt/2;
        } else {
            tr.x = 1; tr.y = 1; tr.offset_x = 0;
        }
    }

    function touchposget(event) {

        pos = [];

        if (event.touches.length > 0) {
            for (let i = 0; i < event.touches.length; i++) {
                let t = event.touches[i];

                pos[i] = {};

                pos[i].x = (t.pageX / tr.x) + tr.offset_x;
                pos[i].y = (t.pageY / tr.y);
                pos[i].id = t.identifier;
                //pos[i].count = 0;//work
                
            }
        }
    }

    this.check = function () {
        let state = {};

        state.pos = pos;
        return state;
    }

    this.check_last = function () {
        let state = {};

        state.pos = pos;
        return state;
    }

    this.draw = function (context) {

        if (!viewf) return;

        let st = this.check_last();

        let s = "p " + pos.length + "/";

        for (let j = 0; j <= pos.length -1 ; j++) {
                s = s + "b" + j + " ";
                
                let cl = {};
                cl.x = pos[j].x;
                cl.y = pos[j].y;
                cl.r = 16;
                cl.draw = function(device){
                    let context = device;

                    context.beginPath();
                    context.arc(this.x, this.y, this.r, 0, 2 * Math.PI, true);
                    //context.fillStyle = "orange";
                    //context.fill();
                    context.strokeStyle = "white";
                    context.lineWidth = 2;
                    context.stroke();
                }
                context.putFunc(cl);
            
        }
        //context.fillStyle = "green";
        //context.print(s, 12, 16);
        // 移動した座標を取得
    }
}
