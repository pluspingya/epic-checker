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
let table, state, units, guide, player1, player2, playAgainButton;

const PvP = 0;
const PvC = 1;
const CvC = 2;

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

  slickUI = game.plugins.add(Phaser.Plugin.SlickUI);
  slickUI.load('res/ui/kenney/kenney.json');
  game.load.image('menu-button', 'res/ui/menu.png');
}

function create() {
  game.add.sprite(0, 0, 'sky');

  state = new State();
  table = new Table(game, state);
  table.setPosition(
    canvasSize.width * 0.5 - table.getDisplaySize().width * 0.5,
    canvasSize.height * 0.5 - table.getDisplaySize().height * 0.5 + Tile.HalfSize().height);
  units = new Units(game, state, table.group.units);
  guides = new Guides(game, table.group.guides);

  createMenu();
}

function start(mode) {

  state.reset();
  table.reset(state);
  units.reset(state);

  switch(mode) {
    default:
    case PvP: {
      player1 = new PlayerInput(1, table, units, guides, onMakingAMove);
      player2 = new PlayerInput(2, table, units, guides, onMakingAMove);
    }break;
    case PvC: {
      player1 = new PlayerInput(1, table, units, guides, onMakingAMove);
      player2 = new PlayerAI(2, table, units, guides, onMakingAMove);
    }break;
    case CvC: {
      player1 = new PlayerAI(1, table, units, guides, onMakingAMove);
      player2 = new PlayerAI(2, table, units, guides, onMakingAMove);
    }break;
  }

  table.quakeAndCollapse(State.getQuakeAndCollapseCoodinates(state.snap));
  units.stand(state.snap.player);
  player1.setTurn(state.snap.player === 1, state);
  player2.setTurn(state.snap.player === 2, state);
}

function update() {
  units.sortZOrder();
}

function render() {
  // game.debug.inputInfo(832, 32);
  // for(let i=0; i<state.snap.map.length; i++)
  //   game.debug.text(state.snap.map[i], 32, 32 + i * 16);
  // game.debug.text('Count : ' + state.snap.turnCount, 190, 32);
  // game.debug.text('Red   : ' + units.units[0].length, 190, 32+16*1);
  // game.debug.text('Blue  : ' + units.units[1].length, 190, 32+16*2);
}

function onMakingAMove(unit, tile) {
  selectedUnit = units.getUnitsAtCoordinates([unit.coordinate])[0];// unit;
  selectedTile = table.getTileAtCoordinate(tile.coordinate);// tile;

  var tween = selectedUnit.tweenToTile(selectedTile);
  tween.onComplete.add(onMoveComplete, this);

  player1.setTurn(false);
  player2.setTurn(false);
}

function onMoveComplete() {
  State.move(state.snap, selectedUnit, selectedTile);
  table.quakeAndCollapse(State.getQuakeAndCollapseCoodinates(state.snap));

  var deadlist = State.getDeadList(state.snap, selectedUnit);
  var deadUnits = units.getUnitsAtCoordinates(deadlist);

  var tween = units.kill(deadUnits);
  if (tween) {
    tween.onComplete.add(() => {
      State.remove(state.snap, deadlist);
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

  var theWinner = State.getTheWinner(state.snap);
  if (theWinner > 0)
  {
    playAgainButton = game.add.button(game.world.centerX, game.world.centerY, 'player'+theWinner+'wins', onPlayAgain)
    playAgainButton.anchor.set(0.5);
    return;
  }

  player1.setTurn(state.snap.player === 1, state);
  player2.setTurn(state.snap.player === 2, state);
}

function onPlayAgain() {
  playAgainButton.destroy();
  state.reset();
  table.reset(state);
  units.reset(state);

  table.quakeAndCollapse(State.getQuakeAndCollapseCoodinates(state.snap));
  units.stand(state.snap.player);
  player1.setTurn(state.snap.player === 1, state);
  player2.setTurn(state.snap.player === 2, state);
}
