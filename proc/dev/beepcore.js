function Beepcore(){

  const wave = ["sine", "square", "sawtooth", "triangle"];

  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  //const ctx = new AudioContext();

  let masterVolume = 0.2;
  let oscwavetype = wave[0];
  let lfo = null;

  let noteList = [];

  function noteClass(){

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
    this.busy = false;  //playで譜面があるうちはbusy/譜面終了したらfalse;    

    const noteTable = Table();
    
    this.init = function(Freq=440, osc_wavetype="sine", lfop=null, mVol = 0.2){
    //  lfo param = {Freq:0, wavetype:"none", depth:0};

      masterVolume = mVol;

      osc.type = osc_wavetype;
      osc.frequency.value = Freq;
  
      if (lfop !== null){
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
    }

    this.on = function(volume=1, delay=0){
      gainNode.gain.value = volume*masterVolume;
      osc.start(delay);
    }

    this.changeVol = function(volume=1){
      gainNode.gain.value = volume*masterVolume;
    }

    this.changeFreq = function(Freq){
      osc.frequency.value = Freq;
    }

    this.off = function(dur){
      osc?.stop(dur);
      this.living = false;
    }

    this.suspend = function(){
      gainNode.gain.value = 0;
      osc.frequency.value = 0;
    }

    this.play = function(setList, now){

      noteList = setList;
      //[{note:"A4", Freq:0, Vol:0, time:0, use:false} ..]
      for (let i in noteList){
        if (Boolean(noteList[i].name)){
          noteList[i].Freq = nameToFreq(noteList[i].name);
        }
      }
      starttime = now;
      this.busy = true;

      function nameToFreq(name){

        let Freq = 0;
        for (let i in noteTable){
          if (name == noteTable[i].name){
            Freq = noteTable[i].Freq;
            break;
          }
        }
        return Freq;
      }
    }

    this.step = function(now){
      let c=0;// not use note count
      let st=0;// playstart time on note
      let et=0;// play end time on note
      for (let i in noteList){
        let n = noteList[i];
        et += n.time;
        let pt = now - starttime;
        if (!n.use){
          if ((st < pt)&&(et > pt)){
            this.changeVol(n.Vol);
            this.changeFreq(n.Freq);
            n.use = true;
          }
          c++
        }
        st = et;
      }
      if (c==0){
        this.suspend();
        noteList = [];
        this.busy = false;
        //演奏終了
      }
    }

    function Table(){

      const notetable=[
          {name:"A0",Freq:27.5}
          ,{name:"A#0",Freq:29.135}
          ,{name:"B0",Freq:30.868}
          ,{name:"C1",Freq:32.703}
          ,{name:"C#1",Freq:34.648}
          ,{name:"D1",Freq:36.708}
          ,{name:"D#1",Freq:38.891}
          ,{name:"E1",Freq:41.203}
          ,{name:"F1",Freq:43.654}
          ,{name:"F#1",Freq:46.249}
          ,{name:"G1",Freq:48.999}
          ,{name:"G#1",Freq:51.913}
          ,{name:"A1",Freq:55}
          ,{name:"A#1",Freq:58.27}
          ,{name:"B1",Freq:61.735}
          ,{name:"C2",Freq:65.406}
          ,{name:"C#2",Freq:69.296}
          ,{name:"D2",Freq:73.416}
          ,{name:"D#2",Freq:77.782}
          ,{name:"E2",Freq:82.407}
          ,{name:"F2",Freq:87.307}
          ,{name:"F#2",Freq:92.499}
          ,{name:"G2",Freq:97.999}
          ,{name:"G#2",Freq:103.826}
          ,{name:"A2",Freq:110}
          ,{name:"A#2",Freq:116.541}
          ,{name:"B2",Freq:123.471}
          ,{name:"C3",Freq:130.813}
          ,{name:"C#3",Freq:138.591}
          ,{name:"D3",Freq:146.832}
          ,{name:"D#3",Freq:155.563}
          ,{name:"E3",Freq:164.814}
          ,{name:"F3",Freq:174.614}
          ,{name:"F#3",Freq:184.997}
          ,{name:"G3",Freq:195.998}
          ,{name:"G#3",Freq:207.652}
          ,{name:"A3",Freq:220}
          ,{name:"A#3",Freq:233.082}
          ,{name:"B3",Freq:246.942}
          ,{name:"C4",Freq:261.626}
          ,{name:"C#4",Freq:277.183}
          ,{name:"D4",Freq:293.665}
          ,{name:"D#4",Freq:311.127}
          ,{name:"E4",Freq:329.628}
          ,{name:"F4",Freq:349.228}
          ,{name:"F#4",Freq:369.994}
          ,{name:"G4",Freq:391.995}
          ,{name:"G#4",Freq:415.305}
          ,{name:"A4",Freq:440}
          ,{name:"A#4",Freq:466.164}
          ,{name:"B4",Freq:493.883}
          ,{name:"C5",Freq:523.251}
          ,{name:"C#5",Freq:554.365}
          ,{name:"D5",Freq:587.33}
          ,{name:"D#5",Freq:622.254}
          ,{name:"E5",Freq:659.255}
          ,{name:"F5",Freq:698.456}
          ,{name:"F#5",Freq:739.989}
          ,{name:"G5",Freq:783.991}
          ,{name:"G#5",Freq:830.609}
          ,{name:"A5",Freq:880}
          ,{name:"A#5",Freq:932.328}
          ,{name:"B5",Freq:987.767}
          ,{name:"C6",Freq:1046.502}
          ,{name:"C#6",Freq:1108.731}
          ,{name:"D6",Freq:1174.659}
          ,{name:"D#6",Freq:1244.508}
          ,{name:"E6",Freq:1318.51}
          ,{name:"F6",Freq:1396.913}
          ,{name:"F#6",Freq:1479.978}
          ,{name:"G6",Freq:1567.982}
          ,{name:"G#6",Freq:1661.219}
          ,{name:"A6",Freq:1760}
          ,{name:"A#6",Freq:1864.655}
          ,{name:"B6",Freq:1975.533}
          ,{name:"C7",Freq:2093.005}
          ,{name:"C#7",Freq:2217.461}
          ,{name:"D7",Freq:2349.318}
          ,{name:"D#7",Freq:2489.016}
          ,{name:"E7",Freq:2637.02}
          ,{name:"F7",Freq:2793.826}
          ,{name:"F#7",Freq:2959.955}
          ,{name:"G7",Freq:3135.963}
          ,{name:"G#7",Freq:3322.438}
          ,{name:"A7",Freq:3520}
          ,{name:"A#7",Freq:3729.31}
          ,{name:"B7",Freq:3951.066}
          ,{name:"C8",Freq:4186.009}
      ];
      
      return notetable;
    }
  }

  this.createNote = function(Freq){

    let note = new noteClass();
    note.init(Freq, oscwavetype, lfo, masterVolume);
    noteList.push(note);
    //console.log(noteList.length);
    
    return note;  
  }

  this.oscSetup = function(wavetype){
    oscwavetype = wave[wavetype];
  }

  this.lfoSetup = function(Freq, wavetype, depth){
    lfo = {Freq: Freq, wavetype:wave[wavetype], depth:depth};
  }

  this.lfoReset = function(){lfo = null};

  this.masterVolume = function(vol = 0.2){
    masterVolume = vol;
  }
  //Taskstep 
  this.step = function(now){
    for (let i in noteList){
      if (noteList[i].living){
        noteList[i].step(now);
      }else{
        noteList.splice(i,1);
      }
    }
  } 

  //Utility  
  this.makeScore = function( namelist, time=100, vol=1){
    //namelist  exmpl. ["G5","C6","E6","C6","D6","G6"];
    let sc = [];
    for (let i in namelist){
        let n = {name:namelist[i],Freq:0,Vol:vol,time:time,use:false};
        sc.push(n);
    }
    sc.push({Freq:0, Vol:0, time:100, use:false});

    return sc;
  }
}

