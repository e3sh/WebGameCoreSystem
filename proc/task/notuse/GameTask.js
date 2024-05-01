class GameTask_FPScount extends GameTask {

    constructor(id){
        super(id);
    }

    oldtime;
    newtime = Date.now();
    cnt = 0;

    fps_log = [];
    log_cnt = 0;
    log_max = 0;

    interval;

    fps = 0;
    
    step(g) {

        this.oldtime = this.newtime;
        this.newtime = Date.now();

        this.interval = this.newtime - this.oldtime;

        if (this.log_cnt > this.log_max) this.log_max = this.log_cnt;
        this.fps_log[this.log_cnt] = this.interval;

        this.log_cnt++;
        if (this.log_cnt > 59) this.log_cnt = 0;

        var w = 0;
        for (var i = 0; i <= this.log_max; i++) {
            w += this.fps_log[i];
        }

        this.cnt++;

        this.fps = parseInt(1000 / (w / (this.log_max + 1)));

    }

    draw(g){
        g.font["8x8white"].putchr("FPS:" + this.fps, 320, 0);
    }

}

class GameTask_Debug extends GameTask {

    constructor(id){
        super(id);
    }

    fontsc;

    init(g){
        const USEFONT = "6x8";// "8x8white";
        g.font[USEFONT].useScreen(3);
        this.fontsc =  g.font[USEFONT];
    }

    step(g) {
    }

    draw(g){
        const SC_NUM = g.screen.length;
        
        var st;  
        var r = g.fpsload.result();

        if (g.state.Config.debug){
            var sl = [];
            var r = g.fpsload.result();
            sl.push("fps:" +  Math.trunc(r.fps));
            sl.push("ave :load/intv/" ); 
            sl.push("    :" + String(r.workload.ave).substring(0,4) +
                "/" + String(r.interval.ave).substring(0,4) +  "ms");
            sl.push("workload :"+ String((r.workload.ave / r.interval.ave)*100).substring(0,5) + "%");
            var ws = String(g.deltaTime()).substring(0, 5);
            sl.push("deltaTime:"+ ws + "ms");
            ws = String(g.time()).substring(0, 10);
            sl.push("run(ms):" + ws);   

            this.fontsc.useScreen(4);
            for(var i=0; i < sl.length; i++){
                this.fontsc.putchr(sl[i], 320, 320+ i*8);
            }

            var sl = [];
            sl.push("sc(intv)bgcolor");  

            st = "";
            for (var i=0 ; i < SC_NUM ;i++){
            //st = "sc[" + i + "]" 
            st = " " + i + "(" 
            + g.screen[i].getInterval() + ")" 
            + g.screen[i].getBackgroundcolor() + "/"
            + g.screen[i].max() + "/" 
            + g.screen[i].count(); 
            sl.push(st);
            }

            for(var i=0; i < sl.length; i++){
                this.fontsc.putchr(sl[i], 480, 320+ i*8);
            }
        }
    }
}

class GameTask_Load extends GameTask {

    constructor(id){
        super(id);
    }
        scrn;
        fontsc;
        str;
        //cnt;

    init(g){
        const USEFONT = "6x8";// "8x8white";
        this.scrn = g.screen[4];
        g.font[USEFONT].useScreen(4);
        this.fontsc =  g.font[USEFONT];
        //this.cnt = 0;
    }

    step(g) {
        var kstate = g.keyboard.check();
        var mstate = g.mouse.check();
        var tstate = g.touchpad.check();

        if (typeof g.state.Config.debug !== 'undefined') g.state.Config.debug = true;

        var startflag = false; 
        if (Boolean(kstate[32])||g.gamepad.btn_start||mstate.button==0) {
            if (kstate[32]||g.gamepad.btn_start||mstate.button==0) {//spacebar↓
                startflag = true;
            }
        }
        if (tstate.pos.length > 2){
            startflag = true;
        }

        if (startflag) {
            var maintask = g.task.read("main");

            g.state.Config.debug = false;

            maintask.visible = true;
            maintask.enable = true;
            this.visible = false;
            this.visible = false;
            g.task.del("load"); 
        }

        if (g.gamepad.check()){
            this.str = g.gamepad.infodraw();
        }else{
            this.str = [];
            this.str.push("[Gamepad]");
            this.str.push("Not Ready.");
        }
    }

    draw(g){
        const LINEH = 12;

        var st = g.asset.check();

        //var pfunc = g.asset.image["FontGraph"].ready ? this.fontsc.putchr :this.scrn.print ;  
        var pfunc = g.asset.image["KanjiHw"].ready ? this.fontsc.putchr :this.scrn.print ;  

        for (var i in st){
            //pfunc(i + " " + st[i], 0, i*16 +16);
            pfunc(st[i], 0, i*LINEH + 8);
        }

        var o = {}
            o.x = 0;
            o.y = st.length*LINEH +32;
            o.w = 32 * 8;
            o.h = 8;
            let wc = Math.floor(Math.cos(((g.time()%3000)/3000)*6.28)*256)+256;
            wc = (wc > 255)?255: wc;
            o.c = 'rgb( 0, 0,' + wc + ')';//"navy";
            //o.c = 'rgb( 0,' +  Math.floor(Math.sin(((g.time()%2000)/2000)*6.28 + 2)*255)  + ',' + Math.floor(Math.cos(((g.time()%2000)/2000)*6.28)*255) + ')';//"navy";
        o.draw = function (device) {
                device.beginPath();
                device.fillStyle = this.c;
                device.fillRect(this.x, this.y, this.w, this.h);
            }
        this.scrn.putFunc(o);


        pfunc("Push SPACE key or [START] button", 0, st.length*LINEH +32);

        for (var i in this.str){
            pfunc(this.str[i], 320, i*8 + 8);
        }

        var ks = g.keyboard.state();
        var ms = g.mouse.check_last();
        var ts = g.touchpad.check();

        st = "";
        for (var i in ks){
            //if (ks[i]) st += "[" + String.fromCharCode(i) + ":" + i + "]"; 
            if (ks[i]) st += "[" + i + "]"; 
        }
        pfunc("[Keyboard]", 320, this.str.length*8 +16);
        if (st.length>0) pfunc("KeyCode:" + st, 320, this.str.length*8 +24);
        
        st = "x:" + ms.x + " y:" + ms.y + " button:" + ms.button + " wheel:" + ms.wheel;
        pfunc("[Mouse]", 320, this.str.length*8 +40);
        pfunc("State:" + st, 320, this.str.length*8 +48);

        var vy = 0;
        pfunc("[TouchPad]" + navigator.maxTouchPoints, 320, this.str.length*8 +64);
        for (var i in ts.pos){
            pfunc("State:" + "[" + i + "]" + ts.pos[i].x + "," + ts.pos[i].y + "," + ts.pos[i].id
            , 320, this.str.length*8 +72 + vy);
            vy+=8;
        }

        pfunc("[Fullscreen]" + (document.fullscreenEnabled?"Enable":"Disable"), 320, this.scrn.ch-16);
        pfunc(document.fullscreenElement?"Active":"NonActive", 320, this.scrn.ch-8);

    }
}

class GameTask_Device extends GameTask {

    constructor(id){
        super(id);
    }
        scrn;
        fontsc;
        toggleFullScreen = function() {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
        keylock = 0;
 
    init(g){
        const USEFONT = "6x8";// "8x8white";

        this.scrn = g.screen[4];
        g.font[USEFONT].useScreen(4);
        this.fontsc =  g.font[USEFONT];
    }

    step(g) {
        var ks = g.keyboard.state();

        if (Boolean(ks[70])) {//[f]key
            if (ks[70]){
                if (!document.fullscreenElement){ 
                    g.systemCanvas.requestFullscreen();
               }
            }
        }

        g.vgamepad.check(g.mouse, g.touchpad);

    }

    draw(g){
        g.vgamepad.draw(this.scrn);
        g.touchpad.draw(this.scrn); 
        g.mouse.draw(this.scrn);
    }
}