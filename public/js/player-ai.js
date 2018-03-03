class PlayerAI extends Player {
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

    while(tmpUnits.length > 0) {
      var randomIndex = parseInt(Math.random() * tmpUnits.length);
      selectedUnit = tmpUnits[randomIndex];
      tmpUnits.splice(randomIndex, 1);
      var possibleMoves = this.state.getPossibleMoves(this.table, selectedUnit);
      if (possibleMoves.length == 0)
        continue;
      selectedTile = possibleMoves[parseInt(Math.random() * possibleMoves.length)];
      break;
    }

    if (selectedUnit === null || selectedTile === null)
    {
      console.error('no possible moves found for player '+ this.player);
      return;
    }

    this.onMakingAMove(selectedUnit, selectedTile);
  }
}
