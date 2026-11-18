(()=>{
const c=document.getElementById('game'),ctx=c.getContext('2d'),$=id=>document.getElementById(id);
const W=960,H=540,ground=438;
let state='menu',player,obstacles,coins,particles,score,coinCount,speed,spawn,coinSpawn,last=0,paused=false;
let best=Number(localStorage.getItem('thanvi_runner_best')||0);$('best').textContent=best;
function reset(){player={x:145,y:ground-68,w:48,h:68,vy:0,onGround:true};obstacles=[];coins=[];particles=[];score=0;coinCount=0;speed=7;spawn=55;coinSpawn=90;paused=false;updateHud()}
function updateHud(){$('score').textContent=Math.floor(score);$('coins').textContent=coinCount}
function start(){reset();state='play';$('menu').style.display='none';$('over').style.display='none'}
function end(){state='over';let s=Math.floor(score);if(s>best){best=s;localStorage.setItem('thanvi_runner_best',best);$('best').textContent=best}$('result').textContent=`Score: ${s}  •  Coins: ${coinCount}`;$('over').style.display='flex'}
function jump(){if(state==='menu'){start();return}if(state==='over'){start();return}if(state==='play'&&!paused&&player.onGround){player.vy=-17;player.onGround=false;}}
function rectHit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function burst(x,y,color){for(let i=0;i<9;i++)particles.push({x,y,vx:(Math.random()-.5)*6,vy:(Math.random()-.7)*6,life:25,color})}
function update(dt){if(state!=='play'||paused)return;let f=Math.min(dt/16.67,2);score+=.12*f*speed/7;speed=Math.min(13,7+score/180);
player.vy+=.85*f;player.y+=player.vy*f;if(player.y+player.h>=ground){player.y=ground-player.h;player.vy=0;player.onGround=true}
spawn-=f;if(spawn<=0){let h=35+Math.random()*38;obstacles.push({x:W+20,y:ground-h,w:30+Math.random()*22,h});spawn=70+Math.random()*55-(speed-7)*3}
coinSpawn-=f;if(coinSpawn<=0){let y=ground-115-Math.random()*115;for(let i=0;i<4;i++)coins.push({x:W+i*34,y:y-Math.sin(i/3*Math.PI)*15,r:12,t:0});coinSpawn=115+Math.random()*80}
obstacles.forEach(o=>o.x-=speed*f);coins.forEach(o=>{o.x-=speed*f;o.t+=.12*f});
obstacles=obstacles.filter(o=>o.x+o.w>0);coins=coins.filter(o=>o.x+o.r>0);
let p={x:player.x+7,y:player.y+5,w:player.w-14,h:player.h-8};
for(const o of obstacles){if(rectHit(p,{x:o.x+3,y:o.y+3,w:o.w-6,h:o.h-3})){burst(player.x+20,player.y+30,'#ff6868');end();break}}
for(const q of coins){if(!q.got&&Math.hypot((player.x+24)-q.x,(player.y+30)-q.y)<37){q.got=true;coinCount++;score+=10;burst(q.x,q.y,'#ffd166')}}coins=coins.filter(q=>!q.got);
particles.forEach(p=>{p.x+=p.vx*f;p.y+=p.vy*f;p.life-=f});particles=particles.filter(p=>p.life>0);updateHud()}
function draw(){ctx.clearRect(0,0,W,H);
let sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#70c9e8');sky.addColorStop(1,'#d7f3dc');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
// distant hills
ctx.fillStyle='#82c5a2';ctx.beginPath();ctx.moveTo(0,ground);for(let x=0;x<=W;x+=80)ctx.quadraticCurveTo(x+40,300+Math.sin(x*.013)*35,x+80,ground);ctx.lineTo(W,ground);ctx.fill();
ctx.fillStyle='#4d9d78';ctx.fillRect(0,ground,W,H-ground);
ctx.fillStyle='#377c61';for(let x=0;x<W;x+=48){ctx.fillRect((x-(performance.now()*.05)%48),ground+18,25,5)}
// clouds
ctx.fillStyle='#ffffffaa';for(let i=0;i<5;i++){let x=(i*230-(performance.now()*.018)%1150+1150)%1150-80,y=75+(i%3)*42;ctx.beginPath();ctx.arc(x,y,22,0,7);ctx.arc(x+25,y-8,28,0,7);ctx.arc(x+55,y,20,0,7);ctx.fill()}
// obstacles
for(const o of obstacles){ctx.fillStyle='#a84f36';ctx.fillRect(o.x,o.y,o.w,o.h);ctx.fillStyle='#e88754';ctx.fillRect(o.x+5,o.y+5,7,o.h-5);ctx.fillStyle='#713b35';ctx.fillRect(o.x,o.y,o.w,8)}
// coins
for(const q of coins){ctx.fillStyle='#f6a900';ctx.beginPath();ctx.arc(q.x,q.y,q.r+2,0,7);ctx.fill();ctx.fillStyle='#ffe27a';ctx.beginPath();ctx.arc(q.x,q.y,q.r-3,0,7);ctx.fill();ctx.fillStyle='#c77a00';ctx.font='bold 14px sans-serif';ctx.textAlign='center';ctx.fillText('$',q.x,q.y+5)}
// player shadow and character
ctx.fillStyle='#183b35aa';ctx.beginPath();ctx.ellipse(player.x+24,ground+3,32,7,0,0,7);ctx.fill();
ctx.fillStyle='#233d75';ctx.fillRect(player.x+5,player.y+23,38,39);ctx.fillStyle='#ffd166';ctx.fillRect(player.x+9,player.y+3,31,28);ctx.fillStyle='#17233c';ctx.fillRect(player.x+29,player.y+12,5,5);ctx.fillStyle='#e58d5d';ctx.fillRect(player.x+12,player.y+58,10,10);ctx.fillRect(player.x+31,player.y+58,10,10);ctx.fillStyle='#fff';ctx.fillRect(player.x+7,player.y+31,34,5);
for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/25);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,5,5);ctx.globalAlpha=1}
if(paused&&state==='play'){ctx.fillStyle='#09152b99';ctx.fillRect(0,0,W,H);ctx.fillStyle='white';ctx.font='bold 48px system-ui';ctx.textAlign='center';ctx.fillText('PAUSED',W/2,H/2)}
}
function loop(t){let dt=t-last||16.67;last=t;update(dt);draw();requestAnimationFrame(loop)}
$('start').onclick=start;$('again').onclick=start;$('jump').addEventListener('pointerdown',e=>{e.preventDefault();jump()});c.addEventListener('pointerdown',e=>{if(state==='play')jump()});
$('pause').onclick=()=>{if(state==='play')paused=!paused;$('pause').textContent=paused?'RESUME':'PAUSE'};
addEventListener('keydown',e=>{if(['Space','ArrowUp','KeyW'].includes(e.code)){e.preventDefault();jump()}if(e.code==='Escape'&&state==='play')paused=!paused});
reset();requestAnimationFrame(loop);
})();