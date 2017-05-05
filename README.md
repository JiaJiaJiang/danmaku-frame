# danmaku-frame
弹幕框架

# 加载框架
```javascript
import DanmakuFrame from 'danmaku-frame.js'
```

## Class DanmakuFrame([container])
* container(可选) : (HTMLElement)放置弹幕框架的元素，若不定义将会创建一个新的`div`。

### static addModule(name,class)
添加模块

* name : (string)模块名
* class : (class)模块类

添加模块需要在`DanmakuFrame`被`new`出来之前进行。

### .enable(name)   
启用模块

* name : (string)模块名

### .disable(name)
禁用模块

* name : (string)模块名

### .addStyle(cssText)
在框架中添加一条css样式

* cssText : (string)要添加的css样式字符串，如`.poi{cursor:pointer)`

### .draw(force)
执行各模块的`draw`方法

 * force : (boolean)是否进行强制绘制。具体行为见具体模块的`draw`方法。

此方法一旦执行一次后将会根据本类`fps`属性自动定时执行，直到本类的`working`属性变为`false`(被暂停了)

### .load(danmakuObj)
加载一个弹幕对象

* danmakuObj : (object)弹幕对象

此方法会调用各模块的`load`方法并传递这个object，具体模块是否接受或如何处理，见各模块。

### .loadList(danmakuArray)
加载一个弹幕对象列表

* danmakuArray : (array)存放弹幕对象的数组

此方法会为数组中的每一个对象调用`load`函数。

### .unload(danmakuObj)
卸载一个弹幕对象

* danmakuObj : (object)弹幕对象

此方法会调用各模块的`unload`方法并传递这个object，具体模块是否接受或如何处理，见各模块。

### .start()
开始运行

此方法会调用各模块的`start`方法，具体行为见各模块。

随后会调用一次`draw`方法。

### .pause()
暂停运行

此方法会调用各模块的`pause`方法，具体行为见各模块。

### .resize()
重置框架尺寸

此方法会调用各模块的`resize`方法，具体行为见各模块。

### .moduleFunction(name,arg)
调用各模块中的对应函数

* name : (string)函数名
* arg : 函数参数

### .setMedia(media)
绑定媒体对象(audio,video)

* media : 媒体对象

此方法会监听一些媒体事件来协调完成本框架的基本功能。

此方法会调用各模块的`media`方法，具体行为见各模块。

### .container
(HTMLElement)放置弹幕框架的元素

### .fps
(number)框架调用draw方法的频率，如果为0即由`requestAnimationFrame`决定

### .width .height
(number)框架的宽高

### .rate
(number)速率

### .media
(object)媒体对象

### .working
(boolean)框架是否正在工作

### .modules
(object)已加载的模块

### .styleSheet
(CSSStyleSheet)样式表对象

### getter time
(number)如果有媒体对象，即为媒体对象`currentTime`的值，否则为框架时间重置后的时间偏移量。单位：毫秒。

### setter time
如果没有媒体对象，将以此重置框架时间基准。对此属性赋值将会调用各模块的`time`函数，参数为此值。

# 新建模块
```javascript
import DanmakuFrameModule from 'danmaku-frame.js'
class mod extends DanmakuFrameModule{
    constructor(frame){
	    super(frame);
	    //...
	}
}
```

### .frame
(object)此模块属于的弹幕框架对象

# 加载模块
```javascript
DanmakuFrame.addModule(模块名,mod)
```