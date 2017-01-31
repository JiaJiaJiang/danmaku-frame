/*
Copyright luojia@luojia.me
LGPL license
*/

'use strict';

class DanmakuFrame{
	constructor(canvas){
		if(canvas && (canvas instanceof HTMLCanvasElement === false))
			throw('The first arg should be a canvas or empty');
		this.canvas=canvas||document.createElement('canvas');//the canvas
		this.context2d=this.canvas.getContext('2d');//the canvas context
		this.COL=new CanvasObjLibrary(this.canvas);//the library

		this.rate=1;
		this.timeBase=0;
		this.modules={};//constructed module list
		for(let m of DanmakuFrame.moduleList){//install all modules
			this.install(m[0]);
		}
	}
	enable(name){
		let module=this.modules[name];
		if(!module)return this.install(name);
		module.enabled=true;
		module.enable();
		return true;
	}
	disable(name){
		let module=this.modules[name];
		if(!module)return false;
		module.enabled=false;
		module.disable();
		return true;
	}
	install(name){
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
		this.timeBase=Date.now()-t;
	}
	get time(){
		return Date.now()-this.timeBase;
	}
	load(danmakuObj){
		for(let m in this.modules)
			this.modules[m].load(danmakuObj);
	}
	unload(danmakuObj){
		for(let m in this.modules)
			this.modules[m].unload(danmakuObj);
	}
	draw(){
		
	}
	FPS(fps){
		if(fps===0){

		}
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
	load(){}
	enable(){}
	disable(){}
}