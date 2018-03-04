class Table {

  static TableSize() {
    return {
      column: 8,
      row: 8
    };
  }

  static preload(game) {
    Tile.preload(game);
  }

  constructor(game, state) {
    this.game = game;
    this.state = state;
    this.group = {
      tiles: null,
      guides: null,
      units: null
    };
    this.tiles = null;
    this.onTileClicked = [];

    this.instantiate();
  }

  instantiate() {
    if (this.group.tiles == null)   this.group.tiles = this.game.add.group();
    if (this.group.guides == null)  this.group.guides = this.game.add.group();
    if (this.group.units == null)   this.group.units =  this.game.add.group();

    this.tiles = [];

    var tableSize = Table.TableSize();
    var tileSize = Tile.DefaultSize();
    var halfTileSize = Tile.HalfSize();

    for(let row=0; row<this.state.snap.map.length; row++) {
      for(let column=0; column<this.state.snap.map[row].length; column++) {
        if (column == 0)
          this.tiles.push([]);
        if (this.state.snap.map[row][column] < 0) {
          this.tiles[row].push(null);
          continue;
        }
        var tile = new Tile(game, row, column, this.group.tiles);
        tile.onClicked = (t) => {
            this.onTileClicked.forEach(cb => cb(t));
        };
        this.tiles[row].push(tile);
      }
    }

  }

  reset(state) {
    this.tiles.forEach(row => row.forEach(tile => {
      if (tile != null)
        tile.destroy();
      }));
    this.state = state;
    this.instantiate();
  }

  quakeAndCollapse({quakeCoordinates, collapseCoordinates}) {
    var quakeTiles = this.getTilesAtCoordinates(quakeCoordinates);
    quakeTiles.forEach(tile => tile.quake());
    var collapseTiles = this.getTilesAtCoordinates(collapseCoordinates);
    collapseTiles.forEach(tile => {
      this.tiles[tile.coordinate.row][tile.coordinate.column] = null;
      tile.collapse();
    });
  }

  setPosition(x, y) {
    [
      this.group.tiles,
      this.group.guides,
      this.group.units
    ].forEach(group => group.position.set(x, y));
  }

  getAnyTile() {
    for(let row = 0; row<this.tiles.length; row++) {
      for(let column=0; column<this.tiles[row].length; column++) {
        if (this.tiles[row][column] != null)
          return this.tiles[row][column];
      }
    }
    return null;
  }

  getTileAtCoordinate(coordinate) {
    return this.tiles[coordinate.row][coordinate.column];
  }
  
  getTilesAtCoordinates(coordinates) {
    let ret = [];
    coordinates.forEach(coordinate => ret.push(this.tiles[coordinate.row][coordinate.column]));
    return ret;
  }

  getDisplaySize() {

    return {
      width: tableSize.row * halfTileSize.width + tableSize.column * halfTileSize.width,
      height: tableSize.row * halfTileSize.height + tableSize.column * halfTileSize.height + (this.getAnyTile().height - Tile.DefaultSize().height),
    };
  }
}
