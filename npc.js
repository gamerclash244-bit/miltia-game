// === NPC UPDATE LOGIC ===
      for (let i = npcs.length - 1; i >= 0; i--) {
        let npc = npcs[i];
        
        // SAFETY CHECK: Prevents the game from freezing if data is broken
        if (!npc || typeof npc.update !== 'function') continue; 

        npc.update(map, networkPlayers, myPlayer, 16, networkBullets);
        
        // Check if player bullets hit NPC
        bullets.forEach((b, bIdx) => {
            if (b.x > npc.x && b.x < npc.x + 40 && b.y > npc.y && b.y < npc.y + 40) {
                let dmg = WEAPONS[b.weapon || 'rifle'].damage;
                npc.health -= dmg;
                bullets.splice(bIdx, 1);
                
                damageNumbers.push({ x: npc.x + 20, y: npc.y - 5, value: dmg, vy: -2.5, opacity: 2.2, color: b.weapon === 'sniper' ? '#a29bfe' : b.weapon === 'shotgun' ? '#e67e22' : '#f1c40f', size: b.weapon === 'sniper' ? 22 : 16 });

                if (npc.health <= 0) {
                    myPlayer.kills++;
                    myPlayer.killStreak++;
                    checkStreak(myPlayer.killStreak);
                    killFeed.push({ text: `☠ YOU → ${npc.name}`, timer: 5.0, color: '#ff4757' });
                    spawnCoins(npc.x + 20, npc.y + 20);
                }
            }
        });

        if (npc.health <= 0) {
            npcs.splice(i, 1);
        }
      }
