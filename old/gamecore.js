  /**
   * @typedef {number} wavetypeNumber 0:"sine", 1:"square", 2:"sawtooth", 3:"triangle"
   * @example
   * 0:"sine", 1:"square", 2:"sawtooth", 3:"triangle"
   * @description
  * - 以下の数値で設定する<br>\
  * - 0: サイン波 <br>\
  * - 1: 矩形波   <br>\
  * - 2: ノコギリ波<br>\
  * - 3: 三角波   <br>\
  */
  /**
   * LFO setup Paramater
   * @typedef {object} lfoParam  
   * @property {number} Freq LFO周波数
   * @property {waveTypeString } wavetype LFOの波形タイプ
   * @property {number} depth LFO depth
   * @example
   * {Freq:0, wavetype:"none", depth:0};
   */
  /** 
   * waveTypeString
   * @typedef {string} waveTypeString "sine" or "square" or "sawtooth" or "triangle" or "none"
   * @example
   * "sine" or "square" or "sawtooth" or "triangle" or "none"
   * @description
   * - 以下の文字列を設定する<br>\
   * - "sine":サイン波<br>\
   * - "square":矩形波<br>\
   * - "sawtooth":ノコギリ波<br>\
   * - "triangle":三角波<br>\
   * - "none":なし（LFOの波形タイプを選択時のみ)<br>\
   */
  /**
   * numberVolume
   * @typedef {number} numberVolume (bitween 0.0~1.0)
   * @example
   *  (bitween 0.0~1.0)
   * @description
   * ボリュームパラメータ: 0.0から1.0の範囲内で指定すること
  */
/**
 * WebAudio Beep Function \
 * BEEPCORE SOUND SYSTEM
 * @class
 * @classdesc
 * WebAudio APIを利用したサウンドシステムです。<br>\
 * サイン波、矩形波、ノコギリ波、三角波などの波形を生成し、<br>\
 * プログラムで音色や音階を制御してビープ音を鳴らします
 */
class Beepcore {
  constructor() {

    const wave = ["sine", "square", "sawtooth", "triangle"];

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    //const ctx = new AudioContext();
    let masterVolume = 0.2;
    let oscwavetype = wave[0];
    let lfo = null;

    let noteList = [];

    /**
     * SoundNoteClass(AudioContextRapper)
     * @class Beepcore.noteClass
     * @classdesc
     * Beepcoreサウンドシステム内で個々の音源を管理します。<br>\
     * 発振器（oscillator）とゲインノード（gainNode）を制御し、<br>\
     * 音の生成、再生、停止、ボリュームや周波数の変更を行います。　
     */
    class noteClass {
      /**
       * 
       */
      constructor() {

        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        //osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        gainNode.gain.value = 0;
        osc.connect(gainNode).connect(ctx.destination);

        let masterVolume;

        let noteList;
        let starttime;

        this.living = false; //生成されて初期化が終わったらtrue/stop後は再利用できないのでfalse
        this.busy = false; //playで譜面があるうちはbusy/譜面終了したらfalse;    

        const noteTable = Table();

        /**
         * note initialize
         * @method
         * @param {number} [Freq=440] 周波数
         * @param {waveTypeString} [osc_wavetype="sine"] オシレーターの波形タイプ
         * @param {lfoParam} [lfop=null] LFO設定
         * @param {numberVolume} [mVol=0.2] マスターボリューム
         * @description
         * 音源を初期化します。<br>\
         * 周波数、オシレーターの波形タイプ、LFO（低周波発振器）の設定、<br>\
         * およびマスターボリュームをパラメータとして設定します。
         */
        this.init = function (Freq = 440, osc_wavetype = "sine", lfop = null, mVol = 0.2) {
          //  lfo param = {Freq:0, wavetype:"none", depth:0};
          masterVolume = mVol;

          osc.type = osc_wavetype;
          osc.frequency.value = Freq;

          if (lfop !== null) {
            // LFO
            const lfo = ctx.createOscillator();
            const depth = ctx.createGain();

            depth.gain.value = lfop.depth;

            lfo.type = lfop.wavetype;
            lfo.frequency.value = lfop.Freq;
            // lfo -> depth -> Osc.Freq
            lfo.connect(depth).connect(osc.frequency);
            lfo.start();
          }
          this.living = true;

          noteList = [];
        };

        /**
         * note on (voice play)
         * @method
         * @param {numberVolume} [volume=1.0] ボリューム
         * @param {number} [delay=0] 遅延時間（秒）
         * @description
         * 音源の再生（ボイスプレイ）を開始します。<br>\
         * 指定されたボリュームと遅延時間（秒）で音を鳴らし<br>\
         * ゲインノードを通じてマスターボリュームが適用されます。
         */
        this.on = function (volume = 1, delay = 0) {
          gainNode.gain.value = volume * masterVolume;
          osc.start(delay);
        };

        /**
         * change note volume
         * @method
         * @param {numberVolume} volume ボリューム　
         * @description
         * 音源のボリュームを変更します。<br>\
         * 新しいボリューム値とマスターボリュームを掛け合わせた値が、<br>\
         * ゲインノードのゲイン値として即座に適用されます。
         */
        this.changeVol = function (volume = 1) {
          gainNode.gain.value = volume * masterVolume;
        };

        /**
         * @method
         * @param {number} Freq 周波数
         * @description
         * 音源の周波数を変更します。<br>\
         * 新しい周波数値をオシレーターに直接設定することで、<br>\
         * リアルタイムに音の高さを調整します。
         */
        this.changeFreq = function (Freq) {
          osc.frequency.value = Freq;
        };

        /**
         * note stop play
         * @method
         * @param {number} dur 遅延時間（秒）
         * @description
         * 音源の再生を停止します。<br>\
         * 指定された遅延時間（秒）後にオシレーターが停止し、<br>\
         * オブジェクトは再利用できない状態（living: false）になります。
         */
        this.off = function (dur) {
          osc?.stop(dur);
          this.living = false;
        };

        /**
         * @method
         * @description
         * 音源のゲインと周波数をゼロに設定し、一時的に音を止めます。<br>\
         * 完全に停止させる`off`とは異なり、 <br>\
         * 音源オブジェクト自体は「生きている」状態を保ちます。
         */
        this.suspend = function () {
          gainNode.gain.value = 0;
          osc.frequency.value = 0;
        };

        /**
         * PlayNoteParamater(UtiltyGenerate)
         * @typedef {object} noteParam NoteParamater
         * @property {string} noteText NoteName A0-A8
         * @property {number} Freq Frequency
         * @property {number} Vol NoteVolume
         * @property {number} time NoteLengthTime
         * @property {boolean} use use check flag
         */
        /**
         * noteScorePlay
         * @method
         * @param {noteParam[]} setList makeScore method create list array
         * @param {number} now play start system time (game.time()) 
         * @description
         * 音符のシーケンス（スコア）を再生します。<br>\
         * `makeScore`メソッドで作成された音符パラメータのリストを受け取り、<br>\
         * 指定された開始システム時刻から再生を開始します。
         */
        this.play = function (setList, now) {

          noteList = setList;
          //[{note:"A4", Freq:0, Vol:0, time:0, use:false} ..]
          for (let i in noteList) {
            if (Boolean(noteList[i].name)) {
              noteList[i].Freq = nameToFreq(noteList[i].name);
            }
          }
          starttime = now;
          this.busy = true;

          function nameToFreq(name) {

            let Freq = 0;
            for (let i in noteTable) {
              if (name == noteTable[i].name) {
                Freq = noteTable[i].Freq;
                break;
              }
            }
            return Freq;
          }
        };

        /**
         * system use internal playcontrol function 
         * @method
         * @param {number} now calltime
         * @description
         * システム内部で使用される再生制御関数です。<br>\
         * 現在時刻に基づいて`noteList`内の音符の状態を更新し、 <br>\
         * 適切なタイミングで音量や周波数を変更します。 
         */
        this.step = function (now) {
          let c = 0; // not use note count
          let st = 0; // playstart time on note
          let et = 0; // play end time on note
          for (let i in noteList) {
            let n = noteList[i];
            et += n.time;
            let pt = now - starttime;
            if (!n.use) {
              if ((st < pt) && (et > pt)) {
                this.changeVol(n.Vol);
                this.changeFreq(n.Freq);
                n.use = true;
              }
              c++;
            }
            st = et;
          }
          if (c == 0) {
            this.suspend();
            noteList = [];
            this.busy = false;
            //演奏終了
          }
        };

        /**
         * @returns noteFreqMappingTable
         * @description
         * A0からG#8までの音名と対応する周波数のマッピングテーブルを生成
         */
        function Table() {

          const notename = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];

          let tb = [];
          for (let i = 0; i < 9; i++) { //Octarb
            const startFreq = 27.5 * Math.pow(2, i);
            for (let j = 0; j < 12; j++) {
              const note = {
                name: notename[j] + ((j < 3) ? i : i + 1),
                Freq: startFreq * (Math.pow(2, j / 12))
              };
              tb.push(note);
            }
          }
          return tb;
        }
      }
    }

    /**
     * NOTE CREATE
     * @method
     * @param {number} Freq 周波数
     * @returns {noteClass} 音源オブジェクト
     * @description
     * 新しい`noteClass`オブジェクトを生成して初期化します。<br>\
     * 指定された周波数、グローバルな波形タイプ、LFO設定、<br>\
     * およびマスターボリュームで音源を作成し、リストに追加します
     */
    this.createNote = function (Freq) {

      let note = new noteClass();
      note.init(Freq, oscwavetype, lfo, masterVolume);
      noteList.push(note);
      //console.log(noteList.length);
      return note;
    };
    /**
     * SETUP BEEPCORE SOUND SYSTEM
     * use OSC Wavetype select
     * @method
     * @param {wavetypeNumber} wavetype 波形タイプ[0~3]
     * @description
     * 使用するオシレーターの波形タイプを設定します。 <br>\
     * 正弦波、矩形波、ノコギリ波、三角波の中から選択し、 <br>\
     * 以降作成される音符のデフォルト波形として適用されます。
     */
    this.oscSetup = function (wavetype) {
      oscwavetype = wave[wavetype];
    };
    /**
     * SETUP BEEPCORE SOUND SYSTEM
     * LFO setup
     * @method
     * @param {number} Freq LFO周波数
     * @param {wavetypeNumber} wavetype 波形タイプ[0~3]
     * @param {number} depth LFOデプス
     * @description
     * LFO（低周波発振器）を設定します <br>\
     * LFOの周波数、波形タイプ、デプス（深さ）を指定し、<br>\
     * 音に揺らぎやビブラート効果を加えることができます。
     */
    this.lfoSetup = function (Freq, wavetype, depth) {
      lfo = { Freq: Freq, wavetype: wave[wavetype], depth: depth };
    };
    /**
     * SETUP BEEPCORE SOUND SYSTEM
     * LFO off
     * @method
     * @description
     * 設定されているLFOを無効にします。<br>\
     * これにより、以降作成される音符にLFO効果は適用されなくなり、<br>\
     * 既存のLFO効果も停止します。
     */
    this.lfoReset = function () { lfo = null; };
    /**
     * SETUP BEEPCORE SOUND SYSTEM
     * MasterVolume setup
     * @method
     * @param {numberVolume} vol マスターボリューム
     * @description
     * BEEPCOREのマスターボリュームを設定します。<br>\
     * 0.0（無音）から1.0（最大）の範囲で音量を調整し <br>\
     * システム全体にわたる音量バランスを制御します。
     */
    this.masterVolume = function (vol = 0.2) {
      masterVolume = vol;
    };
    //Taskstep 
    /**
     * system-use
     * @method
     * @param {nunmber} now systemtime 
     * @description
     * BEEPCOREの状態を更新します。<br>\
     * 現在アクティブな全ての音源（`noteClass`インスタンス）の<br>\
     * step`メソッドを呼び出し、再生状態を管理します。
     */
    this.step = function (now) {
      for (let i in noteList) {
        if (noteList[i].living) {
          noteList[i].step(now);
        } else {
          noteList.splice(i, 1);
        }
      }
    };

    //Utility
    /**
     * - play command paramater make utility
     * - 音名の配列からplayコマンドで再生可能なパラメータ配列に変換
     * - noteNameList -> noteParam Convert
     * @method
     * @param {string[]} namelist notename array
     * @param {number} time note interval(ms) 
     * @param {numberVolume} vol note volume
     * @returns {noteParam[]} playコマンドで再生可能なパラメータ配列
     * @example namelist: ["G5","C6","E6","C6","D6","G6"];
     * 4/4拍子 テンポ120 60f 3600f/m
     * 4分音符    30f 500ms
     * 8分音符    15f 250ms
     * 16分音符  7.5f 125ms
     * 32分音符 3.75f 62.5ms
     * @description
     * 再生コマンド用のパラメータリストを作成するユーティリティです。<br>\
     * 音名の配列を受け取り、各音符の周波数、ボリューム、再生時間を設定した、<br>\
     * `noteClass.play`メソッドで利用可能な形式に変換します。
     */  
    this.makeScore = function (namelist, time = 100, vol = 1) {
      //namelist  exmpl. ["G5","C6","E6","C6","D6","G6"];
      let sc = [];
      for (let i in namelist) {
        let n = { name: namelist[i], Freq: 0, Vol: vol, time: time, use: false };
        sc.push(n);
      }
      sc.push({ Freq: 0, Vol: 0, time: 100, use: false });

      return sc;
    };
  }
}

﻿// DisplayControlクラス
/**
 * 色指定文字列
 * @typedef {string} Color 色指定文字列
 * @example
 * "blue","red","green" etc
 * @see https://developer.mozilla.org/ja/docs/Web/CSS/color_value
 */

/**
 * CanvasRenderingContext2D
 * @typedef {CanvasRenderingContext2D} DeviceContext
 * @see https://developer.mozilla.org/ja/docs/Web/API/CanvasRenderingContext2D
*/

/**
 * ImageData
 * @typedef {HTMLImageElement} Img Texture画像情報
 * @see https://developer.mozilla.org/ja/docs/Web/API/HTMLImageElement
 */

/**
 * 画面表示コントロール(CanvasLayerControl)クラス
 * @class
 * @param {DeviceContext} ctx mainCanvasCtx
 * @param {number} c_w pixel width
 * @param {number} c_h pixel height
 * @param {number} ix display offset x
 * @param {number} iy display offset y
 * @description
 * 実際の画面表示サイズはCSSのSTYLEで <br>\
 * 指定してあるのでここでは、操作する解像度を指定する。 <br>\
 * <br>\
 * HTML Canvas要素への画面表示を制御するクラスです。 <br>\
 * オフスクリーンバッファを使用し、指定された解像度で描画を行い、<br>\
 * 実際のCanvas要素に最終的な描画結果を反映させます。
 * @todo FontFace
 */
class DisplayControl {

    /**
     * OffscreenbufferController 
     * @member
     * @type {offScreenTypeC} 
     */
    buffer;
    /**
     * canvas.width
     * @member
     * @type {number}
     */
    cw;
    /**
     * canvas.height
     * @member
     * @type {number}
     */
    ch;
    /**
     * 加算合成を使用する
     * @member
     * @type {boolean}
     * @todo 現在は効果なし/削除予定
     * @deprecaed
     */
    lighter_enable;

    /**
     * 背景色(fillcolor)
     * @member
     * @type {Color}
     */
    backgroundcolor;

    device; //privete
    intervalTime; //private access->get/set

    /**
     * @param {DeviceContext} ctx canvas2Dcontext
     * @param {number} c_w width
     * @param {number} c_h height
     * @param {number} ix offset x
     * @param {number} iy offset y
     * @description
     * DisplayControlクラスのインスタンスを初期化します。 <br>\
     * 描画コンテキスト、幅、高さ、オフセットなどのパラメータを設定し　<br>\
     * オフスクリーンバッファと表示デバイスを準備します
     */
    constructor(ctx, c_w, c_h, ix, iy) {

        const buffer_ = new offScreenTypeC(c_w, c_h, ix, iy); //offScreenCanvas版(2023/03-)

        this.buffer = buffer_;

        const dev = ctx; //canvas.getContext("2d");
        this.device = dev;

        this.cw = c_w; //canvas.width;
        this.ch = c_h; //canvas.height;

        dev.font = "16px 'Arial'";

        this.lighter_enable = true; //現在無効

        this.view = buffer_.view;
        this.flip = buffer_.flip;

        let intv = 1;
        this.intervalTime = intv;
        let bgcolor = "";
        this.backgroundcolor = bgcolor;
    }

    /**
     * 表示間隔設定(フレーム)
     * @param {number} num 更新間隔
     * 0指定で自動更新(clear)抑止
     * @description
     * 画面の更新間隔（フレーム数）を設定します。 <br>\
     * 0を指定すると自動更新（画面クリア）が抑止され、 <br>\
     * 手動での更新制御が可能になります。
     */
    setInterval =(num)=>{
 
        if (num == 0) {
            this.buffer.flip(false);
        } else {
            this.buffer.flip(true);
        }
        this.intervalTime = num;
    };
    /**
     * 背景色設定
     * @param {Color} str 表示色
     * null,""指定で透過色でクリア
     * @description
     * 画面の背景色を設定します。<br>\
     * `null`または空文字列を指定すると、背景は透過色でクリアされ、<br>\
     * 重ねて表示する際に前の描画が残ります。
     */
    setBackgroundcolor =(str)=>{ this.backgroundcolor = str;};
    /**
     * 表示間隔設定値取得
     * @returns {number} 更新間隔(フレーム)
     * @description
     * 現在設定されている画面の更新間隔（フレーム数）を取得します。
     */
    getInterval =()=>{ return this.intervalTime;};
    /**
     * 背景色設定値取得
     * @returns {Color} 表示色
     * @description
     * 現在設定されている画面の背景色を取得します。<br>\
     * 設定された色指定文字列を返します。
     */
    getBackgroundcolor =()=>{ return this.backgroundcolor;};

    //-------------------------------------------------------------
    /**
     * マップチップ用パターン描画
     * @param {Img} gr Image
     * @param {object} ptn パターン番号（またはx,y,w,hの入ったオブジェクト）
     * @param {number} x 表示位置
     * @param {number} y 表示位置
     * @param {number} w 表示幅
     * @param {number} h 表示高さ
     * @description
     * マップチップなどのパターン画像を画面に描画します。<br>\
     * 元画像からの切り出し位置、サイズ、表示位置、表示幅、高さを指定し、<br>\
     * オフスクリーンバッファに描画します。
     */
    putPattern =(gr, ptn, x, y, w, h)=>{

        this.buffer.drawImgXYWHXYWH(
            gr,
            ptn.x, ptn.y, ptn.w, ptn.h,
            x, y, w, h
        );
    };
    //-------------------------------------------------------------
    /**
     * マップチップ用パターン切り取り配列の登録
     * @param {Img} gr Image
     * @param {object} bgpth パターン配列（x,y,w,hの入ったオブジェクト）
     * @todo　用途不明
     */
    setBgPattern =(bgptn)=>{

        bgPtn = bgptn;
    };
    //-------------------------------------------------------------
    /**
     * 文字列の表示(fillText)
     * @param {string} str MessageText
     * @param {number} x position
     * @param {number} y position
     * @param {Color} c color
     * @description
     * 指定された文字列を画面に表示します。<br>\
     * 文字列、X座標、Y座標、表示色（省略時は"limegreen"）を指定し、<br>\
     * オフスクリーンバッファにテキストを描画します。<br>\
     * フォント展開やベクター表示であることを考えると<br>\
     * 毎フレーム書き換える用途での使用は限定して<br>\
     * あまり更新しない画面での使用を推奨します
     */
    print =(str, x, y, c)=>{

        if (!Boolean(c)) { c = "limegreen"; }

        this.buffer.fillText(str, x, y, c);
    };

    /**
     * @typedef {string} FontTextStyle テキストスタイル
     * @example
     * "bold 48px serif"
     * @description
     *  CSS の font の記述子と同じ構文
     * @see https://developer.mozilla.org/ja/docs/Web/CSS/font
     */
    /**
     * フォントの指定
     * @param {FontTextStyle} [str="16px 'Arial'"] フォントスタイル
     * @description
     * print methodで使用するフォントを変更します
     * @todo 指定した効果が発生しない2025/08/20　
     */
    assignFont =(str="16px 'Arial'")=>{

        this.device.font = str;
    }
    //------------------------------------------------------------
    /**
     * 画像イメージを直接取得して表示させる。
     * @param {Img} gr 画像(イメージデータ)
     * @param {number} x 表示位置座標
     * @param {number} y 表示位置座標
     * @description 
     * 元画像のサイズそのままに、オフスクリーンバッファへ描画します。
     */
    putImage =(gr, x, y)=>{

        this.buffer.drawImgXY(gr, x, y);
    };
    //------------------------------------------------------------
    /**
     * 画像イメージを直接取得して表示させる。（ほぼテスト用）
     * @param {Img} gr 画像(イメージデータ)
     * @param {number} x 表示位置座標
     * @param {number} y 表示位置座標
     * @param {number} w 表示幅
     * @param {number} h 表示高さ
     * @description
     * 画像イメージを指定されたサイズで<br>\
     * オフスクリーンバッファへ描画します。
    */
    putImage2 =(gr, x, y, w, h)=>{
 
        this.buffer.drawImgXYWH(gr, x, y, w, h);
    };
    //------------------------------------------------------------
    /**
     * 画像イメージを直接取得して表示させる。（Transform付き）
     * @param {Img} gr 画像(イメージデータ)
     * @param {number} x 表示位置座標
     * @param {number} y 表示位置座標
     * @param {number} m11 変換座標
     * @param {number} m12 変換座標
     * @param {number} m21 変換座標
     * @param {number} m22 変換座標
     * @description
     * 画像イメージを変形行列（Transform）を適用して表示します。<br>\
     * 画像データと変換座標（m11, m12, m21, m22）を指定し、<br>\
     * 画像を自由に拡大・縮小・回転・せん断して描画できます。
    */
    putImageTransform =(gr, x, y, m11, m12, m21, m22)=>{

        this.buffer.putImageTransform(gr, x, y, m11, m12, m21, m22);
    };
    //---------------------------------------------------------
    /**
     * Transform(OffscreenBuffer全体の変形)
     * @param {number} m11 変換座標
     * @param {number} m12 変換座標
     * @param {number} m21 変換座標
     * @param {number} m22 変換座標
    */
    transform =(m11, m12, m21, m22)=>{

        this.buffer.Transform(m11, m12, m21, m22, 0, 0);
    };
    //------------------------------------------------------------
    /**
     * 表示機能有り(draw)objectで表示コマンドを登録して表示
     * @param {PutFuncCustomDraw} cl 表示機能有り(draw)object
     * @description
     * `draw(device)`関数を持つカスタム描画オブジェクトを登録し、実行します。
    */
    putFunc =(cl)=>{
        //ここで登録するクラスには表示の為に"draw( device )" functionを必ず登録
        this.buffer.putFunc(cl);
    };
    //---------------------------------------------------------
    /**
     * 画面消去(クリア）
     * @param {Color} c_str クリア背景色
     * @description
     * 画面全体を消去（クリア）します。<br>\
     * オプションで背景色を指定して塗りつぶすことも可能で、<br>\
     * `setInterval(0)`設定時以外は、毎フレーム自動的に呼び出されます。
    */
    clear =(c_str)=>{

        if (this.flip()) {

            this.buffer.allClear(0, 0, this.cw, this.ch);

            if (c_str === void 0) { c_str = this.backgroundcolor; }
            if (Boolean(c_str)) {
                this.buffer.fillRect(0, 0, this.cw, this.ch, c_str);
            }
        }
    };
    //-----------------------------------------------------
    /**
     * 部分クリア(色指定で部分塗りつぶし）
     * @param {number} x 表示位置座標
     * @param {number} y 表示位置座標
     * @param {number} w 表示幅
     * @param {number} h 表示高さ
     * @param {Color} c_str 塗り潰し色
     * @description
     * 画面の指定された範囲を色で塗りつぶします。<br>\
     * X座標、Y座標、幅、高さ、塗りつぶし色を指定し、<br>\
     * RGBA形式で半透明色も指定可能です。
    */
    fill =(x, y, w, h, c_str)=>{

        this.buffer.fillRect(x, y, w, h, c_str);
    };
    //----------------------------------------------------------
    /**
     * offScreenのクリア
     * @description
     * オフスクリーンバッファをクリアします。<br>\
     * `enable_reset_flag`が`true`の場合に実行され、<br>\
     * バッファの内容を消去して初期状態に戻します。
    */
    reset =()=>{

        this.buffer.reset();
    };
    //----------------------------------------------------------
    /**
     * (flameloopで実行用）offScreenのクリア
     * @description
     * フレームループ内で実行されることを想定したオフスクリーンバッファのクリア関数です。<br>\
     * `enable_reset_flag`が`true`の場合、`reset`メソッドを呼び出して<br>\
     * バッファをクリアします。
    */
    reflash =()=>{ 

        this.buffer.reflash(); 
    };
    //----------------------------------------------------------
    /**
     * 描画
     * @description
     * オフスクリーンバッファの内容をメインのCanvasに反映させます。<br>\
     * この処理により、オフスクリーンで描画された全ての要素が<br>\
     * ユーザーに見える形で画面に表示されます。
    */
    draw =()=>{

        this.buffer.draw(this.device);
    };
    //----------------------------------------------------------
    /**
     * 書き込み処理回数の取得
     * @returns {number} draw実行毎の回数
     * @description
     * 前回の`draw`メソッド呼び出し以降に実行された描画関数の回数を返します。<br>\
     * これにより、1フレームあたりの描画負荷の目安を把握できます。
    */
    count =()=>{

        return this.buffer.count();
    };
    //----------------------------------------------------------
    /**
     * 書き込み処理回数最大値の取得
     * @returns {number} 最大値
     * @description
     * 記録された描画関数呼び出し回数の最大値を返します。<br>\
     * これは、各フレームにおける描画負荷のピーク値を示し、<br>\
     * パフォーマンス最適化の参考にできます。
    */
    max =()=>{

        return this.buffer.max();
    };
}



/**
 * FontPrintControl
 * Utf16 String Draw Text
 * @example
 * fprint = new fontPrintControl(
 *  screen, 
 *  image"pict/k12x8_jisx0201c.png", 6, 8,
 *  image"pict/k12x8_jisx0208c.png",12, 8
 * );
 * 
 * @description
 * ビットマップ画像として用意されたフォントパターンを用いて、<br>\
 * UTF-16文字列を描画する機能を提供します。<br>\
 * 半角ASCII文字、半角カナ、全角漢字の描画に対応しています。
 */
class fontPrintControl {
    /**
     * @param {GameCore} g GameCore instance
     * @param {Img} asciiPtn ASCII Font Image
     * @param {number} aw ASCII Font width
     * @param {number} ah ASCII Font height
     * @param {Img} KanjiPtn KANJI Font Image
     * @param {number} kw KANJI Font width
     * @param {number} kh KANJI Font height
     */
    constructor(g, asciiPtn, aw, ah, KanjiPtn, kw, kh) {

        var buffer_ = g.screen[0].buffer;

        /**
         * @method
         * @param {number} num DisplayControl (screen) No
         * @description
         * フォント描画に使用するスクリーンバッファを選択します。
         */
        this.useScreen = function (num) {

            buffer_ = g.screen[num].buffer;
        };
        //var p_ch_ptn = fontParam.pattern;
        const pica = asciiPtn; //new Image();

        //pica.src = asciiPtn;
        const pick = KanjiPtn; //new Image();

        //pick.src = KanjiPtn;
        var UTFconv = [];

        const map = utfmap();
        for (let i in map) {
            //map これもglobalで最初に宣言している。変換マップ(横軸:点,縦軸:区で内容がUTF-16の2次元配列/utfmap.js)
            for (let j in map[i]) {
                if (map[i][j] != 0) {
                    UTFconv[map[i][j]] = { x: j, y: i };
                }
            }
        }

        /**
         * @typedef {object} FontLocateImg  
         * @property {img} Img ASCIIFontImage or KANJIFontImage
         * @property {number} x x-position
         * @property {number} y y-position
         * @property {number} w width
         * @property {number} h height
         * @property {number} type 0:ASCII 1:半角カナ 2:漢字(SHIFT-JIS）
        */
        /**
         * フォント画像の文字の切り出し位置算出
         * @param {number} code UTF-16 Moji Code 
         * @returns {FontLocateImg} 切り出し位置指定情報
         * @description
         * 文字コードに対応するフォントパターンの画像内位置を計算します。<br>\
         * ASCII、半角カナ、漢字のそれぞれの文字タイプを判別し、<br>\
         * 適切なフォント画像と切り出し範囲を特定します。
         */
        function charCodeToLoc(code) {

            let kanjif = false;
            let x, y, w, h, t;

            w = 4;
            h = 12;
            t = 0;

            if (code < 128) {
                x = Math.floor(code % 16) * aw;
                y = Math.floor(code / 16) * ah;
                w = aw;
                h = ah;
                //ascii
                t = 0;
            }

            if (code >= parseInt("FF60", 16)
                && code <= parseInt("FF9F", 16)) {

                let wn = code - parseInt("FF60", 16);

                x = Math.floor(wn % 16) * aw;
                y = Math.floor(wn / 16) * ah + (ah * 10);
                w = aw;
                h = ah;
                //半角カナ
                t = 1;
            }

            if (UTFconv[code] !== void 0) {
                //    ws += "(" + UTFconv[n].x + "." + UTFconv[n].y + ")" ;
                //}
                //for (let j in utfkuten ){
                //    let u = utfkuten[j];
                //    if (code == u.U){
                //ws += "(" + u.K + "." + u.T + " " + u.R + ")" ;
                x = UTFconv[code].x * kw;
                y = UTFconv[code].y * kh;
                w = kw;
                h = kh;

                kanjif = true;

                t = 2;
                //    }
            }

            //graphicsPatten to hankaku zennkaku 
            //cursor x,y
            // 
            let r = {};
            r.img = kanjif ? pick : pica;
            r.x = x;
            r.y = y;
            r.w = w;
            r.h = h;
            r.type = t;

            return r;
        }
        /**
         * @method
         * @param {string} str 表示文字列
         * @param {number} x 表示位置x座標
         * @param {number} y 表示位置y座標
         * @description
         * 指定された文字列をフォントパターンを使用して画面に描画します。<br>\
         * 文字列、X座標、Y座標を指定し、<br>\
         * 各文字はフォントパターンから切り出され、順に表示されます。
         */
        this.print = function (str, x, y) {

            for (let i = 0, loopend = str.length; i < loopend; i++) {
                let n = str.charCodeAt(i);

                let d = charCodeToLoc(n);

                //buffer_.fillRect(x, y, 3, 3, "green")
                //buffer_.fillText(d.x, x, y +100);
                //buffer_.fillText(d.y, x, y +116);
                //buffer_.fillText(d.w, x, y +132);
                buffer_.drawImgXYWHXYWH(
                    d.img,
                    d.x, d.y, d.w, d.h,
                    x, y, d.w, d.h
                );
                x = x + d.w;
            }
            //buffer_.drawImgXY(d.img,x, y);
        };
        /**
         * @method
         * @param {string} str 表示文字列
         * @param {number} x 表示位置x座標
         * @param {number} y 表示位置y座標
         * @param {number} z 拡大率
         * @description
         * 指定された文字列の各文字を個別に、拡大率を適用して描画します。<br>\
         * 文字列、X座標、Y座標、そして任意の拡大率（Z）を指定することで、<br>\
         * 文字のサイズを調整して表示できます。
         */
        this.putchr = function (str, x, y, z) {
            //    dummy = function (str, x, y, z) {
            var zflag = false;

            if (!Boolean(z)) {
                z = 1.0;
            } else {
                if (z != 1.0) zflag = true;
            }

            for (var i = 0, loopend = str.length; i < loopend; i++) {
                var n = str.charCodeAt(i);

                let d = charCodeToLoc(n);

                let wx = x;
                let wy = y;
                if (zflag) {
                    //wx += (-d.w / 2) * z;
                    //wy += (-d.h / 2) * z;
                }

                buffer_.drawImgXYWHXYWH(
                    d.img,
                    d.x, d.y, d.w - 1, d.h - 1,
                    wx, wy,
                    Math.floor(d.w * z), Math.floor(d.h * z)
                );
                x = x + (d.w * z);
            }
        };
        // kanji map data UTF-16 -> kuten map (94x94)
        /**
         * 
         * @returns {Uint16Array<ArrayBuffer>} table
         * @description
         * 漢字のUTF-16コードと、フォント画像内の位置（区点コード）を <br>\
         * マッピングするテーブルを生成します。<br>\
         * Base64エンコードされたデータからマッピング情報を復元し、<br>\
         * 漢字の描画を可能にします。
         */
        function utfmap() {

            const map = [];

            const KanjiBase64Table = setTable();

            for (let i in KanjiBase64Table) {
                map.push(Base64toUint16(KanjiBase64Table[i]));
            }
            return map;

            function Base64toUint16(b64str) {

                const encodeBinaryString = binaryString => Uint8Array.from(
                    binaryString,
                    binaryChar => binaryChar.charCodeAt(0)
                );

                const binaryStringB = atob(b64str);
                const uint8ArrayB = encodeBinaryString(binaryStringB);
                //console.log(uint8ArrayB.toString());
                const arrayBuffer = new Uint16Array(uint8ArrayB.buffer);

                return arrayBuffer;
            }

            function setTable() {
                return [
                    ["ADABMAIwDP8O//swGv8b/x//Af+bMJwwtABA/6gAPv/j/z///TD+MJ0wnjADMN1OBTAGMAcw/DAVIBAgD/9cABwwFiBc/yYgJSAYIBkgHCAdIAj/Cf8UMBUwO/89/1v/Xf8IMAkwCjALMAwwDTAOMA8wEDARMAv/EiKxANcA9wAd/2AiHP8e/2YiZyIeIjQiQiZAJrAAMiAzIAMh5f8E/6IAowAF/wP/Bv8K/yD/pwAGJgUmyyXPJc4lxyU="],
                    ["xiWhJaAlsyWyJb0lvCU7IBIwkiGQIZEhkyETMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIIgsihiKHIoIigyIAAAAAAAAAAAAAAAAAAAAAAAAAACciKCKsANIh1CEAIgMiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASIwIiByIAAAAAaiJrIgAAPSIdIgAAAAAsIgAAAAAAAAAAAAAAAAAAKyEwIG8mbSZqJiAgISC2AAAAAAAAAAAA7yU="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEP8R/xL/E/8U/xX/Fv8X/xj/Gf8AAAAAAAAAAAAAAAAAACH/Iv8j/yT/Jf8m/yf/KP8p/yr/K/8s/y3/Lv8v/zD/Mf8y/zP/NP81/zb/N/84/zn/Ov8AAAAAAAAAAAAAAABB/0L/Q/9E/0X/Rv9H/0j/Sf9K/0v/TP9N/07/T/9Q/1H/Uv9T/1T/Vf9W/1f/WP9Z/1r/AAAAAAAAAAA="],
                    ["QTBCMEMwRDBFMEYwRzBIMEkwSjBLMEwwTTBOME8wUDBRMFIwUzBUMFUwVjBXMFgwWTBaMFswXDBdMF4wXzBgMGEwYjBjMGQwZTBmMGcwaDBpMGowazBsMG0wbjBvMHAwcTByMHMwdDB1MHYwdzB4MHkwejB7MHwwfTB+MH8wgDCBMIIwgzCEMIUwhjCHMIgwiTCKMIswjDCNMI4wjzCQMJEwkjCTMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["oTCiMKMwpDClMKYwpzCoMKkwqjCrMKwwrTCuMK8wsDCxMLIwszC0MLUwtjC3MLgwuTC6MLswvDC9ML4wvzDAMMEwwjDDMMQwxTDGMMcwyDDJMMowyzDMMM0wzjDPMNAw0TDSMNMw1DDVMNYw1zDYMNkw2jDbMNww3TDeMN8w4DDhMOIw4zDkMOUw5jDnMOgw6TDqMOsw7DDtMO4w7zDwMPEw8jDzMPQw9TD2MAAAAAAAAAAAAAAAAAAAAAA="],
                    ["kQOSA5MDlAOVA5YDlwOYA5kDmgObA5wDnQOeA58DoAOhA6MDpAOlA6YDpwOoA6kDAAAAAAAAAAAAAAAAAAAAALEDsgOzA7QDtQO2A7cDuAO5A7oDuwO8A70DvgO/A8ADwQPDA8QDxQPGA8cDyAPJAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["EAQRBBIEEwQUBBUEAQQWBBcEGAQZBBoEGwQcBB0EHgQfBCAEIQQiBCMEJAQlBCYEJwQoBCkEKgQrBCwELQQuBC8EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAQxBDIEMwQ0BDUEUQQ2BDcEOAQ5BDoEOwQ8BD0EPgQ/BEAEQQRCBEMERARFBEYERwRIBEkESgRLBEwETQROBE8EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["ACUCJQwlECUYJRQlHCUsJSQlNCU8JQElAyUPJRMlGyUXJSMlMyUrJTslSyUgJS8lKCU3JT8lHSUwJSUlOCVCJQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["YCRhJGIkYyRkJGUkZiRnJGgkaSRqJGskbCRtJG4kbyRwJHEkciRzJGAhYSFiIWMhZCFlIWYhZyFoIWkhAABJMxQzIjNNMxgzJzMDMzYzUTNXMw0zJjMjMyszSjM7M5wznTOeM44zjzPEM6EzAAAAAAAAAAAAAAAAAAAAAHszHTAfMBYhzTMhIaQypTKmMqcyqDIxMjIyOTJ+M30zfDNSImEiKyIuIhEiGiKlIiAiHyK/IjUiKSIqIgAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["nE4WVQNaP5bAVBthKGP2WSKQdYQcg1B6qmDhYyVu7WVmhKaC9ZuTaCdXoWVxYptb0Fl7hvSYYn2+fY6bFmKffLeIiVu1Xgljl2ZIaMeVjZdPZ+VOCk9NT51PSVDyVjdZ1FkBWglc32APYXBhE2YFabpwT3Vwdft5rX3vfcOADoRjiAKLVZB6kDtTlU6lTt9XsoDBkO94AE7xWKJuOJAyeiiDi4IvnEFRcFO9VOFU4Fb7WRVf8pjrbeSALYU="],
                    ["YpZwlqCW+5cLVPNTh1vPcL1/wo/olm9TXJ26ehFOk3j8gSZuGFYEVR1rGoU7nOVZqVNmbdx0j5VCVpFOS5Dylk+DDJnhU7ZVMFtxXyBm82YEaDhs82wpbVt0yHZOejSY8YJbiGCK7ZKybat1ynbFmaZgAYuKjbKVjmmtU4ZRElcwWERZtFv2XihgqWP0Y79sFG+OcBRxWXHVcT9zAX52gtGCl4VgkFuSG51pWLxlWmwldflRLlllWYBf3F8="],
                    ["vGL6ZSpqJ2u0a4tzwX9WiSydDp3EnqFclmx7gwRRS1y2YcaBdmhhcllO+k94U2lgKW5PevOXC04WU+5OVU89T6FPc0+gUu9TCVYPWcFatlvhW9F5h2acZ7ZnTGuzbGtwwnONeb55PHqHe7GC24IEg3eD74PTg2aHsoopVqiM5o9OkB6XiobET+hcEWJZcjt15YG9gv6GwIzFlhOZ1ZnLThpP44neVkpYylj7XutfKmCUYGJg0GESYtBiOWU="],
                    ["QZtmZrBod21wcEx1hnZ1faWC+YeLlY6WnYzxUb5SFlmzVLNbFl1oYYJpr22NeMuEV4hyiqeTuJpsbaiZ2YajV/9nzoYOkoNSh1YEVNNe4WK5ZDxoOGi7a3JzunhrepqJ0olrjQOP7ZCjlZSWaZdmW7NcfWlNmE6Ym2Mgeytqf2q2aA2cX29yUp1VcGDsYjttB27RbluEEIlEjxROOZz2UxtpOmqElypoXFHDerKE3JGMk1tWKJ0iaAWDMYQ="],
                    ["pXwIUsWC5nR+ToNPoFHSWwpS2FLnUvtdmlUqWOZZjFuYW9tbcl55XqNgH2FjYb5h22NiZdFnU2j6aD5rU2tXbCJvl29Fb7B0GHXjdgt3/3qheyF86X02f/B/nYBmgp6Ds4nMiquMhJBRlJOVkZWilWWW05comRiCOE4rVLhczF2pc0x2PHepXOt/C43BlhGYVJhYmAFPDk9xU5xVaFb6V0dZCVvEW5BcDF5+Xsxf7mM6Z9dl4mUfZ8toxGg="],
                    ["X2owXsVrF2x9bH91SHljWwB6AH29X4+JGIq0jHeNzI4dj+KYDpo8m4BOfVAAUZNZnFsvYoBi7GQ6a6BykXVHeal/+4e8inCLrGPKg6CXCVQDVKtVVGhYanCKJ3h1Z82edFOiWxqBUIYGkBhORU7HThFPylM4VK5bE18lYFFlPWdCbHJs42x4cAN0dnquegh7Gn3+fGZ952VbcrtTRVzoXdJi4GIZYyBuWoYxit2N+JIBb6Z5WpuoTqtOrE4="],
                    ["m0+gT9FQR1H2enFR9lFUUyFTf1PrU6xVg1jhXDdfSl8vYFBgbWAfY1llS2rBbMJy7XLvd/iABYEIgk6F95Dhk/+XV5lamvBO3VEtXIFmbWlAXPJmdWmJc1BogXzFUORSR1f+XSaTpGUjaz1rNHSBeb15S3vKfbmCzIN/iF+JOYvRj9GRH1SAkl1ONlDlUzpT13KWc+l35oKvjsaZyJnSmXdRGmFehrBVenp2UNNbR5CFljJO22rnkVFcSFw="],
                    ["mGOfepNsdJdhj6p6inGIloJ8F2hwflFobJPyUhtUq4UTiqR/zY7hkGZTiIhBecJPvlARUkRRU1UtV+pzi1dRWWJfhF91YHZhZ2GpYbJjOmRsZW9mQmgTbmZ1PXr7fEx9mX1Lfmt/DoNKg82GCIpjimaL/Y4amI+duILOj+ibh1IfYoNkwG+ZlkFokVAga3psVG90elB9QIgjighn9k45UCZQZVB8UThSY1KnVQ9XBVjMWvpesmH4YfNicmM="],
                    ["HGkpan1yrHIucxR4b3h5fQx3qYCLiRmL4ozSjmOQdZN6llWYE5p4nkNRn1OzU3teJl8bbpBuhHP+c0N9N4IAivqKUJZOTgtQ5FN8VPpW0VlkW/Fdq14nXzhiRWWvZ1Zu0HLKfLSIoYDhgPCDToaHiuiNN5LHlmeYE5+UTpJODU9IU0lUPlQvWoxfoV+fYKdojmpadIF4noqkineLkJFeTsmbpE58T69PGVAWUElRbFGfUrlS/lKaU+NTEVQ="],
                    ["DlSJVVFXold9WVRbXVuPW+Vd5133XXheg16aXrdeGF9SYExhl2LYYqdjO2UCZkNm9GZtZyFol2jLaV9sKm1pbS9unW4ydYd2bHg/euB8BX0YfV59sX0VgAOAr4CxgFSBj4EqglKDTIhhiBuLooz8jMqQdZFxkj94/JKklU2WBZiZmdiaO51bUqtS91MIVNVY92Lgb2qMX4+5nktRO1JKVP1WQHp3kWCd0p5EcwlvcIERdf1f2mComttyvI8="],
                    ["ZGsDmMpO8FZkV75YWlpoYMdhD2YGZjlosWj3bdV1On1ugkKbm05QT8lTBlVvXeZd7l37Z5lsc3QCeFCKlpPfiFBXp14rY7VQrFCNUQBnyVReWLtZsFtpX01ioWM9aHNrCG59cMeRgHIVeCZ4bXmOZTB93IPBiAmPm5ZkUihXUGdqf6GMtFFCVyqWOliKabSAslQOXfxXlXj6nVxPSlKLVD5kKGYUZ/VnhHpWeyJ9L5NcaK2bOXsZU4pRN1I="],
                    ["31v2Yq5k5mQtZ7prqYXRlpB21ptMYwaTq5u/dlJmCU6YUMJTcVzoYJJkY2VfaOZxynMjdZd7gn6VhoOL24x4kRCZrGWrZotr1U7UTjpPf086UvhT8lPjVdtW61jLWclZ/1lQW01cAl4rXtdfHWAHYy9lXFuvZb1l6GWdZ2Jre2sPbEVzSXnBefh8GX0rfaKAAoHzgZaJXoppimaKjIruiseM3IzMlvyYb2uLTjxPjU9QUVdb+ltIYQFjQmY="],
                    ["IWvLbrtsPnK9dNR1wXg6eQyAM4DqgZSEno9QbH+eD19Yiyud+nr4jo1b65YDTvFT91cxWclapFuJYH9uBm++deqMn1sAheB7clD0Z52CYVxKhR5+DoKZUQRcaGNmjZxlbnE+eRd9BYAdi8qObpDHhqqQH1D6UjpcU2d8cDVyTJHIkSuT5YLCWzFf+WA7TtZTiFtLYjFnimvpcuBzLnprgaONUpGWmRJR11NqVP9biGM5aqx9AJfaVs5TaFQ="],
                    ["l1sxXN5d7k8BYf5iMm3Aect5Qn1NftJ/7YEfgpCERohyiZCLdI4vjzGQS5FskcaWnJHATk9PRVFBU5NfDmLUZ0FsC25jcyZ+zZGDktRTGVm/W9FtXXkufpt8flifcfpRU4jwj8pP+1wlZqx343ocgv+ZxlGqX+xlb2mJa/Ntlm5kb/52FH3hXXWQh5EGmOZRHVJAYpFm2WYabrZe0n1yf/hmr4X3hfiKqVLZU3NZj16QX1Vg5JJklrdQH1E="],
                    ["3VIgU0dT7FPoVEZVMVUXVmhZvlk8WrVbBlwPXBFcGlyEXope4F5wX39ihGLbYoxjd2MHZgxmLWZ2Zn5nomgfajVqvGyIbQluWG48cSZxZ3HHdQF3XXgBeWV58HngehF7p3w5fZaA1oOLhEmFXYjziB+KPIpUinOKYYzejKSRZpJ+kxiUnJaYlwpOCE4eTldOl1FwUs5XNFjMWCJbOF7FYP5kYWdWZ0RttnJzdWN6uIRyi7iRIJMxVvRX/pg="],
                    ["7WINaZZr7XFUfneAcoLmid+YVYexjztcOE/hT7VPB1UgWt1b6VvDX05hL2OwZUtm7mibaXht8W0zdbl1H3deeeZ5M33jga+CqoWqiTqKq46bjzKQ3ZEHl7pOwU4DUnVY7FgLXBp1PVxOgQqKxY9jlm2XJXvPigiYYpHzVqhTF5A5VIJXJV6oYzRsinBhd4t84H9wiEKQVJEQkxiTj5ZedMSaB11pXXBlomeojduWbmNJZxlpxYMXmMCW/og="],
                    ["hG96ZPhbFk4scF11L2bEUTZS4lLTWYFfJ2AQYj9ldGUfZnRm8mgWaGNrBW5ych9123a+fFaA8Fj9iH+JoIqTisuKHZCSkVKXWZeJZQ56BoG7li1e3GAaYqVlFGaQZ/N3TXpNfD5+CoGsjGSN4Y1fjql4B1LZYqVjQmSYYi2Kg3rAe6yK6pZ2fQyCSYfZTkhRQ1NgU6NbAlwWXN1dJmJHYrBkE2g0aMlsRW0XbdNnXG9OcX1xy2V/eq172n0="],
                    ["Sn6of3qBG4I5gqaFborOjPWNeJB3kK2SkZKDla6bTVKEVThvNnFoUYV5VX6zgc58TFZRWKhcqmP+Zv1mWmnZco91jnUOeVZ533mXfCB9RH0HhjSKO5ZhkCCf51B1UsxT4lMJUKpV7lhPWT1yi1tkXB1T42DzYFxjg2M/Y7tjzWTpZflm413Naf1pFW/lcYlO6XX4dpN633zPfZx9YYBJg1iDbIS8hPuFxYhwjQGQbZCXkxyXEprPUJdYjmE="],
                    ["04E1hQiNIJDDT3RQR1JzU29gSWNfZyxus40fkNdPXlzKjM9lmn1SU5aIdlHDY1hba1sKXA1kUWdckNZOGlkqWXBsUYo+VRVYpVnwYFNiwWc1glVpQJbEmSiaU08GWP5bEICxXC9ehV8gYEthNGL/ZvBs3m7OgH+B1IKLiLiMAJAukIqW257bm+NO8FMnWSx7jZFMmPmd3W4ncFNTRFWFW1hinmLTYqJs728idBeKOJTBb/6KOIPnUfiG6lM="],
                    ["6VNGT1SQsI9qWTGB/V3qer+P2mg3jPhySJw9arCKOU5YUwZWZlfFYqJj5mVOa+FtW26tcO1373qqe7t9PYDGgMuGlYpbk+NWx1g+X61llmaAarVrN3XHiiRQ5XcwVxtfZWB6ZmBs9HUaem5/9IEYh0WQs5nJe1x1+XpRe8SEEJDpeZJ6NoPhWkB3LU7yTplb4F+9Yjxm8WfobGuGd4g7ik6R85LQmRdqJnAqc+eCV4SvjAFORlHLUYtV9Vs="],
                    ["Fl4zXoFeFF81X2tftF/yYRFjomYdZ25vUnI6dTp3dIA5gXiBdoe/ityKhY3zjZqSd5UCmOWcxVJXY/R2FWeIbM1zw4yuk3OWJW2cWA5pzGn9j5qT23UakFpYAmi0Y/tpQ08sb9hnu48mhbR9VJM/aXBvalf3WCxbLH0qcgpU45G0na1OTk9cUHVQQ1KejEhUJFiaWx1elV6tXvdeH1+MYLViOmPQY69oQGyHeI55C3rgfUeCAormikSOE5A="],
                    ["uJAtkdiRDp/lbFhk4mR1ZfRuhHYbe2mQ0ZO6bvJUuV+kZE2P7Y9EknhRa1gpWVVcl177bY9+HHW8jOKOW5i5cB1Pv2uxbzB1+5ZOURBUNVhXWKxZYFySX5dlXGchbnt234PtjBSQ/ZBNkyV4OniqUqZeH1d0WRJgElBaUaxRzVEAUhBVVFhYWFdZlVv2XItdvGCVYi1kcWdDaLxo32jXdthtb26bbW9wyHFTX9h1d3lJe1R7UnvWfHF9MFI="],
                    ["Y4RpheSFDooEi0aMD44DkA+QGZR2li2YMJrYlc1Q1VIMVAJYDlynYZ5kHm2zd+V69IAEhFOQhZLgXAedP1OXX7NfnG15cmN3v3nke9Jr7HKtigNoYWr4UYF6NGlKXPac64LFW0mRHnB4Vm9cx2BmZYxsWoxBkBOYUVTHZg2SSFmjkIVRTU7qUZmFDotYcHpjS5NiabSZBH53dVdTYGnfjuOWXWyMTjxcEF/pjwJT0YyJgHmG/17lZXNOZVE="],
                    ["glk/XO6X+06KWc1fjYrhb7B5YnnnW3GEK3OxcXRe9V97Y5pkw3GYfENO/F5LTtxXolapYMNvDX39gDOBv4Gyj5eJpIb0XYpirWSHiXdn4mw+bTZ0NHhGWnV/rYKsmfNPw17dYpJjV2VvZ8N2THLMgLqAKY9NkQ1Q+VeSWoVoc2lkcf1yt4zyWOCMapYZkH+H5HnndymEL09lUlpTzWLPZ8psfXaUe5V8NoKEheuP3WYgbwZyG36rg8GZpp4="],
                    ["/VGxe3J4uHuHgEh76GphXoyAUXVgdWtRYpKMbnp2l5HqmhBPcH+cYk97pZXpnHpWWVjkhryWNE8kUkpTzVPbUwZeLGSRZX9nPmxObEhyr3Ltc1R1QX4sgumFqYzEe8aRaXESmO+YPWNpZmp15HbQeEOF7oYqU1FTJlSDWYdefF+yYElieWKrYpBl1GvMbLJ1rnaReNh5y313f6WAq4i5iruMf5Bel9uYC2o4fJlQPlyuX4dn2Gs1dAl3jn8="],
                    ["O5/KZxd6OVOLde2aZl+dgfGDmIA8X8VfYnVGezyQZ2jrWZtaEH1+diyL9U9qXxlqN2wCb+J0aHloiFWKeYzfXs9jxXXSedeCKJPykpyE7YYtnMFUbF+MZVxtFXCnjNOMO5hPZfZ0DU7YTuBXK1lmWsxbqFEDXpxeFmB2Yndlp2VuZm5tNnIme1CBmoGZglyLoIzmjHSNHJZElq5Pq2Rmax6CYYRqheiQAVxTaaiYeoRXhQ9Pb1KpX0VeDWc="],
                    ["j3l5gQeJhon1bRdfVWK4bM9OaXKSmwZSO1R0VrNYpGFuYhpxblmJfN58G33wlodlXoAZTnVPdVFAWGNec14KX8RnJk49hYmVW5ZzfAGY+1DBWFZ2p3glUqV3EYWGe09QCVlHcsd76H26j9SPTZC/T8lSKVoBX62X3U8XguqSA1dVY2lrK3XciBSPQnrfUpNYVWEKYq5mzWs/fOmDI1D4TwVTRlQxWElZnVvwXO9cKV2WXrFiZ2M+ZbllC2c="],
                    ["1WzhbPlwMngrft6As4IMhOyEAocSiSqKSoymkNKS/ZjznGydT06hTo1QVlJKV6hZPV7YX9lfP2K0Zhtn0GfSaJJRIX2qgKiBAIuMjL+MfpIyliBULJgXU9VQXFOoWLJkNGdncmZ3RnrmkcNSoWyGawBYTF5UWSxn+3/hUcZ2aWToeFSbu57LV7lZJ2aaZ85r6VTZaVVenIGVZ6qb/mdSnF1opk7jT8hTuWIrZ6tsxI+tT21+v54HTmJhgG4="],
                    ["K28ThXNUKmdFm/NdlXusXMZbHIdKbtGEFHoIgZlZjXwRbCB32VIiWSFxX3LbdyeXYZ0LaX9aGFqlUQ1UfVQOZt9294+YkvSc6lldcsVuTVHJaL997H1il7qeeGQhagKDhFlfW9trG3PydrJ9F4CZhDJRKGfZnu52Ymf/UgWZJFw7Yn58sIxPVbZgC32AlQFTX062URxZOnI2gM6RJV/id4RTeV8EfayFM4qNjlaX82euhVOUCWEIYblsUnY="],
                    ["7Yo4jy9VUU8qUcdSy1OlW31eoGCCYdZjCWfaZ2dujG02czdzMXVQedWImIpKkJGQ9ZDElo2HFVmITllPDk6Jij+PEJitUHxellm5W7he2mP6Y8Fk3GZKadhpC222bpRxKHWveop/AIBJhMmEgYkhiwqOZZB9lgqZfmGRYjJrg2x0bcx//H/AbYV/uof4iGVnsYM8mPeWG21hfT2EapFxTnVTUF0Ea+tvzYUthqeJKVIPVGVcTmeoaAZ0g3Q="],
                    ["4nXPiOGIzJHilniWi1+Hc8t6ToSgY2V1iVJBbZxuCXRZdWt4knyGltx6jZ+2T25hxWVchoZOrk7aUCFOzFHuW5llgWi8bR9zQnatdxx653xvgtKKfJDPkXWWGJibUtF9K1CYU5dny23QcTN06IEqj6OWV5yfnmB0QViZbS99XpjkTjZPi0+3UbFSul0cYLJzPHnTgjSSt5b2lgqXl55in6ZmdGsXUqNSyHDCiMleS2CQYSNvSXE+fPR9b4A="],
                    ["7oQjkCyTQlRvm9NqiXDCjO+NMpe0UkFayl4EXxdnfGmUaWptD29icvxy7XsBgH6AS4fOkG1Rk56EeYuAMpPWii1QjFRximprxIwHgdFgoGfynZlOmE4QnGuKwYVohQBpfm6XeFWBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["DF8QThVOKk4xTjZOPE4/TkJOVk5YToJOhU5rjIpOEoINX45Onk6fTqBOok6wTrNOtk7OTs1OxE7GTsJO107eTu1O3073TglPWk8wT1tPXU9XT0dPdk+IT49PmE97T2lPcE+RT29Phk+WTxhR1E/fT85P2E/bT9FP2k/QT+RP5U8aUChQFFAqUCVQBVAcT/ZPIVApUCxQ/k/vTxFQBlBDUEdQA2dVUFBQSFBaUFZQbFB4UIBQmlCFULRQslA="],
                    ["yVDKULNQwlDWUN5Q5VDtUONQ7lD5UPVQCVEBUQJRFlEVURRRGlEhUTpRN1E8UTtRP1FAUVJRTFFUUWJR+HppUWpRblGAUYJR2FaMUYlRj1GRUZNRlVGWUaRRplGiUalRqlGrUbNRsVGyUbBRtVG9UcVRyVHbUeBRVYbpUe1R8FH1Uf5RBFILUhRSDlInUipSLlIzUjlST1JEUktSTFJeUlRSalJ0UmlSc1J/Un1SjVKUUpJScVKIUpFSqI8="],
                    ["p4+sUq1SvFK1UsFSzVLXUt5S41LmUu2Y4FLzUvVS+FL5UgZTCFM4dQ1TEFMPUxVTGlMjUy9TMVMzUzhTQFNGU0VTF05JU01T1lFeU2lTblMYWXtTd1OCU5ZToFOmU6VTrlOwU7ZTw1MSfNmW31P8Zu5x7lPoU+1T+lMBVD1UQFQsVC1UPFQuVDZUKVQdVE5Uj1R1VI5UX1RxVHdUcFSSVHtUgFR2VIRUkFSGVMdUolS4VKVUrFTEVMhUqFQ="],
                    ["q1TCVKRUvlS8VNhU5VTmVA9VFFX9VO5U7VT6VOJUOVVAVWNVTFUuVVxVRVVWVVdVOFUzVV1VmVWAVa9UilWfVXtVflWYVZ5VrlV8VYNVqVWHVahV2lXFVd9VxFXcVeRV1FUUVvdVFlb+Vf1VG1b5VU5WUFbfcTRWNlYyVjhWa1ZkVi9WbFZqVoZWgFaKVqBWlFaPVqVWrla2VrRWwla8VsFWw1bAVshWzlbRVtNW11buVvlWAFf/VgRXCVc="],
                    ["CFcLVw1XE1cYVxZXx1UcVyZXN1c4V05XO1dAV09XaVfAV4hXYVd/V4lXk1egV7NXpFeqV7BXw1fGV9RX0lfTVwpY1lfjVwtYGVgdWHJYIVhiWEtYcFjAa1JYPVh5WIVYuVifWKtYuljeWLtYuFiuWMVY01jRWNdY2VjYWOVY3FjkWN9Y71j6WPlY+1j8WP1YAlkKWRBZG1mmaCVZLFktWTJZOFk+WdJ6VVlQWU5ZWllYWWJZYFlnWWxZaVk="],
                    ["eFmBWZ1ZXk+rT6NZslnGWehZ3FmNWdlZ2lklWh9aEVocWglaGlpAWmxaSVo1WjZaYlpqWppavFq+Wstawlq9WuNa11rmWula1lr6WvtaDFsLWxZbMlvQWipbNls+W0NbRVtAW1FbVVtaW1tbZVtpW3Bbc1t1W3hbiGV6W4Bbg1umW7hbw1vHW8lb1FvQW+Rb5lviW95b5VvrW/Bb9lvzWwVcB1wIXA1cE1wgXCJcKFw4XDlcQVxGXE5cU1w="],
                    ["UFxPXHFbbFxuXGJOdlx5XIxckVyUXJtZq1y7XLZcvFy3XMVcvlzHXNlc6Vz9XPpc7VyMXepcC10VXRddXF0fXRtdEV0UXSJdGl0ZXRhdTF1SXU5dS11sXXNddl2HXYRdgl2iXZ1drF2uXb1dkF23XbxdyV3NXdNd0l3WXdtd613yXfVdC14aXhleEV4bXjZeN15EXkNeQF5OXldeVF5fXmJeZF5HXnVedl56Xryef16gXsFewl7IXtBez14="],
                    ["1l7jXt1e2l7bXuJe4V7oXule7F7xXvNe8F70Xvhe/l4DXwlfXV9cXwtfEV8WXylfLV84X0FfSF9MX05fL19RX1ZfV19ZX2FfbV9zX3dfg1+CX39fil+IX5Ffh1+eX5lfmF+gX6hfrV+8X9Zf+1/kX/hf8V/dX7Ng/18hYGBgGWAQYClgDmAxYBtgFWArYCZgD2A6YFpgQWBqYHdgX2BKYEZgTWBjYENgZGBCYGxga2BZYIFgjWDnYINgmmA="],
                    ["hGCbYJZgl2CSYKdgi2DhYLhg4GDTYLRg8F+9YMZgtWDYYE1hFWEGYfZg92AAYfRg+mADYSFh+2DxYA1hDmFHYT5hKGEnYUphP2E8YSxhNGE9YUJhRGFzYXdhWGFZYVpha2F0YW9hZWFxYV9hXWFTYXVhmWGWYYdhrGGUYZphimGRYathrmHMYcphyWH3Ychhw2HGYbphy2F5f81h5mHjYfZh+mH0Yf9h/WH8Yf5hAGIIYgliDWIMYhRiG2I="],
                    ["HmIhYipiLmIwYjJiM2JBYk5iXmJjYltiYGJoYnxigmKJYn5ikmKTYpZi1GKDYpRi12LRYrtiz2L/YsZi1GTIYtxizGLKYsJix2KbYsliDGPuYvFiJ2MCYwhj72L1YlBjPmNNYxxkT2OWY45jgGOrY3Zjo2OPY4ljn2O1Y2tjaWO+Y+ljwGPGY+NjyWPSY/ZjxGMWZDRkBmQTZCZkNmQdZRdkKGQPZGdkb2R2ZE5kKmWVZJNkpWSpZIhkvGQ="],
                    ["2mTSZMVkx2S7ZNhkwmTxZOdkCYLgZOFkrGLjZO9kLGX2ZPRk8mT6ZABl/WQYZRxlBWUkZSNlK2U0ZTVlN2U2ZThlS3VIZVZlVWVNZVhlXmVdZXJleGWCZYNlioubZZ9lq2W3ZcNlxmXBZcRlzGXSZdtl2WXgZeFl8WVyZwpmA2b7ZXNnNWY2ZjRmHGZPZkRmSWZBZl5mXWZkZmdmaGZfZmJmcGaDZohmjmaJZoRmmGadZsFmuWbJZr5mvGY="],
                    ["xGa4ZtZm2mbgZj9m5mbpZvBm9Wb3Zg9nFmceZyZnJ2c4ly5nP2c2Z0FnOGc3Z0ZnXmdgZ1lnY2dkZ4lncGepZ3xnameMZ4tnpmehZ4Vnt2fvZ7Rn7GezZ+lnuGfkZ95n3WfiZ+5nuWfOZ8Zn52ecah5oRmgpaEBoTWgyaE5os2graFloY2h3aH9on2iPaK1olGidaJtog2iuarlodGi1aKBoumgPaY1ofmgBacpoCGnYaCJpJmnhaAxpzWg="],
                    ["1GjnaNVoNmkSaQRp12jjaCVp+WjgaO9oKGkqaRppI2khacZoeWl3aVxpeGlraVRpfmluaTlpdGk9aVlpMGlhaV5pXWmBaWppsmmuadBpv2nBadNpvmnOaehbymndabtpw2mnaS5qkWmgaZxplWm0ad5p6GkCahtq/2kKa/lp8mnnaQVqsWkeau1pFGrraQpqEmrBaiNqE2pEagxqcmo2anhqR2piallqZmpIajhqImqQao1qoGqEaqJqo2o="],
                    ["l2oXhrtqw2rCarhqs2qsat5q0Wrfaqpq2mrqavtqBWsWhvpqEmsWazGbH2s4azdr3HY5a+6YR2tDa0lrUGtZa1RrW2tfa2FreGt5a39rgGuEa4NrjWuYa5Vrnmuka6prq2uva7JrsWuza7drvGvGa8tr02vfa+xr62vza+9rvp4IbBNsFGwbbCRsI2xebFVsYmxqbIJsjWyabIFsm2x+bGhsc2ySbJBsxGzxbNNsvWzXbMVs3WyubLFsvmw="],
                    ["umzbbO9s2WzqbB9tTYg2bSttPW04bRltNW0zbRJtDG1jbZNtZG1abXltWW2ObZVt5G+FbfltFW4KbrVtx23mbbhtxm3sbd5tzG3obdJtxW36bdlt5G3Vbept7m0tbm5uLm4ZbnJuX24+biNua24rbnZuTW4fbkNuOm5ObiRu/24dbjhugm6qbphuyW63btNuvW6vbsRusm7UbtVuj26lbsJun25BbxFvTHDsbvhu/m4/b/JuMW/vbjJvzG4="],
                    ["Pm8Tb/duhm96b3hvgW+Ab29vW2/zb21vgm98b1hvjm+Rb8JvZm+zb6NvoW+kb7lvxm+qb99v1W/sb9Rv2G/xb+5v228JcAtw+m8RcAFwD3D+bxtwGnB0bx1wGHAfcDBwPnAycFFwY3CZcJJwr3DxcKxwuHCzcK5w33DLcN1w2XAJcf1wHHEZcWVxVXGIcWZxYnFMcVZxbHGPcftxhHGVcahxrHHXcblxvnHScclx1HHOceBx7HHncfVx/HE="],
                    ["+XH/cQ1yEHIbcihyLXIscjByMnI7cjxyP3JAckZyS3JYcnRyfnKCcoFyh3KScpZyonKncrlysnLDcsZyxHLOctJy4nLgcuFy+XL3cg9QF3MKcxxzFnMdczRzL3MpcyVzPnNOc09z2J5Xc2pzaHNwc3hzdXN7c3pzyHOzc85zu3PAc+Vz7nPec6J0BXRvdCV0+HMydDp0VXQ/dF90WXRBdFx0aXRwdGN0anR2dH50i3SedKd0ynTPdNR08XM="],
                    ["4HTjdOd06XTudPJ08HTxdPh093QEdQN1BXUMdQ51DXUVdRN1HnUmdSx1PHVEdU11SnVJdVt1RnVadWl1ZHVndWt1bXV4dXZ1hnWHdXR1inWJdYJ1lHWadZ11pXWjdcJ1s3XDdbV1vXW4dbx1sXXNdcp10nXZdeN13nX+df91/HUBdvB1+nXydfN1C3YNdgl2H3YndiB2IXYidiR2NHYwdjt2R3ZIdkZ2XHZYdmF2YnZodml2anZndmx2cHY="],
                    ["cnZ2dnh2fHaAdoN2iHaLdo52lnaTdpl2mnawdrR2uHa5drp2wnbNdtZ20nbeduF25Xbndup2L4b7dgh3B3cEdyl3JHcedyV3Jncbdzd3OHdHd1p3aHdrd1t3ZXd/d353eXeOd4t3kXegd553sHe2d7l3v3e8d713u3fHd81313fad9x343fud/x3DHgSeCZ5IHgqeUV4jnh0eIZ4fHiaeIx4o3i1eKp4r3jReMZ4y3jUeL54vHjFeMp47Hg="],
                    ["53jaeP149HgHeRJ5EXkZeSx5K3lAeWB5V3lfeVp5VXlTeXp5f3mKeZ15p3lLn6p5rnmzebl5unnJedV553nseeF543kIeg16GHoZeiB6H3qAeTF6O3o+ejd6Q3pXekl6YXpieml6nZ9wenl6fXqIepd6lXqYepZ6qXrIerB6tnrFesR6v3qDkMd6ynrNes961XrTetl62nrdeuF64nrmeu168HoCew97CnsGezN7GHsZex57NXsoezZ7UHs="],
                    ["ensEe017C3tMe0V7dXtle3R7Z3twe3F7bHtue517mHufe417nHuae4t7knuPe117mXvLe8F7zHvPe7R7xnvde+l7EXwUfOZ75XtgfAB8B3wTfPN793sXfA189nsjfCd8KnwffDd8K3w9fEx8Q3xUfE98QHxQfFh8X3xkfFZ8ZXxsfHV8g3yQfKR8rXyifKt8oXyofLN8snyxfK58uXy9fMB8xXzCfNh80nzcfOJ8O5vvfPJ89Hz2fPp8Bn0="],
                    ["An0cfRV9Cn1FfUt9Ln0yfT99NX1GfXN9Vn1OfXJ9aH1ufU99Y32TfYl9W32PfX19m326fa59o321fcd9vX2rfT1+on2vfdx9uH2ffbB92H3dfeR93n37ffJ94X0Ffgp+I34hfhJ+MX4ffgl+C34ifkZ+Zn47fjV+OX5Dfjd+Mn46fmd+XX5Wfl5+WX5afnl+an5pfnx+e36DftV9fX6uj39+iH6Jfox+kn6QfpN+lH6Wfo5+m36cfjh/On8="],
                    ["RX9Mf01/Tn9Qf1F/VX9Uf1h/X39gf2h/aX9nf3h/gn+Gf4N/iH+Hf4x/lH+ef51/mn+jf69/sn+5f65/tn+4f3GLxX/Gf8p/1X/Uf+F/5n/pf/N/+X/cmAaABIALgBKAGIAZgByAIYAogD+AO4BKgEaAUoBYgFqAX4BigGiAc4BygHCAdoB5gH2Af4CEgIaAhYCbgJOAmoCtgJBRrIDbgOWA2YDdgMSA2oDWgAmB74DxgBuBKYEjgS+BS4E="],
                    ["i5ZGgT6BU4FRgfyAcYFugWWBZoF0gYOBiIGKgYCBgoGggZWBpIGjgV+Bk4GpgbCBtYG+gbiBvYHAgcKBuoHJgc2B0YHZgdiByIHagd+B4IHngfqB+4H+gQGCAoIFggeCCoINghCCFoIpgiuCOIIzgkCCWYJYgl2CWoJfgmSCYoJogmqCa4IugnGCd4J4gn6CjYKSgquCn4K7gqyC4YLjgt+C0oL0gvOC+oKTgwOD+4L5gt6CBoPcggmD2YI="],
                    ["NYM0gxaDMoMxg0CDOYNQg0WDL4MrgxeDGIOFg5qDqoOfg6KDloMjg46Dh4OKg3yDtYNzg3WDoIOJg6iD9IMThOuDzoP9gwOE2IMLhMGD94MHhOCD8oMNhCKEIIS9gziEBoX7g22EKoQ8hFqFhIR3hGuErYRuhIKEaYRGhCyEb4R5hDWEyoRihLmEv4SfhNmEzYS7hNqE0ITBhMaE1oShhCGF/4T0hBeFGIUshR+FFYUUhfyEQIVjhViFSIU="],
                    ["QYUChkuFVYWAhaSFiIWRhYqFqIVthZSFm4XqhYeFnIV3hX6FkIXJhbqFz4W5hdCF1YXdheWF3IX5hQqGE4YLhv6F+oUGhiKGGoYwhj+GTYZVTlSGX4ZnhnGGk4ajhqmGqoaLhoyGtoavhsSGxoawhsmGI4irhtSG3obphuyG34bbhu+GEocGhwiHAIcDh/uGEYcJhw2H+YYKhzSHP4c3hzuHJYcphxqHYIdfh3iHTIdOh3SHV4doh26HWYc="],
                    ["U4djh2qHBYiih5+Hgoevh8uHvYfAh9CH1parh8SHs4fHh8aHu4fvh/KH4IcPiA2I/of2h/eHDojShxGIFogViCKIIYgxiDaIOYgniDuIRIhCiFKIWYheiGKIa4iBiH6Inoh1iH2ItYhyiIKIl4iSiK6ImYiiiI2IpIiwiL+IsYjDiMSI1IjYiNmI3Yj5iAKJ/Ij0iOiI8ogEiQyJCokTiUOJHokliSqJK4lBiUSJO4k2iTiJTIkdiWCJXok="],
                    ["ZolkiW2JaolviXSJd4l+iYOJiImKiZOJmImhiamJpomsia+Jsom6ib2Jv4nAidqJ3IndieeJ9In4iQOKFooQigyKG4odiiWKNopBiluKUopGikiKfIptimyKYoqFioKKhIqoiqGKkYqliqaKmoqjisSKzYrCitqK64rziueK5IrxihSL4IriiveK3orbigyLB4sai+GKFosQixeLIIszi6uXJosriz6LKItBi0yLT4tOi0mLVotbi1qLa4s="],
                    ["X4tsi2+LdIt9i4CLjIuOi5KLk4uWi5mLmos6jEGMP4xIjEyMToxQjFWMYoxsjHiMeoyCjImMhYyKjI2MjoyUjHyMmIwdYq2Mqoy9jLKMs4yujLaMyIzBjOSM44zajP2M+oz7jASNBY0KjQeND40NjRCNTp8Tjc2MFI0WjWeNbY1xjXONgY2ZjcKNvo26jc+N2o3WjcyN243LjeqN643fjeON/I0IjgmO/40djh6OEI4fjkKONY4wjjSOSo4="],
                    ["R45JjkyOUI5IjlmOZI5gjiqOY45VjnaOco58joGOh46FjoSOi46KjpOOkY6UjpmOqo6hjqyOsI7GjrGOvo7FjsiOy47bjuOO/I77juuO/o4KjwWPFY8SjxmPE48cjx+PG48MjyaPM487jzmPRY9Cjz6PTI9Jj0aPTo9Xj1yPYo9jj2SPnI+fj6OPrY+vj7eP2o/lj+KP6o/vj4eQ9I8FkPmP+o8RkBWQIZANkB6QFpALkCeQNpA1kDmQ+I8="],
                    ["T5BQkFGQUpAOkEmQPpBWkFiQXpBokG+QdpColnKQgpB9kIGQgJCKkImQj5CokK+QsZC1kOKQ5JBIYtuQApESkRmRMpEwkUqRVpFYkWORZZFpkXORcpGLkYmRgpGikauRr5GqkbWRtJG6kcCRwZHJkcuR0JHWkd+R4ZHbkfyR9ZH2kR6S/5EUkiySFZIRkl6SV5JFkkmSZJJIkpWSP5JLklCSnJKWkpOSm5Jaks+SuZK3kumSD5P6kkSTLpM="],
                    ["GZMikxqTI5M6kzWTO5Nck2CTfJNuk1aTsJOsk62TlJO5k9aT15Pok+WT2JPDk92T0JPIk+STGpQUlBOUA5QHlBCUNpQrlDWUIZQ6lEGUUpRElFuUYJRilF6UapQpknCUdZR3lH2UWpR8lH6UgZR/lIKVh5WKlZSVlpWYlZmVoJWolaeVrZW8lbuVuZW+lcqV9m/Dlc2VzJXVldSV1pXcleGV5ZXilSGWKJYuli+WQpZMlk+WS5Z3llyWXpY="],
                    ["XZZflmaWcpZslo2WmJaVlpeWqpanlrGWspawlrSWtpa4lrmWzpbLlsmWzZZNidyWDZfVlvmWBJcGlwiXE5cOlxGXD5cWlxmXJJcqlzCXOZc9lz6XRJdGl0iXQpdJl1yXYJdkl2aXaJfSUmuXcZd5l4WXfJeBl3qXhpeLl4+XkJecl6iXppejl7OXtJfDl8aXyJfLl9yX7ZdPn/KX33r2l/WXD5gMmDiYJJghmDeYPZhGmE+YS5hrmG+YcJg="],
                    ["cZh0mHOYqpivmLGYtpjEmMOYxpjpmOuYA5kJmRKZFJkYmSGZHZkemSSZIJksmS6ZPZk+mUKZSZlFmVCZS5lRmVKZTJlVmZeZmJmlma2Zrpm8md+Z25ndmdiZ0Zntme6Z8ZnymfuZ+JkBmg+aBZrimRmaK5o3mkWaQppAmkOaPppVmk2aW5pXml+aYpplmmSaaZprmmqarZqwmryawJrPmtGa05rUmt6a35rimuOa5prvmuua7pr0mvGa95o="],
                    ["+5oGmxibGpsfmyKbI5slmyebKJspmyqbLpsvmzKbRJtDm0+bTZtOm1GbWJt0m5Obg5uRm5abl5ufm6CbqJu0m8Cbypu5m8abz5vRm9Kb45vim+Sb1Jvhmzqc8pvxm/CbFZwUnAmcE5wMnAacCJwSnAqcBJwunBucJZwknCGcMJxHnDKcRpw+nFqcYJxnnHaceJznnOyc8JwJnQid65wDnQadKp0mna+dI50fnUSdFZ0SnUGdP50+nUadSJ0="],
                    ["XZ1enWSdUZ1QnVmdcp2JnYedq51vnXqdmp2knamdsp3EncGdu524nbqdxp3PncKd2Z3Tnfid5p3tne+d/Z0anhueHp51nnmefZ6Bnoiei56MnpKelZ6Rnp2epZ6pnrieqp6tnmGXzJ7Ons+e0J7Untye3p7dnuCe5Z7onu+e9J72nvee+Z77nvye/Z4Hnwift3YVnyGfLJ8+n0qfUp9Un2OfX59gn2GfZp9nn2yfap93n3Kfdp+Vn5yfoJ8="],
                    ["L1jHaVmQZHTcUZlxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="],
                    ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="]
                ];
            }
        }
    }
}
// GameAssetManager
//
/**
 * @typedef {number | string} ImageAssetId UniqIdentifer
 * @example
 * "picture_sprite" or "asciifont" or "mycharactor" etc
 * @description
 * 同じIDグループ内で重複しない任意の数値や文字列を設定する<br>\
 * @todo
 * 手間を省くために自動で生成するuniqIDManagerとか作ってもよいかもしれない
 */

/**
 * @typedef {number | string} AudioAssetId UniqIdentifer
 * @example
 * "ring_sound" or "explose_effect" or "click1" etc
 * @description
 * 同じIDグループ内で重複しない任意の数値や文字列を設定する<br>\
 */

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
 * ゲームで使用する画像や音声などのアセットを管理するクラスです。<br>\
 * アセットのロード、ロード状態の確認、そしてIDによるアクセスを<br>\
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
         * @param {ImageAssetId} id UniqId(割り当てたい任意の数字/文字列)
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
         * @class GameAssetManager.imageAsset
         * @param {URI} uri ディレクトリパス
         * @description 
         * 画像アセットの情報を保持するコンテナクラスです。<br>\
         * 画像のURI、ロード状態（ready）、および実際のImageオブジェクトを管理し、<br>\
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
                 * 画像アセットのロードが完了したかどうかをチェックします。<br>\
                 * `Image.complete`プロパティを利用してロード成否を判断し、<br>\
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
         * @param {AudioAssetId} id UniqId(割り当てたい任意の数字/文字列)
         * @param {URI} uri ディレクトリパス/拡張子無しで指定
         * @returns {Audio} Audioオブジェクト
         * @description
         * 指定されたURIから音声アセットをロードします。<br>\
         * ブラウザが再生可能な形式（MP3またはOGG）を自動判別し<br>\
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
         * @class GameAssetManager.audioAsset
         * @param {URI} uri ディレクトリパス
         * @description 
         * 音声アセットの情報を保持するコンテナクラスです。<br>\
         * 音声のURI、ロード状態（ready）、再生位置（pos）<br>\
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
                 * 音声アセットの再生準備状態をチェックします。<br>\
                 * `HTMLMediaElement.readyState`プロパティを利用して、<br>\
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
         * 現在ロードされている全てのアセットのロード状態一覧をテキストで返します。<br>\
         * 画像と音声それぞれについて、URIとロードの成否、<br>\
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
         * ロードされている全てのアセットの一意のIDリストをテキストで返します。<br>\
         * 画像と音声アセットのIDが結合された文字列として提供され<br>\
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
}/**
 * システム初期パラメータ（表示対象のキャンバスと解像度の指定）
 * @typedef {object} GameCoreSysParam システム初期設定用パラメータ
 * @property {string} canvasId canvasDOM Id
 * @property {number} screen[].resolution.w screen width pixelsize
 * @property {number} screen[].resolution.h screen height pixelsize
 * @property {number} screen[].resolution.x screen offset x
 * @property {number} screen[].resolution.y screen offset y
 * @example
const GameCoreSysParam = {
	CanvasId:"canvas",
	screen: [
		{resolution: {w:1024, h:768, x:0, y:0}},
		{resolution: {w:1024, h:768, x:0, y:0}}
	]
}
 * @description
 * -複数のScreenを設定可能、
 * -対象指定時、順番にgame.screen[0], game.screen[1] ...　となる
 * -定数値にして名前を付けた方が管理が判りやすくなります
 * 
 */
/**
 * ゲームエンジン本体
 * @summary ゲームエンジン本体/インスタンス化して実行
 * 実行時のエントリーポイント
 * @param {GameCoreSysParam} sysParam システム初期設定パラメータ
 * @example 
 * //宣言：
 * const game = new GameCore( sysParam );
 * //game.screen[0]のパラメータが実際の使用Canvasの解像度となる。 
 * //offsetパラメータはscreen[0]を基準位置としての表示位置offset。(screen[1以降]で有効)　
 * //ScreenはoffscreenBufferとして処理され、指定した解像度で作成される。 
 * 
 * //ゲームループの開始：
 * game.run();
 * //requestAnimationFrameの周期毎にタスクを実行する。
 * 
 * @description
 * ゲームエンジンの主要なインスタンスであり、実行時のエントリーポイントです。.<br>\
 * ゲームタスク、アセット管理、描画レイヤー、入力デバイス、<br>\
 * サウンドシステムなど、全てのコア機能を統合し制御します。
 */ 
class GameCore {
	/**
	 * @param {GameCoreSysParam} sysParam システム初期設定パラメータ
	 * @description
	 * GameCoreインスタンスを初期化し、ゲームの基盤となるコンポーネントを設定します。<br>\
	 * 入力デバイス、サウンド、描画システム、アセットマネージャーなどを生成し、<br>\
	 * メインループが動作するための準備を整えます。
	 */
	constructor(sysParam) {

		/**
		 * FPSや負荷の計測用(内部関数)
		 * @class GameCore.bench
		 * @classdesc
		 * ゲームのFPS（フレームレート）とワークロード（処理負荷）を計測するユーティリティです。<br>\
		 * フレームごとの時間間隔と処理時間を記録し<br>\
		 * 平均、最大、最小値として結果を提供します。
		 */
		class bench {
			/**
			 * 
			 */
			constructor() {

				let oldtime; let newtime; // = Date.now();
				let cnt = 0;

				let fps_log = []; let load_log = [];
				let log_cnt = 0;
				let log_max = 0;

				let workload; let interval;

				let fps = 0;

				let dt = 0;
				let ot = 0;

				let blinkCounter = 0;
				const BLINK_ITVL = 1500;
				const BLINK_TIME = 500;

				//let ypos = 412;
				/**
				 * 負荷計測区間開始指示
				 * @method
				 * @description
				 * 処理負荷計測区間の開始を指示します。<br>\
				 * このメソッドが呼ばれた時点のパフォーマンスタイムスタンプを記録し、<br>\
				 * 次の`end`メソッドまでの時間を測定します。
				 */
				this.start = function () {

					oldtime = newtime;
					newtime = performance.now(); //Date.now();
				};

				/**
				 * 負荷計測区間終了指示
				 * @method
				 * @description
				 * 処理負荷計測区間の終了を指示し、計測データを記録します。<br>\
				 * `start`からの処理時間（ワークロード）とフレーム間隔を計算し、<br>\
				 * パフォーマンスログに追加します。
				 */
				this.end = function () {

					workload = performance.now() - newtime; //Date.now() - newtime;
					interval = newtime - oldtime;

					if (log_cnt > log_max) log_max = log_cnt;
					fps_log[log_cnt] = interval;
					load_log[log_cnt] = workload;

					log_cnt++;
					if (log_cnt > 59) log_cnt = 0;

					let w = 0;
					for (let i = 0; i <= log_max; i++) {
						w += fps_log[i];
					}

					cnt++;

					//fps = parseInt(1000 / (w / (log_max + 1)));
					fps = 1000 / (w / (log_max + 1));
				};

				/**
				 * @typedef {object} resultLog 計測結果
				 * @property {number} FPS FPS
				 * @property {number[]} interval.log フレーム時間ログ
				 * @property {number} interval.max　最大値
				 * @property {number} interval.min　最小値
				 * @property {number} interval.ave　平均値
				 * @property {number[]} workload.log 負荷ログ
				 * @property {number} workload.max　最大値
				 * @property {number} workload.min　最小値
				 * @property {number} workload.ave　平均値
				 */
				/**
				 * @method
				 * @return {resultLog}　計測結果(.interval　.workload)
				 * @description
				 * FPSとワークロードの計測結果をオブジェクトで返します。<br>\
				 * 各ログの平均、最大、最小値を含む詳細なパフォーマンスデータを提供し、<br>\
				 * ゲームの最適化に役立ちます。
				 */
				this.result = function () {

					let int_max = 0;
					let int_min = 999;
					let int_ave = 0;

					let load_max = 0;
					let load_min = 999;
					let load_ave = 0;

					let wlod = 0;
					let wint = 0;
					for (let i = 0; i <= log_max; i++) {
						//fstr += fps_log[i] + " ";
						//lstr += load_log[i] + " ";
						if (int_max < fps_log[i]) int_max = fps_log[i];
						if (int_min > fps_log[i]) int_min = fps_log[i];

						if (load_max < load_log[i]) load_max = load_log[i];
						if (load_min > load_log[i]) load_min = load_log[i];

						wlod += load_log[i];
						wint += fps_log[i];
					}

					//int_ave = parseInt(wint / (log_max + 1));
					//load_ave = parseInt(wlod / (log_max + 1));
					int_ave = wint / (log_max + 1);
					load_ave = wlod / (log_max + 1);

					let r = {};

					r.fps = fps;

					let wl = {};
					wl.log = load_log;
					wl.max = load_max;
					wl.min = load_min;
					wl.ave = load_ave;

					let iv = {};
					iv.log = fps_log;
					iv.max = int_max;
					iv.min = int_min;
					iv.ave = int_ave;

					r.interval = iv;
					r.workload = wl;

					return r;
				};

				/**
				 * blink用の基準時間を呼び出し元からもらう
				 * @method
				 * @param {number} t now time(ms)
				 * @description
				 * 点滅（blink）機能の基準となる現在のシステム時刻を受け取ります。<br>\
				 * この時刻情報を使って、点滅カウンターを更新し<br>\
				 * 点滅状態の判定に利用します。
				 */
				this.setTime = function (t) {
					ot = dt;
					dt = t;

					blinkCounter = blinkCounter + (dt - ot);
					if (blinkCounter > BLINK_ITVL) blinkCounter = 0.0;
				};

				/**
				 * @method
				 * @return {number} 1フレームの時間を返す(ms)
				 * @description
				 * 直前のフレームに要した時間（デルタタイム）をミリ秒単位で返します。<br>\
				 * この値は、フレームレートが変動する環境での<br>\
				 * ゲームロジックの調整に利用できます。
				 */
				this.readTime = function () {
					return dt - ot; //deltaTimeを返す(ms) 実績　Chrome PC:float/iOS,iPadOS:Integer
				};

				/**
				 * @method
				 * @return {number} エンジンが起動してからの経過時間を返す(ms)
				 * @description
				 * ゲームエンジンが起動してからの経過時間（ライフタイム）をミリ秒単位で返します。<br>\
				 * これは、ゲーム全体を通じた時間の管理や <br>\
				 * 特定のイベントのタイミング制御に利用できます。
				 */
				this.nowTime = function () {
					return dt; //lifeTimeを返す(ms)
				};

				/**
				 * @method
				 * @return {boolean} 一定間隔(1.5s/0.5s)でtrue/falseを返す
				 * @description
				 * 一定の間隔（1.5秒`true`、0.5秒`false`）で`true`/`false`を繰り返すブール値を返します。<br>\
				 * UI要素の点滅表示や、周期的なイベントのトリガーなど <br>\
				 * 視覚的な合図や時間制御に利用できます。
				 */
				this.blink = function () {
					//return blinkCounter + ":" + BLINK_ITVL + ":" + dt;//(parseInt(blinkCounter) < BLINK_TIME)?true:false;
					return (blinkCounter < BLINK_TIME) ? true : false;
				};
			}
		}

		let runStatus_ = false;

		const task_ = new GameTaskControl(this);

		//device setup
		const keyboard_ = new inputKeyboard();
		const mouse_ = new inputMouse(sysParam.canvasId);
		const joystick_ = new inputGamepad();
		const touchpad_ = new inputTouchPad(sysParam.canvasId);
		const vGpad_ = new inputVirtualPad(mouse_, touchpad_);

		const beep_ = new Beepcore();

		const screen_ = [];

		const w = sysParam.screen[0].resolution.w;
		const h = sysParam.screen[0].resolution.h;

		const canvas = document.getElementById(sysParam.canvasId);
		canvas.width = w; canvas.height = h;

		this.systemCanvas = canvas;

		const ctx = canvas.getContext("2d");

		for (let i in sysParam.screen) {
			let wsysp = sysParam.screen[i];
			screen_[i] = new DisplayControl(ctx,
				wsysp.resolution.w, wsysp.resolution.h,
				wsysp.resolution.x, wsysp.resolution.y,
				sysParam.offscreen
			);
		}
		const viewport_ = new viewport();
		viewport_.size(w, h); viewport_.border(w / 2, h / 2);
		viewport_.setPos(0, 0); viewport_.repeat(false);

		//
		const sprite_ = new GameSpriteControl(this);

		//
		const font_ = [];

		this.setSpFont = function (fontParam) {

			let fprm = {
				Image: asset_.image[fontParam.id].img,
				pattern: fontParam.pattern
			};
			let wf = new GameSpriteFontControl(this, fprm);

			font_[fontParam.name] = wf;
		};

		//assetsetup
		const asset_ = new GameAssetManager();

		// soundはassetを参照するので↑の後で宣言する。
		const sound_ = new soundControl(asset_);

		// mainloop
		let sysp_cnt = sysParam.screen.length;

		const tc = new bench();
		let sintcnt = []; //screenIntervalCounter
		for (let i = 0; i < sysp_cnt; i++) sintcnt[i] = 0;

		/**
		 * game main roop (requestAnimationFrame callback function)
		 * @param {number} t calltime/performance.now()
		 * @description
		 * ゲームのメインループとして機能する`requestAnimationFrame`のコールバック関数です。<br>\
		 * 毎フレーム、タスクの更新、ビープ音の再生、描画バッファのクリア、<br>\
		 * スプライトの描画、最終的な画面反映といった一連の処理を実行します。
		 */
		function loop(t) {
			if (runStatus_) {

				tc.setTime(t);
				tc.start();

				task_.step();
				beep_.step(t); //beep play再生用

				for (let i = 0; i < sysp_cnt; i++) {
					if (screen_[i].getInterval() - sintcnt[i] == 1) {
						screen_[i].reflash();
						screen_[i].clear();
						//これで表示Bufferがクリアされ、先頭に全画面消去が登録される。
					}
				}

				task_.draw();
				sprite_.allDrawSprite(); //スプライトをBufferに反映する。

				for (let i = 0; i < sysp_cnt; i++) {
					screen_[i].draw();
					//これで全画面がCanvasに反映される。
				}

				tc.end();

				for (let i = 0; i < sysp_cnt; i++) {
					sintcnt[i]++;
					if (sintcnt[i] >= screen_[i].getInterval()) sintcnt[i] = 0;
				}
				//run
				requestAnimationFrame(loop); //"use strict"対応

			} else {
				//pause
			}
		}

		//public propaty and method
		/**
		 * @type {GameTaskControl}
		 */
		this.task = task_;
		/**
 		 * @type {GameAssetManager}
		 */
		this.asset = asset_;

		/**
		 * @type {inputKeyboard}
		 */
		this.keyboard = keyboard_;
		/**
		 * @type {inputMouse}
		 */
		this.mouse = mouse_;
		/**
		 * @type {inputGamepad}
		 */
		this.gamepad = joystick_;
		/**
		 * @type {inputGamepad}
		 */
		this.joystick = joystick_;
		/**
		 * @type {inputTouchPad}
		 */
		this.touchpad = touchpad_;
		/**
		 * @type {inputVirtualPad}
		 */
		this.vgamepad = vGpad_;

		/**
		 * @type {DisplayControl[]}
		 */
		this.dsp = screen_[0];
		/**
		 * @type {DisplayControl[]}
		 */
		this.screen = screen_;
		/**
		 * @type {viewport}
		 */
		this.viewport = viewport_;

		/**
		 * @type {soundControl}
		 */
		this.sound = sound_;
		/**
		 * @type {Beepcore}
		 */
		this.beep = beep_;
		//
		/**
		 * @type {GameSpriteControl}
		 */
		this.sprite = sprite_;
		/**
		 * @type {GameSpriteFontControl}
		 */
		this.font = font_;

		this.state = {};

		/**
		 * FPS/workload count Utility
		 * @type {bench}
		 */
		this.fpsload = tc;

		/**
		 * @method
		 * @return {number} 1フレームの時間を返す(ms)
		 * @description
		 * 直前のフレームに要した時間（デルタタイム）をミリ秒単位で返します。<br>\
		 * この値は、フレームレートが変動する環境での<br>\
		 * ゲームロジックの調整に利用できます。
		 */
		this.deltaTime = tc.readTime; //

		/**
		 * @method
		 * @return {number} エンジンが起動してからの経過時間を返す(ms)
		 * @description
		 * ゲームエンジンが起動してからの経過時間（ライフタイム）をミリ秒単位で返します。<br>\
		 * これは、ゲーム全体を通じた時間の管理や <br>\
		 * 特定のイベントのタイミング制御に利用できます。
		*/
		this.time = tc.nowTime; //

		/**
		 * @method
		 *　@return {boolean} 一定間隔(1.5s/0.5s)でtrue/falseを返す
		 * @description
		 * 一定の間隔（1.5秒`true`、0.5秒`false`）で`true`/`false`を繰り返すブール値を返します。<br>\
		 * UI要素の点滅表示や、周期的なイベントのトリガーなど <br>\
		 * 視覚的な合図や時間制御に利用できます。
		 */
		this.blink = tc.blink; //function return bool

		// init
		sprite_.useScreen(0);

		/**
		 * ゲームループの開始
		 * requestAnimationFrameの周期毎にタスクを実行する。
		 * @method
		 * @description
		 * ゲームループの実行を開始します。<br>\
		 * `requestAnimationFrame`を介して`loop`関数が周期的に呼び出され<br>\
		 * ゲームの全ての処理が動き始めます。
		 */
		this.run = function () {
			runStatus_ = true;

			requestAnimationFrame(loop);
		};

		/**
		 * ゲームループの停止
		 * @method
		 * @description
		 * ゲームループの実行を一時停止します。<br>\
		 * これにより`requestAnimationFrame`の呼び出しが止まり、<br>\
		 * ゲームの更新や描画が中断されます。
		 */
		this.pause = function () {
			runStatus_ = false;
		};
	}
}

/**
 * GameTaskTemplate
 * @class
 * @example
 * class GameTask_Foo extends GameTask {
 * 	constractor(){ super(id) }
 * }
 * @classdesc
 * ゲームのロジックや描画処理をカプセル化するための基底タスククラスです。<br>\
 * `GameTaskControl`によって管理され、`init`、`pre`、`step`、`draw`、`post`などの <br>\
 * ライフサイクルメソッドを提供します。
*/
class GameTask{

	/**
	 * Task　Unique Identifier
	 * @type {TaskId}
	 */ 
	id;
	/**
	 * task step status/
	 * true: step execute 
	 * @type {boolean}
	 */
	enable;
	/**
	 * task draw status/
	 * true: draw execute　 
	 * @type {boolean}
	 */
	visible;
	/**
	 * task running status  
	 * @type {boolean}
	*/
	running;
	/**
	 * task using status
	 * @type {boolean}
	 */
	living;
	/**
	 * task running proirity
	 * @type {number}
	 * @todo function Not implemented
	*/
	proirity;
	/**
	 * new 1st execute check flag
	 * @type {boolean}
	 */
	preFlag;

	/**
	 * @param {TaskId} id  Unique Identifier
	 * @description
	 * GameTaskインスタンスを初期化します。<br>\
	 * タスクの一意な識別子（ID）を設定し、実行（enable）、描画（visible） <br>\
	 * 実行中（running）、生存（living）などの初期状態を定義します。
	 */ 
	constructor(id){
		this.id = id
		this.enable = true; // true : run step  false: pasue step
		this.visible = true; // true: run draw  false: pasue draw

		this.preFlag = false;

		this.running = true;
		this.living = true;
	}

	/**
	 * task step and draw stop execute 
	 * @method
	 * @description
	 * タスクのステップ処理と描画処理の両方を停止します。<br>\
	 * タスクの状態を`enable: false`、`visible: false`、`running: false`に設定し <br>\
	 * 一時的にタスクの活動を中断させます。
	 */
	pause(){
		this.enable = false; // true : run step  false: pasue step
		this.visible = false; // true: run draw  false: pasue draw

		this.running = false;
	}

	/**
	 * task step and draw resume execute  
	 * @method
	 * @description
	 * 一時停止中のタスクのステップ処理と描画処理を再開します。<br>\
	 * タスクの状態を`enable: true`、`visible: true`、`running: true`に設定し、<br>\
	 * タスクの活動を復帰させます。
	 */
	resume(){
		this.enable = true; // true : run step  false: pasue step
		this.visible = true; // true: run draw  false: pasue draw

		this.running = true;
	}
	/**
	 * @method
	 * @param {number} num sortorder 
	 * @todo priority control function Not implemented(2025/08/15) 
	 * @description
	 * タスクの実行優先順位を設定します。<br>\
	 * ただし、この機能は現在未実装であり、<br>\
	 * 将来の拡張のために予約されています。
	 */
	setPriority(num){ this.proirity = num;}

	/**
	 * user implementation
	 * @method
	 * @description
	 * ユーザーがタスク固有のパラメータや状態をリセットするためのプレースホルダーメソッドです。<br>\
	 * このメソッドは継承クラスでオーバーライドすることで、<br>\
	 * タスクの初期状態への復帰処理を実装できます。
	 */
	reset(){}

	/**
	 * task dispose
	 * @method
	 * @description
	 * タスクを「生存していない」（living: false）状態に設定し、破棄のマークを付けます。<br>\
	 * これにより、`GameTaskControl`がタスクリストからこのタスクを<br>\
	 * 安全に削除できるようになります。
	 */
	kill(){ this.living = false;}

	/**
	 * TaskControllerからtask.add時に実行される。
	 * @method
	 * @param {GameCore} g GameCoreインスタンス
	 * @description
	 * タスクが`GameTaskControl`に追加された際に一度だけ実行されます<br>\
	 * 主に、タスク内で使用するアセットのロードや、<br>\
	 * 初期設定（コンストラクタで設定できないもの）を行うのに適しています。
	 */ 
	init(g){
		//asset(contents) load
		//呼び出しタイミングによってはconstuctorで設定してもよい。
	}

	/**
	 * TaskControllerから初回の呼び出し時に実行される。
	 * @method
	 * @param {GameCore} g　GameCoreインスタンス
	 * @description
	 * タスクが`GameTaskControl`によって最初に実行される直前に一度だけ呼び出されます。<br>\
	 * パラメータのリセットや、タスクが本格的に動き出す前の<br>\
	 * 最終的な準備を行うのに適しています。
	 */ 
	pre(g){
    	//paramater reset etc
	    //this.preFlag = true;　フラグの変更はTaskControlで実行されるので継承側でも実行する必要なし。
	}

	/**
	 * TaskControlでループ毎に実行される。(enable :true)
	 * @method
	 * @param {GameCore} g　GameCoreインスタンス
	 * @description
	 * `GameTaskControl`によってゲームループ毎に呼び出される、タスクの主要な更新ロジックです。<br>\
	 * `this.enable`が`true`の場合に実行され、<br>\
	 * ゲームの進行に関わる計算や状態更新を行います。
	 */ 
	step(g){// this.enable が true時にループ毎に実行される。

	}

	/**
	 * TaskControlでループ毎に実行される。(visible :true)
	 * @method
	 * @param {GameCore} g　GameCoreインスタンス
	 * @description
	 * `GameTaskControl`によってゲームループ毎に呼び出される、タスクの描画ロジックです。<br>\
	 * `this.visible`が`true`の場合に実行され、 <br>\
	 * 画面へのグラフィック要素の描画を行います。
	 */ 
	draw(g){// this.visible が true時にループ毎に実行される。

	}

	/**
	 * destructor(TaskControllerからtask終了時に呼ばれる)
	 * @method
	 * @param {GameCore} g　GameCoreインスタンス
	 * @description
	 * タスクが`GameTaskControl`から削除される際に一度だけ呼び出されるデストラクタです。<br>\
	 * リソースの解放や、タスク終了時に必要なクリーンアップ処理を <br>\
	 * 実装するのに適しています。
	 */
	post(g){// task.delで終了時に実行される。

	}
}
// GameTaskControl
// parent : GameCore
/**
 * @typedef {number | string} TaskId UniqIdentifer
 * @example
 * "main" or "root" or "system" etc
 * @description
 * 同じIDグループ内で重複しない任意の数値や文字列を設定する<br>\
 */

/**
 * @summry GameTaskController　タスク管理
 * 登録されるゲームタスクの状態管理を行う
 * @param {GameCore} game ゲーム本体のインスタンス
 * @example
 *	game.task.add( new gametask( id ));
 *	game.task.del(  id );
 *	game.task.read( id );
 *
 *	//id：管理用に任意の重複しない文字列や数字を指定する。
 *
 *	//*タスクの雛形*
 *
 *	class gametask( id ) extends Gametask {
 *		constructor(id){
 *			super(id);
 *			//new　で実行される。
 *		}
 *		init( g ){}// task.add時に実行される。
 *		pre( g ){} // 最初の実行時に実行。
 *		step( g ){}// this.enable が true時にループ毎に実行される。　
 *		draw( g ){}// this.visible が true時にループ毎に実行される。
 *	}
 *	this.enable = true; // true : run step  false: pause step
 *	this.visible = true; // true: run draw  false: pause draw
 *
 *	//gにはGameCoreオブジェクトが入るので経由でデバイスやアセットにアクセスする。
 * @description
 * ゲーム内の個々のタスク（`GameTask`インスタンス）を管理するコントローラです。<br>\
 * タスクの追加、削除、読み込み、そしてゲームループにおける <br>\
 * `step`（更新）と`draw`（描画）の実行を制御します。
 * @todo priorityControl 実行は登録順で行われる。priorityプロパティによる実行順序制御は未実装
 * @todo 時間指定実行、一時実行タスクや割り込み制御なども標準機能である方がよいかもしれない
 */
class GameTaskControl {
	/**
	 * @param {GameCore} game GameCoreインスタンス 
	 * @description
	 * GameTaskControlのインスタンスを初期化します。<br>\
	 * 内部でタスクリストを管理するための配列と、<br>\
	 * タスク数やタスク名リストを追跡する変数を設定します。
	 */
	constructor(game) {

		let task_ = [];

		let taskCount_ = 0;
		let taskNamelist_ = "";

		const taskCheck =()=> {
			taskCount_ = 0;
			taskNamelist_ = "";

			for (let n in task_) {
				taskNamelist_ += n + " ";
				taskCount_++;
			}
		}

		/**
		 * 指定したIDのGameTask objectを返す
		 * @method
		 * @param {number | string} id  Unique Identifier
		 * @returns {GameTaskClass} GameTask instance object
		 * @description
		 * 指定されたIDを持つ`GameTask`オブジェクトをタスクリストから取得して返します。<br>\
		 * これにより、特定のタスクに直接アクセスし、<br>\
		 * その状態やプロパティを参照・操作できます。
		 * @todo 結果可否報告とエラーチェック
		 */
		this.read = function (taskid) {

			return task_[taskid];
		};

		/**
		 * GameTaskを実行リストに追加
		 * @method
		 * @param {GameTaskClass} GameTask instance object
		 * @return {void}
		 * @description
		 * 新しい`GameTask`インスタンスを実行リストに追加します。<br>\
		 * タスクの`init`メソッドを呼び出して初期化を行い<br>\
		 * タスク数とタスク名リストを更新します。
		 */
		this.add = function (task) {
			//task init process
			task_[task.id] = task;

			task.init(game);

			taskCheck();
		};

		/**
		 * 指定したIDのGameTask objectを実行リストから削除
		 * @method
		 * @param {number | string} id  Unique Identifier
		 * @returns {void}
		 * @description
		 * 指定されたIDを持つ`GameTask`オブジェクトを実行リストから削除します。<br>\
		 * 削除前にタスクの`post`メソッドを呼び出して終了処理を行い、<br>\
		 * その後、リストからタスクを破棄します。
		 * @todo 結果可否報告とエラーチェック(無いtaskを削除した場合)
		 */
		this.del = function (taskid) {
			//task post process
			task_[taskid].post(); //deconstract

			//task delete
			delete task_[taskid];

			taskCheck();
		};

		/**
		 * 指定したIDのGameTaskObject.init()を実行
		 * @method
		 * @param {number | string} id  Unique Identifier
		 * @returns {void}
		 * @description
		 * 指定されたIDの`GameTask`オブジェクトの`init`メソッドを明示的に実行します。<br>\
		 * これは、タスクの追加時だけでなく、<br>\
		 * 必要なタイミングでタスクの初期化を再度行いたい場合に利用できます。
		 * @todo 結果可否報告とエラーチェック
		 */
		this.init = function (taskid) {

			task_[taskid].init(game);
		};

		/**
		 * 実行リストにあるGameTaskのstepを呼ぶ(処理Op)
		 * （初回実行の場合はpre+step）
		 * @method
		 * @return {void}
		 * @description
		 * 実行リストに登録されている全ての`GameTask`の`step`メソッドを呼び出します。<br>\
		 * 各タスクが`enable`状態であれば、ゲームの更新ロジックが実行され、<br>\
		 * 初回実行時には`pre`メソッドも呼び出されます。
		 */
		this.step = function () {

			for (let i in task_) {
				let w_ = task_[i];

				if (!w_.preFlag) {
					w_.pre(game);
					w_.preFlag = true;
				}

				if (w_.enable) {
					w_.step(game);
				}
			}
		};

		/**
		 * 実行リストにあるGameTaskのdrawを呼ぶ(描画Op)
		 * @method
		 * @return {void}
		 * @description
		 * 実行リストに登録されている全ての`GameTask`の`draw`メソッドを呼び出します。 <br>\
		 * 各タスクが`visible`状態であれば、画面への描画ロジックが実行され、<br>\
		 * ゲームのグラフィックが更新されます。
		 */
		this.draw = function () {
			// reset and Clear Operation.
			//

			for (let i in task_) {
				let w_ = task_[i];

				if (w_.visible) {
					w_.draw(game);
				}
			}
			// draw Operation.
		};

		/**
		 * 実行リストにあるGameTaskの数を返す
		 * @method
		 * @return {number} タスク数
		 * @description
		 * 現在実行リストに登録されている`GameTask`の総数を返します。<br>\
		 * これにより、アクティブなタスクの数を把握できます。<br>\
		 */
		this.count = function () {
			return taskCount_;
		};
		/**
		 * 実行リストにあるGameTaskのId一覧を返す
		 * @method
		 * @return {string} Id一覧の文字列
		 * @description
		 * 現在実行リストに登録されている全ての`GameTask`のIDを <br>\
		 * 文字列リストとして返します。<br>\
		 * これにより、どのタスクが現在管理されているかを一覧で確認できます。
		 */
		this.namelist = function () {
			return taskNamelist_;
		};

	}
}
/**
 * inputGamepa
 * @class
 * @classdesc
 * Gamepad APIを利用してゲームパッドの入力を管理します。<br\
 * 方向キー、各種ボタン、アナログスティックの状態を検出し、<br\
 * ゲームで利用可能なプロパティとして提供します。
 */
class inputGamepad {
    constructor() {

        let support = (window.Gamepad); //Support Gamepad API
        let connect = (navigator.getGamepads); //GamePad Ready

        let gamepad_list; // = navigator.getGamepads();

        this.upkey; // = false;
        this.downkey; // = false;
        this.leftkey = false;
        this.rightkey = false;

        this.btn_start = false;
        this.btn_back = false;
        this.btn_lb = false;
        this.btn_rb = false;
        this.btn_lt = false;
        this.btn_rt = false;
        this.btn_l3 = false;
        this.btn_r3 = false;

        this.btn_a = false;
        this.btn_b = false;
        this.btn_x = false;
        this.btn_y = false;

        this.r; //-1:off 0-360:input_r leftstick 

        this.ls_x; //axes[0]
        this.ls_y; //axes[1]
        this.rs_x; //axes[2]
        this.rs_y; //axes[3]

        let readystate = false;

        this.button;
        this.axes;

        /**
         * @method
         * @returns {boolean} ゲームパッド接続状態
         * @description
         * ゲームパッドの接続状態を確認し、その入力状態を更新します。 <br\
         * Gamepad APIがサポートされており、ゲームパッドが認識されている場合に、<br\
         * 最新のボタンやスティックの入力を取得します。
         */
        this.check = function () {
            readystate = false;

            if (!(support && connect)) return false;

            gamepad_list = navigator.getGamepads();

            //connect Check 認識したうちで一番若い番号のコントローラを使用する
            let ct = []; for (let i in gamepad_list) if (Boolean(gamepad_list[i])) ct.push(i);
            let num = Math.min(...ct);
            let gamepad = gamepad_list[num];

            if (!gamepad) return false;
            readystate = true;

            this.update(gamepad);

            return readystate;
        };

        /**
         * @typedef {object} Gamepad Gamepadオブジェクト
         * @see https://developer.mozilla.org/ja/docs/Web/API/Gamepad
         */
        //↓これは基本外部から使用しない↓
        //差し替えでGamepadのハード別対応させることが出来る。
        /**
         * @method
         * @param {Gamepad} gamepad Gamepadオブジェクト
         * @description
         * ゲームパッドからの生データ（ボタンや軸の値）を受け取り、<br\
         * 内部の入力状態プロパティを更新します。<br\
         * 通常は`check`メソッドによって内部的に呼び出され<br\
         * 特定のハードウェアマッピングに対応できます。
         * @todo ハードウェアマッピングの設定切り替え操作
         */
        this.update = function (gamepad) {

            //paramater:
            //Logicool Gamepad F310　(Mode *DirectX/X-Input) ------
            //id: "Logicool Dual Action (STANDARD GAMEPAD Vendor: 046d Product: c216)"
            //mapping: "standard"
            var p = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
            //id: "Xbox 360 Controller (XInput STANDARD GAMEPAD)"
            //mapping: "standard"
            //var p = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
            //
            //SONY CUH-ZCT2J WIRELESS CONTROLLER (PS4Pro) ------
            //id: "Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 09cc)"
            //mapping: "standard"
            //var p = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
            //
            //SONY CFI-ZCT1J WIRELESS CONTROLLER (PS5) ------
            //id: "DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)"
            //mapping: "standard"
            //var p = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
            var button = gamepad.buttons;
            var axes = gamepad.axes;

            this.button = button;
            this.axes = axes;

            this.upkey = (Boolean(button[p[12]])) ? button[p[12]].pressed : false;
            this.downkey = (Boolean(button[p[13]])) ? button[p[13]].pressed : false;
            this.leftkey = (Boolean(button[p[14]])) ? button[p[14]].pressed : false;
            this.rightkey = (Boolean(button[p[15]])) ? button[p[15]].pressed : false;

            this.btn_start = (Boolean(button[p[9]])) ? button[p[9]].pressed : false;
            this.btn_back = (Boolean(button[p[8]])) ? button[p[8]].pressed : false;
            this.btn_lb = (Boolean(button[p[4]])) ? button[p[4]].pressed : false;
            this.btn_rb = (Boolean(button[p[5]])) ? button[p[5]].pressed : false;
            this.btn_lt = (Boolean(button[p[6]])) ? button[p[6]].pressed : false;
            this.btn_rt = (Boolean(button[p[7]])) ? button[p[7]].pressed : false;
            this.btn_l3 = (Boolean(button[p[10]])) ? button[p[10]].pressed : false;
            this.btn_r3 = (Boolean(button[p[11]])) ? button[p[11]].pressed : false;

            this.btn_a = (Boolean(button[p[0]])) ? button[p[0]].pressed : false;
            this.btn_b = (Boolean(button[p[1]])) ? button[p[1]].pressed : false;
            this.btn_x = (Boolean(button[p[2]])) ? button[p[2]].pressed : false;
            this.btn_y = (Boolean(button[p[3]])) ? button[p[3]].pressed : false;

            this.ls_x = (Boolean(axes[0])) ? axes[0] : 0;
            this.ls_y = (Boolean(axes[1])) ? axes[1] : 0;
            this.rs_x = (Boolean(axes[2])) ? axes[2] : 0;
            this.rs_y = (Boolean(axes[3])) ? axes[3] : 0;

            var x = Math.floor(axes[0] * 100); //> 0.05)?axes[j]:0;
            var y = Math.floor(axes[1] * 100); //> 0.05)?axes[j+1]:0;

            this.r = ((Math.abs(x) < 10) && (Math.abs(y) < 10)) ? -1 : target_r(x * 100, y * 100);

            return;
        };

        function target_r(wx, wy) {
            var r = (wx == 0) ?
                ((wy >= 0) ? 180 : 0) :
                ((Math.atan(wy / wx) * (180.0 / Math.PI)) + ((wx >= 0) ? 90 : 270));
            return r;
        }

        /**
         * @method
         * @returns {string[]} 状態情報テキストリスト
         * @description
         * 接続されているゲームパッドの識別の詳細情報と、<br\
         * 現在のボタン、スティックの入力状態をテキストリストで返します。<br\
         * デバッグやゲームパッドの動作確認に役立ちます。
         */
        this.infodraw = function () {
            let str = [];
            str.push("[Gamepad] max:" + gamepad_list.length);

            //Coneect Check
            let ct = [];
            for (let i in gamepad_list) {
                if (Boolean(gamepad_list[i])) {
                    str.push("no:" + i + ", type:" + gamepad_list[i].mapping);
                    str.push("id:" + gamepad_list[i].id);
                    //console.log("no:" + i + ", type:" + gamepad_list[i].mapping);     
                    //console.log("id:" + gamepad_list[i].id);
                    ct.push(i);
                } else {
                    str.push("no." + i + " not Connect");
                }
            }
            str.push("--------------------------------");

            let num = Math.min(...ct);

            if (gamepad_list[num]) {
                // ------------------------------------------------------------
                // Gamepad オブジェクト
                // ------------------------------------------------------------
                // ゲームパッドリストを取得する
                // gamepad_list = navigator.getGamepads();
                // ゲームパッドリスト内のアイテム総数を取得する
                // num = gamepad_list.length;
                // gamepad[num]
                // ------------------------------------------------------------
                // タイムスタンプ情報 // gamepad.timestamp
                // ------------------------------------------------------------
                // ゲームパッドの識別名 // gamepad.id
                // ------------------------------------------------------------
                // ゲームパッドの物理的な接続状態 // gamepad.connected
                // ------------------------------------------------------------
                // マッピングタイプ情報 // gamepad.mapping
                // ------------------------------------------------------------
                // ボタンリスト // gamepad.buttons[] // buttons.length;
                // ------------------------------------------------------------
                // 軸リスト // gamepad.axes[]; //// axes.length;
                let gp = gamepad_list[num];
                str.push("Use No:" + num + ", type:" + gp.mapping);
                str.push("id:" + gp.id);
                str.push("");
                str.push("Up   [" + (this.upkey ? "o" : "-") + "]"
                    + " Down [" + (this.downkey ? "o" : "-") + "]"
                    + " Left [" + (this.leftkey ? "o" : "-") + "]"
                    + " Right[" + (this.rightkey ? "o" : "-") + "]");
                str.push("");
                str.push("(A)  [" + (this.btn_a ? "o" : "-") + "]"
                    + " (B)  [" + (this.btn_b ? "o" : "-") + "]"
                    + " (X)  [" + (this.btn_x ? "o" : "-") + "]"
                    + " (Y)  [" + (this.btn_y ? "o" : "-") + "]");
                str.push("");
                str.push("BACK [" + (this.btn_back ? "o" : "-") + "]"
                    + " START[" + (this.btn_start ? "o" : "-") + "]");
                str.push("LB   [" + (this.btn_lb ? "o" : "-") + "]"
                    + " RB   [" + (this.btn_rb ? "o" : "-") + "]");
                str.push("LT   [" + (this.btn_lt ? "o" : "-") + "]"
                    + " RT   [" + (this.btn_rt ? "o" : "-") + "]");
                str.push("L3   [" + (this.btn_l3 ? "o" : "-") + "]"
                    + " R3   [" + (this.btn_r3 ? "o" : "-") + "]");
                str.push("");
                str.push("r = " + this.r);
                str.push("");
                str.push("Ls_x: " + this.ls_x);
                str.push("Ls_y: " + this.ls_y);
                str.push("Rs_x: " + this.rs_x);
                str.push("Rs_y: " + this.rs_y);
            } else {
                str.push("Not Ready.");
            }

            return str;
        };
    }
}﻿//InputKeyboard
/**
 * InputKeyboard
 * キーボード入力管理
 * @class
 * @classdesc
 * キーボードからの入力を管理するクラスです。<br>\
 * `keydown`と`keyup`イベントを監視し、<br>\
 * 特定のキー（方向キー、シフト、コントロール、スペース、A-Zなど）の<br>\
 * 押下状態をプロパティとして提供します。<br>\
 * memo:<br>\
 * 入力値の確認にkeyCodeを利用しているが<br>\
 * keyCodeを利用しているがMDNで非推奨となっていたのでcodeでの処理も追加
 * @see https://developer.mozilla.org/ja/docs/Web/API/KeyboardEvent/keyCode
 */
class inputKeyboard {
    /**
     * @param {boolean} codesupportmode select keyCode/code(null=keyCode mode)
     * @description
     * inputKeyboardインスタンスを初期化し、キーボードイベントリスナーを設定します。<br>\
     * キーの状態を保持するマップを準備し、<br>\
     * キーダウンとキーアップのイベントに応じてマップを更新します。
     * @todo　将来的にはデフォルトでtrue
     */
    constructor(codesupportmode) {
        // keycode
        //
        // ↑:38, ↓:40, ←:37, →:39
        //
        // shift:16, ctrl :17, alt  :18, space:32
        //
        // q:81, w:87, e:69
        // a:65, s:83, d:68
        // z:90, x:88, c:67

        // code(windows11/chrome)
        //
        // ↑:'ArrowUp', ↓:'ArrowDown', ←:'ArrowLeft', →:'ArrowRight'
        //
        // shift:'ShiftLeft', ctrl:'ControlLeft', alt:'AltLeft', space:'Space'
        //
        // q:'KeyQ', w:'KeyW', e:'KeyE'
        // a:'KeyA', s:'KeyS', d:'KeyD'
        // z:'KeyZ', x:'KeyX', c:'KeyC'

        let keymap = [];

        const keyStateReset = ()=> {

            this.upkey = false;
            this.downkey = false;
            this.leftkey = false;
            this.rightkey = false;

            this.shift = false;
            this.ctrl = false;
            this.space = false;

            this.qkey = false;
            this.wkey = false;
            this.ekey = false;

            this.akey = false;
            this.skey = false;
            this.dkey = false;

            this.zkey = false;
            this.xkey = false;
            this.ckey = false;
        }

        keyStateReset();

        //windowsフォーカスが外れるとキー入力リセットさせとく(押しっぱなし状態となる為）
        window.addEventListener("blur", function (event) { keymap = []; }, false);

        //KeyCode を使用するのはいつのまにか非推奨となっているので時間があるか使用不可になる前に書換要
        //@see　https://developer.mozilla.org/ja/docs/Web/API/KeyboardEvent
        if (!Boolean(codesupportmode)){
            window.addEventListener("keydown", function (event) { keymap[event.keyCode] = true; }, false);
            window.addEventListener("keyup", function (event) { keymap[event.keyCode] = false; }, false);
        }else{
        //code対応用(アプリケーション側での対応も必要)
            window.addEventListener("keydown", function (event) { keymap[event.code] = true; }, false);
            window.addEventListener("keyup", function (event) { keymap[event.code] = false; }, false);
        }
        /**
         * 入力状態確認(状態確認用キープロパティの更新)
         * @method
         * @returns {object} key status array
         * @example
         * {keycode:true, keycode:false, ..}
         * @description
         * 現在のキーボード入力状態を更新し、その結果を返します。<br>\
         * 主要なキー（方向キー、修飾キー、特定のアルファベット）の<br>\
         * 押下状態が対応するプロパティに反映されます。
         */
        this.check = function(){

            keyStateReset();

            for (let i in keymap) {

                switch (i) {
                    // shift:16, ctrl :17, alt  :18, space:32
                    case "16": this.shift = keymap[16]; break;
                    case "17": this.ctrl = keymap[17]; break;
                    case "18": this.alt = keymap[18]; break;
                    case "32": this.space = keymap[32]; break;
                    // ↑:38, ↓:40, ←:37, →:39
                    case "38": this.upkey = keymap[38]; break;
                    case "40": this.downkey = keymap[40]; break;
                    case "37": this.leftkey = keymap[37]; break;
                    case "39": this.rightkey = keymap[39]; break;
                    // q:81, w:87, e:69
                    // a:65, s:83, d:68
                    // z:90, x:88, c:67
                    case "65": this.akey = keymap[65]; break;
                    case "67": this.ckey = keymap[67]; break;
                    case "68": this.dkey = keymap[68]; break;
                    case "69": this.ekey = keymap[69]; break;
                    case "81": this.qkey = keymap[81]; break;
                    case "83": this.skey = keymap[83]; break;
                    case "87": this.wkey = keymap[87]; break;
                    case "88": this.xkey = keymap[88]; break;
                    case "90": this.zkey = keymap[90]; break;

                    //code support mode
                    case 'ShiftLeft':   this.shift =    keymap['ShiftLeft'];    break;
                    case 'ControlLeft': this.ctrl =     keymap['ControlLeft'];  break;
                    case 'AltLeft':     this.alt =      keymap['AltLeft'];      break;
                    case 'Space':       this.space =    keymap['Space'];        break;
                    case 'ArrowUp':     this.upkey =    keymap['ArrowUp'];      break;
                    case 'ArrowDown':   this.downkey =  keymap['ArrowDown'];    break;
                    case 'ArrowLeft':   this.leftkey =  keymap['ArrowLeft'];    break;
                    case 'ArrowRight':  this.rightkey = keymap['ArrowRight'];   break;
                    case 'KeyA': this.akey = keymap['KeyA']; break;
                    case 'KeyC': this.ckey = keymap['KeyC']; break;
                    case 'KeyD': this.dkey = keymap['KeyD']; break;
                    case 'KeyE': this.ekey = keymap['KeyE']; break;
                    case 'KeyQ': this.qkey = keymap['KeyQ']; break;
                    case 'KeyS': this.skey = keymap['KeyS']; break;
                    case 'KeyW': this.wkey = keymap['KeyW']; break;
                    case 'KeyX': this.xkey = keymap['KeyX']; break;
                    case 'KeyZ': this.zkey = keymap['KeyZ']; break;

                    default:
                        break;
                }
            }

            return keymap;
        };
        /**
         * 入力状態確認（状態確認用キープロパティは変化しない）
         * @method
         * @returns {Array} key status array
         * @example
         * {keycode:true, keycode:false, ..}
         * @description
         * 現在のキーボードの入力状態（`keymap`配列）を、プロパティを更新せずに返します。<br>\
         * これにより、キーの個別の状態を直接参照できます。
         */
        this.state = function () {

            return keymap;
        };

        /**
         * keyCode指定して対象キーの状態を確認する
         * @method
         * @param {number} keycode キーコード
         * @returns {boolean} キーの状態(true:on/false:off)
         * @description
         * 特定の`keyCode`を持つキーの現在の状態を問い合わせます。<br>\
         * 指定されたキーが押されているか（`true`）または<br>\
         * 押されていないか（`false`）を返します。
         */
        this.inquiryKey = function (keycode) {

            let result = false;
            if (Boolean(keystate[keycode])) {
                if (keystate[keycode]) {
                    result = keystate[keycode];
                }
            }
            return result;
        };
    }
}

﻿//InputMouse
//
/**
 * InputMouse
 * @class
 * @classdesc
 * マウスの入力を管理する機能を提供します。<br>\
 * マウスの移動、ボタンのクリック、ホイールのスクロールイベントを捕捉し、<br>\
 * マウスの位置、ボタンの状態、ホイールの移動量を追跡します。
 */
class inputMouse {
    /**
     * @constructor
     * @param {string} element_ID　target getElementById(element_ID);
     * @example
     * element_IDにはGameCoreでCanvasのIDが指定されます。
     */
    constructor(element_ID) {

        let state = { x: 0, y: 0, button: 0, wheel: 0 };

        let x = 0;
        let y = 0;
        let button = -1;
        let wheel = 0;

        let tr = { x: 1, y: 1, offset_x: 0 };

        let el = document.getElementById(element_ID);

        //mouseevent
        el.addEventListener("mousemove",
            function (event) {
                x = event.clientX;
                y = event.clientY;
            },
            false);

        el.addEventListener("mousedown", function (event) { button = event.button; }, false);
        el.addEventListener("mouseup", function (event) { button = -1; }, false);
        el.addEventListener("mousewheel", function (event) { wheel = event.wheelDelta; }, false);

        //firefox用ホイールコントロール
        el.addEventListener("DOMMouseScroll", function (event) { wheel = event.detail; }, false);

        /**
         * @method
         * @param {GameCore} g GameCoreインスタンス
         * @description
         * フルスクリーンモードかどうかに応じてマウス座標の変換を調整します。<br>\
         * これにより、実際の画面解像度と描画Canvasの解像度が異なる場合でも<br>\
         * 正確なマウス位置をゲーム内で取得できます。
        */
        this.mode = function (g) {

            if (document.fullscreenElement) {
                let cw = document.documentElement.clientWidth;
                let ch = document.documentElement.clientHeight;
                let pixr = window.devicePixelRatio;

                let scw = g.systemCanvas.width;
                let sch = g.systemCanvas.height;

                let rt = ch / sch;

                tr.x = rt; tr.y = rt; tr.offset_x = ((scw * rt) - cw) / rt / 2;
            } else {
                tr.x = 1; tr.y = 1; tr.offset_x = 0;
            }
        };

        /**
         * @typedef {object} mouseState マウス状態
         * @property {number} x x座標
         * @property {number} y y座標
         * @property {number} button ボタン状態
         * @property {number} wheel ホイール移動量
         * @example
         * button -1:何も押してない　0:左ボタン　2:右ボタン　1:ホイール
         */

        /**
         * @method
         * @returns {mouseState} マウス状態
         * @description
         * 現在のマウスの入力状態（位置、ボタン、ホイール）を返します。<br>\
         * ボタンの状態とホイールの移動量は、次回の呼び出しのためにリセットされます。
         * @todo ボタン同時押しの検出の為にbuttonsを評価するようにする
         * @todo 多ボタンマウスの動作について検討
         */
        this.check = function () {

            state.x = (x / tr.x) + tr.offset_x;
            state.y = (y / tr.y);
            state.button = button;
            state.wheel = wheel;

            if (button != 0) { button = -1; }
            wheel = 0;

            return state;
        };

        /**
         * @method
         * @returns {mouseState} マウス状態
         * @description
         * 最後に記録されたマウスの入力状態を、値をリセットせずに返します。<br>\
         * このメソッドは、前フレームの状態を参照したい場合や、<br>\
         * 値のリセットが不要な場合に利用されます。
         */
        this.check_last = function () {
            //state.x = x * tr.x + tr.offset_x;
            //state.y = y * tr.y;
            //state.button = button;
            //state.wheel = wheel;

            return state;
        };

        /**
         * @method
         * @param {DisplayControl} ctx 表示するDisplayControlを指定
         * @description
         * 現在のマウスカーソル位置に視覚的なインジケータを描画します。<br>\
         * デバッグや、カスタムカーソルを表示したい場合に利用でき、<br>\
         * 描画機能を持つオブジェクトを`putFunc`で登録します
         */
        this.draw = function (ctx) {

            let st = this.check_last();

            let cl = {};
            cl.x = st.x;
            cl.y = st.y;
            cl.draw = function (device) {
                let context = device;

                context.beginPath();
                context.moveTo(this.x, this.y);
                context.lineTo(this.x + 10, this.y + 10);
                context.globalAlpha = 1.0;
                context.strokeStyle = "white"; //"black";
                context.lineWidth = 3;
                context.stroke();
            };
            ctx.putFunc(cl);
        };
    }
}
﻿// touchPadControl 
//**************************************************************
/**
 * touchPadControl
 * @class
 * @classdesc
 * タッチパッド（またはタッチスクリーン）からの入力を管理します。<br>\
 * タッチ開始、移動、終了、キャンセルイベントを処理し、<br>\
 * 複数のタッチポイントの位置を追跡します。
 * @todo スワイプやピンチインアウトの検出
 */
class inputTouchPad {
    /**
     * @constructor
     * @param {string} canvas_id CanvasId
     * @example
     * GameCoreでCanvasIdが指定されます。
     */
    constructor(canvas_id) {

        let pos = [];

        let tr = { x: 1, y: 1, offset_x: 0 };

        let el = document.getElementById(canvas_id);
        //let cvs = document;
        //this.o_Left = el.width ;//offsetLeft;
        //this.o_Top = el.height;//offsetTop;
        let viewf = false;

        //iPodTouch用(マルチポイントタッチ)
        el.addEventListener('touchstart', ViewTrue,
            { passive: false });
        el.addEventListener('touchmove', ViewTrue,
            { passive: false });
        el.addEventListener('touchend', ViewFalse,
            { passive: false });
        el.addEventListener('touchcancel', ViewFalse,
            { passive: false });

        function ViewTrue(e) {
            e.preventDefault();
            touchposget(e);
            viewf = true;
        }

        function ViewFalse(e) {
            e.preventDefault();
            touchposget(e);
            viewf = false;
        }

        /**
         * @method
         * @param {GameCore} g GameCoreインスタンス
         * @description
         * フルスクリーンモードかどうかに応じてタッチ座標の変換を調整します。<br>\
         * これにより、実際の画面解像度と描画Canvasの解像度が異なる場合でも、<br>\
         * 正確なタッチ位置をゲーム内で取得できます。
         */
        this.mode = function (g) {

            if (document.fullscreenElement) {
                let cw = el.clientWidth; //document.documentElement.clientWidth;
                let ch = el.clientHeight; //document.documentElement.clientHeight;
                let pixr = window.devicePixelRatio;

                let scw = g.systemCanvas.width;
                let sch = g.systemCanvas.height;

                let rt = ch / sch;

                tr.x = rt; tr.y = rt; tr.offset_x = ((scw * rt) - cw) / rt / 2;
            } else {
                tr.x = 1; tr.y = 1; tr.offset_x = 0;
            }
        };

        function touchposget(event) {

            pos = [];

            if (event.touches.length > 0) {
                for (let i = 0; i < event.touches.length; i++) {
                    let t = event.touches[i];

                    pos[i] = {};

                    pos[i].x = (t.pageX / tr.x) + tr.offset_x;
                    pos[i].y = (t.pageY / tr.y);
                    pos[i].id = t.identifier;
                    //pos[i].count = 0;//work
                }
            }
        }

        /**
         * @typedef {object} touchpadState タッチパネル状態
         * @property {object[]} pos
         * @property {number} pos[].x x座標　
         * @property {number} pos[].y y座標
         * @property {number} pos[].id touch.identifier
         * @see https://developer.mozilla.org/ja/docs/Web/API/Touch
         * 
         */
        /**
         * @method
         * @returns {touchpadState} タッチパネル状態 
         * @description
         * 現在のタッチ入力状態を返します。<br>\
         * 複数のタッチポイントがある場合、各ポイントのX、Y座標と<br>\
         * IDを含む配列として提供されます。
         */
        this.check = function () {
            let state = {};

            state.pos = pos;
            return state;
        };

        /**
         * @method
         * @returns {touchpadState} タッチパネル状態
         * @description
         * 最後に記録されたタッチ入力状態を、値をリセットせずに返します。<br>\
         * このメソッドは、前フレームの状態を参照したい場合や、<br>\
         * 値のリセットが不要な場合に利用されます。
         */
        this.check_last = function () {
            let state = {};

            state.pos = pos;
            return state;
        };

        /**
         * @method
         * @param {DisplayControl} context 表示するDisplayControlを指定
         * @description
         * 現在アクティブなタッチポイントの位置に視覚的な円形インジケータを描画します。<br>\
         * デバッグや、タッチ操作のフィードバックを表示したい場合に利用でき、<br>\
         * 描画機能を持つオブジェクトを`putFunc`で登録します。
         */
        this.draw = function (context) {

            if (!viewf) return;

            let st = this.check_last();

            let s = "p " + pos.length + "/";

            for (let j = 0; j <= pos.length - 1; j++) {
                s = s + "b" + j + " ";

                let cl = {};
                cl.x = pos[j].x;
                cl.y = pos[j].y;
                cl.r = 16;
                cl.draw = function (device) {
                    let context = device;

                    context.beginPath();
                    context.arc(this.x, this.y, this.r, 0, 2 * Math.PI, true);
                    //context.fillStyle = "orange";
                    //context.fill();
                    context.strokeStyle = "white";
                    context.lineWidth = 2;
                    context.stroke();
                };
                context.putFunc(cl);

            }
            //context.fillStyle = "green";
            //context.print(s, 12, 16);
            // 移動した座標を取得
        };
    }
}
﻿/**
 * VirtualPadControl
 * タッチパットから方向とボタン入力コントロール
 * @class
 * @classdesc 
 * マウスやタッチパッドの入力を仮想ゲームパッドの入力に変換します。<br>\
 * 画面上の仮想パッド領域とボタン領域へのタッチ/クリックを検出し、<br>\
 * 方向（角度と距離）とボタンの押下状態として提供します。
 */
class inputVirtualPad {
    /**
     * @constructor
     * @param {inputMouse} mouse inputMouseインスタンス 
     * @param {inputTouchPad} touchpad inputTouchPadインスタンス
     */
    constructor(mouse, touchpad) {
        //vControllerの入力位置設定

        const ResoX = 640;
        const ResoY = 400;

        let vCntlPos = {};

        vCntlPos.X = 0;
        vCntlPos.Y = 0;

        let Pad_Loc = {};

        Pad_Loc.X = 80;
        Pad_Loc.Y = ResoY - 80;
        Pad_Loc.R = 75;

        let Button_Loc = [];

        for (let i = 0; i <= 1; i++) {

            Button_Loc[i] = {};

            Button_Loc[i].X = ResoX - 200 + 80 * (i + 1);
            Button_Loc[i].Y = ResoY - 80;
            Button_Loc[i].R = 28;
            Button_Loc[i].ON = false;
        }


        for (let i = 0; i <= 1; i++) {

            Button_Loc[i + 2] = {};

            Button_Loc[i + 2].X = ResoX - 80;
            Button_Loc[i + 2].Y = (ResoY - 120) + 80 * i;
            Button_Loc[i + 2].R = 28;
            Button_Loc[i + 2].ON = false;
        }

        let pos = [];

        let now_vdeg = 0;
        let now_vbutton = [];
        let now_vdistance = -1;

        let viewf = false;

        /**
         * @typedef {object} vPadState 仮想ゲームパッド状態
         * @property {number} deg　仮想パッド方向
         * @property {boolean[]} button 仮想ボタン押下状態
         * @property {number} distance　仮想パッド距離
         */
        /**
         * @method
         * @returns {vPadState} 仮想ゲームパッド状態
         * @example
         * //input mouse_state, touchpad_state
         * //return deg = 0 -359 ,button[0-n] = false or true;
         * //       distance
         * @description
         * マウスとタッチパッドの最新の入力状態を処理し、仮想パッドの入力を更新します。<br>\
         * 仮想パッドの中心からの角度、距離、そして仮想ボタンの押下状態を計算し<br>\
         * その結果を返します。
         */
        this.check = function () {
            let ts = touchpad.check_last();
            let ms = mouse.check_last();

            pos = [];
            if (ts.pos.length <= 0) {
                if (ms.button != -1) {
                    pos.push({ x: ms.x, y: ms.y });
                    viewf = true;
                }
                else
                    viewf = false;
            } else {
                pos = ts.pos;
                viewf = true;
            }

            now_vdeg = 0;
            now_vbutton = [];

            let bn = Button_Loc.length - 1;

            for (let j = 0; j <= bn; j++) now_vbutton[j] = false;

            now_vdistance = -1;

            let tr = 0; // deg;
            let dst = -1;

            if (pos.length > 0) {
                for (let i = 0; i < pos.length; i++) {
                    let wdst = dist(pos[i].x, pos[i].y, Pad_Loc.X, Pad_Loc.Y);

                    if (Pad_Loc.R > wdst) {
                        //パッドに複数点入力の場合は最後のものを優先
                        tr = Math.floor(target_r(Pad_Loc.X, Pad_Loc.Y, pos[i].x, pos[i].y));
                        dst = wdst;
                    }

                    for (let j = 0; j <= bn; j++) {
                        if (Button_Loc[j].R > dist(Button_Loc[j].X, Button_Loc[j].Y, pos[i].x, pos[i].y)) {
                            now_vbutton[j] = true;
                        } else {
                            // now_vbutton[j] = false;
                        }
                    }
                }
            }

            now_vdeg = tr;
            now_vdistance = dst;

            let state = {};

            state.button = now_vbutton;
            state.deg = tr; // deg;
            state.distance = dst; //dstns;

            return state;
        };

        /**
         * @method
         * @returns {vPadState} 仮想ゲームパッド状態
         * @description
         * 最後に計算された仮想パッドの入力状態を、値をリセットせずに返します。<br>\
         * このメソッドは、前フレームの状態を参照したい場合や、<br>\
         * 値のリセットが不要な場合に利用されます。
         */
        this.check_last = function () {

            let state = {};

            state.button = now_vbutton;
            state.deg = now_vdeg; // deg;
            state.distance = now_vdistance; //dstns;

            return state;
        };

        /**
         * @method
         * @param {DisplayControl} context 描画先 
         * @description
         * 画面上に仮想ゲームパッドのグラフィックを描画します。<br>\
         * 方向パッドとボタンの形状、そして現在の入力状態を示すインジケータが表示され、<br>\
         * タッチやマウス操作に視覚的なフィードバックを提供します。
        */
        this.draw = function (context) {

            if (!viewf) return;

            let st = this.check_last();

            let bn = Button_Loc.length - 1;

            let cl = {};
            cl.x = Pad_Loc.X;
            cl.y = Pad_Loc.Y;
            cl.r = Pad_Loc.R;
            cl.bt = Button_Loc;
            cl.draw = function (device) {
                let context = device;

                context.beginPath();
                context.arc(this.x, this.y, this.r, 0, 2 * Math.PI, true);
                context.fillStyle = "gray"; //"black";
                context.globalAlpha = 0.5;
                context.fill();
                for (let i = 0; i <= this.bt.length - 1; i++) {

                    context.beginPath();
                    context.arc(this.bt[i].X, this.bt[i].Y, this.bt[i].R, 0, 2 * Math.PI, true);
                    context.fillStyle = "gray"; //"black";

                    context.fill();
                }

            };
            context.putFunc(cl);

            let s = "p " + pos.length + "/";

            if (st.distance > 0) {

                s = s + "d " + st.deg + ":" + st.distance;

                let cl = {};
                cl.x = Pad_Loc.X;
                cl.y = Pad_Loc.Y;
                cl.vx = Math.cos(ToRadian(st.deg - 90)) * Pad_Loc.R; //st.distance;
                cl.vy = Math.sin(ToRadian(st.deg - 90)) * Pad_Loc.R; //st.distance;

                cl.sr = ((st.deg + 225) % 360 / 180) * Math.PI;
                cl.draw = function (device) {
                    let context = device;
                    context.beginPath();
                    context.strokeStyle = "orange";
                    context.lineWidth = 60;
                    context.arc(this.x, this.y, 40, this.sr, this.sr + (1 / 2) * Math.PI, false);
                    context.stroke();
                };
                context.putFunc(cl);
            }

            for (let j = 0; j <= bn; j++) {
                if (st.button[j]) {
                    s = s + "b" + j + " ";

                    let cl = {};
                    cl.x = Pad_Loc.X;
                    cl.y = Pad_Loc.Y;
                    cl.r = Pad_Loc.R;
                    cl.bt = Button_Loc[j];
                    cl.draw = function (device) {
                        let context = device;

                        context.beginPath();
                        //context.arc(Button_Loc[j].X, Button_Loc[j].Y, Button_Loc[j].R - 5, 0, 2 * Math.PI, true);
                        context.arc(this.bt.X, this.bt.Y, this.bt.R - 5, 0, 2 * Math.PI, true);
                        context.fillStyle = "orange";
                        context.fill();
                    };
                    context.putFunc(cl);
                }
            }
        };

        //自分( x,y )から目標( tx, ty )の
        //	方向角度を調べる(上が角度0の0-359)
        function target_r(x, y, tx, ty) {
            let r;

            let wx = tx - x;
            let wy = ty - y;

            if (wx == 0) {
                if (wy >= 0) r = 180; else r = 0;
            } else {
                r = ToDegree(Math.atan(wy / wx));

                if ((wx >= 0) && (wy >= 0)) r = 90 + r;
                if ((wx >= 0) && (wy < 0)) r = 90 + r;
                if ((wx < 0) && (wy < 0)) r = 270 + r;
                if ((wx < 0) && (wy >= 0)) r = 270 + r;
            }

            return r;
        }

        //角度からラジアンに変換
        //
        function ToRadian(d){
            return (d * (Math.PI / 180.0));
        };

        //ラジアンから角度に変換
        //
        function ToDegree(r) {
            return (r * (180.0 / Math.PI));
        }

        //2点間の距離
        function dist(x, y, tx, ty) {

            return Math.floor(Math.sqrt(Math.pow(Math.abs(x - tx), 2) + Math.pow(Math.abs(y - ty), 2)));
        }
    }
}﻿/**
 * offScreenクラス
 * (offscreen buffer)
 * @class DisplayControl.offScreenTypeC
 * @classdesc
 * DisplayControlクラスの内部で利用されるオフスクリーンバッファを管理します<br>\
 * 実際の描画はここで行われ、その後メインCanvasにまとめて転送されることで、<br>\
 * 描画パフォーマンスと複雑なグラフィック効果を実現します。<br>\
 * <br>\
 * //全画面表示する為、mainのCanvasにまとめて重ね表示
 */
class offScreenTypeC {
    /**
     * @param {number} w 作成サイズ幅指定
     * @param {number} h 作成サイズ高さ指定
     * @param {number} ix 水平方向オフセット 
     * @param {number} iy 垂直方向オフセット  
     * @description
     * offScreenTypeCインスタンスを初期化し、指定された幅と高さでオフスクリーンCanvasを作成します。<br>\
     * 2D描画コンテキストを取得し、オフセットや描画フラグなどの内部状態を設定します。
     */
    constructor(w, h, ix, iy) {
        //w : width, h:height
        let element = new OffscreenCanvas(w, h);//2DEFで更新する場合があるのでconstはNG

        const offset_x = ix;
        const offset_y = iy;

        let efcnt = 0; //CallFunctionCount
        let efmax = 0; //CallFunctionCount(Max)

        let device = element.getContext("2d");//2DEFで更新有

        let enable_draw_flag = true;
        let enable_reset_flag = true;

        let _2DEffectEnable = false; //default off
        let view_angle = 0;

        //[Mode Functions]
        /**
         * MODE CHANGE ENNABLE_DRAW_FLAG
         * @method
         * @param {boolean} [flg=null] enable_draw_flag
         * @returns {boolean} 現在値
         * @todo 現在は効果なし/使用箇所確認後、削除予定
         * @description
         * オフスクリーンバッファをメインCanvasに描画するかどうかを制御します。<br>\
         * `true`を設定すると描画が有効になり、`false`で無効になりますが、<br>\
         * 現在の実装では効果が限定的である可能性があります。
         */
        this.view = function (flg) {
            if (typeof flg == "boolean") {
                enable_draw_flag = flg;
            }
            return enable_draw_flag;
        };
        /**
         * MODE CHANGE ENNABLE_FLIP_FLAG
         * @method
         * @param {boolean} [flg=null] enable_flip_flag
         * @returns {boolean} 現在値
         * @todo 現在は効果なし/使用箇所確認後、削除予定
         * @description
         * オフスクリーンバッファが自動的にクリアされるかどうかを制御します。<br>\
         * `true`を設定するとクリアが有効になり、`false`で無効になりますが、<br>\
         * 現在の実装では効果が限定的である可能性があります。
         */
        this.flip = function (flg) {
            if (typeof flg == "boolean") {
                enable_reset_flag = flg;
            }
            return enable_draw_flag;
        };
        /**
         * FULLSCREEN ROTATE FUNCTION
         * @method
         * @param {numver} r rotate angle
         * @desc 
         * this function effect eneble :_2DEffectEnable:true<br><br>\
         * <br>\
         * フルスクリーン2Dエフェクトが有効な場合、オフスクリーンバッファ全体を回転させます。<br>\
         * 指定された角度でバッファの内容が変換され、<br>\
         * 画面全体に回転効果を適用します。
         */
        this.turn = function (r) {
            if (_2DEffectEnable)
                view_angle = r;
        };
        /**
         * 2D FULLSCREEN EFFECT FUNCTION ENABLE
         * @method
         * @param {boolean} f ENABLE FLAG
         * @description
         * フルスクリーン2Dエフェクトの有効/無効を切り替えます。<br>\
         * 有効にした場合、回転時の枠外乱れを防ぐためバッファサイズを2倍に拡張し、<br>\
         * 描画原点を中心に移動させます
         * @todo 縦横2倍ではなく縦横を長辺の2倍にしないと足りない<br>\
         * 回転機能をあらためて使う案件が出てきたら補正する
         */
        this._2DEF = function (f) {
            _2DEffectEnable = f;

            if (f) {
                //回転で枠外が乱れるのでBackbufferを縦横2倍にする
                element = new OffscreenCanvas(w * 2, h * 2);
                //書き込み位置の原点(0,0)を中心近くに寄せる
                device = element.getContext("2d");
                device.translate(w / 2, h / 2);
            } else {
                element = new OffscreenCanvas(w, h);
                device = element.getContext("2d");
                device.translate(0, 0);
            }
        };
        //[Draw Functions]
        //-------------------------------------------------------------
        //SP_PUT
        /**
         * 変形ありの画像出力(SpritePut)(背景回転)FullParameter
         * @method
         * @param {Img} img 画像データ
         * @param {number} sx source x　元画像での位置x
         * @param {number} sy source y　元画像での位置y
         * @param {number} sw source w　元画像の幅
         * @param {number} sh source h　元画像の高さ
         * @param {number} dx destination x　出力画像の位置x
         * @param {number} dy destination y　出力画像の位置Y
         * @param {number} dw destination w  出力画像の幅
         * @param {number} dh destination h　出力画像の高さ
         * @param {number} m11 transform param
         * @param {number} m12 transform param
         * @param {number} m21 transform param
         * @param {number} m22 transform param
         * @param {number} tx target x　変形時の出力先x
         * @param {number} ty target y　変型時の出力先y
         * @param {number} alpha alpha 透明度指定(0-255)/不透明255
         * @param {number} r radian　方向上を基準0にした回転方向(0-359)
         * @returns {void}
         * @description
         * 画像を変形（回転、反転、拡大・縮小）させながら描画します。<br>\
         * 元画像の切り出し範囲、表示位置、変形パラメータ、アルファ値、回転角を細かく指定し、<br>\
         * 複雑なスプライト描画を可能にします。
         */
        this.spPut = function (img, sx, sy, sw, sh, dx, dy, dw, dh, m11, m12, m21, m22, tx, ty, alpha, r) {

            device.save();
            if (_2DEffectEnable) { tx += w / 2; ty += h / 2; };
            device.setTransform(m11, m12, m21, m22, tx, ty);
            if (r != 0) { device.rotate(Math.PI / 180 * r); }

            if (alpha == 255) {
                device.globalCompositeOperation = "source-over";
            } else {
                //if (this.light_enable) device.globalCompositeOperation = "lighter"; //source-over
                device.globalAlpha = alpha * (1.0 / 255);
            }
            //if (_2DEffectEnable){device.translate(w/2,h/2);};
            device.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);

            device.restore();
            //device.setTransform( 1,0,0,1,0,0 );
            efcnt++;
        };
        //-------------------------------------------------------------
        //DRAWIMG_XYWH_XYWH
        /**
         * 画像出力(サイズ変更有)
         * @method
         * @param {Img} img 画像データ
         * @param {number} sx source x　元画像での位置x
         * @param {number} sy source y　元画像での位置y
         * @param {number} sw source w　元画像の幅
         * @param {number} sh source h　元画像の高さ
         * @param {number} dx destination x　出力画像の位置x
         * @param {number} dy destination y　出力画像の位置Y
         * @param {number} dw destination w  出力画像の幅
         * @param {number} dh destination h　出力画像の高さ
         * @returns {void}
         * @description
         * 画像の一部を切り出して、指定された位置とサイズで描画します<br>\
         * 元画像（source）のX, Y, 幅, 高さ、<br>\
         * そして描画先（destination）のX, Y, 幅, 高さを指定します。
         */
        this.drawImgXYWHXYWH = function (img, sx, sy, sw, sh, dx, dy, dw, dh) {

            device.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);

            efcnt++;
        };
        //-------------------------------------------------------------
        //FILLTEXT
        /**
         * 文字表示
         * @method
         * @param {string} str 表示文字列 
         * @param {number} x 表示座標x
         * @param {number} y 表示座標y
         * @param {Color} c 表示色 (省略の場合"limegreen")
         * @description
         * 指定された文字列をオフスクリーンバッファに描画します。<br>\
         * 文字列、X座標、Y座標、そして表示色をパラメータとして受け取り、<br>\
         * バッファの描画コンテキストでテキストを描画します。
         */
        this.fillText = function (str, x, y, c) {

            if (!Boolean(c)) { c = "limegreen"; }

            device.fillStyle = c;
            device.fillText(str, x, y);

            efcnt++;
        };
        //------------------------------------------------------------
        //DRAWIMG_XY
        /**
         * 画像出力(元画像そのまま)
         * @method
         * @param {Img} img 画像データ
         * @param {number} sx 表示位置x
         * @param {number} sy 表示位置y
         * @returns {void}
         * @description
         * 画像全体を元のサイズそのままに、指定された位置に描画します。<br>\
         * 画像データと表示位置のX, Y座標を指定する、<br>\
         * 最もシンプルな画像描画メソッドです。
         */
        this.drawImgXY = function (img, sx, sy) {

            device.drawImage(img, sx, sy);

            efcnt++;
        };
        //------------------------------------------------------------
        //DRAWIMG_XYWH
        /**
         * 画像出力(元画像全体をサイズ変更)
         * @method 
         * @param {Img} img 画像データ
         * @param {number} sx source x　表示位置x
         * @param {number} sy source y　表示位置y
         * @param {number} sw source w　幅
         * @param {number} sh source h　高さ
         * @returns {void}
         * @description
         * 画像全体を、指定された幅と高さに拡大・縮小して描画します。<br>\
         * 画像データ、表示位置のX, Y座標、そして描画したい幅と高さを指定し<br>\
         * 画像サイズを調整して表示します。
         */ 
        this.drawImgXYWH = function (img, sx, sy, sw, sh) {

            device.drawImage(img, sx, sy, sw, sh);

            efcnt++;
        };
        //------------------------------------------------------------
        //PUTIMAGETRANSFORM
        /**
         * 画像出力(元画像全体を変形して表示)
         * @method 
         * @param {Img} img 画像データ
         * @param {number} x 表示位置x
         * @param {number} y 表示位置y
         * @param {number} m11 transform param
         * @param {number} m12 transform param
         * @param {number} m21 transform param
         * @param {number} m22 transform param
         * @returns {void}
         * @description
         * 画像全体に変形行列を適用して描画します。<br>\
         * 画像データ、表示位置X, Y、そして変換行列のパラメータを指定し<br>\
         * 画像の回転、拡大・縮小、せん断などをまとめて適用できます。
         */
        //use img, m11, m12, m21, m22, tx, ty
        //------------------------------------------------------------
        this.putImageTransform = function (img, x, y, m11, m12, m21, m22) {

            device.save();

            device.setTransform(m11, m12, m21, m22, x, y);
            device.drawImage(img, 0, 0);

            device.restore();

            efcnt++;
        };
        //---------------------------------------------------------
        //TRANSFORM
        /**
         * 変形(emptyFunction)
         * @method 
         * @param {number} m11 transform param
         * @param {number} m12 transform param
         * @param {number} m21 transform param
         * @param {number} m22 transform param
         * @returns {void}
         * @todo　削除予定
         * @deprecaed
         * @description
         * オフスクリーンバッファの描画コンテキストに変形行列を適用します。<br>\
         * 現在は機能しないダミー関数です。
         */
        this.transform = function (m11, m12, m21, m22) {
            //dummy
            efcnt++;
        };
        //------------------------------------------------------------
        // PUTFUNC
        /**
         * CustomDrawObject
         * @typedef {object} PutFuncCustomDraw draw(device)を含むオブジェクト
         * @property {function} draw 必須 {DeviceContext}を引数に呼び出される
         * @property {*} any 任意のプロパティ 
         * @summary CanvasMethodを登録して表示させる。
         * device: {DeviceContext} 
         * @example
         * cl = { x: 100, y:100, r:30, c:"red",
         *      draw:(d)=>{
         *          d.beginPath();
         *          d.strokeStyle = this.c;
         *          d.lineWidth = 1;
         *          d.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
         *          d.stroke();
         *          }
         *      }
         */

        /**
         * カスタム描画表示(CanvasMethodを実行)
         * @method 
         * @param {PutFuncCustomDraw} cl draw(device)を含むオブジェクト
         * @returns {void}
         * @description
         * `draw(device)`メソッドを持つカスタム描画オブジェクトを登録し、実行します。<br>\
         * この機能により、開発者はCanvasの低レベルな描画APIを直接利用して<br>\
         * グラフィック処理をオフスクリーンバッファ上で行うことができます。
         */
        this.putFunc = function (cl) {

            cl.draw(device);
            //ここで登録するクラスには表示の為に"draw( device )" functionを必ず登録
            efcnt++;
        };

        //---------------------------------------------------------
        //ALLCLEAR
        /**
         * 指定範囲の消去（クリア)
         * @method 
         * @param {number} sx 指定位置x
         * @param {number} sy 指定位置y
         * @param {number} sw 幅
         * @param {number} sh 高さ
         * @returns {void}
         * @description
         * オフスクリーンバッファの指定された矩形範囲を完全に消去します。<br>\
         * X, Y座標、幅, 高さを指定し、<br>\
         * 既存の描画内容をクリアします。
         */
        this.allClear = function (sx, sy, sw, sh) {

            device.save();

            device.setTransform(1, 0, 0, 1, 0, 0);
            device.clearRect(sx, sy, sw, sh);

            device.restore();

            efcnt++;
        };

        //-----------------------------------------------------
        //FILLRECT
        /**
         * 指定範囲の消去（クリア)
         * @method 
         * @param {number} sx 指定位置x
         * @param {number} sy 指定位置y
         * @param {number} sw 幅
         * @param {number} sh 高さ
         * @param {string} color 塗り潰し色(省略で透明色) 
         * @returns {void}
         * @description
         * オフスクリーンバッファの指定された矩形範囲を色で塗りつぶします。<br>\
         * X, Y座標、幅, 高さ、そして塗りつぶし色を指定し、<br>\
         * 色を指定しない場合はその範囲をクリアします。
        */
        this.fillRect = function (sx, sy, sw, sh, color) {

            if (Boolean(color)) {
                device.fillStyle = color;
                device.fillRect(sx, sy, sw, sh);
            } else {
                device.clearRect(sx, sy, sw, sh);
            }

            efcnt++;
        };

        //----------------------------------------------------------
        //RESET
        // 
        /**
         * offScreenバッファのクリア
         * @method 
         * @returns {void}
         * @description
         * オフスクリーンバッファ全体をクリアします。<br>\
         * `enable_reset_flag`が`true`の場合にのみ実行され、<br>\
         * バッファの内容を初期状態に戻します。
         */
        this.reset = function () {

            if (enable_reset_flag) {
                this.allClear(0, 0, w, h);
            }

            efcnt++;
        };

        //----------------------------------------------------------
        //REFLASH
        /**
         * (flameloopで実行用）offScreenバッファのクリア
         * @method 
         * @returns {void}
         * @description
         * ゲームのフレームループ内で呼び出されることを想定した<br>\
         * オフスクリーンバッファのクリア機能です。<br>\
         * `enable_reset_flag`が`true`であれば、`reset`メソッドを呼び出します。
         */
        this.reflash = function () {

            if (enable_reset_flag) {
                this.reset();
            }
            efcnt++;
        };

        //----------------------------------------------------------
        //DRAW
        /**
         * 描画処理
         * OffscreenCanvasをCanvasへ反映
         * @method 
         * @param {CanvasContext} outdev 出力先のCanvas2DContext(MainCanvas)
         * @returns {void}
         * @description
         * オフスクリーンバッファに描画された内容を、出力先のメインCanvasに転送します。<br>\
         * 2Dエフェクトが有効な場合は、回転などの効果を適用しながら<br>\
         * メインCanvasに反映させます。
         */
        this.draw = function (outdev) {
            //2024/04/29 new Function turn
            if (enable_draw_flag) {
                if (!_2DEffectEnable) {
                    //outdev.clearRect(0, 0, w, h);
                    outdev.drawImage(element, offset_x, offset_y);
                } else {
                    let w = element.width;
                    let h = element.height;

                    outdev.fillStyle = "green";
                    outdev.fillRect(0, 0, w / 2, h / 2);

                    //outdev.clearRect(0, 0, w/2, h/2);
                    outdev.save();
                    outdev.translate(w / 4, h / 4);
                    outdev.rotate((Math.PI / 180) * ((view_angle) % 360));

                    outdev.drawImage(element, offset_x - w / 2, offset_y - h / 2);
                    //outdev.drawImage(element, offset_x, offset_y);
                    outdev.restore();
                    //console.log("e" + view_angle%360);
                    device.fillStyle = "red";
                    device.fillRect(-w / 4, -h / 4, w, h);
                }
            }
            if (efmax < efcnt) efmax = efcnt;
            efcnt = 0; //Drawコール毎の呼び出し数の記録の為、メインキャンバスに反映毎に0にする
        };
        //----------------------------------------------------------
        //COUNT
        /**
         * 前回のDrawコールから現在までのFunction呼び出し回数を返す
         * @returns {number} function call count par frame
         * @description
         * 前回の`draw`メソッドが呼び出されてから現在までに、<br>\
         * オフスクリーンバッファに対して行われた描画関数の呼び出し回数を返します。<br>\
         * これにより、1フレームあたりの描画操作の数を把握できます。
         */
        this.count = function () {
            //return function call count par frame
            return efcnt;
        };
        //----------------------------------------------------------
        //MAX
        /**
         * Function呼び出し回数の最大値を返す
         * @returns {number} function call count par frame
         * @description
         * オフスクリーンバッファへの描画関数呼び出し回数の最大値を返します。<br>\
         * これは、フレーム間で最も多くの描画操作が行われた際の記録であり<br>\
         * 描画負荷のピークを把握するのに役立ちます。
         */
        this.max = function () {
            //return function call count par frame maxim
            return efmax;
        };
    }
}



//soundControl
/**
 * soundControl
 * @class
 * @classdesc
 * `GameAssetManager`によってロードされた音声アセットの再生を制御します。<br>\
 * アセットIDを介して、音声の再生、停止、ボリューム調整、<br>\
 * そして再生状態の確認といった基本的な操作を提供します。
 */
class soundControl {
    /**
     * @param {GameAssetManager} gameAsset GameAssetManagerインスタンス
     */
    constructor(gameAsset) {

        let sd = gameAsset.sound;

        /**
         * @method
         * @param {AudioAssetId} id AssetId
         * @description
         * 指定されたIDの音声アセットを再生します。<br>\
         * もし音声がすでに終了している場合、再生位置を最初に戻してから再生を開始し、<br>\
         * 音楽などのループ再生に適しています。
         */
        this.play = function (id) {

            let p = sd[id].sound;

            if (p.ended) p.currentTime = 0;

            p.play();
        };

        /**
         * @method
         * @param {AudioAssetId} id AssetId
         * @description
         * 指定されたIDの音声アセットを効果音として再生します。<br>\
         * 常に再生位置を最初に戻してから再生を開始するため、<br>\
         * 複数の効果音を連続して鳴らすのに適しています。
         */
        this.effect = function (id) {

            if (Boolean(sd[id])) {

                sd[id].sound.currentTime = 0;
                sd[id].sound.play();
            }
        };

        /**
         * @method
         * @param {AudioAssetId} id AssetId
         * @returns {boolean} nowPlaying?
         * @description
         * 指定されたIDの音声アセットが現在再生中であるかどうかを返します。<br>\
         * 音声が終了していない場合に`true`を返し、<br>\
         * 再生状態の確認に利用できます。
         */
        this.running = function (id) {
            return (!sd[id].ended);
        };

        /**
         * @method
         * @param {AudioAssetId} id AssetId
         * @returns {number} playing%
         * @description
         * 指定されたIDの音声アセットの現在の再生進行度をパーセンテージで返します。<br>\
         * 現在の再生位置と音声全体の長さから計算され、<br>\
         * 再生バーの表示などに利用できます。
         */
        this.info = function (id) {

            let p = sd[id];

            return (p.currentTime / p.duration) * 100;
        };
        /**
         * @method
         * @param {AudioAssetId} id AssetId
         * @description
         * 指定されたIDの音声アセットの再生位置を最初に戻します。<br>\
         * 再生中の音声を最初からやり直したい場合や、<br>\
         * 次に再生する準備として利用できます。
        */
        this.restart = function (id) {

            sd[id].currentTime = 0;

        };

        /**
         * @method
         * @param {AudioAssetId} id AssetId
         * @param {numberVolume} vol Volume
         * @description
         * 指定されたIDの音声アセットのボリュームを設定します。<br>\
         * 0.0（無音）から1.0（最大）の範囲で音量を調整し、<br>\
         * 個々の音声の音量バランスを制御します。
         */
        this.volume = function (id, vol) {

            sd[id].volume = vol;
        };
    }
}












/**
 * @typedef {number | string} spPtnId SpriteAnimeUniqIdentifer
 * @description
 * スプライトアニメーションパターンの登録ID<br>\
 * 同じIDグループ内で重複しない任意の数値や文字列を設定する<br>\
 */

/**
 * @class
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
 * @classdesc
 * ゲーム内のスプライトオブジェクトの表示と管理を制御します。<br>\
 * スプライトの生成、移動、アニメーション、衝突判定<br>\
 * そして描画優先順位の管理を行います。
 */
class GameSpriteControl {
    /**
     * 
     * @param {GameCore} g GameCoreインスタンス 
     */
    constructor(g) {
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
         * @class GameSpriteControl.SpItem
         * @classdesc
         * 個々のスプライトオブジェクトの属性を定義する内部クラスです。<br>\
         * 位置、速度、回転、拡大率、表示優先順位、衝突判定設定、<br>\
         * そして生存状態などのプロパティを保持します。
         */
        class SpItem {
            /**
             * @description
             * `SpItem`インスタンスを初期化します。<br>\
             * スプライトの位置、速度、回転、優先順位、衝突判定有効/無効、<br>\
             * そして生存状態などの初期プロパティを設定します。
             */
            constructor() {

                this.x = 0;
                this.y = 0;
                /**
                 * 方向　Radian(0-359）
                 * @type {number}
                 */
                this.r = 0;
                /**
                 * 拡大率(default1.0)//reserb
                 * @type {number}
                 */
                this.z = 0;
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
                this.collision = { w: 0, h: 0 };
                this.id = "";
                this.count = 0;
                this.pcnt = 0;
                this.visible = false;
                /**
                 * 衝突相手のSpItem(複数の場合は複数)
                 * CollisionCheckで衝突しているitemのオブジェクトが入る
                 * 衝突相手のSpItem(複数の場合は複数)
                 * @member
                 * @type {SpItem[]}
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
                 * @method
                 * @param {GameCore} g GameCoreインスタンス
                 * @param {DisplayControl} screen　表示スクリーン
                 * @description
                 * スプライト固有のカスタム描画ロジックを実装するためのエントリポイントです。<br>\
                 * 通常のスプライト描画の前後どちらかで呼び出されるように設定でき、<br>\
                 * 複雑な視覚効果をスプライトに適用できます。
                 */
                this.customDraw = function (g, screen) { };

                /**
                 * 移動処理で呼ばれる関数のエントリポイント
                 * @method
                 * @param {number} delta
                 * @description
                 * スプライトの移動処理を担う関数を設定するためのエントリポイントです。<br>\
                 * デフォルトでは直線移動関数が設定されていますが、<br>\
                 * カスタムの移動ロジックを割り当てて多様な動きを実現できます。
                 */
                this.moveFunc;

                /**
                 * 表示する
                 * @method
                 * @description
                 * スプライトを表示状態に設定します。<br>\
                 * これにより、スプライトがゲームループの描画フェーズで処理され、<br>\
                 * 画面に表示されるようになります。
                 */
                this.view = function () { this.visible = true; };
                /**
                 * 表示しない
                 * @method
                 * @description
                 * スプライトを非表示状態に設定します。<br>\
                 * これにより、スプライトはゲームループの描画フェーズではスキップされ、<br>\
                 * 画面には表示されなくなります。
                 */
                this.hide = function () { this.visible = false; };
                /**
                 * 表示位置指定
                 * @method
                 * @param {number} x x座標）
                 * @param {number} y y座標
                 * @param {number} r 方向(0-359)(省略可)
                 * @param {number} z 拡大率(省略可)
                 * @description
                 * スプライトの表示位置、回転角度、拡大率を直接設定します。<br>\
                 * X座標、Y座標、回転角度（0-359度）、拡大率をパラメータとして受け取り、<br>\
                 * スプライトを即座に指定された状態に配置します。
                 */
                this.pos = function (x, y, r = 0, z = 0) {
                    this.x = x; this.y = y; this.r = r; this.z = z;
                };
                /**
                 * 移動指定
                 * frame毎に.moveFuncが呼ばれる(通常は直線移動)
                 * @method
                 * @param {number} dir 方向(0-359）
                 * @param {number} speed 1f当たりの移動pixel（1/60基準)
                 * @param {number} aliveTime 動作させるフレーム数
                 * @description
                 * スプライトに移動の指示を与えます。<br>\
                 * 移動方向（0-359度）、1フレームあたりの速度、動作させるフレーム数を指定し<br>\
                 * スプライトが自動的に移動し、設定された時間後に停止します。
                 */
                this.move = function (dir, speed, aliveTime) {
                    this.visible = true;
                    let wr = ((dir - 90) * (Math.PI / 180.0));
                    this.vx = Math.cos(wr) * speed;
                    this.vy = Math.sin(wr) * speed;
                    this.r = dir;
                    this.alive = aliveTime;
                };

                this.moveFunc = normal_move; //normal_move;

                /**
                 * 移動処理で呼ばれる関数(default)
                 * @param {number} delta
                 * @description
                 * `SpItem.moveFunc`のデフォルトとして使用される移動処理関数です。<br>\
                 * スプライトの速度（`vx`, `vy`）に基づいて位置を更新し,<br>\
                 *  `alive`カウンタがゼロになると非表示になります。
                 */
                function normal_move(delta) {
                    this.alive--;

                    this.x += this.vx * (delta / (1000 / 60));
                    this.y += this.vy * (delta / (1000 / 60));

                    if (this.alive <= 0) {
                        this.visible = false;
                    } else {
                        this.visible = true;
                    }
                }
                /**
                 * 移動停止
                 * @method
                 * @description
                 * スプライトの現在の移動を停止させます。<br>\
                 * `alive`カウンタをゼロに、`vx`と`vy`をゼロに設定することで、<br>\
                 * スプライトは現在の位置で静止します。
                 */
                this.stop = function () {
                    this.alive = 0;
                    this.vx = 0; this.vy = 0;
                };
                /**
                 * 廃棄
                 * @method
                 * @description
                 * スプライトを破棄状態に設定します。<br>\
                 * `alive`カウンタをゼロ、`visible`を`false`、`living`を`false`に設定することで、<br>\
                 * スプライトは表示も処理もされなくなり、最終的にリストから削除されます。
                 */
                this.dispose = function () {
                    this.alive = 0;
                    this.visible = false;
                    //上の2つで表示も処理もされなくなる
                    this.living = false;
                };
                /**
                 * 表示処理(内部処理用)
                 * @method
                 * @param {number} x x座標
                 * @param {number} y y座標
                 * @param {number} r 方向(0-359)(省略可)
                 * @param {number} z 拡大率(省略可)
                 * @description
                 * スプライトをオフスクリーンバッファに描画するための内部処理関数です。<br>\
                 * スプライトの位置、パターン、回転、拡大率に基づいて<br>\
                 * 最終的な描画を実行します。
                 */
                this.put = function (x, y, r = 0, z = 1) {

                    let rf = true;
                    if (Boolean(g.viewport)) {
                        let rs = g.viewport.viewtoReal(x, y);
                        x = rs.x;
                        y = rs.y;
                        rf = rs.in;
                    }
                    if (rf) {
                        if (!Boolean(pattern_[this.id])) {
                            buffer_.fillText(this.index + " " + this.count, x, y);
                        } else {
                            spPut(pattern_[this.id].image, pattern_[this.id].pattern[this.pcnt], x, y, r, z);
                            this.count++;
                            if (this.count > pattern_[this.id].wait) { this.count = 0; this.pcnt++; }
                            if (this.pcnt > pattern_[this.id].pattern.length - 1) { this.pcnt = 0; }
                        }
                    }
                };
                //内部処理用
                /**
                 * @method
                 * @description
                 * `SpItem`インスタンスの全てのプロパティを初期状態にリセットします。<br>\
                 * これにより、一度使用されたスプライトオブジェクトを再利用する際に<br>\
                 * クリーンな状態から始めることができます。
                 */
                this.reset = function () {

                    this.x = 0;
                    this.y = 0;
                    this.r = 0;
                    this.z = 0;
                    this.vx = 0;
                    this.vy = 0;
                    this.priority = 0;
                    this.collisionEnable = true;
                    this.collision = { w: 0, h: 0 };
                    this.id = "";
                    this.count = 0;
                    this.pcnt = 0;
                    this.visible = false;
                    this.hit = [];
                    this.alive = 0;
                    this.index = 0;
                    this.living = true;
                    this.normalDrawEnable = true;
                    this.customDraw = function (g, screen) { };
                    this.beforeCustomDraw = false;
                    this.moveFunc = normal_move;
                };

                /**
                 * @method
                 * @returns {string[]} propertyListText
                 * @description
                 * `SpItem`インスタンスのプロパティとその値をデバッグ用に文字列配列として返します。<br>\
                 * スプライトの現在の状態を詳細に確認することができ、<br>\
                 * 開発中のデバッグ作業に役立ちます。
                 */
                this.debug = function () {

                    let st = [];
                    const o = Object.entries(this);

                    o.forEach(function (element) {
                        let w = String(element).split(",");

                        let s = w[0];
                        if (s.length < 13) {
                            s = s + " ".repeat(13);
                            s = s.substring(0, 13);
                        }
                        let s2 = w[1].substring(0, 15);
                        st.push("." + s + ":" + s2);
                    });
                    st.push("");
                    st.push("Object.entries end.");

                    return st;
                };
            }
        }

        /**
         * スプライトアイテム登録/生成
         * @method
         * @param {spPtnId} Ptn_id スプライトアニメーションパターンID
         * @param {boolean} [col=false] 衝突有効無効
         * @param {number} [w=0] 衝突サイズ幅
         * @param {number} [h=0] 衝突サイズ高さ
         * @returns {SpItem} スプライトアイテムオブジェクト
         * @description
         * 新しいスプライトアイテム（`SpItem`）を生成し、リストに登録します。<br>\
         * パターンID、衝突判定の有効/無効、衝突判定の幅と高さを指定し、<br>\
         * 新しいスプライトオブジェクトを返します。
         */
        this.itemCreate = function (Ptn_id, col = false, w = 0, h = 0) {
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
        };

        /**
         * スプライトアイテムリスト取得
         * @method
         * @returns {SpItem[]} スプライトアイテムオブジェクトの配列
         * @description
         * 現在管理されている全てのスプライトアイテムの配列を返します。<br>\
         * これにより、ゲーム内の全てのスプライトにアクセスし、<br>\
         * 一括で操作や状態確認を行うことができます。
         */
        this.itemList = function () {
            return sprite_;
            //基本Index＝配列番号のはず      
        };
        /**
         * スプライトアイテムリストリセット
         * @method
         * @description
         * 現在管理されている全てのスプライトアイテムをリストから削除し、リセットします。<br>\
         * これにより、ゲーム内のスプライトを全てクリアし、<br>\
         * スプライト管理システムを初期状態に戻します。
         */
        this.itemFlash = function () {
            sprite_ = [];
        };
        /**
         * リストから廃棄済みのスプライトを削除して再インデックス
         * @method
         * @returns {SpItem[]} スプライトアイテムオブジェクトの配列
         * @description
         * リストから破棄済みのスプライトを削除し、残ったスプライトのインデックスを振り直します。<br>\
         * これにより、スプライトリストを整理し、<br>\
         * メモリ効率を向上させることができます。
         */
        this.itemIndexRefresh = function () {
            //disposeしたSpItemを削除してIndexを振り直す
            let ar = [];
            for (let i in sprite_) if (sprite_[i].living) ar.push(sprite_[i]);
            for (let i in ar) ar[i].index = i;

            sprite_ = ar;
            return sprite_;
        };
        //----
        /**
         * 手動更新モードに変更する
         * @method
         * @param {boolean} [bool=true]　true:手動 /false:自動更新に戻す
         * @returns {void}
         * @description
         * スプライトの描画モードを自動更新から手動更新に切り替えます。<br>\
         * `true`を指定すると手動モードになり、開発者が`allDrawSprite`を明示的に呼び出す必要があります。
         */
        this.manualDraw = function (bool = true) {

            if (bool) {
                autoDrawMode = false;
            } else {
                autoDrawMode = true;
            }
        };
        /**
         * 表示先SCREENの選択
         * @method
         * @param {number} num スクリーン番号
         * @returns {void}
         * @description
         * スプライトを描画する対象のスクリーン（レイヤー）を選択します。<br>\
         * 指定されたスクリーン番号のオフスクリーンバッファにスプライトが描画され、<br>\
         * レイヤー構造での表示が可能になります。
         */
        this.useScreen = function (num) {
            //buffer_ = g.screen[num].buffer;
            activeScreen = g.screen[num];
            buffer_ = activeScreen.buffer;
        };

        /**
         * スプライトパターン定義パラメータ
         * 
         * @typedef {object} spPatternParam アニメーションパターン定義パラメータ
         * @property {ImageAssetId} image イメージアセットID 
         * @property {number} wait アニメーション変更間隔（フレーム数）
         * @property {number} pattern[].x イメージ範囲指定x
         * @property {number} pattern[].y イメージ範囲指定y
         * @property {number} pattern[].w イメージ範囲指定w
         * @property {number} pattern[].h イメージ範囲指定h
         * @property {number} pattern[].r 向き(0-359)上基準
         * @property {boolean} pattern[].fv trueで上下反転
         * @property {boolean} pattern[].fh trueで左右反転
         * @example
         * const spPatternParam = {
         *  image: "dummy",
         *  wait: 0, 
         *  pattern: [
         *      { x: 0, y: 0, w: 0, h: 0, r: 0, fv: false, fh: false },
         *      { x: 0, y: 0, w: 0, h: 0, r: 0, fv: false, fh: false }
         *      ]
         *  };
        */
        
        /**
         * スプライトパターン定義
         * @method
         *　@param {spPtnId} id スプライトアニメーションパターンID
         *　@param {spPatternParam} Param パターン定義パラメータ  
         * @description
         * スプライトのアニメーションパターンを定義し、IDと紐づけて登録します。<br>\
         * 使用する画像アセット、アニメーション間隔、そして各フレームのパターン定義を<br>\
         * 指定することでアニメーションを表現できます。
         */
        this.setPattern = function (id, Param) {
            pattern_[id] = { image: g.asset.image[Param.image].img, wait: Param.wait, pattern: Param.pattern };
        };
        //FullCheck return spitem[].hit(array)<-obj
        /**
         * @method
         * @description
         * 現在アクティブなスプライトアイテム間の衝突判定を実行します。<br>\
         * 全ての衝突有効なスプライトに対して総当たりでチェックを行い<br>\
         * 衝突している相手を`hit`プロパティに格納します。
         */
        this.CollisionCheck = function () {
            //総当たりなのでパフォーマンス不足の場合は書き換える必要有。
            let checklist = [];
            for (let i in sprite_) {
                let sp = sprite_[i];
                if (sp.living) { //visibleではない場合での当たり判定有の場合がある可能性を考えて処理
                    if (sp.collisionEnable) {
                        checklist.push(sp);
                    }
                }
            }
            for (let i in checklist) {
                let ssp = checklist[i];
                ssp.hit = [];
                for (let j in checklist) {
                    if (!(i == j)) {
                        let dsp = checklist[j];

                        if ((Math.abs(ssp.x - dsp.x) < ((ssp.collision.w / 2) + (dsp.collision.w / 2)))
                            && (Math.abs(ssp.y - dsp.y) < ((ssp.collision.h / 2) + (dsp.collision.h / 2)))) {
                            ssp.hit.push(dsp);
                        }
                    }
                }
            }
        };

        //Inner Draw Control Functions
        /**
         * 
         * @param {Img} img 画像データ
         * @param {object} d パターン情報{x: y: w: h: r: fv: fh}
         * @param {number} x 位置x
         * @param {number} y 位置y
         * @param {number} r 回転r
         * @param {number} z 拡大率
         * @param {number} alpha アルファ値
         * @description
         * スプライトパターンをオフスクリーンバッファに描画するための内部ユーティリティ関数です。<br>\
         * 画像データ、パターン情報、位置、回転、拡大率、アルファ値を受け取り、<br>\
         * 複雑な変換を適用して描画します。
         */
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

                let FlipV = d.fv ? -1.0 : 1.0;
                let FlipH = d.fh ? -1.0 : 1.0;

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
        /**
         * @method
         * @description
         * 管理されている全てのスプライトを、設定された優先順位に基づいて描画します。<br>\
         * スプライトの生存状態、可視性、移動ロジック（自動更新モード時）<br>\
         * カスタム描画などを処理し、バッファに反映させます。
         */
        this.allDrawSprite = function () {

            if (autoDrawMode) {
                pbuf.reset();
                for (let i in sprite_) {
                    let o = sprite_[i];
                    if (o.living) {
                        pbuf.add(o);
                    }
                }
                pbuf.sort();
                let wo = pbuf.buffer();

                for (let i in wo) {
                    let sw = wo[i];

                    if (sw.alive > 0) {
                        sw.moveFunc(g.deltaTime());
                    }
                    if (sw.visible) {
                        if (sw.beforeCustomDraw) sw.customDraw(g, activeScreen);
                        if (sw.normalDrawEnable) {
                            let rx = sw.x;
                            let ry = sw.y;
                            let rf = true;
                            if (Boolean(g.viewport)) {
                                let rs = g.viewport.viewtoReal(rx, ry);
                                rx = rs.x;
                                ry = rs.y;
                                rf = rs.in;
                            }
                            if (rf) {
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
        };
        //priorityBufferControl
        //表示プライオリティ制御
        /**
         * @description
         * スプライトの描画優先順位を制御するための内部ユーティリティです。<br>\
         * 登録されたスプライトを`priority`プロパティに基づいてソートし、<br>\
         * 奥から手前への正しい順序で描画できるようにします。
         */
        function priorityBuffer() {
            // .Priorityでソートして表示
            // 0が一番奥で大きい方が手前に表示される(allDrawSpriteにて有効)
            let inbuf = [];
            this.add = (obj) => { inbuf.push(obj); };
            this.sort = () => { inbuf.sort((a, b) => a.priority - b.priority); };
            this.buffer = () => { return inbuf; };
            this.reset = () => { inbuf = []; };
        }
    }
}// GameSpriteFontControl
//
/**
 * GameSpriteFontControl
 * @description
 * スプライトシートとして用意されたビットマップフォントを利用して<br>\
 * 文字を画面に描画する機能を提供します。<br>\
 * 指定されたフォントパターンと描画先スクリーンを使用して、<br>\
 * テキスト表示を実現します。
 */
class GameSpriteFontControl {
    /**
     * PCGpatternMap
     * @typedef {object} FontParam スプライトフォント設定パラメータ 
     * @property {string} name フォントID
     * @property {ImageAssetIdA} id 使用するイメージアセットID
     * @property {number} pattern[].x 切り取り開始位置X
     * @property {number} pattern[].y 切り取り開始位置Y
     * @property {number} pattern[].w 文字幅
     * @property {number} pattern[].h 文字高さ
     */
    /**
     * @param {GameCore} g GameCoreインスタンス
     * @param {FontParam} fontParam　フォント設定パラメータ 
     * @example
     * //フォント設定パラメータ
     * //(ascii code [space]～[~]まで）
     * const fontParam = {
     * 	name: fontID
     * 	id: 使用するassetImageのID
     *  	pattern: [
     * 		{x: ,y: ,w: ,h: ], //space
     * 			|
     * 		{x: ,y: ,w: ,h: ] //~
     * 	    ]
     * }
     */
    constructor(g, fontParam) {

        let buffer_ = g.screen[0].buffer;
        //buffer  (offScreen)
        /**
         * @method
         * @param {number} num スクリーン番号
         * @description
         * ビットマップフォントの描画に使用するスクリーンバッファを選択します。
         */
        this.useScreen = function (num) {

            buffer_ = g.screen[num].buffer;
        };

        let tex_c = fontParam.Image;
        let sp_ch_ptn = fontParam.pattern;

        //表示位置はx,yが左上となるように表示されます。拡大するとずれます。
        //    this.putchr = chr8x8put;
        /**
         * @method
         * @param {string} str 表示文字列(ASCII)
         * @param {number} x 座標
         * @param {number} y 座標
         * @param {number} z 拡大率
         * @description
         * 指定された文字列の各文字を、定義されたスプライトフォントパターンを用いて描画します。<br>\
         * 文字列、X座標、Y座標、そして任意の拡大率を指定することで、<br>\
         * 文字をカスタマイズして表示できます。
         */
        this.putchr = function (str, x, y, z) {
            //    dummy = function (str, x, y, z) {
            let zflag = false;

            if (!Boolean(z)) {
                z = 1.0;

            } else {
                if (z != 1.0) zflag = true;
            }

            for (let i = 0, loopend = str.length; i < loopend; i++) {
                let n = str.charCodeAt(i);

                if ((n >= 32) && (n < 128)) { // space ～ "~" まで
                    let d = sp_ch_ptn[n - 32];

                    let wx = x + i * (d.w * z);
                    let wy = y;
                    if (zflag) {
                        wx += (-d.w / 2) * z;
                        wy += (-d.h / 2) * z;
                    }

                    buffer_.drawImgXYWHXYWH(
                        tex_c,
                        d.x, d.y, d.w, d.h,
                        wx, wy,
                        d.w * z, d.h * z
                    );
                }
            }
            //
        };

    }
}

//viewport
//x, y, w, h
//repeat  //折り返し表示の有無　overflow してる場合反対側に表示するか
//size(w,h);//
//repeat(mode);
//setPos(px,py);実座標をスプライト座標としてviewportの左上をどこに置くか指定
//viewtoReal(x,y)ビューポート変換後の画面表示座標
//（スプライト座標！＝画面表示座標とする処理
//戻り値｛x:,y:表示座標,in:(true:表示範囲内(false:表示範囲外)}
//スプライト座標！＝画面表示座標とする処理\
//ワールド座標系として管理して表示する場合\
//これを通してビューポート内にあるスプライトのみ表示する
/**
 * @class
 * @classdesc
 * ワールド座標系と実際の画面表示座標系の変換を管理するクラスです。<br>\
 * ゲーム内のスプライトがどの位置にあり、画面のどこに表示されるべきか、<br>\
 * また、表示範囲内にあるかどうかの判定を行います。
*/
class viewport {

    /**
     * homeposition x (leftup)
     * @type {number}
     * @description
     * ワールド座標系におけるビューポート（左上）の水平基準位置
     */
    x;
    /**
     * homeposition y (leftup)
     * @type {number}
     * @description
     * ワールド座標系におけるビューポート（左上）の垂直基準位置
     */
    y;
    /**
     * viewport size width
     * @type {number}
     * @description
     * ビューポートの表示領域幅
     */
    w;
    /**
     * viewport size height
     * @type {number}
     * @description
     * ビューポートの表示領域高さ
     */
    h;
    /**
     * border size x 
     * @type {number}
     * @description
     * ビューポート周囲の余白幅
     */
    bmw;
    /**
     * border size y
     * @type {number}
     * @description
     * ビューポート周囲の余白高さ
     */
    bmh;

    /**
     * @constructor
    */
    constructor() {

        let x_, y_, w_, h_, bmw_, bmh_, repeat_ = true;
        x_ = 0; y_ = 0, bmw_ = 0, bmh_ = 0;

        this.x = 0;
        this.y = 0;
        this.w = w_;
        this.h = h_;
        this.bmw = bmw_;
        this.bmh = bmh_;

        const update = () => {
            this.x = x_;
            this.y = y_;
            this.w = w_;
            this.h = h_;
            this.bmw = bmw_;
            this.bmh = bmh_;
        }

        /**
         * Repeat Mode Enable
         * @method 
         * @param {boolean} [mode=true] 有効/無効
         * @description
         * ビューポートの繰り返しモードを有効/無効にします。<br>\
         * このモードが`true`の場合、画面外に出たオブジェクトが反対側から現れるように<br>\
         * 座標が折り返して計算されます。
         */
        this.repeat = function (mode = true) {
            repeat_ = mode;
        };
        /**
         * Set viewport size 
         * @method 
         * @param {number} w 表示領域幅 
         * @param {number} h 表示領域高さ
         * @description
         * ビューポートの表示領域の幅と高さを設定します。<br>\
         * 通常、これはゲームの実際の画面解像度に合わせて設定され、<br>\
         * 表示可能な範囲を定義します。
         */
        this.size = function (w, h) {
            w_ = w; h_ = h;
            update();
        };
        /**
         * SetHomePotition
         * @method 
         * @param {number} x 基準位置X
         * @param {number} y 基準位置Y
         * @description
         * ワールド座標系におけるビューポートの基準位置（左上）を設定します。<br>\
         * この位置を移動させることで、ゲームの世界をスクロールさせたり<br>\
         * カメラの視点を変更したりできます。
         */
        this.setPos = function (x, y) {
            x_ = x; y_ = y;
            update();
        };

        /**
         * set border margin
         * @method
         * @param {number} w 余白幅
         * @param {number} h 余白高さ
         * @description
         * 表示範囲の判定に使用する、ビューポート周囲の余白を設定します。<br>\
         * オブジェクトがこの余白範囲から外に出るまで<br>\
         * ビューポート内に存在すると判定されます。
         */
        this.border = function (w, h) {
            bmw_ = w; bmh_ = h;
            update();
        };

        /**
         * viewport.viewtoReal Result
         * @typedef {object} viewportResult チェック結果
         * @property {number} x 表示領域内での座標X
         * @property {number} y 表示領域内での座標Y
         * @property {boolean} in 表示領域内+余白の中かどうか
         * @description ワールド座標から実画面座標に変換
         */
        /**
         * in viewport check and positionConvert
         * @method
         * @param {number} sx ワールド座標X
         * @param {number} sy ワールド座標Y
         * @returns {viewportResult}
         * @description 
         * ワールド座標を実際の画面表示座標に変換し、ビューポート内にあるかを判定します。<br>\
         * スプライトなどのワールド座標をこのメソッドに通すことで、<br>\
         * 正しい画面上の位置と表示可否の情報を取得できます。
        */
        this.viewtoReal = function (sx, sy) {
            let rx = sx + x_;
            let ry = sy + y_;
            let f = false;

            if (repeat_) { // repeat true;
                if (rx < 0) rx = w_ + rx;
                if (rx > w_) rx = rx % w_;
                if (ry < 0) ry = h_ + ry;
                if (ry > h_) ry = ry % h_;
            }

            f = (rx + bmw_ < 0 || rx > w_ + bmw_ || ry + bmh_ < 0 || ry > h_ + bmh_) ? false : true;

            //console.log("x" + x_ + ",y" + y_ + ",w" + w_);
            return { x: rx, y: ry, in: f };
        };

    }
}