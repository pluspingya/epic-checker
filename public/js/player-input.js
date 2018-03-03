class PlayerInput extends Player {
  constructor(player, table, units, guides, onMakingAMove) {
    super(player, table, units, guides, onMakingAMove);
    this.units.onUnitClicked.push(this.onUnitClicked.bind(this));
    this.table.onTileClicked.push(this.onTileClicked.bind(this));
    this.selectedUnit = null;
    this.possibleMoves = null;
  }

  onUnitClicked(unit) {
    if (!this.isMyTurn ||
        this.state.snap.player != unit.player)
      return; //it's not my turn

    this.selectedUnit = unit;
    this.possibleMoves = this.state.getPossibleMoves(this.table, this.selectedUnit);
    this.guides.show(this.possibleMoves);
  }

  onTileClicked(tile) {
    if (this.isMyTurn == false)
      return;
    if (this.selectedUnit == null)
      return;

    var canMove = this.possibleMoves && this.possibleMoves.find(p =>
      p.coordinate.row == tile.coordinate.row &&
      p.coordinate.column == tile.coordinate.column);
    if (!canMove)
      return;

    guides.hide();

    if (this.onMakingAMove)
      this.onMakingAMove(this.selectedUnit, tile);
  }
}
