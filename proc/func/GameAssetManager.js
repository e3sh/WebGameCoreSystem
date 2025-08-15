// GameAssetManager
//
/**
 * @summary ゲームアセット管理 
 * Imageやaudioオブジェクトを管理 
 * Image/Audio Object
 * @example
 *  game.asset.imageLoad( id , url ); //戻り値 Imageオブジェクト
 *	game.asset.soundLoad( id , url ); //戻り値 audioオブジェクト(拡張子なしで）
 * 
 *	game.asset.image[ id ];
 *	game.asset.sound[ id ];
 *
 *	game.asset.*.ready //true:ロード完了　false:ロード未完了または失敗
 * 
 * @Todo JSON/TEXT data 
 * @Todo (Sprite Animation pattern/ tilemap data)
 * @Todo DelayLoad
 */
function GameAssetManager(){

    //========= image asset
    let img_ = [];

    /**
     * @param {string | number} id UniqId(割り当てたい任意の数字/文字列)
     * @param {URI} uri ディレクトリパス
     * @returns {ImageData} Imageオブジェクト
     */
    this.imageLoad = function (id, uri) {

        img_[ id ] = new imageAsset( uri );
        return img_[id].img;
	}

    /**
     * {array} Imageオブジェクト
     */
    this.image = img_;

    /**
     * イメージアセットコンテナClass
     * @param {URI} uri ディレクトリパス
     * 
     */ 
    imageAsset = function( uri ){

        this.uri = uri;

        this.ready = false;

        this.img = new Image(); 
        this.img.src = uri;

        /**
         * @returns {boolean} ロード成否
         */
        this.loadcheck= function() {
            this.ready = this.img.complete; //alert("load "+uri);
            return this.img.complete;
        }
    }

    //========== Audio Asset 
    let snd_ = [];

    /**
     * @param {string | number} id UniqId(割り当てたい任意の数字/文字列)
     * @param {URI} uri ディレクトリパス/拡張子無しで指定
     * @returns {AudioData} Audioオブジェクト
     */
    this.soundLoad = function (id, uri) { //拡張子無しで指定

        snd_[ id ] = new audioAsset( uri );

        return snd_[ id ].sound;
    }
    
    /**
     * {array} Audioオブジェクト
     */
    this.sound = snd_;

    /**
     * AudioアセットコンテナClass
     * @param {URI} uri ディレクトリパス
     * 
     */ 
    audioAsset = function( uri ){

        let ext = ".mp3";
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
    /**
     * アセットのロード状態一覧チェック
     * @returns {string[]} リストを返す
     */ 
    this.check = function () {

        let st = [];

        for (let i in img_) {
            let stw = img_[i].uri.split("/", 20)

            st.push( "[" + i + "] " + stw[stw.length-1] + " " + (img_[i].loadcheck()?"o":"x") );
            //img でreadyState　はIEのみの為、使用しない。
        }

        let rs = ["Noting", "Mata", "Current", "Future", "Ok"];

        for (let i in snd_) {
            let stw = snd_[i].uri.split("/", 20);
            let num = snd_[i].loadcheck();
            st.push( "[" + i + "] " + stw[stw.length - 1] + " " + num + "/" + rs[num]);//? "o" : "x") );
        }

        return st;
    }

    /**
     * @returns {string} Idリスト
     */ 
    this.namelist = function(){

        let st = [];

        for (let i in img_) {
            st.push( i );
        }

        for (let i in snd_) {
            st.push( i );
        }

        return st;
    }
    //
}