//soundControl
//

function soundControl( gameAsset ) {

    //�قƂ��game.asset.sound(id).�`�Œ��ڑ��삷��΂悢���e�B
    //�Q�[���̓��e�ɂ���Ă���Ƀ��b�v����K�v����Ǝv����B

    var sd = gameAsset.sound;

    this.play = function( id ) {

        var p = sd[id];

        if (p.ended) p.currentTime = 0;

        p.play();
    }

    this.effect = function( id ) {

        var p = sd[id];

        p.currentTime = 0;
        p.play();
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












