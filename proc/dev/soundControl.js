//soundControl
//

function soundControl( gameAsset ) {

    //ほとんどgame.asset.sound(id).～で直接操作すればよい内容。
    //ゲームの内容によってさらにラップする必要あると思われる。

    var sd = gameAsset.sound;

    this.play = function( id ) {

        var p = sd[id].sound;

        if (p.ended) p.currentTime = 0;

        p.play();
    }

    this.effect = function( id ) {

        if (Boolean(sd[ id ])) {

            sd[ id ].sound.currentTime = 0;
            sd[ id ].sound.play();

            //var audioCtx = new AudioContext;
            //var source = audioCtx.createMediaElementSource( sd[ id ]);
            //source.play();
        }
    }

    this.running = function ( id ) 
    {
       return (!sd[id].ended);
    }

    this.info = function ( id ) {

        var p = sd[id];

        return (p.currentTime / p.duration) * 100;
    }


    this.restart = function ( id ) {

        sd[id].currentTime = 0;

    }

    this.volume = function ( id, vol ) {

        sd[id].volume = vol;
    }
}












