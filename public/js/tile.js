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
    if (group)
      group.add(this);
    else
      game.add.existing(this);
  }

}
