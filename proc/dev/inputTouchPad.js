// touchPadControl 
//**************************************************************
function inputTouchPad(canvas_id) {

    var pos = [];

    var cvs1 = document.getElementById(canvas_id);
    //var cvs = document;

    this.o_Left = cvs1.offsetLeft;
    this.o_Top = cvs1.offsetTop;

    var viewf = false;

    //iPodTouch用(マルチポイントタッチ)
    document.addEventListener('touchstart', ViewTrue
    , {passive: false });
    document.addEventListener('touchmove', ViewTrue
    , {passive: false });
    document.addEventListener('touchend', ViewFalse
    , {passive: false });
    document.addEventListener('touchcancel', ViewFalse
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

    function touchposget(event) {

        pos = [];

        if (event.touches.length > 0) {
            for (var i = 0; i < event.touches.length; i++) {
                var t = event.touches[i];

                pos[i] = {};

                pos[i].x = t.pageX;
                pos[i].y = t.pageY;
                pos[i].id = t.identifier;
                //pos[i].count = 0;//work
                
            }
        }
    }

    this.check = function () {
        var state = {};

        state.pos = pos;
        return state;
    }

    this.check_last = function () {
        var state = {};

        state.pos = pos;
        return state;
    }

    this.draw = function (context) {

        if (!viewf) return;

        var st = this.check_last();

        var s = "p " + pos.length + "/";

        for (var j = 0; j <= pos.length -1 ; j++) {
                s = s + "b" + j + " ";
                
                var cl = {};
                cl.x = pos[j].x;
                cl.y = pos[j].y;
                cl.r = 16;
                cl.draw = function(device){
                    var context = device;

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
