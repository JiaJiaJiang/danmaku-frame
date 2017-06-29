/*
Copyright luojia@luojia.me
LGPL license
*/
'use strict';

import ResizeSensor from '../lib/ResizeSensor.js';
class DanmakuFrame{
	constructor(container){
		const F=this;
		F.container=container||document.createElement('div');
		F.rate=1;
		F.timeBase=F.width=F.height=F.fps=0;
		F.fpsTmp=0;
		F.fpsRec=F.fps||60;
		F.media=null;
		F.working=false;
		F.enabled=true;
		F.modules={};//constructed module list
		//F.moduleList=[];
		const style=document.createElement("style");
		document.head.appendChild(style);
		F.styleSheet=style.sheet;
		

		setTimeout(()=>{//container size sensor
			F.container.ResizeSensor=new ResizeSensor(F.container,()=>{
				F.resize();
			});
			F.resize();
		},0);
		setInterval(()=>{
			F.fpsRec=F.fpsTmp;
			F.fpsTmp=0;
		},1000);
		F.draw=F.draw.bind(F);
	}
	enable(name){
		if(!name){
			this.enabled=true;
			if(this.media){
				this.media.paused||this.start();
			}else{
				this.start();
			}
			this.container.hidden=false;
			return;
		}
		let module=this.modules[name]||this.initModule(name);
		if(!module)return false;
		module.enabled=true;
		module.enable&&module.enable();
		return true;
	}
	disable(name){
		if(!name){
			this.pause();
			this.moduleFunction('clear');
			this.enabled=false;
			this.container.hidden=true;
			return;
		}
		let module=this.modules[name];
		if(!module)return false;
		module.enabled=false;
		module.disable&&module.disable();
		return true;
	}
	addStyle(s){
		if(typeof s === 'string')s=[s];
		if(s instanceof Array === false)return;
		s.forEach(r=>this.styleSheet.insertRule(r,this.styleSheet.cssRules.length));
	}
	initModule(name,arg){
		if(this.modules[name]){
			console.warn(`The module [${name}] has already inited.`);
			return this.modules[name];
		}
		let mod=DanmakuFrame.availableModules[name];
		if(!mod)throw('Module ['+name+'] does not exist.');
		let module=new mod(this,arg);
		if(module instanceof DanmakuFrameModule === false)
			throw('Constructor of '+name+' is not extended from DanmakuFrameModule');
		this.modules[name]=module;
		console.debug(`Mod Inited: ${name}`);
		return module;
	}
	set time(t){//current media time (ms)
		this.media||(this.timeBase=Date.now()-t);
		this.moduleFunction('time',t);//let all mods know when the time be set
	}
	get time(){
		return this.media?(this.media.currentTime*1000)|0:(Date.now()-this.timeBase);
	}
	draw(force){
		if(!this.working)return;
		this.fpsTmp++;
		this.moduleFunction('draw',force);
		if(this.fps===0){
			requestAnimationFrame(()=>this.draw());
		}else{
			setTimeout(this.draw,1000/this.fps);
		}
	}
	load(...danmakuObj){
		this.moduleFunction('load',...danmakuObj);
	}
	loadList(danmakuArray){
		this.moduleFunction('loadList',danmakuArray);
	}
	unload(danmakuObj){
		this.moduleFunction('unload',danmakuObj);
	}
	start(){
		if(this.working||!this.enabled)return;
		this.working=true;
		this.moduleFunction('start');
		this.draw(true);
	}
	pause(){
		if(!this.enabled)return;
		this.working=false;
		this.moduleFunction('pause');
	}
	resize(){
		this.width=this.container.offsetWidth;
		this.height=this.container.offsetHeight;
		this.moduleFunction('resize');
	}
	moduleFunction(name,...arg){
		let m;
		for(let n in this.modules){
			m=this.modules[n];
			if(m.enabled&&m[name])m[name](...arg);
		}
	}
	setMedia(media){
		const F=this;
		F.media=media;
		addEvents(media,{
			playing:()=>F.start(),
			'pause,stalled,seeking,suspend':()=>F.pause(),
			ratechange:()=>{
				F.rate=F.media.playbackRate;
				F.moduleFunction('rate',F.rate);
			},
		});
		F.moduleFunction('media',media);
	}
	static addModule(name,module){
		if(name in this.availableModules){
			console.warn('The module "'+name+'" has already been added.');
			return;
		}
		this.availableModules[name]=module;
	} 
}

DanmakuFrame.availableModules={};

class DanmakuFrameModule{
	constructor(frame){
		this.frame=frame;
		this.enabled=false;
	}
}
function addEvents(target,events={}){
	for(let e in events)e.split(/\,/g).forEach(e2=>target.addEventListener(e2,events[e]));
}

export {DanmakuFrame,DanmakuFrameModule,ResizeSensor}