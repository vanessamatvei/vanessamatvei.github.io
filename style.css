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

  // Mobile nav toggle
  const nav = document.querySelector('nav');
  const toggle = document.createElement('div');
  toggle.className = 'nav-toggle';
  toggle.innerHTML = `<span></span><span></span><span></span>`;
  nav.prepend(toggle);
  toggle.addEventListener('click', () => nav.classList.toggle('show'));

  // Canvas for cherry blossom petals
  const canvas = document.getElementById('bg-canvas');
  if(canvas){
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    class Petal {
      constructor(){ this.reset(); }
      reset(){
        this.x = Math.random()*w;
        this.y = Math.random()*h;
        this.size = 4 + Math.random()*4;
        this.speedX = (Math.random()-0.5)*0.3;
        this.speedY = 0.3 + Math.random()*0.6;
        this.angle = Math.random()*Math.PI*2;
        this.spin = (Math.random()-0.5)*0.02;
        this.color = `hsla(340, 70%, 85%, ${0.6 + Math.random()*0.3})`;
      }
      draw(){
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.bezierCurveTo(this.size/2, -this.size/2, this.size/2, this.size/2, 0, this.size);
        ctx.bezierCurveTo(-this.size/2, this.size/2, -this.size/2, -this.size/2, 0, -this.size);
        ctx.fillStyle=this.color;
        ctx.fill();
        ctx.restore();
      }
      update(){
        this.x += this.speedX;
        this.y += this.speedY;
        this.angle += this.spin;
        if(this.y>h+10||this.x>w+10) this.reset();
      }
    }

    const petals = [];
    for(let i=0;i<120;i++) petals.push(new Petal());

    window.addEventListener('resize',()=>{ w=canvas.width=window.innerWidth; h=canvas.height=window.innerHeight; });

    function animate(){
      ctx.clearRect(0,0,w,h);
      petals.forEach(p=>{p.update(); p.draw();});
      requestAnimationFrame(animate);
    }
    animate();
  }

});
