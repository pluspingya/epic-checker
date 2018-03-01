var tableSize = {
  column: 8,
  row: 8
};

var tileSize = Tile.DefaultSize();

var halfTileSize = {
  width: tileSize.width / 2,
  height: tileSize.height /2
};

var canvasSize = {
  width: tableSize.column * tileSize.width + halfTileSize.width,
  height: tableSize.row * tileSize.height + tileSize.height * 2
};

var selectedUnit = null, selectedTile = null;
var possibleMoves = null;
let table, state, units, guide, button;

var game = new Phaser.Game(canvasSize.width, canvasSize.height, Phaser.AUTO, 'canvas', {
  preload: preload,
  create: create,
  update: update,
  render: render
});

function preload() {
  game.load.image('epicchecker', 'res/epicchecker.png');
  game.load.image('player1wins', 'res/player1wins.png');
  game.load.image('player2wins', 'res/player2wins.png');
  game.load.image('sky', 'res/sky.jpg');

  Table.preload(game);
  Units.preload(game);
  Guides.preload(game);
}

function create() {
  game.add.sprite(0, 0, 'sky');

  state = new State();

  table = new Table(game, state);
  table.instantiate();
  table.setPosition(
    canvasSize.width * 0.5 - table.getDisplaySize().width * 0.5,
    canvasSize.height * 0.5 - table.getDisplaySize().height * 0.5 + Tile.HalfSize().height);
  table.onTileClicked = onTileClicked;

  units = new Units(game, state, table.group.units);
  units.instantiate();
  units.onUnitClicked = onUnitClicked;

  guides = new Guides(game, table.group.guides);

  table.quakeAndCollapse(state.getQuakeAndCollapseCoodinates());
  units.stand(state.snap.player);
}

function update() {
  units.sortZOrder();
}

function render() {
//  game.debug.inputInfo(32, 32);
  for(let i=0; i<state.snap.map.length; i++)
    game.debug.text(state.snap.map[i], 32, 32 + i * 16);
  game.debug.text('Count : ' + state.snap.turnCount, 190, 32);
  game.debug.text('Red   : ' + units.units[0].length, 190, 32+16*1);
  game.debug.text('Blue  : ' + units.units[1].length, 190, 32+16*2);
}

function onUnitClicked(unit) {
  if (selectedTile != null) //unit still moving to this tile
    return;

  if (state.snap.player != unit.player)
    return; //it's not your turn

  selectedUnit = unit;

  possibleMoves = state.getPossibleMoves(table, selectedUnit);
  guides.show(possibleMoves);
}

function onTileClicked(tile) {
  if (selectedTile != null) //unit still moving to this tile
    return;

  if (selectedUnit == null)
    return;

  var canMove = possibleMoves && possibleMoves.find(p =>
    p.coordinate.row == tile.coordinate.row &&
    p.coordinate.column == tile.coordinate.column);
  if (!canMove)
    return;

  selectedTile = tile;
  var tween = selectedUnit.tweenToTile(tile);
  tween.onComplete.add(onMoveComplete, this);

  guides.hide();
}

function onMoveComplete() {

  state.move(selectedUnit, selectedTile);
  table.quakeAndCollapse(state.getQuakeAndCollapseCoodinates());

  var deadlist = state.getDeadList(selectedUnit);
  var deadUnits = units.getUnitsAtCoordinates(deadlist);

  var tween = units.kill(deadUnits);
  if (tween) {
    tween.onComplete.add(() => {
      state.remove(deadlist);
      onRemoveComplete();
    }, this);
  }else {
    onRemoveComplete();
  }

}

function onRemoveComplete() {
  selectedUnit = null;
  selectedTile = null;


  units.stand(state.snap.player);

  var theWinner = state.getTheWinner(table);
  if (theWinner > 0)
  {
    button = game.add.button(game.world.centerX, game.world.centerY, 'player'+theWinner+'wins', onPlayAgain)
    button.anchor.set(0.5);
  }
}

function onPlayAgain() {
  button.destroy();
  state.reset();
  table.reset(state);
  units.reset(state);

  table.quakeAndCollapse(state.getQuakeAndCollapseCoodinates());
  units.stand(state.snap.player);
}
