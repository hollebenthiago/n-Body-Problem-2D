var canvas = document.querySelector('canvas')
    ;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var c = canvas.getContext('2d');

var mouse = {
    x: undefined,
    y: undefined
}

window.addEventListener('mousemove', 
function(event) {
    mouse.x = event.x;
    mouse.y = event.y;
})
var mMax = 10*20
function planet(m,x,y,dx,dy,k1,k2,name,color,g,radius) {
    this.g = g; // universal gravitational constant 
    this.m = m; // in kg
    this.mMin = m;
    this.k1 = k1; // change position units to m/s
    this.k2 = k2; // change velocity units to m/s
    this.x = this.k1*x;
    this.y = this.k1*y;
    this.dx = this.k2*dx;
    this.dy = this.k2*dy;
    this.radius = radius;
    this.name = name;
    this.color = color;
    this.draw = function() {
        c.beginPath();
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
        c.fillStyle = this.color;
        c.fill();
    }
    this.update = function() {
        console.log('entrou')
        if (mouse.x - this.x < 50 && mouse.x - this.x > -50 && mouse.y - this.y < 50 && mouse.y - this.y > -50) {
            if (this.m < mMax) {
                this.m += this.m;
            }
        }
        else if(this.m >= this.mMin){
            this.m -= 0.5*this.m;
        }
        this.draw();
    } 
}
var forcagravitx = function(object1,object2) {
    if (object1.x == object2.x && object1.y == object2.y) {
        return 0;
    }  
    else {
        return (-object1.x+object2.x)*object1.g*object2.m/(Math.sqrt((object1.x -object2.x)*(object1.x-object2.x) + (object1.y - object2.y)*(object1.y - object2.y))**3);
    }
}

var forcagravity = function(object1,object2) {
    if (object1.x == object2.x && object1.y == object2.y) {
        return 0;
    }  
    else {
        return (-object1.y+object2.y)*object1.g*object2.m/(Math.sqrt((object1.x -object2.x)*(object1.x-object2.x) + (object1.y - object2.y)*(object1.y - object2.y))**3);
    }
}
planetas = [new planet(10**15,400,300,1,-1,1,1,'Sun','yellow',6.667e-11,10),new planet(10**15,400,350,0,0,1,1,'Earth','blue',6.667e-11,10),
            new planet(10**15, 440,330,-1,1,1,1,'Ball','green',6.667e-11,10)];
var frames = 0;
function sistema(h,planetas) {
    this.h = h;
    this.planetas = planetas;
    this.merge = function() {
        for (var i = 0; i < this.planetas.length-1; i++) {
            for (var j = i+1; j < this.planetas.length;j++){
                if (Math.abs(this.planetas[i].x-this.planetas[j].x) < 5 && Math.abs(this.planetas[i].y - 
                this.planetas[j].y) < 5) {
                    var removed = this.planetas.splice(j,1);
                    this.planetas[i].x = removed.x;
                    this.planetas[i].y = removed.y;
                    this.planetas[i].dx = (this.planetas[i].m*this.planetas[i].dx +removed.m*removed.dx)/(removed.m+this.planetas[i].m);
                    this.planetas[i].dy = (this.planetas[i].m*this.planetas[i].dy +removed.m*removed.dy)/(removed.m+this.planetas[i].m);
                    this.planetas[i].m += removed.m;
                    this.planetas[i].color = 'white';
                }
            }
        }
    }
    this.draw = function() {
        for (var i = 0; i < this.planetas.length; ++i) {
            this.planetas[i].draw();
            //c.beginPath();
            //c.arc(this.planetas[i].x,this.planetas[i].y,this.planetas[i].radius,0,Math.PI*2,false);
            //c.fillStyle = this.planetas[i].color;
            //c.fill();
        }
        var M = 0;
        var X = 0;
        var Y = 0;
        var R = 0;
        for (var i = 0; i < this.planetas.length; i++){
            M = M + this.planetas[i].m;
            X += this.planetas[i].x*this.planetas[i].m;
            Y += this.planetas[i].y*this.planetas[i].m;
            R += this.planetas[i].radius
        }
        X *= 1/M;
        Y *= 1/M;
        c.beginPath();
        c.arc(X,Y,R/(this.planetas.length**2),0,Math.PI*2,false);
        c.fillStyle = 'purple';
        c.fill();
        for (var i = 0; i < this.planetas.length-1; i++){
            for (var j = i; j < this.planetas.length; j++){
                c.beginPath();
                c.moveTo(this.planetas[i].x,this.planetas[i].y);
                c.lineTo(this.planetas[j].x,this.planetas[j].y);
                c.strokeStyle = 'purple';
                c.stroke();
            }
        }
    }
    this.verlet = function() {
        frames += 1;
        var novosposx = [];
        var novosposy = [];
        var novosvelx = [];
        var novosvely = [];
        var aceleracoesx = [];
        var aceleracoesy = [];
        for (var i = 0; i < this.planetas.length; i++) {
            var acx = 0;
            var acy = 0;
            for (var j = 0; j < this.planetas.length; j ++) {
                if (i == j){
                    acx += 0;
                    acy += 0;
                }
                else{
                    acx += (this.planetas[j].x-this.planetas[i].x)*this.planetas[j].m*this.planetas[i].g/(Math.sqrt((this.planetas[i].x-this.planetas[j].x)**2 + (this.planetas[i].y-this.planetas[j].y)**2 )**3);
                    acy += (this.planetas[j].y - this.planetas[i].y)*this.planetas[j].m*this.planetas[i].g/(Math.sqrt((this.planetas[i].x-this.planetas[j].x)**2 + (this.planetas[i].y-this.planetas[j].y)**2 )**3);
                }
            }
            novosposx.push(this.planetas[i].x + this.h*this.planetas[i].dx + this.h*this.h*acx/2);
            novosposy.push(this.planetas[i].y + this.h*this.planetas[i].dy + this.h*this.h*acy/2);
            aceleracoesx.push(acx);
            aceleracoesy.push(acy);
        }
        for (var k = 0; k < this.planetas.length; k++) {
            var acnewx = 0;
            var acnewy = 0;
            for (var l = 0; l < this.planetas.length; l++) {
                if (k == l){
                    acnewx += 0;
                    acnewy += 0;
                }
                else{
                    acnewx += (novosposx[l]-novosposx[k])*this.planetas[l].m*this.planetas[k].g/(Math.sqrt((novosposx[k]-novosposx[l])**2 + (novosposy[k]-novosposy[l])**2)**3)
                    acnewy += (novosposy[l]-novosposy[k])*this.planetas[l].m*this.planetas[k].g/(Math.sqrt((novosposx[k]-novosposx[l])**2 + (novosposy[k]-novosposy[l])**2)**3)
                }
            }
            novosvelx.push(this.planetas[k].dx + 0.5*(aceleracoesx[k]+acnewx)*this.h);
            novosvely.push(this.planetas[k].dy + 0.5*(aceleracoesy[k]+acnewy)*this.h);
            console.log(mouse.x,mouse.y);
        }
        for (var t = 0; t < this.planetas.length;t++) {
            this.planetas[t].x = novosposx[t];
            this.planetas[t].y = novosposy[t];
            this.planetas[t].dx = novosvelx[t];
            this.planetas[t].dy = novosvely[t];
            if (Math.abs(mouse.x - this.planetas[t].x) < 50 && Math.abs(mouse.y - this.planetas[t].y) < 50) {
                console.log('entrou')
                this.planetas[t].m += 0.01*this.planetas[t].m;
            }
            
        }
        for (var i = 0; t < this.planetas.length; i++){
            this.planetas[i].update();
        }
        //this.merge();
        this.draw();
    }
}
planetas = [new planet(10**15,500,500,-20,0,1,1,'Sun','yellow',6.667e-11,10), new planet(10**15, 300,300,20,0,1,1,'ball','blue',6.667e-11,10)
            ,new planet(10**15, 300,500,0,-20,1,1,'Ball','green',6.667e-11,10), new planet(10**15,500,300,0,20,1,1,'Ball','red',6.667e-11,10)];
system = new sistema(0.1,planetas);
function animate() {
    requestAnimationFrame(animate);
    c.clearRect(0,0,innerWidth,innerHeight);
    system.verlet();
}

animate();

