class NPC {
  constructor(id, name, color) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.x = Math.random() * 8000 + 500;
    this.y = 2000;
    this.width = 40;
    this.height = 40;
    this.dx = 0;
    this.dy = 0;
    this.health = 100;
    this.maxHealth = 100;
    this.aimAngle = 0;
    this.weapon = 'rifle';
    
    this.targetPlayer = null;
    this.state = 'idle'; 
    this.decisionTimer = 0;
    this.moveDir = Math.random() > 0.5 ? 1 : -1;
    this.isJumping = false;
    this.lastShotTime = 0;
  }

  update(platforms, players, myPlayer, dt, networkBullets) {
    if (this.health <= 0) return;

    const now = Date.now();
    this.decisionTimer -= dt; 

    let closest = myPlayer;
    let minDist = Math.hypot(myPlayer.x - this.x, myPlayer.y - this.y);
    
    for (let id in players) {
        let p = players[id];
        if (p.health <= 0) continue;
        let d = Math.hypot(p.x - this.x, p.y - this.y);
        if (d < minDist) { minDist = d; closest = p; }
    }
    
    this.targetPlayer = (minDist < 1200) ? closest : null;

    if (this.decisionTimer <= 0) {
      this.decisionTimer = 1000 + Math.random() * 2000;
      if (this.targetPlayer) {
        this.state = 'combat';
        this.moveDir = this.targetPlayer.x > this.x ? 1 : -1;
      } else {
        this.state = 'patrol';
        if (Math.random() > 0.7) this.moveDir *= -1;
      }
    }

    let speed = 4;
    this.x += this.moveDir * speed;

    this.dy += 0.35; 
    
    if ((this.targetPlayer && this.targetPlayer.y < this.y - 100) || this.y > 2300) {
      this.dy -= 0.8; 
      this.isJumping = true;
    } else {
      this.isJumping = false;
    }
    this.y += this.dy;

    platforms.forEach(obj => {
      if (this.x < obj.x + obj.w && this.x + this.width > obj.x && 
          this.y < obj.y + obj.h && this.y + this.height > obj.y) {
        if (this.dy > 0) {
          this.y = obj.y - this.height;
          this.dy = 0;
        } else if (this.dy < 0) {
          this.y = obj.y + obj.h;
          this.dy = 0;
        }
      }
    });

    if (this.targetPlayer && this.health > 0) {
      let targetX = this.targetPlayer.x + 20;
      let targetY = this.targetPlayer.y + 20;
      
      let desiredAngle = Math.atan2(targetY - (this.y + 20), targetX - (this.x + 20));
      this.aimAngle += (desiredAngle - this.aimAngle) * 0.1;

      if (now - this.lastShotTime > 400 + Math.random() * 600) {
        this.shoot(now, networkBullets);
      }
    }
  }

  shoot(now, networkBullets) {
    this.lastShotTime = now;
    const bvx = Math.cos(this.aimAngle) * 14;
    const bvy = Math.sin(this.aimAngle) * 14;
    
    networkBullets.push({
      x: this.x + 20,
      y: this.y + 20,
      vx: bvx,
      vy: bvy,
      radius: 4,
      color: '#ffffff'
    });
  }
}

const npcNames = ["Alpha_Unit", "Ghost_Z", "Rogue_01", "Shadow_Byte", "Viper", "Keralite_Pro", "Bot_Nizal", "Cyber_Rex", "Void_Walker", "Neon_Soul"];
const npcColors = ["#ff4757", "#2ecc71", "#3498db", "#f1c40f", "#a29bfe", "#fd79a8"];

function spawnNPCs(count) {
  let list = [];
  for (let i = 0; i < count; i++) {
    let name = npcNames[Math.floor(Math.random() * npcNames.length)] + "_" + Math.floor(Math.random() * 99);
    let color = npcColors[Math.floor(Math.random() * npcColors.length)];
    list.push(new NPC("npc_" + i, name, color));
  }
  return list;
}
