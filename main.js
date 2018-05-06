var points = [];
var canvas, context;
var GF = 0.98;
var G = -1;
var maxDistance = 20;
var md = false, mx = 0, my = 0;

var explosionPower = 0;
var explosionDefault = 1;
var explosionIncrease = 0;

var width = 1, height = 2;

var lineWidth = 1;

var multiplier = 50;

var mesh = true;

window.addEventListener("load", function(){
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");

  resizeHandler();
  window.addEventListener("resize", resizeHandler, false);

  width = 20;
  height = 20;

  for(var i = 0; i < width; i++){
    for(var j = 0; j < height; j++){
      var s = maxDistance * 2;
      points.push(new Point(maxDistance * 2 + i * s, maxDistance * 2 + j * s));
    }
  }


  canvas.addEventListener("mousedown", function(e){
    md = true;
    mx = e.clientX;
    my = e.clientY;
  }, false);

  canvas.addEventListener("mousemove", function(e){
    mx = e.clientX;
    my = e.clientY;
  }, false);

  canvas.addEventListener("mouseup", function(e){
    md = false;
  }, false);

  loop();
}, false);

function resizeHandler(){
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}

function loop(){
  context.strokeStyle = "white";//;"rgb(255, 234, 143)";
  context.fillStyle = "black";//"rgb(250, 99, 105)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  for(var i = 0; i < points.length; i++) points[i].update();
  for(var i = 0; i < points.length; i++) points[i].move();
  context.beginPath();
  context.lineWidth = lineWidth;

  if(md){
    explosionPower += explosionIncrease;
  } else{
    explosionPower = explosionDefault;
  }

  if(mesh){

    for(var i = 0; i < points.length; i++){
      var p = points[i];

      if(i % height == 0) context.moveTo(p.px - (p.px - p.x) * multiplier, p.py - (p.py - p.y) * multiplier);
      if(i % height != 0) context.lineTo(p.px - (p.px - p.x) * multiplier, p.py - (p.py - p.y) * multiplier);
    }

    for(var j = 0; j < height; j++){
      for(var i = 0; i < points.length; i += height){
        var p = points[j + i];
        if(i/height == 0) context.moveTo(p.px - (p.px - p.x) * multiplier, p.py - (p.py - p.y) * multiplier);
        if(i/height != 0) context.lineTo(p.px - (p.px - p.x) * multiplier, p.py - (p.py - p.y) * multiplier);
      }
    }
  } else{
    for(var i = 0; i < points.length; i++){
      var p = points[i];

      var n = 5;

      context.moveTo(p.px, p.py);
      context.lineTo(p.px - (p.px - p.x) * multiplier, p.py - (p.py - p.y) * multiplier);
    }
  }

  context.stroke();

  requestAnimationFrame(loop);
}

function Point(x, y){
  this.vx = 0;
  this.vy = 0;

  this.x = this.px = x;
  this.y = this.py = y;

  this.update = function(){
    for(var i = 0; i < points.length; i++){
      var poin = points[i];

      if(poin != this){
        var dx = poin.px - poin.x;
        var dy = poin.py - poin.y;

        var dist2 = ((this.x - poin.px) * (this.x - poin.px) + (this.y - poin.py) * (this.y - poin.py));

        if(dist2 != 0){
          this.vx += G * dx/dist2;
          this.vy += G * dy/dist2;

          poin.vx -= G * dx/dist2;
          poin.vy -= G * dy/dist2;
        }
      }
    }

    if(md){
      var dx = this.x - mx;
      var dy = this.y - my;

      var dist2 = (dx * dx + dy * dy);
      //dist2 = Math.max(1, dist2);

      this.vx += explosionPower * dx/dist2;
      this.vy += explosionPower * dy/dist2;
    }

    this.vx += (this.px - this.x)/200;
    this.vy += (this.py - this.y)/200;

    this.vx *= GF;
    this.vy *= GF;
  };

  this.move = function(){
    this.x += this.vx;
    this.y += this.vy;
    /*

    var angle = Math.PI + Math.atan2(this.py - this.y, this.px - this.x);
    var dist = Math.min(maxDistance, Math.sqrt((this.px - this.x) * (this.px - this.x) + (this.py - this.y) * (this.py - this.y)));

    if(dist == maxDistance) this.vx = this.vy = 0;

    this.x = this.px + Math.cos(angle) * dist;
    this.y = this.py + Math.sin(angle) * dist;*/
  };
}
