class Units {

  static preload(game) {
    Unit.preload(game);
  }

  constructor(game, state, group) {
    this.game = game;
    this.state = state;
    this.group = group;
    this.units = null;
    this.onUnitClicked = [];

    this.instantiate();
  }

  instantiate() {
    this.units = [[],[]];
    for(let row=0; row<this.state.snap.map.length; row++){
      for(let column=0; column<this.state.snap.map[row].length; column ++) {
        let player = this.state.snap.map[row][column];
        if (player <= 0)
          continue;
        let unit = new Unit(this.game, player, this.group);
        unit.onClicked = () => {
          this.onUnitClicked.forEach(cb => cb(unit));
        };
        unit.warpToTile(table.tiles[row][column]);
        if (player == 1) {
          unit.turnTo({
            x: table.tiles[row-1][column],
            y: table.tiles[row-1][column] + 50
          });
        }
        var playerIndex = player-1;
        this.units[playerIndex].push(unit);
      }
    }
  }

  reset(state) {
    this.units.forEach(units => units.forEach(unit => unit.destroy()));
    this.state = state;
    this.instantiate();
  }

  sortZOrder() {
    this.group.sort('y', Phaser.Group.SORT_ASCENDING);
  }

  getUnitsAtCoordinates(coordinates) {
    var ret = [];
    coordinates.forEach(coordinate => {
      var unit = this.units[0].find(u => u.coordinate.row == coordinate.row && u.coordinate.column == coordinate.column)
              || this.units[1].find(u => u.coordinate.row == coordinate.row && u.coordinate.column == coordinate.column);
      if (unit)
        ret.push(unit);
    });
    return ret;
  }

  stand(player) {
    if (this.units[0].length == 0 || this.units[1].length == 0)
    {
      this.units.forEach(units => units.forEach(unit => unit.idle()));
      return;
    }
    this.units[player == 1 ? 0 : 1].forEach(unit => unit.stand());
    this.units[player == 1 ? 1 : 0].forEach(unit => unit.idle());
  }

  kill(units) {
     var lastTween = null;
    // for(var i=units.length - 1; i >= 0; i--) {
    //   this.units[unit.player-1].indexOf(unit);
    // }
    this.units.forEach(list => list.forEach(unit => {
      if (units.indexOf(unit) < 0)
        unit.idle();
    }));
    units.forEach(unit => {
      var index = this.units[unit.player-1].indexOf(unit);
      //console.log('kill', index);
      if (index >= 0)
        this.units[unit.player-1].splice(index, 1);
      //console.log(this.units[unit.player-1] );
      lastTween = unit.kill();
    });
    return lastTween;
  }

};
