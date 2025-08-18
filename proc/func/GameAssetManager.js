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
 * @description
 * ゲームで使用する画像や音声などのアセットを管理するクラスです。\
 * アセットのロード、ロード状態の確認、そしてIDによるアクセスを\
 * 一元的に提供します。
 */
class GameAssetManager {

    /**
     * Imageオブジェクトリスト
     * @member
     * @type {imageAsset[]} 
    */
    image;

    /**
     * audioオブジェクトリスト
     * @member
     * @type {audioAsset[]} 
     */
    sound;

    constructor() {

        //========= image asset
        const img_ = [];

        /**
         * @method
         * @param {string | number} id UniqId(割り当てたい任意の数字/文字列)
         * @param {URI} uri ディレクトリパス
         * @returns {Image} Imageオブジェクト
         * @description
         * 指定されたURIから画像アセットを非同期でロードします。
         * 一意のIDを割り当て、ロード完了ステータスを追跡しながら
         * ロードされたImageオブジェクトを返します。
         */
        this.imageLoad = function (id, uri) {

            img_[id] = new imageAsset(uri);
            return img_[id].img;
        };

        /**
         * {array} Imageオブジェクト
         */
        this.image = img_;

        /**
         * イメージアセットコンテナClass (内部クラス)
         * @param {URI} uri ディレクトリパス
         * @description 
         * 画像アセットの情報を保持するコンテナクラスです。\
         * 画像のURI、ロード状態（ready）、および実際のImageオブジェクトを管理し、\
         * ロードが完了したかどうかを確認する機能を提供します。
         */
        class imageAsset {
            /**
             * @type {Image}
             */
            img;
            /**
             * loadcheck complate status 
             * @type {boolean}
             */
            ready;
            /**
             * Image uri
             * @type {string}
             */
            uri;
            /**
             * @param {URI} uri ディレクトリパス
             */
            constructor(uri) {

                this.uri = uri;
                this.ready = false;
                this.img = new Image();
                this.img.src = uri;
                /**
                 * @method
                 * @returns {boolean} ロード成否
                 * @description
                 * 画像アセットのロードが完了したかどうかをチェックします。\
                 * `Image.complete`プロパティを利用してロード成否を判断し、\
                 * `ready`ステータスを更新します。
                 */
                this.loadcheck = function () {
                    this.ready = this.img.complete; //alert("load "+uri);
                    return this.img.complete;
                };
            }
        };

        //========== Audio Asset 
        const snd_ = [];

        /**
         * @param {string | number} id UniqId(割り当てたい任意の数字/文字列)
         * @param {URI} uri ディレクトリパス/拡張子無しで指定
         * @returns {Audio} Audioオブジェクト
         * @description
         * 指定されたURIから音声アセットをロードします。\
         * ブラウザが再生可能な形式（MP3またはOGG）を自動判別し\
         * 一意のIDで音声オブジェクトを管理します。
         */
        this.soundLoad = function (id, uri) {

            snd_[id] = new audioAsset(uri);

            return snd_[id].sound;
        };

        /**
         * {array} Audioオブジェクト
         */
        this.sound = snd_;

        /**
         * AudioアセットコンテナClass(内部クラス)
         * @param {URI} uri ディレクトリパス
         * @description 
         * 音声アセットの情報を保持するコンテナクラスです。\
         * 音声のURI、ロード状態（ready）、再生位置（pos）\
         * および実際のAudioオブジェクトを管理します。
         */
        class audioAsset {
            /**
             * Audioオブジェクト
             * @member
             * @type {Audio}
             */
            sound;
            /**
             * loadcheck complate status 
             * @member
             * @type {boolean}
             */
            ready;
            /**
             * Audio uri
             * @member
             * @type {string}
             */
            uri;
            /**
             * Audio play position
             * @member
             * @type {number}
             */
            pos;

            /**
             * 
             * @param {URI} uri 
             */
            constructor(uri) {

                let ext = ".mp3";
                if ((new Audio()).canPlayType("audio/ogg") == "probably") { ext = ".ogg"; }

                this.ready = false;
                this.sound = new Audio(uri + ext);
                this.sound.addEventListener("loadeddata", function (e) { this.ready = true; });

                this.uri = uri + ext;
                this.pos = 0;

                /**
                 * 
                 * @method
                 * @returns {number} readyState
                 * @example
                 * readyState
                 * メディアファイルの再生準備状態。
                 * 値 定数            	状態
                 * 0 HAVE_NOTHING       メディアファイルの情報がない状態。
                 * 1 HAVE_METADATA  	メディアファイルのメタデータ属性を初期化するのに十分な状態。
                 * 2 HAVE_CURRENT_DATA	現在の再生位置のデータはあるが、続きを再生する分のデータは不十分な状態。
                 * 3 HAVE_FUTURE_DATA	現在の再生位置から続きを再生できるだけのデータがある状態。
                 * 4 HAVE_ENOUGH_DATA	メディアファイルの終わりまで中断せずに再生できる状態。
                 * @see https://developer.mozilla.org/ja/docs/Web/API/HTMLMediaElement/readyState
                 * @description
                 * 音声アセットの再生準備状態をチェックします。\
                 * `HTMLMediaElement.readyState`プロパティを利用して、\
                 * 音声データがどの程度ロードされているかを確認します。
                 */
                this.loadcheck = function () {
                    this.ready = (this.sound.readyState != 0) ? true : false;
                    return this.sound.readyState;
                };
                //this.sound = new Audio(uri + ext);
            }
        };

        //==========   
        /**
         * アセットのロード状態一覧チェック
         * @method
         * @returns {string[]} image/soundの状態一覧をテキストリストで返す
         * @description
         * 現在ロードされている全てのアセットのロード状態一覧をテキストで返します。\
         * 画像と音声それぞれについて、URIとロードの成否、\
         * または音声のreadyStateを表示します。
         */
        this.check = function () {

            let st = [];

            for (let i in img_) {
                let stw = img_[i].uri.split("/", 20);

                st.push("[" + i + "] " + stw[stw.length - 1] + " " + (img_[i].loadcheck() ? "o" : "x"));
                //img でreadyState　はIEのみの為、使用しない。
            }

            let rs = ["Noting", "Mata", "Current", "Future", "Ok"];

            for (let i in snd_) {
                let stw = snd_[i].uri.split("/", 20);
                let num = snd_[i].loadcheck();
                st.push("[" + i + "] " + stw[stw.length - 1] + " " + num + "/" + rs[num]); //? "o" : "x") );
            }

            return st;
        };

        /**
         * @method
         * @returns {string} Idリスト(テキスト)
         * @description
         * ロードされている全てのアセットの一意のIDリストをテキストで返します。\
         * 画像と音声アセットのIDが結合された文字列として提供され\
         * 管理されているアセットを一目で確認できます。
         */
        this.namelist = function () {

            let st = [];

            for (let i in img_) {
                st.push(i);
            }

            for (let i in snd_) {
                st.push(i);
            }

            return st;
        };
        //
    }
}