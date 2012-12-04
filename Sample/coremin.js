function GameBGmapControl(){}function DisplayControl(d,h,g){var a=new offScreen;this.buffer=a;var f;this.spImage=function(a){f=a};var e;this.fontImage=function(a){e=a};var i=[],b=document.getElementById(d);b.width=h;b.height=g;var c=b.getContext("2d");this.cw=b.width;this.ch=b.height;c.font="16px 'Arial'";this.lighter_enable=true;this.putPattern=function(c,b,f,g,e,d){a.drawImgXYWHXYWH(c,b.x,b.y,b.w,b.h,f,g,e,d)};this.setBgPattern=function(a){bg_ptn=a};this.print=function(c,d,e,b){if(!Boolean(b))b="limegreen";a.fillText(c,d,e,b)};this.putImage=function(b,c,d){a.drawImgXY(b,c,d)};this.putImage2=function(b,e,f,d,c){a.drawImgXYWH(b,e,f,d,c)};this.putImageTransform=function(f,g,h,b,c,d,e){a.putImageTransform(f,g,h,b,c,d,e)};this.transform=function(b,c,d,e){a.Transform(b,c,d,e,0,0)};this.putFunc=function(b){a.putFunc(b)};this.clear=function(c){a.allClear(0,0,b.width,b.height);Boolean(c)&&a.fillRect(0,0,b.width,b.height,c)};this.fill=function(e,f,d,c,b){a.fillRect(e,f,d,c,b)};this.reset=function(){a.reset()};this.draw=function(){a.draw(c)};this.count=function(){return a.count()}}function GameAssetManager(){var a=[];this.imageLoad=function(d,c){var b=new Image;b.src=c;b.ready=false;b.addEventListener("load",function(){this.ready=true});a[d]=b;return b};this.image=a;var b=[];this.soundLoad=function(e,d){var c=".mp3";if((new Audio).canPlayType("audio/ogg")=="maybe")c=".ogg";var a=new Audio(d+c);a.ready=false;a.addEventListener("loadeddata",function(){this.ready=true});b[e]=a;return a};this.sound=b;this.check=function(){var e="<br>";for(var c in a){var d=a[c].src.split("/",20);e+=c+" "+a[c].name+" "+d[d.length-1]+" "+(a[c].ready?"o":"x")+"<br>"}for(var c in b){var d=b[c].src.split("/",20);e+=c+" "+b[c].name+" "+d[d.length-1]+" "+(b[c].ready?"o":"x")+"<br>"}return e}}function GameCore(c){var k=60,a=0,g=Date.now();window.requestAnimationFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(d){a++;if(a>k){a=1;g=Date.now()}var c=g+Math.round(a*(1e3/k)),e=Date.now(),b=c-e;if(b<=0)b=1;setTimeout(d,b)}}();var b=false,e=new GameTaskControl(this),i=new GameAssetManager,m=new inputKeyboard,n=new inputMouse,d=[];for(var l in c){var f=c[l];d[l]=new DisplayControl(f.canvasId,f.resolution.w,f.resolution.h)}if(c.length>0)var o=d[0];var h=new GameSpriteControl(this),j=[];this.setSpFont=function(a){var b={Image:i.image[a.id],pattern:a.pattern},c=new GameSpriteFontControl(this,b);j[a.name]=c};var i=new GameAssetManager;document.getElementById("console").innerHTML="START GAME CORE";function p(){if(b){e.step();e.draw();requestAnimationFrame(arguments.callee)}}this.task=e;this.asset=i;this.keyboard=m;this.mouse=n;this.dsp=o;this.screen=d;this.sprite=h;this.font=j;h.useScreen(0);this.run=function(){b=true;requestAnimationFrame(p)};this.pause=function(){b=false}}function GameTaskControl(b){var a=[],d=0,c="";function e(){d=0;c="";for(var b in a){c+=b+" ";d++}}this.read=function(b){return a[b]};this.add=function(c){a[c.id]=c;c.init(b);e()};this.del=function(b){b.post();delete a[b.id];e()};this.init=function(c){a[c].init(b)};this.step=function(){for(var d in a){var c=a[d];if(!c.preFlag){c.pre(b);c.preFlag=true}c.enable&&c.step(b)}};this.draw=function(){for(var d in a){var c=a[d];c.visible&&c.draw(b)}};this.count=function(){return d};this.namelist=function(){return c}}function inputKeyboard(){var a=[];window.addEventListener("blur",function(){a=[]},false);window.addEventListener("keydown",function(b){a[b.keyCode]=true},false);window.addEventListener("keyup",function(b){a[b.keyCode]=false},false);this.check=function(){return a};this.state=function(){var b="";for(var c in a)b+="["+c+"]"+(a[c]?"*":".");return b}}function inputMouse(){var a={x:0,y:0,button:0,wheel:0},e=0,f=0,b=-1,d=0,c=document;c.addEventListener("mousemove",function(a){e=a.clientX;f=a.clientY},false);c.addEventListener("mousedown",function(a){b=a.button},false);c.addEventListener("mouseup",function(){b=-1},false);c.addEventListener("mousewheel",function(a){d=a.wheelDelta},false);c.addEventListener("DOMMouseScroll",function(a){d=a.detail},false);this.check=function(){a.x=e;a.y=f;a.button=b;a.wheel=d;if(b!=0)b=-1;d=0;return a};this.check_last=function(){return a}}function offScreen(){for(var j=1500,d=0,p=[],f=0;f<j;f++)p[f]=new b;var a=[],e=0;function c(){d++;if(d>=j)d=0;return p[d]}this.spPut=function(e,p,r,o,n,l,m,k,j,f,g,h,i,s,t,d,u){var b=c();b.img=e;b.sx=p;b.sy=r;b.sw=o;b.sh=n;b.dx=l;b.dy=m;b.dw=k;b.dh=j;b.m11=f;b.m12=g;b.m21=h;b.m22=i;b.tx=s;b.ty=t;b.alpha=d;b.r=u;b.mode=q;a[a.length]=b};this.drawImgXYWHXYWH=function(d,l,m,k,j,h,i,f,e){var b=c();b.img=d;b.sx=l;b.sy=m;b.sw=k;b.sh=j;b.dx=h;b.dy=i;b.dw=f;b.dh=e;b.mode=g;a[a.length]=b};this.fillText=function(e,f,g,d){if(!Boolean(d))d="limegreen";var b=c();b.text=e;b.sx=f;b.sy=g;b.color=d;b.mode=o;a[a.length]=b};this.drawImgXY=function(d,e,f){var b=c();b.img=d;b.sx=e;b.sy=f;b.mode=k;a[a.length]=b};this.drawImgXYWH=function(d,g,h,f,e){var b=c();b.img=d;b.sx=g;b.sy=h;b.sw=f;b.sh=e;b.mode=i;a[a.length]=b};this.putImageTransform=function(i,j,k,d,e,f,g){var b=c();b.img=i;b.tx=j;b.ty=k;b.m11=d;b.m12=e;b.m21=f;b.m22=g;b.mode=h;a[a.length]=b};this.transform=function(d,e,f,g){var b=c();b.m11=d;b.m12=e;b.m21=f;b.m22=g;b.mode=l;a[a.length]=b};this.putFunc=function(b){a[a.length]=b};this.allClear=function(f,g,e,d){var b=c();b.sx=f;b.sy=g;b.sw=e;b.sh=d;b.mode=m;a[a.length]=b};this.fillRect=function(g,h,f,e,d){var b=c();b.sx=g;b.sy=h;b.sw=f;b.sh=e;b.color=d;b.mode=n;a[a.length]=b};this.reset=function(){a=[];d=0};this.draw=function(d){for(var b=0,c=a.length;b<c;b++)a[b].draw(d);if(e<a.length)e=a.length};this.count=function(){return e};var r=0,q=1,g=2,i=3,k=4,o=5,h=6,l=7,m=8,n=9;function b(){this.img;this.text;this.sx;this.sy;this.sw;this.sh;this.dx;this.dy;this.dw;this.dh;this.color;this.m11;this.m12;this.m21;this.m22;this.tx;this.ty;this.alpha;this.r;this.mode}b.prototype.func=[];b.prototype.func[r]=function(){};b.prototype.func[q]=function(a){a.save();a.setTransform(this.m11,this.m12,this.m21,this.m22,this.tx,this.ty);this.r!=0&&a.rotate(Math.PI/180*this.r);if(this.alpha==255)a.globalCompositeOperation="source-over";else a.globalAlpha=this.alpha*(1/255);a.drawImage(this.img,this.sx,this.sy,this.sw,this.sh,this.dx,this.dy,this.dw,this.dh);a.restore()};b.prototype.func[g]=function(a){a.drawImage(this.img,this.sx,this.sy,this.sw,this.sh,this.dx,this.dy,this.dw,this.dh)};b.prototype.func[i]=function(a){a.drawImage(this.img,this.sx,this.sy,this.sw,this.sh)};b.prototype.func[k]=function(a){a.drawImage(this.img,this.sx,this.sy)};b.prototype.func[o]=function(a){a.fillStyle=this.color;a.fillText(this.text,this.sx,this.sy)};b.prototype.func[h]=function(a){a.save();a.setTransform(this.m11,this.m12,this.m21,this.m22,this.tx,this.ty);a.drawImage(this.img,0,0);a.restore()};b.prototype.func[l]=function(){};b.prototype.func[m]=function(a){a.save();a.setTransform(1,0,0,1,0,0);a.clearRect(this.sx,this.sy,this.sw,this.sh);a.restore()};b.prototype.func[n]=function(a){if(Boolean(this.color)){a.fillStyle=this.color;a.fillRect(this.sx,this.sy,this.sw,this.sh)}else a.clearRect(this.sx,this.sy,this.sw,this.sh)};b.prototype.draw=function(a){this.func[this.mode].call(this,a)}}function offScreenTypeB(d,c){var b=document.createElement("canvas");b.width=d;b.height=c;var a=b.getContext("2d");this.flip=function(c){c.putImageData(a.getImageData(0,0,b.width,b.height),0,0)};this.spPut=function(d,o,p,n,m,k,l,j,i,e,f,g,h,q,r,b,c){a.save();a.setTransform(e,f,g,h,q,r);c!=0&&a.rotate(Math.PI/180*c);if(b==255)a.globalCompositeOperation="source-over";else a.globalAlpha=b*(1/255);a.drawImage(d,o,p,n,m,k,l,j,i);a.restore()};this.drawImgXYWHXYWH=function(b,i,j,h,g,e,f,d,c){a.drawImage(b,i,j,h,g,e,f,d,c)};this.fillText=function(c,d,e,b){if(!Boolean(b))b="limegreen";a.fillStyle=b;a.fillText(c,d,e)};this.drawImgXY=function(b,c,d){a.drawImage(b,c,d)};this.drawImgXYWH=function(b,e,f,d,c){a.drawImage(b,e,f,d,c)};this.putImageTransform=function(b,g,h,c,d,e,f){a.save();a.setTransform(c,d,e,f,g,h);a.drawImage(b,0,0);a.restore()};this.transform=function(){};this.putFunc=function(b){b.draw(a)};this.allClear=function(d,e,c,b){a.save();a.setTransform(1,0,0,1,0,0);a.clearRect(d,e,c,b);a.restore()};this.fillRect=function(e,f,d,c,b){if(Boolean(b)){a.fillStyle=b;a.fillRect(e,f,d,c)}else a.clearRect(e,f,d,c)};this.reset=function(){};this.draw=function(a){this.flip(a)};this.count=function(){return 0}}function GameSpriteControl(d){var a=[],b=[],c;function e(){this.x=0;this.y=0;this.r=0;this.z=0;this.priority=0;this.collisionEnable=true;this.collision={w:0,h:0};this.id;this.count=0;this.pcnt=0;this.hit=[]}this.set=function(b,d,c,g,f){if(!Boolean(a[b]))a[b]=new e;a[b].id=d;a[b].count=0;a[b].pcnt=0;if(Boolean(c)){a[b].collisionEnable=true;a[b].collision={w:g,h:f}}else a[b].collisionEnable=false};this.pos=function(c,d,e){var b=a[c];b.x=d;b.y=e};this.useScreen=function(a){c=d.screen[a].buffer};this.put=function(h,e,g,i,j){var d=a[h];d.x=e;d.y=g;d.r=i;d.z=j;if(!Boolean(b[d.id]))c.fillText(h+" "+d.count,e,g);else{f(b[d.id].image,b[d.id].pattern[d.pcnt],e,g,i,j);d.count++;if(d.count>b[d.id].wait){d.count=0;d.pcnt++}if(d.pcnt>b[d.id].pattern.length-1)d.pcnt=0}};this.setPattern=function(c,a){b[c]={image:d.asset.image[a.image],wait:a.wait,pattern:a.pattern}};this.check=function(){};function f(f,a,g,h,e,b,d){if(!Boolean(e))e=a.r;if(!Boolean(d))d=255;if(!Boolean(b))b=1;var i=!a.fv&&!a.fh&&e==0&&d==255;if(i)c.drawImgXYWHXYWH(f,a.x,a.y,a.w,a.h,g+-a.w/2*b,h+-a.h/2*b,a.w*b,a.h*b);else{var k=a.fv?-1:1,j=a.fh?-1:1;c.spPut(f,a.x,a.y,a.w,a.h,-a.w/2*b,-a.h/2*b,a.w*b,a.h*b,j,0,0,k,g,h,d,e)}}}function GameSpriteFontControl(c,a){var b=c.screen[0].buffer;this.useScreen=function(a){b=c.screen[a].buffer};var e=a.Image,d=a.pattern;this.putchr=function(i,m,n,c){var h=false;if(!Boolean(c))c=1;else if(c!=1)h=true;for(var f=0,l=i.length;f<l;f++){var g=i.charCodeAt(f);if(g>=32&&g<128){var a=d[g-32],j=m+f*(a.w*c),k=n;if(h){j+=-a.w/2*c;k+=-a.h/2*c}b.drawImgXYWHXYWH(e,a.x,a.y,a.w,a.h,j,k,a.w*c,a.h*c)}}}}