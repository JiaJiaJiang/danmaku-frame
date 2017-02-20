/*
Copyright luojia@luojia.me
LGPL license
*/
import ResizeSensor from '../lib/ResizeSensor.js';

'use strict';
class DanmakuFrame{
	constructor(container){
		this.container=container||document.createElement('div');
		this.container.id='danmaku_container';
		this.rate=1;
		this.timeBase=0;
		this.media=null;
		this.fps=30;
		this.working=false;
		this.modules={};//constructed module list
		for(let m of DanmakuFrame.moduleList)//init all modules
			this.initModule(m[0]);
		setTimeout(()=>{//container size sensor
			this.container.ResizeSensor=new ResizeSensor(this.container,()=>{
				this.resize();
			});
		},0);
		
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
	initModule(name){
		let mod=DanmakuFrame.moduleList.get(name);
		if(!mod)throw('Module ['+name+'] does not exist.');
		let module=new mod(this);
		if(module instanceof DanmakuFrameModule === false)
			throw('Constructor of '+name+' is not extended from DanmakuFrameModule');
		module.enabled=true;
		this.modules[name]=module;
		return true;
	}
	set time(t){//current media time (ms)
		this.media||(this.timeBase=Date.now()-t);
		this.moduleFunction('time',t);//let all mods know when the time be set
	}
	get time(){
		return this.media?this.media.currentTime*1000000:(Date.now()-this.timeBase);
	}
	load(danmakuObj){
		this.moduleFunction('load');
	}
	loadList(danmakuArray){
		this.moduleFunction('loadList',danmakuArray);
	}
	unload(danmakuObj){
		this.moduleFunction('unload',danmakuObj);
	}
	start(){
		this.working=true;
		this.moduleFunction('start');
		this.draw();
	}
	pause(){
		this.working=false;
		this.moduleFunction('pause');
	}
	stop(){
		this.working=false;
		this.moduleFunction('stop');
	}
	resize(){
		this.moduleFunction('resize');
	}
	moduleFunction(name,...arg){
		for(let m in this.modules)
			this.modules[m][name]&&this.modules[m][name](...arg);
	}
	draw(){
		if(this.working===false)return;
		if(this.fps===0){
			requestAnimationFrame(()=>{this.draw();});
		}else{
			setTimeout(()=>{this.draw();},1000/this.fps);
		}
		this.moduleFunction('draw');
	}
	setMedia(media){
		this.media=media;
	}
	static addModule(name,module){
		if(this.moduleList.has(name)){
			console.warn('The module "'+name+'" has already been added.');
			return;
		}
		this.moduleList.set(name,module);
	} 
}

DanmakuFrame.moduleList=new Map();

class DanmakuFrameModule{
	constructor(frame){
		this.frame=frame;
		this.enabled=false;
	}
	/*enable(){}
	disable(){}
	load(){}
	frame(){}
	time(){}
	start(){}
	pause(){}
	stop(){}*/
}

export {DanmakuFrame,DanmakuFrameModule}