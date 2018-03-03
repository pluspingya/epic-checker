const PrunningInfinityValue = 99999999;

class PrunningNode {
  constructor(isMaximizer) {
      this.isMaximizer = isMaximizer;
      this.alpha = -PrunningInfinityValue;
      this.beta = +PrunningInfinityValue;
      this.value = this.isMaximizer ? this.alpha : this.beta;
  }
}

class PlayerAIPrunning extends Player {
  constructor(player, table, units, guides, onMakingAMove) {
    super(player, table, units, guides, onMakingAMove);
  }

  setTurn(turn, state) {
    super.setTurn(turn, state);

    if (!this.isMyTurn)
      return;

    var myUnits = this.units.units[this.player-1];
    var tmpUnits = [].concat(myUnits);
    var selectedUnit = null;
    var selectedTile = null;
    var snap = JSON.parse(JSON.stringify(state.snap));
    // console.log("==== initial ====");
    // snap.map.forEach(row => console.log(row));

    let greatMove = this.getGreatMove(snap, tmpUnits);

    this.onMakingAMove(greatMove.unit, greatMove.tile);
  }

  getGreatMove(snap, units) {
    let possibleMoves = [];
    units.forEach(unit => possibleMoves = possibleMoves.concat(this.state.getPossibleMoves(this.table, unit)));
    // console.log('possibleMoves:');
    // possibleMoves.forEach(move => console.log('from', move.unit.coordinate, ' to ', move.tile.coordinate));
    if (possibleMoves.length == 0)
      return null;

    var bestValue = -PrunningInfinityValue;
    var possibleMovesOrderByValue = {};
    for(let i=0; i<possibleMoves.length; i++) {
      var move = possibleMoves[i];
      let value = PlayerAIPrunning.getValue(snap, move.unit, move.tile, new PrunningNode(true), false, 2);
      if (!possibleMovesOrderByValue[value])
        possibleMovesOrderByValue[value] = [];
      possibleMovesOrderByValue[value].push(move);
      if (bestValue < value)
        bestValue = value;
    }
    return possibleMovesOrderByValue[bestValue][parseInt(Math.random() * possibleMovesOrderByValue[bestValue].length)];
  }

  static getValue(snap, unit, tile, node, isMaximizer, dept) {

    var nextSnap = JSON.parse(JSON.stringify(snap));
    var nextUnit = { coordinate: unit.coordinate , player: unit.player };
    var nextTile = { coordinate: tile.coordinate };
    // console.log('> [' + unit.player + '] ' + unit.coordinate.column + ',' + unit.coordinate.row + ' to ' + tile.coordinate.column + ',' + tile.coordinate.row);
    State.move(nextSnap, nextUnit, nextTile);
    var deadList = State.getDeadList(nextSnap);
    State.remove(nextSnap, deadList);
    // nextSnap.map.forEach(row => console.log(row));

    let nextNode = new PrunningNode(isMaximizer);
    nextNode.alpha = node.alpha;
    nextNode.beta = node.beta;

    var units = State.getUnits(nextSnap, nextSnap.player);
    var possibleMoves = [];
    units.forEach(unit => possibleMoves = possibleMoves.concat(State.getPossibleMoves(nextSnap, unit)));

    if (possibleMoves.length === 0 || dept <= 0)
      return State.getPoint(nextSnap);

    for(var i=0; i<possibleMoves.length; i++) {
      var unit = possibleMoves[i].unit;
      var tile = possibleMoves[i].tile;
      let value = PlayerAIPrunning.getValue(nextSnap, unit, tile, nextNode, !isMaximizer, dept-1);

      if (nextNode.isMaximizer) {
        if (nextNode.value < value)
          nextNode.value = value;
        if (nextNode.value > nextNode.beta)
          break;
        if (nextNode.alpha < value)
          nextNode.alpha = value;
      }else {
        if (nextNode.value > value)
          nextNode.value = value;
        if (nextNode.value < nextNode.alpha)
          break;
        if (nextNode.beta > value)
          nextNode.beta = value;
      }
    }

    return nextNode.value;
  }
}
