const CubeDL = 'cube-dl';
const CubeDR = 'cube-dr';
const CubeUL = 'cube-ul';
const CubeUR = 'cube-ur';
const CubeLD = 'cube-ld';
const CubeRD = 'cube-rd';

class Unit extends Phaser.Sprite {

  static DefaultSize() {
    return {
      width: 80,
      height: 94
    };
  }

  static preload(game) {
    game.load.image(CubeDL, 'res/cube-dl.png');
    game.load.image(CubeDR, 'res/cube-dr.png');
    game.load.image(CubeUL, 'res/cube-ul.png');
    game.load.image(CubeUR, 'res/cube-ur.png');
    game.load.image(CubeLD, 'res/cube-ld.png');
    game.load.image(CubeRD, 'res/cube-rd.png');
  }

  constructor(game, player, group) {
    super(game, 0, 0, CubeDL);
    this.game = game;
    this.player = player;
    this.anchor.set(0.5);
    this.tint = this.player == 1 ? 0xff0000 : 0x548ce5;
    this.tile = null;
    this.tween = null;
    this.coordinate = null;
    this.onClicked = null;
    this.inputEnabled = true;
    this.input.pixelPerfectClick = true;
    this.events.onInputDown.add((s) => {
      if (this.onClicked)
        this.onClicked(this);
    }, this);
    if (group)
      group.add(this);
    else
      game.add.existing(this);
  }

  warpToTile(tile) {
    this.tile = tile;
    var target = {
      x: this.tile.position.x,
      y: this.tile.position.y - 50
    };
    this.position.set(target.x, target.y);
    this.coordinate = tile.coordinate;
  }

  tweenToTile(tile) {
    this.tile = tile;
    var target = {
      x: this.tile.position.x,
      y: this.tile.position.y - 50
    };
    var distance = Phaser.Math.distance(
      this.position.x, this.position.y,
      target.x, target.y);
    this.turnTo(target);
    if (this.tween) {
      this.tween.stop();
      this.tween = null;
    }
    this.tween = this.game.add.tween(this).to(target, Math.round(distance), Phaser.Easing.Linear.None, true);
    return this.tween;
  }

  turnTo(target) {
    var position = this.position;
    if (target.x > position.x) {
      if (target.y > position.y) {
        this.loadTexture(CubeDR);
      }else {
        this.loadTexture(CubeUR);
      }
    }else {
      if (target.y > position.y) {
        this.loadTexture(CubeDL);
      }else {
        this.loadTexture(CubeUL);
      }
    }
  }

  stand() {
    this.inputEnabled = true;
    var targetUp = {
      x: this.position.x,
      y: this.position.y - this.height * 0.1,
    };
    var targetDown = {
      x: this.tile.position.x,
      y: this.tile.position.y - 50
    };
    if (this.tween) {
      this.tween.stop();
      this.tween = null;
    }
    this.tween = this.game.add.tween(this)
    .to(targetUp, 250, Phaser.Easing.Linear.None, false, Math.random() * 2500)
    .to(targetDown, 500, Phaser.Easing.Bounce.Out, false)
    .loop().start();
  }

  idle() {
    this.inputEnabled = false;
    var target = {
      x: this.tile.position.x,
      y: this.tile.position.y - 50
    };
    if (this.tween) {
      this.tween.stop();
      this.tween = null;
    }
    this.tween = this.game.add.tween(this).to(target, 500, Phaser.Easing.Bounce.Out, true);
  }

  kill() {
    if(this.key == CubeDL)
      this.loadTexture(CubeLD);
    else if (this.key == CubeDR)
      this.loadTexture(CubeRD);
    var target = {
      x: this.position.x,
      y: this.position.y - this.height * 0.5,
      alpha: 0
    };
    if (this.tween != null) {
      this.tween.stop();
      this.tween = null;
    }
    this.tween = this.game.add.tween(this).to(target, 500, Phaser.Easing.Linear.None, true);
    this.tween.onComplete.add(() => this.destroy(), this);
    return this.tween;
  }

}
