/* script.js — subtle flowing petal animation for soft, elegant effect */

document.addEventListener('DOMContentLoaded', () => {

  // Scroll reveal
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, {threshold:0.1});
  reveals.forEach(r=>io.observe(r));

  // Canvas for subtle flowing petals / abstract shapes
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;

  class Particle {
    constructor(){
      this.reset();
    }
    reset(){
      this.x = Math.random()*w;
      this.y = Math.random()*h;
      this.size = 2+Math.random()*3;
      this.speedX = 0.1 + Math.random()*0.4;
      this.speedY = 0.1 + Math.random()*0.4;
      this.color = `hsla(${Math.random()*50+280}, 60%, 70%, 0.5)`;
    }
    draw(){
      ctx.beginPath();
      ctx.ellipse(this.x,this.y,this.size,this.size/1.5,0,0,Math.PI*2);
      ctx.fillStyle=this.color;
      ctx.fill();
    }
    update(){
      this.x += this.speedX;
      this.y += this.speedY;
      if(this.x>w+10||this.y>h+10)this.reset();
    }
  }

  const particles = [];
  for(let i=0;i<80;i++) particles.push(new Particle());

  window.addEventListener('resize',()=>{w=canvas.width=window.innerWidth; h=canvas.height=window.innerHeight;});

  function animate(){
    ctx.clearRect(0,0,w,h);
    particles.forEach(p=>{p.update(); p.draw();});
    requestAnimationFrame(animate);
  }
  animate();

});
