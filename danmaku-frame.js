/*
Copyright luojia@luojia.me
*/

'use strict';

class DanmakuFrame{
	constructor(canvas){
		if(canvas && (canvas instanceof HTMLCanvasElement === false))
			throw('The first arg should be a canvas or empty');
		this.canvas=canvas||document.createElement('canvas');//the canvas
		this.context=this.canvas.getContext('2d');//the canvas context
		this.COL=new CanvasObjLibrary(this.canvas);//the library

		this.modules=new Map();//constructed module list
		for(let m of DanmakuFrame.moduleList){//install all modules
			this.install(m[0]);
		}
	}
	enable(name){
		let module=this.modules.get(name);
		if(module){
			module.enabled=true;
			module.enable();
			return true;
		}
		return this.install(name);
	}
	disable(name){
		let module=this.modules.get(name);
		if(!module)return false;
		module.enabled=false;
		module.disable();
		return true;
	install(name){
		let mod=DanmakuFrame.moduleList.get(name);
		if(!mod)throw('Module ['+name+'] does not exist.');
		let module=new mod(this);
		if(module instanceof DanmakuFrameModule === false)
			throw('Constructor of '+name+' is not extended from DanmakuFrameModule');
		module.enabled=true;
		this.modules.set(name,module);
		return true;
	}
	danmaku(danmakuObj){
		for(let m of this.modules)
			m[1].danmaku(danmakuObj);
	}
	static add(name,module){
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
	danmaku(){}
	enable(){}
	disable(){}
}