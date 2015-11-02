var centerStr = '当前中心点坐标：' + map.getCenter().getLng() + ',' + map.getCenter().getLat();


var newCenter = map.setFitView();
document.getElementById('centerCoord').innerHTML = '当前中心点坐标：' + newCenter.getCenter();


var point = map.setCenter(new AMap.LngLat(116.404, 39.915));
var marker = new AMap.Marker({
	icon:"http://webapi.amap.com/images/marker_sprite.png",  
	position:new AMap.LngLat(116.405467, 39.907761)
});
marker.setMap(map);  
map.setZoom(13);

map.setStatus({doubleClickZoom:true}); //双击放大

function updateMarker(){
	//自定义点标记内容   
	var markerContent = document.createElement("div");
	markerContent.className = "markerContentStyle";
    
	//点标记中的图标
	var markerImg = document.createElement("img");
    markerImg.className = "markerlnglat";
	markerImg.src = "http://webapi.amap.com/images/3.png";	
	markerContent.appendChild(markerImg);
	 
	//点标记中的文本
	var markerSpan = document.createElement("span");
	markerSpan.innerHTML = "Hi，我换新装备啦！";
	markerContent.appendChild(markerSpan);
	 
	marker.setContent(markerContent);//更新点标记内容
	marker.setPosition(new AMap.LngLat(116.391467,39.927761)); //更新点标记位置
}


//实例化点标记
function addMarker(){
	marker = new AMap.Marker({				  
		icon:"http://webapi.amap.com/images/marker_sprite.png",
		position:new AMap.LngLat(116.405467,39.907761)
	});
	marker.setMap(map);  //在地图上添加点
}


<input type="button" value="删除最近添加的点覆盖物" onClick="javascript:marker.setMap(null)"/>
<input type="button" value="清空所有覆盖物" onClick="javascript:map.clearMap()"/> 

//添加点标记
function addMarker(){
	var LngLatX = document.getElementById("lnglatX").value; //获取Lng值
	var LngLatY = document.getElementById("lnglatY").value; //获取Lat值
	marker = new AMap.Marker({				  
		icon: "http://webapi.amap.com/images/marker_sprite.png",
		position:new AMap.LngLat(LngLatX,LngLatY)
	});

	marker.setMap(map);  //在地图上添加点
	map.setFitView(); //调整到合理视野
}


var mapObj;
//初始化地图对象，加载地图
mapObj = new AMap.Map("mapContainer", {
	resizeEnable: true
});
//设置地图上默认鼠标样式
mapObj.setDefaultCursor("url(http://developer.amap.com/wp-content/uploads/2014/06/openhand.cur),pointer");
//通过地图的dragstart、dragging、dragend事件切换鼠标拖拽地图过程中的不同样式
AMap.event.addListener(mapObj,'dragstart',function(e){
	mapObj.setDefaultCursor("url(http://developer.amap.com/wp-content/uploads/2014/06/closedhand.cur),pointer");
});
AMap.event.addListener(mapObj,'dragging',function(e){
	mapObj.setDefaultCursor("url(http://developer.amap.com/wp-content/uploads/2014/06/closedhand.cur),pointer");
});
AMap.event.addListener(mapObj,'dragend',function(e){
	mapObj.setDefaultCursor("url(http://developer.amap.com/wp-content/uploads/2014/06/openhand.cur),pointer");
});

//在地图zoomchange事件中通过this指向当前操作的对象map，获取缩放级别
AMap.event.addListener(map,'zoomchange',function(e){
	document.getElementById('pane').innerHTML = this.getZoom();  
});



//事件回调函数
var callBackFn = function(e){
	document.getElementById("eventInfo").innerHTML = e.type+" : "+e.lnglat.getLng()+","+e.lnglat.getLat();
};

var clickEventListener = AMap.event.addListener(map,'click',callBackFn);
var mouseoutEventListener = AMap.event.addListener(map,'mouseout',callBackFn);
var mouseoverEventListener = AMap.event.addListener(map,'mouseover',callBackFn);	 


//移除地图的click事件的监听
function removeListener(){
	AMap.event.removeListener(clickEventListener);
}


<input type="button" value="打开信息窗体" onClick="javascript:openInfo()"/>  
//在指定位置打开信息窗体
function openInfo(){
	//构建信息窗体中显示的内容
    var info = []; 
	info.push("<div><div><img style=\"float:left;\" src=\" http://webapi.amap.com/images/autonavi.png \"/></div> "); 
	info.push("<div style=\"padding:0px 0px 0px 4px;\"><b>高德软件</b>");  
	info.push("电话 : 010-84107000   邮编 : 100102");  
	info.push("地址 : 北京市望京阜通东大街方恒国际中心A座16层</div></div>");  
      
	infoWindow = new AMap.InfoWindow({  
		content:info.join("<br/>")  //使用默认信息窗体框样式，显示信息内容
	}); 
	infoWindow.open(map, new AMap.LngLat(116.480983,39.989628));

}






	//初始化地图对象，加载地图
	var map = new AMap.Map("mapContainer",{
		resizeEnable: true,
		//二维地图显示视口
		view: new AMap.View2D({
			//地图中心点
			center:new AMap.LngLat(116.481181,39.989792),
			//地图显示的缩放级别
			zoom:13 
		})
	});
	//地图中添加地图操作ToolBar插件
	map.plugin(["AMap.ToolBar"], function(){		
		var toolBar = new AMap.ToolBar(); 
		map.addControl(toolBar);		
	});
	
	//地图初始化时，在地图上添加一个marker标记,鼠标点击marker可弹出自定义的信息窗体
    addMarker();
	//添加marker标记
	function addMarker(){
	   map.clearMap();
	   var marker = new AMap.Marker({ 					 
		   map: map,					 
		   //位置 
		   position: new AMap.LngLat(116.481181,39.989792), 
		   //复杂图标    
		   icon: "http://webapi.amap.com/images/0.png"    
	   }); 
	   //鼠标点击marker弹出自定义的信息窗体
	   AMap.event.addListener(marker,'click',function(){ 
			 infoWindow.open(map,marker.getPosition());	
	   });	
	}
	
	//实例化信息窗体
	var infoWindow = new AMap.InfoWindow({
			isCustom:true,  //使用自定义窗体
			content:createInfoWindow('方恒假日酒店&nbsp;&nbsp;<span style="font-size:11px;color:#F00;">价格:318</span>',"<img src='http://tpc.googlesyndication.com/simgad/5843493769827749134' style='position:relative;float:left;margin:0 5px 5px 0;'>地址：北京市朝阳区阜通东大街6号院3号楼 东北 8.3 公里<br/>电话：010 64733333<br/><a href='http://baike.baidu.com/view/6748574.htm'>详细信息</a>"),
			offset:new AMap.Pixel(16, -45)//-113, -140
		});
	
	//构建自定义信息窗体	
	function createInfoWindow(title,content){
		var info = document.createElement("div");
		info.className = "info";
	
		//可以通过下面的方式修改自定义窗体的宽高
		//info.style.width = "400px";
	
		// 定义顶部标题
		var top = document.createElement("div");
		var titleD = document.createElement("div");
		var closeX = document.createElement("img");
		top.className = "info-top"; 
		titleD.innerHTML = title; 
		closeX.src = "http://webapi.amap.com/images/close2.gif";
		closeX.onclick = closeInfoWindow;
		  
		top.appendChild(titleD);
		top.appendChild(closeX);
		info.appendChild(top);
		
	    
		// 定义中部内容
		var middle = document.createElement("div");
		middle.className = "info-middle";
		middle.style.backgroundColor='white';
		middle.innerHTML = content;
		info.appendChild(middle);
		
		// 定义底部内容
		var bottom = document.createElement("div");
		bottom.className = "info-bottom";
		bottom.style.position = 'relative';
		bottom.style.top = '0px';
		bottom.style.margin = '0 auto';
		var sharp = document.createElement("img");
		sharp.src = "http://webapi.amap.com/images/sharp.png";
		bottom.appendChild(sharp);	
		info.appendChild(bottom);
		return info;
	}
	
	//关闭信息窗体
	function closeInfoWindow(){
		map.clearInfoWindow();
	}

