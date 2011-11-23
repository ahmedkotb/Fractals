iterations = 15;
radius = 2.0;
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
        this.c = new Complex(0.44,0.19);
        iterations=50;
        radius=30;
        this.scaleX = 200;
        this.scaleY = 200;

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.canvas.onmousemove = function(e){
            debugClear();
            var i = (e.clientX - this.offsetLeft);
            var j = (e.clientY - this.offsetTop);
            var t = me.toComplex(i,j);
            var x = t.x;
            var y = t.y;
            //debug(i + " " + j);
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

Fractal.prototype.refresh = function(){
	var start = (new Date()).getTime();
	var imageData = this.ctx.createImageData(this.canvas.width,this.canvas.height);
    var data = imageData.data;
    var backgroundColor = {r:0 , g:0 , b:0};

    for (var j=0;j<this.canvas.height;j++){
        var y = -j + this.canvas.height/2 - this.panY;
        y = y/this.scaleY;
        for (var i=0;i<this.canvas.width;i++){
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
	debug("render time : " + (end-start)/1000 + " seconds");
}

Fractal.prototype.zoomIn = function(){
    this.scaleX += 30;
    this.scaleY += 30;
    this.refresh();
}

Fractal.prototype.zoomOut = function(){
    this.scaleX -= 30;
    this.scaleY -= 30;
    this.refresh();
}

Fractal.prototype.pan = function(direction){
    if (direction == 0)
        this.panX +=10;
    else if (direction  == 1)
        this.panY -=10;
    else if (direction == 2)
        this.panX -=10;
    else if (direction == 3)
        this.panY +=10;
    this.refresh();
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
