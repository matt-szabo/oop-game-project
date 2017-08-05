// This sectin contains some game constants. It is not super interesting
var GAME_WIDTH = 750;
var GAME_HEIGHT = 500;
//var HMOVE_WIDTH = 25;

var ENEMY_WIDTH = 75;
var ENEMY_HEIGHT = 75;
var MAX_ENEMIES = 3;
var MAX_COINS = 1;
var MAX_BULLETS = 5;
var coincollp = 0;

var BULLET_HEIGHT = 75;
var BULLET_WIDTH = 75;

var COIN_WIDTH = 75;
var COIN_HEIGHT = 75;
var ENTER_BAR_CODE = 13;


var PLAYER_WIDTH = 75;
var PLAYER_HEIGHT = 54;
var PLAYER_HEALTH = 150;

// These two constants keep us from using "magic numbers" in our code
var LEFT_ARROW_CODE = 37;
var RIGHT_ARROW_CODE = 39;
var SPACE_BAR_CODE = 32;
var UP_ARROW_CODE = 38;

// These two constants allow us to DRY
var MOVE_LEFT = 'left'; 
var MOVE_RIGHT = 'right';

// Preload game images
var images = {};
['enemy.png', 'stars.png', 'player.png','coin.png','bullet.png'].forEach(imgName => {
    var img = document.createElement('img');
    img.src = 'images/' + imgName;
    images[imgName] = img;
});


// GLOBAL MUSIC VARIABLE AND CONSTRUCTOR

var myMusic;

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }    
}

// This section is where you will be doing most of your coding

class Entity {

 render(ctx) {
        ctx.drawImage(this.sprite, this.x, this.y);
    }
}



class Coin extends Entity {

    constructor(xPos) {
    super();
        this.x = xPos;
        this.y = -COIN_HEIGHT;
        this.sprite = images['coin.png'];
        this.coincoll = coincollp;

        // Each COIN should have a different speed
        this.speed = Math.random() / 2 + 0.25;
    }

    update(timeDiff) {
        this.y = this.y + timeDiff * this.speed;
    }

   //  render(ctx) {
//         ctx.drawImage(this.sprite, this.x, this.y);
//     }
}

class Bullet extends Entity {

    constructor(xPos) {
    super();
        this.x = xPos;
        this.y = GAME_HEIGHT-PLAYER_HEIGHT;
        this.sprite = images['bullet.png'];
       

        // Each COIN should have a different speed
        this.speed = Math.random() / 2 + 0.25;
    }

    update(timeDiff) {
        this.y = this.y - timeDiff * this.speed;
    }

   //  render(ctx) {
//         ctx.drawImage(this.sprite, this.x, this.y);
//     }
}


class Enemy extends Entity {

    constructor(xPos) {
    super();
        this.x = xPos;
        this.y = -ENEMY_HEIGHT;
        this.sprite = images['enemy.png'];

        // Each enemy should have a different speed
        this.speed = Math.random() / 2 + 0.25;
    }

    update(timeDiff) {
        this.y = this.y + timeDiff * this.speed;
    }

   //  render(ctx) {
//         ctx.drawImage(this.sprite, this.x, this.y);
//     }
}

class Player extends Entity {

    constructor() {
    super();
        this.x = 2 * PLAYER_WIDTH;
        this.y = GAME_HEIGHT - PLAYER_HEIGHT - 10;
        this.sprite = images['player.png'];
        this.health = PLAYER_HEALTH;
        this.coincoll = coincollp;
    }

    // This method is called by the game engine when left/right arrows are pressed
   move(direction) {
//         if (direction === MOVE_LEFT && this.x > 0) {
//             this.x = this.x - PLAYER_WIDTH;
//         }
//         else if (direction === MOVE_RIGHT && this.x < GAME_WIDTH - PLAYER_WIDTH) {
//             this.x = this.x + PLAYER_WIDTH;
//         }
//     }

 if (direction === MOVE_LEFT) {
         if (this.x === 0){ //i.e. if we are in the leftmost position which at 0 px, 2nd leftmost position is 75 px as we are adding width of burger
            this.x = GAME_WIDTH - PLAYER_WIDTH;
         }
         else if (this.x > 0){ //normal situation
            this.x = this.x - PLAYER_WIDTH;
         }
         // console.log(this.x); //debugging
      }
     else if (direction === MOVE_RIGHT) {
         if ( this.x < GAME_WIDTH - PLAYER_WIDTH ){ //normal situation
            this.x = this.x + PLAYER_WIDTH;
         }
         else if (this.x === (GAME_WIDTH - PLAYER_WIDTH)){ //most rightmost position (dynamic to game width and player width)
            this.x = 0;
         }
}

}
}



/*
This section is a tiny game engine.
This engine will use your Enemy and Player classes to create the behavior of the game.
The engine will try to draw your game at 60 frames per second using the requestAnimationFrame function
*/
class Engine {
    constructor(element) {
        // Setup the player
        this.player = new Player();

        // Setup enemies, making sure there are always three
        this.setupEnemies();
        
        // Setup coins make sure there is always 1
        this.setupCoins();

        this.setupBullets();

        // Setup the <canvas> element where we will be drawing
        var canvas = document.createElement('canvas');
        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;
        element.appendChild(canvas);

        this.ctx = canvas.getContext('2d');

        // Since gameLoop will be called out of context, bind it once here.
        this.gameLoop = this.gameLoop.bind(this);
    }

    /*
     The game allows for 5 horizontal slots where an enemy can be present.
     At any point in time there can be at most MAX_ENEMIES enemies otherwise the game would be impossible
     */
   //**************************************
   
  setupCoins() {
        if (!this.coins) {
            this.coins = [];
        }
         
        
        while (this.coins.filter(e => !!e).length < MAX_COINS) {
            this.addCoins();
        }
    }
    

    setupEnemies() {
        if (!this.enemies) {
            this.enemies = [];
        }

		//todo: find a way to make this add an enemy every 5 seconds when called from gameloop and not when starting 1st time
        while (this.enemies.filter(e => !!e).length < MAX_ENEMIES) {
            this.addEnemy();
        }
    }

    setupBullets(argi) {
        if (!this.bullets) {
            this.bullets = [];
        }

		//todo: find a way to make this add an enemy every 5 seconds when called from gameloop and not when starting 1st time
        while (this.bullets.filter(e => !!e).length < MAX_BULLETS) {
            this.addBullets(argi);
        }
    }

    // This method finds a random spot where there is no enemy, and puts one in there
    addEnemy() {
        var enemySpots = GAME_WIDTH / ENEMY_WIDTH; // 5 columns

        var enemySpot; // defaults to undefined - no assignment
        // Keep looping until we find a free enemy spot at random
        while (enemySpot === undefined || this.enemies[enemySpot]) {
            enemySpot = Math.floor(Math.random() * enemySpots);
        }

        this.enemies[enemySpot] = new Enemy(enemySpot * ENEMY_WIDTH);
    }

// ***************** ADD coins

    addCoins() {
        var coinSpots = GAME_WIDTH / COIN_WIDTH; // 5 coins for 5 columns
		
        var coinSpot;
        
        
        // Keep looping until we find a free coin spot at random
        while (coinSpot === undefined || this.coins[coinSpot]) {
            coinSpot = Math.floor(Math.random() * coinSpots);
        }

        this.coins[coinSpot] = new Coin(coinSpot * COIN_WIDTH);
    }


        addBullets(argi) {
        var bulletSpots = GAME_WIDTH / BULLET_WIDTH; // 5 coins for 5 columns
		
        var bulletSpot;
        
        
        // Keep looping until we find a free coin spot at random
        while (bulletSpot === undefined || this.bullets[bulletSpot]) {
            bulletSpot = Math.floor(Math.random() * bulletSpots);
        }

        this.bullets[bulletSpot] = new Bullet(argi);
    }

    // This method kicks off the game
    start() {
        this.score = 0;
        this.lastFrame = Date.now();
    	
    	// MUSIC STARTS
    	
    	myMusic = new sound("gametheme.mp3");
    	myMusic.play();

        // Listen for keyboard left/right and update the player
        document.addEventListener('keydown', e => {
            if (e.keyCode === LEFT_ARROW_CODE) {
                this.player.move(MOVE_LEFT);
            }
            else if (e.keyCode === RIGHT_ARROW_CODE) {
                this.player.move(MOVE_RIGHT);
            }
        });

        this.gameLoop();
    }

    /*
    This is the core of the game engine. The `gameLoop` function gets called ~60 times per second
    During each execution of the function, we will update the positions of all game entities
    It's also at this point that we will check for any collisions between the game entities
    Collisions will often indicate either a player death or an enemy kill

    In order to allow the game objects to self-determine their behaviors, gameLoop will call the `update` method of each entity
    To account for the fact that we don't always have 60 frames per second, gameLoop will send a time delta argument to `update`
    You should use this parameter to scale your update appropriately
     */
    gameLoop() {
        
        // Check how long it's been since last frame
        var currentFrame = Date.now();
        var timeDiff = currentFrame - this.lastFrame;

        // Increase the score!
        this.score += timeDiff;

        // Call update on all enemies
        this.enemies.forEach(enemy => enemy.update(timeDiff));

		// Call update on coins
		this.coins.forEach(coiny => coiny.update(timeDiff));

		// Call update on bullets
		this.bullets.forEach(bullety => bullety.update(timeDiff));
		
		// Draw everything!
        this.ctx.drawImage(images['stars.png'], 0, 0); // draw the star bg
        
        this.enemies.forEach(enemy => enemy.render(this.ctx)); // draw the enemies
        
        this.coins.forEach(coiny => coiny.render(this.ctx)); // draw the coins

        this.bullets.forEach(bullety => bullety.render(this.ctx));
        
        this.player.render(this.ctx); // draw the player

		// INCREASE SPEED OF ENEMY Falling
		
		   this.enemies.forEach((enemy, enemyIdx) => {
            enemy.speed = enemy.speed + this.score/350000;
            });

        // Check if any enemies should die
        
        this.enemies.forEach((enemy, enemyIdx) => {
            if (enemy.y > GAME_HEIGHT ) {
                delete this.enemies[enemyIdx];
            }
        });
        
         // Check if any coins should be removed from screen
        
        
        this.coins.forEach((coiny, coinIdx) => {
            if (coiny.y > GAME_HEIGHT) {
                delete this.coins[coinIdx];
            }
        });
        
     this.bullets.forEach((bullety, bulletIdx) => {
            if (bullety.y < 0) {
                delete this.bullets[bulletIdx];
            }
        });

		// this.enemies.forEach((enemy, enemyIdx) => {

		// 	this.bullets.forEach(bullety,bulletIdx) => {
		// 		if (enemy.x === bullety.x && enemy.y >= bullety.y) {

	
  //               delete this.enemies[enemyIdx];
  //           }

  //           });
  //       });        

// this.enemies.forEach(function(enemy){

// 	this.bullets.forEach(function(bullety){

// if (enemy.x === bullety.x && enemy.y >= bullety.y) {

	
//            delete this.enemies[];
//              }



// 	});
// });

		      



        this.setupEnemies();
	
		
		this.setupCoins();

		 document.addEventListener('keydown', e => {
             if (e.keyCode === SPACE_BAR_CODE) {
             this.setupBullets(this.player.x);
            
        }
             });

		//this.setupBullets();
		
        
        
         if(this.checkCoins()){
         
        
        this.player.coincoll++;
         
         }

        // if(this.isEnemyShot()){
         
        // this.enemies.forEach((enemy, enemyIdx) => {
        //         delete this.enemies[enemyIdx];
            
        // });
         
        // }
         
         
        if (this.isPlayerDead() && this.player.health > 0){
           this.player.health--;
        }

        if (this.player.health === 0) {
        
        // STOP THE MUSIC
        
        myMusic.stop();
           
           // If they are dead, then it's game over!
           
           
            this.player.health = PLAYER_HEALTH;
           // this.coins.coincoll = coincollp;  //reset the health
            this.ctx.font = 'bold 30px Impact';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(this.score + ' SCORE ', 120, 150);
            this.ctx.fillText(' PRESS ENTER TO RESTART ', 40, 190);
            
            // LISTEN FOR SPACE BAR TO RESTART
            
            document.addEventListener('keydown', e => {
             if (e.keyCode === ENTER_BAR_CODE) {
             location.reload();
            
        }
             });
        }
        else {
        
          //  If player is not dead, then draw the score
          
          
            this.ctx.font = 'bold 30px Impact';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(this.score + " score", 5, 30);
    		this.ctx.fillText(this.player.coincoll + ' COINS ', 5, 110);
            if (this.player.health < 50){
               this.ctx.fillStyle = 'red';
            }
            else {
               this.ctx.fillStyle = 'green';
            }
            this.ctx.fillText(this.player.health + " health", 5, 70);

           // Set the time marker and redraw
            this.lastFrame = Date.now();
           requestAnimationFrame(this.gameLoop);
        }
        }
        


    isPlayerDead() {
    
    	var dead = false;
    	
    	this.enemies.forEach((enemy) => {
		            
            if (enemy.x === this.player.x && enemy.y + ENEMY_HEIGHT >= this.player.y){
            dead = true;
            return;
            }
        });
        
    return dead;
	}
	

	 //    isEnemyShot(){
    
  //   	var shot = false;
    	
  //   	this.bullets.forEach((bullety) => {
		            
  //           if (bullety.x === this.enemies.x && bullety.y <= this.enemies.y + ENEMY_HEIGHT){
  //           shot = true;
  //           return;
  //           }
  //       });
        
  //   	return shot;
		// }


	checkCoins(){
	
	var cointouch = false;
    	
    	this.coins.forEach((coiny) => {
		            
            if (coiny.x === this.player.x && coiny.y + COIN_HEIGHT >= this.player.y){
            cointouch = true;
            
            return;
            }
        });
        
    return cointouch;
	}
	
	
	
}

// This section will start the game
var gameEngine = new Engine(document.getElementById('app'));
gameEngine.start();