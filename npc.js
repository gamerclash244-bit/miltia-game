/**
 * BaylerBay Ops - Advanced NPC System
 */

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
    
    this.target = null;
    this.state = 'idle'; 
    this.decisionTimer = 0;
    this.moveDir = Math.random() > 0.5 ? 1 : -1;
    this.lastShotTime = 0;
  }

  update(platforms, networkPlayers, myPlayer, dt, networkBullets, allNPCs) {
    if (this.health <= 0) return;

    const now = Date.now();
    this.decisionTimer -= dt; 

    // --- 1. TARGETING SYSTEM (Shoots Players AND Other Bots) ---
    let closest = null;
    let minDist = 1200; // Aggro range

    // Check distance to YOU
    let distToMe = Math.hypot(myPlayer.x - this.x, myPlayer.y - this.y);
    if (distToMe < minDist && myPlayer.health > 0) {
      minDist = distToMe;
      closest = myPlayer;
    }

    // Check distance to NETWORK PLAYERS
    for (let id in networkPlayers) {
      let p = networkPlayers[id];
      if (p.health <= 0) continue;
      let d = Math.hypot(p.x - this.x, p.y - this.y);
      if (d < minDist) { minDist = d; closest = p; }
    }

    // Check distance to OTHER NPCs
    for (let i = 0; i < allNPCs.length; i++) {
      let otherBot = allNPCs[i];
      if (otherBot.id === this.id || otherBot.health <= 0) continue;
      let d = Math.hypot(otherBot.x - this.x, otherBot.y - this.y);
      if (d < minDist) { minDist = d; closest = otherBot; }
    }
    
    this.target = closest;

    // --- 2. MOVEMENT & DECISION LOGIC ---
    if (this.decisionTimer <= 0) {
      this.decisionTimer = 1000 + Math.random() * 2000;
      if (this.target) {
        this.state = 'combat';
        this.moveDir = this.target.x > this.x ? 1 : -1;
      } else {
        this.state = 'patrol';
        if (Math.random() > 0.7) this.moveDir *= -1;
      }
    }

    this.x += this.moveDir * 4; // Move speed
    this.dy += 0.35; // Gravity
    
    // Jetpack Logic
    if ((this.target && this.target.y < this.y - 100) || this.y > 2300) {
      this.dy -= 0.8; 
    }
    this.y += this.dy;

    // Platform Collisions
    platforms.forEach(obj => {
      if (this.x < obj.x + obj.w && this.x + this.width > obj.x && 
          this.y < obj.y + obj.h && this.y + this.height > obj.y) {
        if (this.dy > 0) { this.y = obj.y - this.height; this.dy = 0; } 
        else if (this.dy < 0) { this.y = obj.y + obj.h; this.dy = 0; }
      }
    });

    // --- 3. COMBAT LOGIC ---
    if (this.target && this.health > 0) {
      let targetX = this.target.x + 20;
      let targetY = this.target.y + 20;
      
      let desiredAngle = Math.atan2(targetY - (this.y + 20), targetX - (this.x + 20));
      this.aimAngle += (desiredAngle - this.aimAngle) * 0.15; // Smooth aiming

      if (now - this.lastShotTime > 500 + Math.random() * 500) {
        this.shoot(now, networkBullets);
      }
    }
  }

  shoot(now, networkBullets) {
    this.lastShotTime = now;
    networkBullets.push({
      x: this.x + 20,
      y: this.y + 20,
      vx: Math.cos(this.aimAngle) * 14,
      vy: Math.sin(this.aimAngle) * 14,
      radius: 4,
      color: '#ffffff',
      ownerId: this.id // Identifies who shot it
    });
  }
}

// Spawner
function spawnNPCs(count) {
  const names = ["Alpha_Unit", "Ghost_Z", "Rogue_01", "Shadow_Byte", "Viper", "Keralite_Pro", "Bot_Nizal", "Cyber_Rex", "Void_Walker"];
  const colors = ["#ff4757", "#2ecc71", "#3498db", "#f1c40f", "#a29bfe", "#fd79a8"];
  let list = [];
  for (let i = 0; i < count; i++) {
    let n = names[Math.floor(Math.random() * names.length)] + "_" + Math.floor(Math.random() * 99);
    let c = colors[Math.floor(Math.random() * colors.length)];
    list.push(new NPC("npc_" + i, n, c));
  }
  return list;
}
