const ASSET_GUIDE = 'guide';

class Guide extends Phaser.Sprite {

  static preload(game) {
    game.load.image(ASSET_GUIDE, 'res/isotile.png');
  }

  constructor(game, group) {
    super(game, 0, 0, ASSET_GUIDE);
    this.anchor.set(0.5);
    if (group)
      group.add(this);
    else
      game.add.existing(this);
  }

  setToTile(tile) {
    this.position.set(
      tile.position.x,
      tile.position.y - 28);
  }

}
