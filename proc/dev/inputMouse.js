
//InputMouse
//

function inputMouse(){

    var state = { x: 0, y: 0, button: 0, wheel: 0 };

    var x = 0;
    var y = 0;
    var button = -1;
    var wheel = 0;

    var el = document;

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

    this.check = function () {

        state.x = x;
        state.y = y;
        state.button = button;
        state.wheel = wheel;

        if (button != 0) { button = -1; }
        wheel = 0;

        return state;
    }

    this.check_last = function () {

        state.x = x;
        state.y = y;
        state.button = button;
        state.wheel = wheel;

        return state;
    }

    this.draw = function(ctx){

        var st = this.check_last(); 

        var cl = {};
        cl.x = st.x;
        cl.y = st.y;
        cl.draw = function(device){ 
            var context = device;

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
