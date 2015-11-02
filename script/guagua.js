var bodyStyle=document.body.style;
bodyStyle.mozUserSelect=bodyStyle.webkitUserSelect="none";


var scratch={
	code:"",canvas:null,ctx:null,textWidth:0,mousedown:false,
	init:function(w,h){
		var canvas=document.querySelector("canvas");
		canvas.width=w;
		canvas.height=h;
		if(canvas.getContext){
			this.canvas=canvas;
			this.ctx=canvas.getContext("2d");
			this.reset();
			this.bindEvent();
		}
	},
	reset:function(){
		var canvas=this.canvas,
			ctx=this.ctx,
			w=canvas.width,
			h=canvas.height;
		canvas.width=w;
		// this.code=Math.random()>0.6?"恭喜你中奖了":"继续努力";
		ctx.fillStyle="#ddd";
		ctx.fillRect(0,0,w,h);
		ctx.font=(h*3/5>>>1)+"px 'microsoft yahei'";
		ctx.fillStyle="#000";
		// this.textWidth=ctx.measureText(this.code).width;
	},
	clearAll:function() {
		var canvas=this.canvas,
			ctx=this.ctx;

		canvas.remove();


	},
	bindEvent:function(){
		var canvas=this.canvas,
			ctx=this.ctx,
			w=canvas.width,
			h=canvas.height;
		function eventDown(e){
			e=e||window.event;
			e.preventDefault();
			if(e.changedTouches){
				e=e.changedTouches[e.changedTouches.length-1];
			}
			var p=canvas.getBoundingClientRect();
			canvas.ox=p.left;
			canvas.oy=p.top;
			scratch.mousedown=true;
			ctx.lineWidth=20;
			ctx.moveTo(e.clientX-p.left,e.clientY-p.top)
		}
		
		function eventUp(e){
			e.preventDefault();
			scratch.mousedown=false;
		}
		
		function getTransparentPercent(ctx, width, height) {
	        var imgData = ctx.getImageData(0, 0, width, height),
	            pixles = imgData.data,
	            transPixs = [];
	        for (var i = 0, j = pixles.length; i < j; i += 4) {
	            var a = pixles[i + 3];
	            if (a < 128) {
	                transPixs.push(i);
	            }
	        }
	        return parseInt(transPixs.length / (pixles.length / 4) * 100,10);
	    }


		function eventMove(e){
			e.preventDefault();
			if(scratch.mousedown){
				e=e||window.event;
				if(e.changedTouches){
					e=e.changedTouches[e.changedTouches.length-1];
				}
				var disX=e.clientX,disY=e.clientY;
				ctx.globalCompositeOperation="destination-out";
				ctx.lineTo(disX-this.ox,disY-this.oy);
				ctx.stroke();
				ctx.globalCompositeOperation="destination-over";
				ctx.fillText(scratch.code,(w-scratch.textWidth)/2,h*3/5,w);


				var per = getTransparentPercent(ctx, canvas.width, canvas.height);

				if(per >= 50) {
					scratch.clearAll();
					api && api.execScript({
		              name : 'guagua',
		              frameName : 'guagua',
		              script : 'getResult();'
		            });
				}

				 // if (this.drawPercentCallback) {
		   //          this.drawPercentCallback.call(null, this.getTransparentPercent(this.maskCtx, this.width, this.height));
		   //      }


			}
		}
		
		document.addEventListener("touchstart",eventDown);
		canvas.addEventListener("touchmove",eventMove);
		document.addEventListener("touchend",eventUp);
	}
}