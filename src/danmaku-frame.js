/*
Copyright luojia@luojia.me
LGPL license
*/
'use strict';

import ResizeSensor from '../lib/ResizeSensor.js';
class DanmakuFrame{
	constructor(container){
		this.container=container||document.createElement('div');
		this.rate=1;
		this.timeBase=this.width=this.height=this.fps=0;
		this.media=null;
		this.working=false;
		this.modules={};//constructed module list
		this.moduleList=[];
		const style=document.createElement("style");
		document.head.appendChild(style);
		this.styleSheet=style.sheet;
		
		for(let m in DanmakuFrame.moduleList){//init all modules
			this.initModule(m)
		}

		setTimeout(()=>{//container size sensor
			this.container.ResizeSensor=new ResizeSensor(this.container,()=>{
				this.resize();
			});
			this.resize();
		},0);
		this.draw=this.draw.bind(this);
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
		this.moduleFunction('draw',force);
		if(this.fps===0){
			requestAnimationFrame(this.draw);
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
			if(m[name]&&m.enabled)m[name](arg);
		}
	}
	setMedia(media){
		this.media=media;
		addEvents(media,{
			playing:()=>this.start(),
			pause:()=>this.pause(),
			ratechange:()=>this.rate=this.media.playbackRate,
		});
		this.moduleFunction('media',media);
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