const config = {
  type: Phaser.AUTO,
  width: 420,
  height: 640,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 800 }, debug: false }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  parent: 'game-container'
};

const game = new Phaser.Game(config);

let player, cursors, pipes, score = 0, scoreText, gameOver=false, startText;

function preload(){
  this.load.image('bg', 'assets/bg.png');
  this.load.image('player', 'assets/player.png');
  this.load.image('pipe', 'assets/pipe.png');
}

function create(){
  this.add.tileSprite(210,320,420,640,'bg');

  player = this.physics.add.sprite(100, 300, 'player').setScale(0.45);
  player.setCollideWorldBounds(true);
  player.setGravityY(0);

  // start instruction
  startText = this.add.text(210, 300, 'Tap/Space to Start', { fontSize:'20px', fill:'#fff' }).setOrigin(0.5);

  pipes = this.physics.add.group();

  scoreText = this.add.text(16, 16, 'Score: 0', { fontSize:'20px', fill:'#fff' });

  // controls
  this.input.on('pointerdown', flap, this);
  cursors = this.input.keyboard.createCursorKeys();
  this.input.keyboard.on('keydown-SPACE', flap, this);

  this.time.addEvent({ delay: 1500, callback: spawnPipes, callbackScope: this, loop: true });
  this.physics.add.collider(player, pipes, hitPipe, null, this);
}

function update(){
  if(gameOver) return;

  if(player.body.velocity.y > 5){
    player.setAngle(10);
  } else {
    player.setAngle(-10);
  }

  if(cursors.up.isDown) flap();
}

function flap(){
  if(gameOver) {
    // restart
    gameOver = false;
    score = 0;
    scoreText.setText('Score: 0');
    player.x = 100; player.y = 300;
    player.setVelocityY(0); player.setGravityY(800);
    pipes.clear(true,true);
    startText.setVisible(false);
    return;
  }
  if(startText.visible) startText.setVisible(false);
  player.setVelocityY(-330);
  player.setGravityY(800);
}

function spawnPipes(){
  if(startText.visible) return; // wait until start

  const gap = 140;
  const min = 120, max = 400;
  const topY = Phaser.Math.Between(min, max);
  const topPipe = pipes.create(460, topY - gap/2 - 320, 'pipe').setOrigin(0.5,1);
  const bottomPipe = pipes.create(460, topY + gap/2 + 320, 'pipe').setOrigin(0.5,0);
  topPipe.body.allowGravity = false;
  bottomPipe.body.allowGravity = false;
  topPipe.setVelocityX(-200);
  bottomPipe.setVelocityX(-200);

  // score when pipe passes player
  this.time.addEvent({
    delay: 1200,
    callback: ()=> {
      if(!gameOver){
        score += 1;
        scoreText.setText('Score: ' + score);
      }
    }, callbackScope: this, loop: false
  });
}

function hitPipe(){
  gameOver = true;
  startText.setText('Game Over - Tap/Space to Restart');
  startText.setVisible(true);
  player.setVelocityY(0);
  player.setGravityY(0);
  pipes.setVelocityX(0);
}
