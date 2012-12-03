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

    function SpItem(){
    
        this.x = 0;
        this.y = 0;
        this.r = 0;
        this.z = 0;
        this.priority = 0;
        this.collisionEnable = true;
        this.collision = { w: 0, h: 0 };
        this.id;
        this.count = 0;
        this.pcnt = 0;
    //    this.visible = false;
        this.hit = [];
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
    }

    this.pos = function (num, x, y) {
        var sw = sprite_[num];

        sw.x = x;
        sw.y = y;
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

    this.setPattern = function (id, Param) {
        
        pattern_[id] = { image: g.asset.image[ Param.image ], wait:Param.wait, pattern:Param.pattern }
        
    }

    this.check = function () {

        //collisionTest
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

            var FlipV = d.fv?1.0:-1.0;
            var FlipH = d.fh?1.0:-1.0;

            /*
            switch (m) {
                case 0:
                    break;
                case 1:
                    FlipV = -1.0;
                    break;
                case 2:
                    FlipH = -1.0;
                    break;
                case 3:
                    FlipV = -1.0;
                    FlipH = -1.0;
                    break;
                default:
                    break;
            }
            */
            //o.light_enable = this.light_enable;

            buffer_.spPut(
                img,
                d.x, d.y, d.w, d.h,
                (-d.w / 2) * z,
                (-d.h / 2) * z,
                d.w * z,
                d.h * z,
                FlipV, 0, 0, FlipH,
                x, y,
                alpha, r
            );

            buffer_.fillText(r+" ", x, y);
        }
    }

}