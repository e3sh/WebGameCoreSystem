// GameSpriteControl
//

function GameSpriteControl(g) {

    //var MAXSPRITE = 1000;
    //screen size (colision check)

    var sprite_ = [];
    var pattern_ = [];

    var buffer_;

    //SpriteAnimationも含ませる予定

    //Animation使用のSpriteにはCollisionチェックも含ませるべきか？

    //sprite.set( spPtn ,[priority])
    //  collisisonEnable 
    //  size w,h
    // 
    //return num

    var autoDrawMode = true;

    function SpItem(){
    
        this.x = 0;
        this.y = 0;
        this.r = 0;
        this.z = 0;
        this.priority = 0;//機能未実装
        this.collisionEnable = true;
        this.collision = { w: 0, h: 0 };
        this.id;
        this.count = 0;
        this.pcnt = 0;
        this.visible = false;
        this.hit = [];

        this.alive = 0;
        this.vx = 0;
        this.vy = 0;
    }

    /*
    this.view = function (num) {

        if (!Boolean(sprite_[num])) {
            sprite_[num] = new SpItem();
        }
        sprite_[num].visible = true;
    }

    this.hide = function (num) {

        if (!Boolean(sprite_[num])) {
            sprite_[num] = new SpItem();

        }
        sprite_[num].visible = false;
    }
    */

    this.set = function (num, id, col, w, h) {

        if (!Boolean(sprite_[num])) {
            sprite_[num] = new SpItem();
        }
        
        sprite_[num].id = id;
        sprite_[num].count = 0;
        sprite_[num].pcnt = 0;

        if (Boolean(col)) {
            
            sprite_[num].collisionEnable = true;
            sprite_[num].collision = { w: w, h: h };
         } else {

            sprite_[num].collisionEnable = false;
        }

        sprite_[num].visible = false;
    }

    this.setMove = function (num, r, v, aliveTime) {
        var sw = sprite_[num];

        var wr = ((r - 90) * (Math.PI / 180.0));

        sw.vx = Math.cos(wr) * v;
        sw.vy = Math.sin(wr) * v;

        sw.alive = aliveTime;
    }

    this.pos = function (num, x, y, r, z) {
        var sw = sprite_[num];

        sw.x = x;
        sw.y = y;
        sw.r = r;
        sw.z = z;

        sw.visible = true;

        sprite_[num] = sw;

    }

    this.reset = function (num ) {
        var sw = sprite_[num];

        sw.visible = false;
        sw.collisionEnable = false;
        sw.alive = 0;
        sw.vx = 0;
        sw.vy = 0;
    }

    this.manualDraw = function (bool) {

        if (bool) {
            autoDrawMode = false;
        } else {
            autoDrawMode = true;
        }
    }

    this.useScreen = function( num ){
        buffer_ = g.screen[num].buffer;
    }

    this.put = function (num, x, y, r, z) {
        var sw = sprite_[num];

        sw.x = x;
        sw.y = y;
        sw.r = r;
        sw.z = z;

        if (!Boolean(pattern_[sw.id])){
            buffer_.fillText( num + " " + sw.count , x, y);
        }else{
            spPut(pattern_[sw.id].image, pattern_[sw.id].pattern[sw.pcnt], x, y, r, z);
            sw.count++;
            if (sw.count > pattern_[sw.id].wait) { sw.count = 0; sw.pcnt++; }
            if (sw.pcnt > pattern_[sw.id].pattern.length - 1) { sw.pcnt = 0; }
        }

//        sw.count++;
//        if (sw.count > patten_[id].pattern.length) { sw.count = 0; }
    };

    this.get = function (num) {

        if (Boolean(num)) {
            
            if (!Boolean(sprite_[num])) {
                sprite_[num] = new SpItem();
            }
            return sprite_[num];

        } else {
            
            var rc = -1;
            for (var i in sprite_) {
                if (!sprite_[i].visible) {
                    rc = i;
                }
            }
            if (rc == -1) {
                rc = sprite_.length;
            }

            return rc;
        }
    }

    this.setPattern = function (id, Param) {
        
        pattern_[id] = { image: g.asset.image[ Param.image ].img, wait:Param.wait, pattern:Param.pattern }
        
    }

    this.check = function (num) {

        //collisionTest
        var checktarget = [];

        for (var i in sprite_) {
            var sw = sprite_[i];

            if (sw.visible) {
                if (sw.collisionEnable) {
                    checktarget.push(i);
                }
            }
        }

        var ary = [];

        var my = {
            x: sprite_[num].x,
            y: sprite_[num].y,
            w: sprite_[num].collision.w / 2,
            h: sprite_[num].collision.h / 2
        };

        for (var i = 0, loopend = checktarget.length; i < loopend; i++) {

            if (num != checktarget[i]) {
                var tgt = {
                    x: sprite_[checktarget[i]].x, y: sprite_[checktarget[i]].y,
                    w: sprite_[checktarget[i]].collision.w / 2, h: sprite_[checktarget[i]].collision.h / 2
                }

                //ひとまず拡大縮小表示と当たり判定は連動しない事とする。
                //拡大表示する場合は当たり判定の範囲の指定を広くする事。
                /*
                if ((Math.abs(o.x - e.x) < (o.hit_x + e.hit_x) / 2) && (Math.abs(o.y - e.y) < (o.hit_y + e.hit_y) / 2)) {

                    o.status = 2;
                    e.status = 2;
                    o.crash = e;
                    e.crash = o;
                    crash[j] = 1;
                    crash[i] = 1;
                }
                */
                if ((Math.abs(my.x - tgt.x) < my.w + tgt.w)
                    && (Math.abs(my.y - tgt.y) < my.h + tgt.h)) {

                    ary.push(checktarget[i]);
                }
            }
        }

        //返すのはスプライト番号だけにするか、スプライトオブジェクトを返すべきか？
        //ひとまずスプライト番号のリストを返すこととする。（扱いにくい場合は再度調整）
        return ary;
    }

    function spPut(img, d, x, y, r, z, alpha) {

        //var simple = true;

        if (!Boolean(r)) { r = d.r; }
        if (!Boolean(alpha)) { alpha = 255; }
        if (!Boolean(z)) { z = 1.0; }

        var simple = ((!d.fv) && (!d.fh) && (r == 0) && (alpha == 255));

        //var simple = false;
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

            var FlipV = d.fv?-1.0:1.0;
            var FlipH = d.fh?-1.0:1.0;

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

    this.allDrawSprite = function () {
 
        if (autoDrawMode) {
            for (var i in sprite_) {
                var sw = sprite_[i];

                if (sw.alive > 0) {
                    sw.alive--;

                    sw.x += sw.vx;
                    sw.y += sw.vy;

                    if (sw.alive <= 0) {
                        sw.visible = false;//this.reset(i);
                    }
                }
 
                if (sw.visible) {
                    if (!Boolean(pattern_[sw.id])) {
                        buffer_.fillText(i + " " + sw.count, sw.x, sw.y);
                    } else {
                        spPut(pattern_[sw.id].image, pattern_[sw.id].pattern[sw.pcnt], sw.x, sw.y, sw.r, sw.z);
                        sw.count++;
                        if (sw.count > pattern_[sw.id].wait) { sw.count = 0; sw.pcnt++; }
                        if (sw.pcnt > pattern_[sw.id].pattern.length - 1) { sw.pcnt = 0; }
                    }
                }
            }
        }
    }
}