const ASSET_TILE = 'tile';

class Tile extends Phaser.Sprite {

  static DefaultSize() {
    return {
      width: 128,
      height: 74
    };
  }

  static HalfSize() {
    var defaultSize = Tile.DefaultSize();
    return {
      width: defaultSize.width / 2,
      height: defaultSize.height / 2
    };
  }

  static preload(game) {
    game.load.image(ASSET_TILE, 'res/ground-air-tile.png');
  }

  constructor(game, row, column, group) {
    super(game, 0, 0, ASSET_TILE);
    this.anchor.set(0.5);
    this.inputEnabled = true;
    this.input.pixelPerfectClick = true;
    this.onClicked = null;
    this.events.onInputDown.add((s) => {
      if (this.onClicked)
        this.onClicked(this);
    }, this);
    var halfTileSize = Tile.HalfSize();
    this.coordinate = { row, column }
    this.position.set(
      (column * halfTileSize.width - row * halfTileSize.width) + (tableSize.row * halfTileSize.width),
      (column * halfTileSize.height + row * halfTileSize.height) + this.height * 0.5
    );
    this.tween = null;
    if (group)
      group.add(this);
    else
      game.add.existing(this);
  }

  quake() {
    if (this.tween) {
      this.tween.stop();
      this.tween = null;
    }
    this.tween = this.game.add.tween(this)
    .to({angle:-5}, 100, Phaser.Easing.Linear.None, false)
    .to({angle: 0}, 100, Phaser.Easing.Bounce.None, false)
    .to({angle: 5}, 100, Phaser.Easing.Bounce.None, false)
    .to({angle: 0}, 100, Phaser.Easing.Bounce.None, false)
    .loop().start();
  }

  collapse() {
    var target = {
      x: this.position.x,
      y: this.position.y + this.height * 0.5,
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
