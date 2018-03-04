class PlayerAI extends Player {
  constructor(player, table, units, guides, onMakingAMove) {
    super(player, table, units, guides, onMakingAMove);
  }

  setTurn(turn, state) {
    super.setTurn(turn, state);

    if (!this.isMyTurn)
      return;

    this.httpGet('/api/getBestMove', state.snap, (response) => {
      var res = JSON.parse(response);
      this.onMakingAMove(res.move.unit, res.move.tile);
    });
  }

  httpGet(theUrl, snap, callback) {
    var xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = function() {
          if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
              callback(xmlHttp.responseText);
      }
      xmlHttp.open("POST", theUrl, true); // true for asynchronous
      var data = new FormData();
      data.append('snap', JSON.stringify(snap));
      xmlHttp.send(data);
  }
}
