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

