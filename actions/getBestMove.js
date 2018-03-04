'use strict'

const {Action, api} = require('actionhero');
const State = require('../classes/game-state');

const PrunningInfinityValue = 99999999;

class PrunningNode {
  constructor(isMaximizer) {
      this.isMaximizer = isMaximizer;
      this.alpha = -PrunningInfinityValue;
      this.beta = +PrunningInfinityValue;
      this.value = this.isMaximizer ? this.alpha : this.beta;
  }
}

module.exports = class GetBestMove extends Action {
  constructor() {
    super();
    this.name = 'getBestMove';
    this.description = 'I will give you the best move possible!';
    this.inputs = {
      snap: {
        required: true,
        validator: this.snapValidator
      }
    }
    this.outputExample = {
      move: {
        unit: { coordinate: { row: 0, column: 0 } },
        tile: { coordinate: { row: 1, column: 0 } }
      }
    };
  }

  snapValidator(param) {
    var snap = JSON.parse(param);
    if (typeof(snap.map) !== 'object')
      throw new Error('missing snap.map');
    if (typeof(snap.collapse) !== 'object')
      throw new Error('missing snap.collapse');
    if (typeof(snap.player) !== 'number')
      throw new Error('missing snap.player');
    if (typeof(snap.turnCount) !== 'number')
      throw new Error('missing snap.turnCount');
  }

  async run(data) {
    var snap = JSON.parse(data.params.snap);

    let tmpUnits = State.getPlayerUnits(snap);
    let move = this.getGreatMove(snap, tmpUnits);

    data.response.move = move;
  }

  getGreatMove(snap, units) {
    let possibleMoves = [];
    units.forEach(unit => possibleMoves = possibleMoves.concat(State.getPossibleMoves(snap, unit)));
    // console.log('possibleMoves:');
    // possibleMoves.forEach(move => console.log('from', move.unit.coordinate, ' to ', move.tile.coordinate));
    if (possibleMoves.length == 0)
      return null;

    var bestValue = -PrunningInfinityValue;
    var possibleMovesOrderByValue = {};
    for(let i=0; i<possibleMoves.length; i++) {
      var move = possibleMoves[i];
      let value = GetBestMove.getValue(snap, move.unit, move.tile, new PrunningNode(true), false, 2);
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
      let value = GetBestMove.getValue(nextSnap, unit, tile, nextNode, !isMaximizer, dept-1);

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
