//InputKeyboard
/**
 * InputKeyboard
 * キーボード入力管理
 * @description
 * 入力値の確認にkeyCodeを利用しているが
 * keyCodeを利用しているがMDNで非推奨となっていたのでcodeでの処理も追加
 * @see https://developer.mozilla.org/ja/docs/Web/API/KeyboardEvent
 *///
class inputKeyboard {
    /**
     * @param {boolean} codesupportmode select keyCode/code(null=keyCode mode)
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

        const keymap = [];

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
         * @returns {Array} key status array
         * @example
         * {keycode:true, keycode:false, ..}
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
         * @returns {Array} key status array
         * @example
         * {keycode:true, keycode:false, ..}
         */
        this.state = function () {

            return keymap;
        };

        /**
         * keyCode指定して対象キーの状態を確認する
         * @param {number} keycode キーコード
         * @returns {boolean} キーの状態(true:on/false:off)
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

