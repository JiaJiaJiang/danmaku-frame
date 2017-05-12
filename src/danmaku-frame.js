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
		F.modules={};//constructed module list
		F.moduleList=[];
		const style=document.createElement("style");
		document.head.appendChild(style);
		F.styleSheet=style.sheet;
		
		for(let m in DanmakuFrame.moduleList){//init all modules
			F.initModule(m)
		}

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
		let module=this.modules[name];
		if(!module)return this.initModule(name);
		module.enabled=true;
		module.enable&&module.enable();
		return true;
	}
	disable(name){
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
	initModule(name){
		let mod=DanmakuFrame.moduleList[name];
		if(!mod)throw('Module ['+name+'] does not exist.');
		let module=new mod(this);
		if(module instanceof DanmakuFrameModule === false)
			throw('Constructor of '+name+' is not extended from DanmakuFrameModule');
		module.enabled=true;
		this.modules[name]=module;
		this.moduleList.push(name);
		console.debug(`Mod Inited: ${name}`);
		return true;
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
	load(danmakuObj){
		this.moduleFunction('load',danmakuObj);
	}
	loadList(danmakuArray){
		this.moduleFunction('loadList',danmakuArray);
	}
	unload(danmakuObj){
		this.moduleFunction('unload',danmakuObj);
	}
	start(){
		if(this.working)return;
		this.working=true;
		this.moduleFunction('start');
		this.draw(true);
	}
	pause(){
		this.working=false;
		this.moduleFunction('pause');
	}
	resize(){
		this.width=this.container.offsetWidth;
		this.height=this.container.offsetHeight;
		this.moduleFunction('resize');
	}
	moduleFunction(name,arg){
		for(let i=0,m;i<this.moduleList.length;i++){
			m=this.modules[this.moduleList[i]];
			if(m.enabled&&m[name])m[name](arg);
		}
	}
	setMedia(media){
		const F=this;
		F.media=media;
		addEvents(media,{
			playing:()=>F.start(),
			pause:()=>F.pause(),
			ratechange:()=>{
				F.rate=F.media.playbackRate;
				F.moduleFunction('rate',F.rate);
			},
		});
		F.moduleFunction('media',media);
	}
	static addModule(name,module){
		if(name in this.moduleList){
			console.warn('The module "'+name+'" has already been added.');
			return;
		}
		this.moduleList[name]=module;
	} 
}

DanmakuFrame.moduleList={};

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