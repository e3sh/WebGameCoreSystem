/**
 * @summary スプライト制御 スプライトの表示
 * @param {GameCore} g GameCoreInstance
 * @example
 *  //表示するスプライトの定義
 *  game.sprite.set( spNumber, PatternID,   
 *  [bool: colisionEnable],   
 *  [int: colWidth], [int: colHeight] );  
 *
 *	//スプライトアイテム登録/生成
 *  game.sprite.s.itemCreate = function(Ptn_id, col=false, w=0, h=0 ) 
 *	//return item	
 *
 * @description
 * method
 *  .spriteItem.view() .Hide() .pos .move .stop .dispose .put
 *  .itemlist .itemFlash .itemIndexRefresh .CollisionCheck .useScreen
 *  .setPattern
 * 
 * propaty
 *  .x .y .r .vx .vy .priority .collsionEnable .collision .id 
 *  .hit .alive .index .living
 *  .normalDrawEnable .beforeCoustomDraw
 * 
 * etc 
 */
function GameSpriteControl(g) {
    //
    //let MAXSPRITE = 1000;
    //screen size (colision check)

    let sprite_ = [];
    let pattern_ = [];

    let buffer_;
    let activeScreen;

    let autoDrawMode = true;

    /**
     * classスプライトアイテム
     * 
     */ 
    function SpItem(){

        this.x  = 0;
        this.y  = 0;
        /**
         * 方向　Radian(0-359）
         * @type {number} 
         */ 
        this.r  = 0;
        /**
         * 拡大率(default1.0)//reserb
         * @type {number} 
         */ 
        this.z  = 0;
        this.vx = 0;
        this.vy = 0;
        /**
         * 表示優先順位(大きいほど手前に表示(後から書き込み))
         * @type {number} 
         */ 
        this.priority = 0;
        /**
         * 衝突処理の有効(実施対象にする)
         * @type {boolean} 
         */ 
        this.collisionEnable = true;
        /**
         * 衝突処理用のサイズ
         * @type {object} 
         */ 
        this.collision = {w:0,h:0};
        this.id = "";
        this.count = 0;
        this.pcnt = 0;
        this.visible = false;
        /**
         * CollisionCheckで衝突しているitemのオブジェクトが入る
         * @type {SpItem[]} 衝突相手のSpItem(複数の場合は複数)　
         */ 
        this.hit = [];
        this.alive = 0;
        this.index = 0; 
        this.living = true;
        /**
         * 通常のスプライトを表示する
         * @type {boolean} 
         */ 
        this.normalDrawEnable = true;
        /**
         * customDrawがnormalDraw実施前後どちらで呼ばれるか(後によばれたら手前に表示される。Default:後(手前)
         * @type {boolean} 
         */ 
        this.beforeCustomDraw = false;
     
        /**
         * カスタム表示のエントリポイント/通常は空/内容あるものに変えると処理される
         * @param {GameCore} g
         * @param {screen} screen 
         */ 
        this.customDraw = function(g, screen){};

        /**
         * 移動処理で呼ばれる関数のエントリポイント
         * @param {number} delta
         */ 
        this.moveFunc;

        /**
         * 表示する
         */ 
        this.view = function (){ this.visible = true; }
        /**
         * 表示しない
         */ 
        this.hide = function (){ this.visible = false;}
        /**
         * 表示位置指定
         * @param {number} x x座標）
         * @param {number} y y座標
         * @param {number} r 方向(0-359)(省略可)
         * @param {number} z 拡大率(省略可)
         */ 
        this.pos = function(x, y, r=0, z=0){
            this.x = x; this.y = y; this.r = r; this.z = z;
        }
        /**
         * 移動指定
         * frame毎に.moveFuncが呼ばれる(通常は直線移動)	
         * @param {number} dir 方向(0-359）
         * @param {number} speed 1f当たりの移動pixel（1/60基準)
         * @param {number} aliveTime 動作させるフレーム数
         */ 
        this.move = function(dir, speed, aliveTime){
            this.visible = true;
            let wr = ((dir - 90) * (Math.PI / 180.0));
            this.vx = Math.cos(wr)*speed;
            this.vy = Math.sin(wr)*speed; 
            this.r = dir;
            this.alive = aliveTime;
        }

        this.moveFunc = normal_move;//normal_move;

        /**
         * 移動処理で呼ばれる関数(default)
         * @param {number} delta
         */ 
        function normal_move(delta){
            this.alive--;

            this.x += this.vx * (delta/(1000/60));
            this.y += this.vy * (delta/(1000/60));

            if (this.alive <= 0) {
                this.visible = false;
            }else{
                this.visible = true;
            }
        }
        /**
         * 移動停止
         */ 
        this.stop = function(){
            this.alive = 0;
            this.vx=0; this.vy=0;
        }
        /**
         * 廃棄
         */ 
        this.dispose = function(){
            this.alive = 0;
            this.visible = false;
            //上の2つで表示も処理もされなくなる
            this.living = false;
        }
        /**
         * 表示処理(内部処理用)
         * @param {number} x x座標
         * @param {number} y y座標
         * @param {number} r 方向(0-359)(省略可)
         * @param {number} z 拡大率(省略可)
         */ 
        this.put = function (x, y, r=0, z=1) {

            let rf = true;                       
            if (Boolean(g.viewport)){
                let rs = g.viewport.viewtoReal(x,y);
                x  = rs.x;
                y  = rs.y;
                rf = rs.in;
            }
            if (rf){
                if (!Boolean(pattern_[this.id])){
                    buffer_.fillText( this.index + " " + this.count , x, y);
                }else{
                    spPut(pattern_[this.id].image, pattern_[this.id].pattern[this.pcnt], x, y, r, z);
                    this.count++;
                    if (this.count > pattern_[this.id].wait) { this.count = 0; this.pcnt++; }
                    if (this.pcnt > pattern_[this.id].pattern.length - 1) { this.pcnt = 0; }
                }
            }
        }
        //内部処理用
        this.reset = function(){

            this.x  = 0;
            this.y  = 0;
            this.r  = 0;
            this.z  = 0;
            this.vx = 0;
            this.vy = 0;
            this.priority = 0;
            this.collisionEnable = true;
            this.collision = {w:0,h:0};
            this.id = "";
            this.count = 0;
            this.pcnt = 0;
            this.visible = false;
            this.hit = [];
            this.alive = 0;
            this.index = 0; 
            this.living = true;
            this.normalDrawEnable = true;
            this.customDraw = function(g,screen){};
            this.beforeCustomDraw = false;
            this.moveFunc = normal_move;
        }

        this.debug = function(){

            let st = [];
            const o = Object.entries(this);

            o.forEach(function(element){
                let w = String(element).split(",");

                let s = w[0];
                if (s.length < 13){
                    s = s + " ".repeat(13);
                    s = s.substring(0, 13);
                }
                let s2 = w[1].substring(0, 15);
                st.push("."+ s + ":" + s2);
            });
            st.push("");
            st.push("Object.entries end.");
    
            return st;
        }
    }

    /**
     * スプライトアイテム登録/生成
     * @param {number | string} Ptn_id UniqID 
     * @param {*} col 衝突有効無効(省略時：無効)
     * @param {*} w 衝突サイズ幅(省略時：0)
     * @param {*} h 衝突サイズ高さ(省略時：0)
     * @returns {SpItem} SpriteItemObject 
     */
    this.itemCreate = function(Ptn_id, col=false, w=0, h=0 ){
        const item = new SpItem();
        let n = sprite_.length;
        sprite_.push(item);
        
        item.reset();
        item.index = n;

        item.id = Ptn_id;
        item.count = 0;
        item.pcnt = 0;

        item.collisionEnable = col;
        item.collision = { w: w, h: h };

        //let st = item.debug();
        //for (let s of st) console.log(s);
        //default visible:false alive:0

        return item;
    }

    /**
     * スプライトアイテムリスト取得
     * @returns {SpItemList} スプライトアイテムオブジェクトの配列
     */   
    this.itemList = function(){
        return sprite_; 
        //基本Index＝配列番号のはず      
    }
    /**
     * スプライトアイテムリストリセット
     */   
    this.itemFlash = function(){
        sprite_ = [];
    }
    /**
     * リストから廃棄済みのスプライトを削除して再インデックス
　   * @returns {SpItemList} スプライトアイテムオブジェクトの配列
     */   
    this.itemIndexRefresh = function(){
        //disposeしたSpItemを削除してIndexを振り直す
        let ar = [];
        for (let i in sprite_) if (sprite_[i].living) ar.push(sprite_[i]);
        for (let i in ar) ar[i].index=i;

        sprite_ = ar;
        return sprite_
    }
    //----
    /**
     * 手動更新モードに変更する
     * 
     * @param {boolean} bool　true:手動 /false:自動更新に戻す
     * @returns {void}    
     */   
    this.manualDraw = function (bool=true) {

        if (bool) {
            autoDrawMode = false;
        } else {
            autoDrawMode = true;
        }
    }
    /**
     * 表示先SCREENの選択
     * 
     * @param {number} screenNo（Layer番号の定数値）TYPE未定の為number
     * @returns {void}    
     */   
    this.useScreen = function( num ){
        //buffer_ = g.screen[num].buffer;
        activeScreen = g.screen[num];
        buffer_ = activeScreen.buffer;
    }

    /**
     * スプライトパターン定義パラメータ
     *　@param {number | string} image ImageId
     *　@param {number} wait アニメーション変更間隔（フレーム数）
     *　@param {number} x イメージ範囲指定x
     *　@param {number} y イメージ範囲指定y
     *　@param {number} w イメージ範囲指定w
     *　@param {number} h イメージ範囲指定h
     *　@param {number} r 向き(0-359)上基準
     *　@param {boolean} fv trueで上下反転
     *　@param {boolean} fh trueで左右反転
     */
    const SpPatternParam = {
        image: "dummy" ,
        wait: 0,
        pattern:[
            {x:0, y:0, w:0, h:0, r:0 ,fv:false, fh:false},
            {x:0, y:0, w:0, h:0, r:0 ,fv:false, fh:false}
            ]
    }
    /**
     * スプライトパターン定義
     *　@param {number | string} anim_id animationUniqID 
     *　@param {SpPatternParam} Param パターン定義パラメータ
     */
    this.setPattern = function (id, Param) {
        pattern_[id] = { image: g.asset.image[ Param.image ].img, wait:Param.wait, pattern:Param.pattern }
    }
    
    //FullCheck return spitem[].hit(array)<-obj
    this.CollisionCheck = function(){
        //総当たりなのでパフォーマンス不足の場合は書き換える必要有。
        let checklist = [];
        for (let i in sprite_) {
            let sp = sprite_[i];
            if (sp.living){//visibleではない場合での当たり判定有の場合がある可能性を考えて処理
                if (sp.collisionEnable) {
                    checklist.push(sp);
                }
            }
        }
        for(let i in checklist){
            let ssp = checklist[i];
            ssp.hit = [];
            for(let j in checklist){
                if (!(i == j)){
                    let dsp = checklist[j];

                    if ((Math.abs(ssp.x - dsp.x) < ((ssp.collision.w/2) + (dsp.collision.w/2)))
                        && (Math.abs(ssp.y - dsp.y) < ((ssp.collision.h/2) + (dsp.collision.h/2)))) {
                            ssp.hit.push(dsp);
                    }
                }
            }
        }
    }

    //Inner Draw Control Functions
    function spPut(img, d, x, y, r, z, alpha) {

        //let simple = true;

        if (!Boolean(r)) { r = d.r; }
        if (!Boolean(alpha)) { alpha = 255; }
        if (!Boolean(z)) { z = 1.0; }

        let simple = ((!d.fv) && (!d.fh) && (r == 0) && (alpha == 255));
        //simple = true;

        //let simple = false;
        if (simple) {
            buffer_.drawImgXYWHXYWH(
                img,
                d.x, d.y, d.w, d.h,
                x + (-d.w / 2) * z,
                y + (-d.h / 2) * z,
                d.w * z,
                d.h * z
            );

        } else {

            let FlipV = d.fv?-1.0:1.0;
            let FlipH = d.fh?-1.0:1.0;

            buffer_.spPut(
                img,
                d.x, d.y, d.w, d.h,
                (-d.w / 2) * z,
                (-d.h / 2) * z,
                d.w * z,
                d.h * z,
                FlipH, 0, 0, FlipV,
                x, y,
                alpha, r
            );

            //buffer_.fillText(r+" ", x, y);
        }
    }

    //Game System inner Draw Call Function
    const pbuf = new priorityBuffer();

    //game.sprite.allDrawSprite(); //登録中スプライトの表示　システムが自動的に呼びます。
    //↑moveFuncも自動更新の場合に処理される。　manualDrawモードにする場合は自前で処理の事

    this.allDrawSprite = function () {

        if (autoDrawMode) {
            pbuf.reset();
            for (let i in sprite_) {
                let o = sprite_[i];
                if (o.living) {
                    //if (dev.gs.in_stage(o.x, o.y)){
                    //画面内であることのチェックはシステム側にないので保留)
                    pbuf.add(o);
                }
            }
            pbuf.sort();
            let wo = pbuf.buffer();

            for (let i in wo) {
                let sw = wo[i];

                if (sw.alive > 0) {
                    sw.moveFunc(g.deltaTime());
                    /*
                    sw.alive--;

                    sw.x += sw.vx;
                    sw.y += sw.vy;

                    if (sw.alive <= 0) {
                        sw.visible = false;
                    }else{
                        sw.visible = true;
                    }
                    */
                }

                //buffer_.fillText(i + " " + sw.visible, sw.x, sw.y);
                if (sw.visible) {
                    if (sw.beforeCustomDraw) sw.customDraw(g, activeScreen);
                    if (sw.normalDrawEnable){
                        let rx= sw.x;
                        let ry= sw.y;
                        let rf = true;                       
                        if (Boolean(g.viewport)){
                            let rs = g.viewport.viewtoReal(rx,ry);
                            rx = rs.x;
                            ry = rs.y;
                            rf = rs.in;
                        }
                        if (rf){
                            if (!Boolean(pattern_[sw.id])) {
                                buffer_.fillText(i + " " + sw.count, rx, ry);
                            } else {
                                spPut(pattern_[sw.id].image, pattern_[sw.id].pattern[sw.pcnt], rx, ry, sw.r, sw.z);
                                sw.count++;
                                if (sw.count > pattern_[sw.id].wait) { sw.count = 0; sw.pcnt++; }
                                if (sw.pcnt > pattern_[sw.id].pattern.length - 1) { sw.pcnt = 0; }
                            }
                        }
                    }
                    if (!sw.beforeCustomDraw) sw.customDraw(g, activeScreen);
                }
            }
        }
    }
    //priorityBufferControl
    //表示プライオリティ制御
    function priorityBuffer(){
        // .Priorityでソートして表示
        // 0が一番奥で大きい方が手前に表示される(allDrawSpriteにて有効)
        let inbuf = [];
        this.add     =( obj )=>{ inbuf.push(obj);}
        this.sort    =() =>    { inbuf.sort((a,b)=> a.priority - b.priority );}
        this.buffer  =()=>     { return inbuf; }
        this.reset   =()=>     { inbuf = []; }
    }
}