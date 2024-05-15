//InputMouse
//
function inputMouse(element_ID){

    let state = { x: 0, y: 0, button: 0, wheel: 0 };

    let x = 0;
    let y = 0;
    let button = -1;
    let wheel = 0;

    let tr = {x:1, y:1, offset_x:0};

    let el = document.getElementById(element_ID);

    //mouseevent
    el.addEventListener("mousemove",
        function (event) {
            x = event.clientX;
            y = event.clientY;
        }
    , false);

    el.addEventListener("mousedown", function (event) { button = event.button; }, false);
    el.addEventListener("mouseup", function (event) { button = -1; }, false);
    el.addEventListener("mousewheel", function (event) { wheel = event.wheelDelta; }, false);

    //firefox用ホイールコントロール
    el.addEventListener("DOMMouseScroll", function (event) { wheel = event.detail; }, false);

    this.mode = function(g){

        if (document.fullscreenElement){ 
            let cw = document.documentElement.clientWidth;
            let ch = document.documentElement.clientHeight;
            let pixr = window.devicePixelRatio;

            let scw = g.systemCanvas.width;
            let sch = g.systemCanvas.height;

            let rt = ch/sch;
            
            tr.x = rt; tr.y = rt; tr.offset_x = ((scw*rt) - cw)/rt/2;
        } else {
            tr.x = 1; tr.y = 1; tr.offset_x = 0;
        }
    }

    this.check = function () {

        state.x = (x / tr.x) + tr.offset_x;
        state.y = (y / tr.y);
        state.button = button;
        state.wheel = wheel;

        if (button != 0) { button = -1; }
        wheel = 0;

        return state;
    }

    this.check_last = function () {

        //state.x = x * tr.x + tr.offset_x;
        //state.y = y * tr.y;
        //state.button = button;
        //state.wheel = wheel;

        return state;
    }

    this.draw = function(ctx){

        let st = this.check_last(); 

        let cl = {};
        cl.x = st.x;
        cl.y = st.y;
        cl.draw = function(device){ 
            let context = device;

            context.beginPath();
            context.moveTo(this.x, this.y);
            context.lineTo(this.x+10, this.y+10);
            context.globalAlpha = 1.0;
            context.strokeStyle = "white";//"black";
            context.lineWidth = 3;
            context.stroke();
        }
        ctx.putFunc(cl);
    }
}
