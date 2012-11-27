// GameAssetManager
//

function GameAssetManager(){

	//asset Load ...

    //var imagelist_ = imagesList();
    //var soundlist = soundlist();

    //fontlist

    //sprite
    //motionpattern

    //mapdata

    //etcetc

    var img_ = [];

    this.imageLoad = function (id, uri) {
		
	        var tex = new Image(); 
	        tex.src = uri;

	        tex.ready = false;
	        tex.addEventListener("load", function () {
	            this.ready = true;
	        });
	
		img_[ id ] = tex;

		return tex;
	}

    this.image = img_;

    var snd_ = [];

    this.soundLoad = function (id, uri) { //拡張子無しで指定
        
        var ext = ".mp3";
        if ((new Audio()).canPlayType("audio/ogg") == "maybe") { ext = ".ogg"; }

        var aud = new Audio(uri + ext);

        aud.ready = false;
        aud.addEventListener("loadeddata", function (e) { this.ready = true; });

        snd_[ id ] = aud;

        return aud;
    }

    this.sound = snd_;

    this.check = function () {

        var st = "<br>";

        for (var i in img_) {
            var stw = img_[i].src.split("/", 20)
            st += i + " " + img_[i].name +" " + stw[stw.length-1] + " " + (img_[i].ready?"o":"x") + "<br>";
            //img でreadyState　はIEのみの為、使用しない。
        }

        for (var i in snd_) {
            var stw = snd_[i].src.split("/", 20)
            st += i + " " + snd_[i].name + " " + stw[stw.length - 1] + " " + (snd_[i].ready ? "o" : "x") + "<br>";
            //img でreadyState　はIEのみの為、使用しない。
        }

        return st;
    }

    //
}