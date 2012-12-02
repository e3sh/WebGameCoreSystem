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

    this.useScreen = function( num ){
        buffer_ = g.screen[ num ];
    }

    this.put = function (num, x, y, r, z) {
        var sw = sprite_[num];

        sw.x = x;
        sw.y = y;
        sw.r = r;
        sw.z = z;

        if (!Boolean(pattern_[sw.id])){
            buffer_.print( num + " " + sw.count , x, y);
        }else{
            buffer_.putPattern(pattern_[sw.id].image, pattern_[sw.id].pattern[sw.pcnt], x, y, 32, 32);
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
}