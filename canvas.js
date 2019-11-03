var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var c = canvas.getContext('2d');
alert('This is a simulation of the famous n-body problem, answer the prompts according to the instructions and then press some keys to see what happens!');
var colorArray = [
'#F27781',
'#18298C',
'#04BF8A',
'#F2CF1D',
'#F29F05',
'#00A691',
'#307EFE',
'#D033BB',
'#FF0089',
'#1BBF15',
'#F2360C',
'#A60522',
'#BF7E04',
];
var sistemasolar = window.prompt('do you want to simulate the solar system? (yes or no)');
var H = window.prompt('how many hours do you want our step to be? (number)');
if (sistemasolar === 'yes'){
    var moresuns = window.prompt("do you want to see more suns? (yes or no)");
    if (moresuns == 'yes'){
        var howmany = window.prompt('how many? (number)');
    }
}
if (sistemasolar === 'no') {
    var numberballs = window.prompt('how many bodies do you want? (number)');
    var initcond = window.prompt('do you want to set up your own initial conditions? (yes or no)');
    if (initcond == 'yes'){
        listballsmass = [];
        var listballsx = [];
        var listballsy = [];
        var listballsdx = [];
        var listballsdy = [];
        var listballscolors = [];

        for (var i = 0; i < numberballs; i++) {
            listballsmass.push(window.prompt('tell me the mass of ball number ' + String(i+1) + " (earth's mass is 5.97e24)"))
            listballsx.push(window.prompt('tell me the initial x-position of ball number ' + String(i+1)+ ' (number)'));
            listballsy.push(window.prompt('tell me the initial y-position of ball number '+ String(i+1)+' (number)'));
            listballsdx.push(window.prompt('tell me the initial x-velocity of ball number ' + String(i+1)+' (number)'));
            listballsdy.push(window.prompt('tell me the initial y-velocity of ball number ' + String(i+1) + ' (number)' ));
            listballscolors.push(window.prompt('tell me the color of ball number ' + String(i+1) + ' (can be in hexadecimal, rgba, or simply something like red'));
        }
        var G = window.prompt('and lastly a gravitational constant (number, 6.67e-11 is the usual one)');   
    }
    else{
        alert('random numbers will generate ' + String(numberballs) + ' bodies for you :)'); 
        var randombodies = [];
    }
}
alert("Can you guess what's happening when you mouse over a body?");
var ax = -3e11;
var bx = 3e11;
var ay = 3e11;
var cy = -3e11;
window.addEventListener('keydown',checkKeyPress,false);

function checkKeyPress(key){
    if (key.keyCode == '39'){
        ax += 0.1*bx;
        bx += 0.1*bx;
    }
    else if(key.keyCode == '37'){
        ax -= 0.1*bx;
        bx -= 0.1*bx;
    }
    else if(key.keyCode == '40'){
        cy += 0.1*cy;
        ay += 0.1*cy;
    }
    else if(key.keyCode == '38'){
        cy -= 0.1*cy;
        ay -= 0.1*cy;
    }
    else if(key.keyCode == '81'){
        ax += 0.1*ax;
        bx += 0.1*bx;
        cy += 0.1*cy;
        ay += 0.1*ay;
    }
    else if(key.keyCode == '87'){
        ax -= 0.1*ax;
        bx -= 0.1*bx;
        cy -= 0.1*cy;
        ay -= 0.1*ay;
    }
}
var mousenotPressed = false;
var counter = 0;
var mouse = {
    x: undefined,
    y: undefined
}

var mouseclick = {
    x: undefined,
    y: undefined
}

window.addEventListener('mousemove', 
function(event) {
    mouse.x = event.x;
    mouse.y = event.y;
})

window.addEventListener("mousedown", function(e){
    mousePressed = true;
    counter += 1;
    window.onmousemove = function(e) {
        if(mousePressed == true){
            mouseclick.x = mouse.x;
            mouseclick.y = mouse.y;
        }
     }
});
//window.addEventListener('mousedown', function() {
//   console.log('bbbbb');   
//    mouseclick.x =  event.x;
//    mouseclick.y = event.y;
//    counter +=1;

//})

window.addEventListener('mouseup',function() {
    //console.log('ccccccccc');
    mousePressed = false;
    counter += 1;
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
    this.sx = innerWidth*(this.x-ax)/(bx-ax);
    this.sy = innerHeight*(this.y-ay)/(cy-ay);
    this.radius = radius;
    this.name = name;
    this.color = color;
    this.draw = function() {
        c.beginPath();
        c.arc(this.sx,this.sy,this.radius,0,Math.PI*2,false);
        c.fillStyle = this.color;
        c.fill();
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
var frames = 0;
function sistema(h,planetas) {
    this.h = h;
    this.planetas = planetas;
    this.merge = function() {
        for (var i = 0; i < this.planetas.length-1; i++) {
            for (var j = i+1; j < this.planetas.length;j++){
                if (Math.abs(this.planetas[i].x-this.planetas[j].x) < 10 && Math.abs(this.planetas[i].y - 
                this.planetas[j].y) < 10) {
                    this.planetas[i].m += this.planetas[j].m
                    this.planetas.splice(j,1);
                    //console.log(this.planetas.length);
                    //this.planetas[i].x = removed.x;
                    //this.planetas[i].y = removed.y;
                    this.planetas[i].dx = 0;
                    this.planetas[i].dy = 0;
                    //this.planetas[i].dx = (this.planetas[i].m*this.planetas[i].dx +removed.m*removed.dx)/(removed.m+this.planetas[i].m);
                    //this.planetas[i].dy = (this.planetas[i].m*this.planetas[i].dy +removed.m*removed.dy)/(removed.m+this.planetas[i].m);
                    //this.planetas[i].m += removed.m;
                    //this.planetas[i].color = 'white';
                }
            }
        }
    }
    this.draw = function() {
        for (var i = 0; i < this.planetas.length; ++i) {
            this.planetas[i].draw();  
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
        c.arc(innerWidth*(X-ax)/(bx-ax),innerHeight*(Y-ay)/(cy-ay),R/(this.planetas.length**2),0,Math.PI*2,false);
        c.fillStyle = 'purple';
        c.fill();
        if (this.planetas.length <= 5 ){
            for (var i = 0; i < this.planetas.length-1; i++){
                for (var j = i; j < this.planetas.length; j++){
                    c.beginPath();
                    c.moveTo(this.planetas[i].sx,this.planetas[i].sy);
                    c.lineTo(this.planetas[j].sx,this.planetas[j].sy);
                    if (sistemasolar == 'yes'){
                        c.strokeStyle = 'rgba(128,0,128,0.1)';
                    }
                    else{c.strokeStyle = 'rgba(128,0,128,0.5)'}
                    c.stroke();
                }
            }
        }
        
    }
    this.verlet = function() {
        frames += 1;
        if (((h/3600)*frames)%24 == 0){
            console.log(String(Math.floor((h/3600)*frames/24)) + ' days');
        }
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
            //console.log(mouseclick.x,mouseclick.y,counter);
        }
        for (var t = 0; t < this.planetas.length;t++) {
            this.planetas[t].x = novosposx[t];
            this.planetas[t].y = novosposy[t];
            this.planetas[t].dx = novosvelx[t];
            this.planetas[t].dy = novosvely[t];
            this.planetas[t].sx = innerWidth*(this.planetas[t].x-ax)/(bx-ax);
            this.planetas[t].sy = innerHeight*(this.planetas[t].y -ay)/(cy-ay);
            if (Math.abs(mouse.x - this.planetas[t].sx) < 50 && Math.abs(mouse.y - this.planetas[t].sy) < 50) {
                console.log('entrou')
                this.planetas[t].m += 0.01*this.planetas[t].m;
                console.log(this.planetas[t].sx);
                console.log(this.planetas[t].x);
            }
            //if (mousenotPressed == false) {
                //if (Math.abs(mouseclick.x - this.planetas[t].sx) < 20 && Math.abs(mouseclick.y - this.planetas[t].y) < 20) {
                    //console.log('entrou');
                    //this.planetas[t].sx = mouseclick.x;
                    //this.planetas[t].sy = mouseclick.y;
                //}
            //}    
        //}
            
        }
//       for (var i = 0; i < this.planetas.length;i++) {
//           if (this.planetas[i].x > innerWidth) {
//               this.planetas[i].x -= innerWidth;
//           }
//            else if (this.planetas[i].x < 0) {
//                this.planetas[i].x += innerWidth;
//           }
//       }

//        for (var i = 0; i < this.planetas.length;i++) {
//          if (this.planetas[i].y > innerHeight) {
//              this.planetas[i].y -= innerHeight;
//            }
//            else if (this.planetas[i].y < 0){
//                this.planetas[i].y += innerHeight;
//            }
//        }
        this.merge();
        this.draw();
    }
}
if (sistemasolar === 'yes'){
    var sol = new planet(1.9885*10**30,0,0,0,0,1,1,'Sun','yellow',6.67*10**-11,5);
    var mercury = new planet(0.330*10**24,46*10**9,0,0,58.98*10**3,1,1,'Mercury','red',6.67*10**-11,5);
    var venus = new planet(4.87*10**24,107.5*10**9,0,0,35.26*10**3,1,1,'Venus','green',6.67*10**-11,5);
    var earth = new planet(5.97*10**24,147.1*10**9,0,0,30.29*10**3,1,1,'Earth','blue',6.67*10**-11,5);
    var moon = new planet(5.97*10**24 + 0.073*10**24,147.1*10**9 + 0.363*10**9,0,0,30.29*10**3 + 1.082*10**3,1,1,'Moon','white',6.67*10**-11,2);
    var mars = new planet(0.642*10**24,206.6*10**9,0,0,26.5*10**3,1,1,'Mars','brown',6.67*10**-11,5);
    var jupiter = new planet(1898*10**24,740.5*10**9,0,0,13.72*10**3,1,1,'Jupiter','lightblue',6.67*10**-11,5);
    var saturn = new planet(568*10**24,1352.6*10**9,0,0,10.183*10**3,1,1,'Saturn','indigo',6.67*10**-11,5);
    var uranus = new planet(86.8*10**24,2741.3*10**9,0,0,7.11*10**3,1,1,'Uranus','orange',6.67*10**-11,5);
    var neptune = new planet(102*10**24,4444.5*10**9,0,0,5.5*10**3,1,1,'Neptune','cyan',6.67*10**-11,5);
    var pluto = new planet(0.0146*10**24,4436.8*10**9,0,0,6.1*10**3,1,1,'Pluto','lightgreen',6.67*10**-11,5);
    var planetas = [sol,mercury,venus,earth,moon,mars,jupiter,saturn,uranus,neptune,pluto];
    if (moresuns == 'yes'){
        console.log('entrou')
        for (var i = 0; i < howmany; i ++){
            planetas.push(new planet(1.9885e30,(Math.random()-0.5)*bx,(Math.random()-0.5)*ay,(Math.random()-0.5)*1000,(Math.random()-0.5)*1000,1,1,'Sun','yellow',6.67e-11,5));
        }
    }
}
else{    

}
if (sistemasolar === 'no' && initcond === 'no'){
    var planetas = [];
    for (var i =0; i < numberballs; i++){
        planetas.push(new planet(1e27,(Math.random()-0.5)*bx,(Math.random()-0.5)*ay,(Math.random()-0.5)*10000,(Math.random()-0.5)*10000,1,1,'ball',colorArray[Math.floor(Math.random()*colorArray.length)],6.67e-11,5))
    }
}
if (sistemasolar === 'no' && initcond === 'yes'){
    var planetas = [];
    for (var i = 0; i < numberballs; i++){
        planetas.push(new planet(1e24,listballsx[i],listballsy[i],listballsdx[i],listballsdy[i],1,1,'just a ball', listballscolors[i],G,5));
    
    }
}

system = new sistema(3600*H,planetas);
function animate() {
    requestAnimationFrame(animate);
    c.clearRect(0,0,innerWidth,innerHeight);
    system.verlet();
    //console.log(system.planetas[0].sy);
}

animate();















