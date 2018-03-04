'use strict'

const {Action, api} = require('actionhero');
const State = require('../classes/game-state');

module.exports = class GetRandomMove extends Action {
  constructor() {
    super();
    this.name = 'getRandomMove';
    this.description = 'I will give you abitary random move!';
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

    let move = null;
    let tmpUnits = State.getPlayerUnits(snap);

     while(tmpUnits.length > 0) {
       var randomIndex = parseInt(Math.random() * tmpUnits.length);
       var selectedUnit = tmpUnits[randomIndex];
       tmpUnits.splice(randomIndex, 1);
       var possibleMoves = State.getPossibleMoves(snap, selectedUnit);
       if (possibleMoves.length == 0)
         continue;
       move = possibleMoves[parseInt(Math.random() * possibleMoves.length)];
       break;
     }

    if (move === null)
    {
      console.error('no possible moves found for player '+ snap.player);
      data.error = 'no possible moves found for player '+ snap.player;
    }

    data.response.move = move;
  }
}
