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

    //========= image asset
    var img_ = [];

    this.imageLoad = function (id, uri) {

        img_[ id ] = new ImageAsset( uri );

        /*
	        var tex = new Image(); 
	        tex.src = uri;

	        tex.ready = false;
	        tex.addEventListener("load", function (e) {
	            this.ready = true;
	        });
	
		img_[ id ] = tex;

		return tex;
        */
       return img_[id].img;
	}

    this.image = img_;

    ImageAsset = function( uri ){

        this.uri = uri;

        this.ready = false;

        this.img = new Image(); 
        this.img.src = uri;
        this.loadcheck= function() {
            this.ready = this.img.complete; //alert("load "+uri);
            return  this.img.complete;
        }

        //this.img.addEventListener("load", {ready: this.ready, handleEvent: loadcheck});
    
        //this.ready = this.img.ready;

    }

    //========== Audio Asset 
    var snd_ = [];
    //案：sound.Classでラップしてアセットを直接操作するようにする。playとかも内包させる。2022/02/13memo
    /*
    var s_uri = [];
    var s_pos = [];
    var s_stat = [];
    */

    this.soundLoad = function (id, uri) { //拡張子無しで指定

        snd_[ id ] = new AudioAsset( uri );
       
        /*
        var ext = ".mp3";
        //if ((new Audio()).canPlayType("audio/ogg") == "maybe") { ext = ".ogg"; }

        snd_[ id ] = new Audio(uri + ext);

        snd_[ id ].ready = false;
        snd_[ id ].addEventListener("loadeddata", function (e) { this.ready = true; });

        s_uri[ id ] = uri;
        s_pos[ id ] = 0;
        s_stat[ id ] = snd_[ id ].ready;

        //snd_[ id].play();
        */

        return snd_[ id ].sound;
    }
    
    this.sound = snd_;

    AudioAsset = function( uri ){

        var ext = ".mp3";
        if ((new Audio()).canPlayType("audio/ogg")=="probably"){ext=".ogg";}

        this.ready = false;
        this.sound = new Audio(uri + ext);
        this.sound.addEventListener("loadeddata", function (e) { this.ready = true; });

        this.uri = uri + ext;
        this.pos = 0;

        this.loadcheck= function() {
            //this.ready = this.sound.complete; //alert("load "+uri);
            //return  this.sound.complete;
            /*
            readyState	
            メディアファイルの再生準備状態。
            
            値	定数	状態
            0	HAVE_NOTHING	メディアファイルの情報がない状態。
            1	HAVE_METADATA	メディアファイルのメタデータ属性を初期化するのに十分な状態。
            2	HAVE_CURRENT_DATA	現在の再生位置のデータはあるが、続きを再生する分のデータは不十分な状態。
            3	HAVE_FUTURE_DATA	現在の再生位置から続きを再生できるだけのデータがある状態。
            4	HAVE_ENOUGH_DATA	メディアファイルの終わりまで中断せずに再生できる状態。
            */
            this.ready = (this.sound.readyState != 0)? true: false;
            return this.sound.readyState;
        }
        //this.sound = new Audio(uri + ext);
    }

    //==========   
    this.check = function () {

        var st = [];

        for (var i in img_) {
            var stw = img_[i].uri.split("/", 20)

            st.push( "[" + i + "] " + stw[stw.length-1] + " " + (img_[i].loadcheck()?"o":"x") );
            //img でreadyState　はIEのみの為、使用しない。
        }

        var rs = ["Noting", "Mata", "Current", "Future", "Ok"];

        for (var i in snd_) {
            var stw = snd_[i].uri.split("/", 20);
            var num = snd_[i].loadcheck();
            st.push( "[" + i + "] " + stw[stw.length - 1] + " " + num + "/" + rs[num]);//? "o" : "x") );
        }

        return st;
    }

    this.namelist = function(){

        var st = [];

        for (var i in img_) {
            var stw = img_[i].uri.split("/", 20)

            st.push( i );
            //img でreadyState　はIEのみの為、使用しない。
        }

        for (var i in snd_) {
            var stw = snd_[i].uri.split("/", 20)
            st.push( i );
        }

        return st;


    }
    //
}