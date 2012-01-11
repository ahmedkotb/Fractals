iterations = 15;
radius = 2.0;
demo_id  = 0;
//helper functions
function debug(str){
	document.getElementById("debug").innerHTML += str + "<br/>";
}
function debugClear(){
	document.getElementById("debug").innerHTML = "";
}

function toRadians(angle){
	return angle * Math.PI / 360;
}

function setPixelColor(data,x,y,color){
    var index = (x + y * 400) * 4;
    data[index+0] = color.r;
    data[index+1] = color.g;
    data[index+2] = color.b;
    data[index+3] = 0xff;
}
//--------------------------------------------
function Fractal(canvas){
    if (canvas.getContext){
        this.scaleX = 100;
        this.scaleY = 100;
        this.panX = 00;
        this.panY = 00;
        //fractal
        this.c = new Complex(0.44,0.19);


        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.canvas.onmousemove = function(e){
            debugClear();
            var i = (e.clientX - this.offsetLeft);
            var j = (e.clientY - this.offsetTop);
            var t = me.toComplex(i,j);
            var x = t.x;
            var y = t.y;
            debug(x + " " + y);
        }
        var me = this;
        this.canvas.onmousedown = function(e){
            var ctx = me.ctx;
            var i = (e.clientX - this.offsetLeft);
            var j = (e.clientY - this.offsetTop);
            var t = me.toComplex(i,j);
            var x = t.x;
            var y = t.y;
            var k=0;
            var n = new Complex(x,y);
            var c = me.c;
            ctx.beginPath();
            ctx.moveTo(i,j);
            ctx.strokeStyle = "#ff0000";
            while (k<iterations){
                n = n.multiply(n).add(c);
                t = me.toCanvas(n.r,n.i);
                ctx.lineTo(t.x,t.y);
                k++;
                if (n.magnitude() > radius)
                    break;
            }
            debug(k);
            ctx.stroke();
        }
        this.canvas.onmouseup = function(e){
        }
    }else{
        alert("canvas not supported!");
    }
}

Fractal.prototype.toComplex = function(i,j){
    var x = i - this.canvas.width /2 - this.panX;
    var y = -j + this.canvas.height/2 - this.panY;
    x/=this.scaleX;
    y/=this.scaleY;
    return {x:x, y:y};
}

Fractal.prototype.toCanvas = function(i,j){
    var x = this.canvas.width/2 + i*this.scaleX + this.panX;
    var y = -j*this.scaleY + this.canvas.height/2 - this.panY ;
    return {x:x, y:y};
}

Fractal.prototype.trace = function(x,y){

}

Fractal.prototype.redraw = function(x1,y1,x2,y2){
	var start = (new Date()).getTime();
	//var imageData = this.ctx.createImageData(this.canvas.width,this.canvas.height);
	var imageData = this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);
    var data = imageData.data;
    var backgroundColor = {r:0 , g:0 , b:0};

    for (var j=y1;j<y2;j++){
        var y = -j + this.canvas.height/2 - this.panY;
        y = y/this.scaleY;
        for (var i=x1;i<x2;i++){
            var x = i - this.canvas.width /2 - this.panX;
            x = x/this.scaleX;

            var n = new Complex(x,y);
            var k=0;
            while (k<iterations){
                n = n.multiply(n).add(this.c);
                k++;
                if (n.magnitude() > radius) break;
            }
            /*
            var n = new Complex(0,0);
            var c = new Complex(x,y);
            var k = 0;
            while (k<iterations){
                n = n.multiply(n).add(c);
                k++;
                if (n.magnitude() > radius) break;
            }
            */

            if (n.magnitude() > radius || isNaN(n.magnitude())){
                //var t = {r:0 , g:0 , b:k/iterations*255 , a:255};
                var t = {r:0 , g:0 , b:0 };
                var base = 4;
                if (k > 0){
                    t.b = (k%base)/(base-1)* 255;
                    k >>= 2;
                }
                if (k > 0){
                    t.g = (k%base)/(base-1)* 255;
                    k >>= 2;
                }
                if (k > 0){
                    t.r = (k%base)/(base-1)* 255;
                }

                setPixelColor(data,i,j,t);
            }
            else
                setPixelColor(data,i,j,backgroundColor);
        }
    }
	this.ctx.putImageData(imageData, 0, 0);
	var end = (new Date()).getTime();
    debugClear();
	debug("render time : " + (end-start)/1000 + " seconds");
    debug("Scale = (" + this.scaleX + "," + this.scaleY + ")");
    debug("Pan = (" + this.panX + "," + this.panY + ")");
}

Fractal.prototype.refresh = function(){
    this.redraw(0,0,this.canvas.width,this.canvas.height);
}

Fractal.prototype.zoomIn = function(){
    this.scaleX += 100;
    this.scaleY += 100;
    this.refresh();
}

Fractal.prototype.zoomOut = function(){
    this.scaleX -= 100;
    this.scaleY -= 100;
    if (this.scaleX <= 0) this.scaleX = 10;
    if (this.scaleY <= 0) this.scaleY = 10;
    this.refresh();
}

Fractal.prototype.pan = function(direction){
    var delta = 30;
    var img = this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);
    if (direction == 0){
        this.panX +=delta;
        this.ctx.putImageData(img,+delta,0);
        this.redraw(0,0,delta,this.canvas.height);
    }else if (direction  == 1){
        this.panY -=delta;
        this.ctx.putImageData(img,0,+delta);
        this.redraw(0,0,this.canvas.width,delta);
    }else if (direction == 2){
        this.panX -=delta;
        this.ctx.putImageData(img,-delta,0);
        this.redraw(this.canvas.width-delta,0,this.canvas.width,this.canvas.height);
    }else if (direction == 3){
        this.panY +=delta;
        this.ctx.putImageData(img,0,-delta);
        this.redraw(0,this.canvas.height-delta,this.canvas.width,this.canvas.height);
    }
    //this.refresh();

}

//--------------------------------------------
function Complex(r,i){
    this.r = r;
    this.i = i;
}

Complex.prototype.add = function(c){
    return new Complex(this.r + c.r , this.i + c.i);
}

Complex.prototype.multiply = function(c){
    return new Complex(this.r * c.r - this.i * c.i, this.r * c.i + this.i * c.r);
}

Complex.prototype.magnitude = function(){
    return Math.sqrt(this.r * this.r + this.i * this.i);
}

Complex.prototype.inspect = function(){
    return this.r + "," + this.i + "i";
}
//-------------------------------------------

function demo_sequence(){
    clearInterval(demo_id);
    var i= 0.0;
    var j = 0.0;
    var count = 0;
    radius = 20.0;
    iterations = 50;
    fractal.scaleX = 100;
    fractal.scaleY = fractal.scaleX;
    fractal.panX = 0;
    fractal.panY = 0;
    demo_id = setInterval(function(){
            if (i >= 1.0) {
                return;
            }
            if (j >= 1.0){
                i += 0.05;
                j  = 0.0;
            }else j+=0.05;
            fractal.c = new Complex(i,j);
            fractal.refresh();
            debugClear();
            count++;
            debug(count);
            debug(fractal.c.inspect());
        } , 1000);
}

function demo_random(){
    clearInterval(demo_id);
    var i= 0.0;
    var j = 0.0;
    var min_pan = -500 , max_pan = 500;
    var min_zoom = 100 , max_zoom = 600;
    var min_itr = 30, max_itr= 100;
    var min_r = 12.0, max_r = 50.0;
    demo_id = setInterval(function(){
            i = Math.random();
            j = Math.random();
            radius = Math.floor(Math.random() * (max_r - min_r) + min_r);
            iterations = Math.floor(Math.random() * (max_itr - min_itr) + min_itr);
            fractal.scaleX = Math.floor(Math.random() * (max_zoom - min_zoom) + min_zoom);
            fractal.scaleY = fractal.scaleX;
            fractal.panX = Math.floor(Math.random() * (max_pan - min_pan) + min_pan);
            fractal.panY = Math.floor(Math.random() * (max_pan - min_pan) + min_pan);
            fractal.c = new Complex(i,j);
            fractal.refresh();
            debug(fractal.c.inspect());
            debug("iterations = " + iterations);
            debug("escape radius = " + radius);
        } , 3000);
}
