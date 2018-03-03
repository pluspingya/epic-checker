class Player {
  constructor(player, table, units, guides, onMakingAMove) {
    this.player = player;
    this.table = table;
    this.units = units;
    this.guides = guides;
    this.onMakingAMove = onMakingAMove;
    this.isMyTurn = false;
    this.state = null;
  }

  setTurn(turn, state) {
    this.isMyTurn = turn;
    this.state = state;
  }
}
