class State {

  static DefaultSnap() {
    return {
      player: 1,
      turnCount: 0,
      map : [
        [2, 2, 2, 2, 2, 2, 2, 2],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
      ]
    }
  }

  constructor() {
    this.snap = State.DefaultSnap();
  }

  reset() {
    this.snap = State.DefaultSnap();
  }

  move(unit, tile) {
    this.snap.map[unit.coordinate.row][unit.coordinate.column] = 0;
    this.snap.map[tile.coordinate.row][tile.coordinate.column] = unit.player;
    unit.coordinate = tile.coordinate;
    this.snap.player = unit.player == 1 ? 2 : 1;
    this.snap.turnCount ++;
  }

  remove(coordinates) {
    coordinates.forEach(coordinate => this.snap.map[coordinate.row][coordinate.column] = 0);
  }

  getPossibleMoves(table, {player, coordinate}) {
    var ret = [];

    //Up
    for (let row = coordinate.row-1; row >= 0; row--) {
      if (this.snap.map[row][coordinate.column] != 0)
        break;
      ret.push(table.tiles[row][coordinate.column]);
    }

    //Down
    for (let row = coordinate.row+1; row < this.snap.map.length; row++) {
      if (this.snap.map[row][coordinate.column] != 0)
        break;
      ret.push(table.tiles[row][coordinate.column]);
    }

    //Left
    for (let column = coordinate.column-1; column >= 0; column--) {
      if (this.snap.map[coordinate.row][column] != 0)
        break;
      ret.push(table.tiles[coordinate.row][column]);
    }

    //Right
    for (let column = coordinate.column+1; column < this.snap.map[coordinate.row].length; column++) {
      if (this.snap.map[coordinate.row][column] != 0)
        break;
      ret.push(table.tiles[coordinate.row][column]);
    }

    return ret;
  }

  getDeadList(unit) {

    var ret = [];
    var victims = [];
    var candidates = [];
    var unitOpponent = unit.player == 1 ? 2 : 1;

    for(let row=0; row<this.snap.map.length; row++) {
      for(let column=0; column<this.snap.map[row].length; column++) {
        if (this.snap.map[row][column] == unit.player) {

          let upCandidates = [];
          let upImmediateFoundOpponent = true;
          for(let moveup = 1; row - moveup >= 0; moveup ++) {
            if (this.snap.map[row-moveup][column] == unitOpponent) {
              upCandidates.push({row: row-moveup, column});
              if (upImmediateFoundOpponent)
                continue;
            }
            else if (this.snap.map[row-moveup][column] == unit.player && upCandidates.length > 0) {
              victims = victims.concat(upCandidates);
            }
            else if (this.snap.map[row-moveup][column] == unit.player) {
              upImmediateFoundOpponent = false;
              continue;
            }
            break;
          }

          var downCandidates = [];
          var downImmediateFoundOpponent = true;
          for(let movedown = 1; row + movedown < this.snap.map.length; movedown ++) {
            if (this.snap.map[row+movedown][column] == unitOpponent) {
              downCandidates.push({row: row+movedown, column});
              if (upImmediateFoundOpponent)
                continue;
            }
            else if (this.snap.map[row+movedown][column] == unit.player && downCandidates.length > 0) {
              victims = victims.concat(downCandidates);
            }
            else if (this.snap.map[row+movedown][column] == unit.player) {
              upImmediateFoundOpponent = false;
              continue;
            }
            break;
          }

          if (upCandidates.length > 0 && downCandidates.length > 0) {
            victims.push(upCandidates[0]);
            victims.push(downCandidates[0]);
          }

          let leftCandidates = [];
          let leftImmediateFoundOpponent = true;
          for(let moveleft = 1; column - moveleft >= 0; moveleft ++) {
            if (this.snap.map[row][column-moveleft] == unitOpponent) {
              leftCandidates.push({row, column: column - moveleft});
              if (leftImmediateFoundOpponent)
                continue;
            }
            else if (this.snap.map[row][column-moveleft] == unit.player && leftCandidates.length > 0) {
              victims = victims.concat(leftCandidates);
            }
            else if (this.snap.map[row][column-moveleft] == unit.player) {
              leftImmediateFoundOpponent = false;
              continue;
            }
            break;
          }

          var rightCandidates = [];
          var rightImmediateFoundOpponent = true;
          for(let moveright = 1; column + moveright < this.snap.map[row].length; moveright ++) {
            if (this.snap.map[row][column+ moveright] == unitOpponent) {
              rightCandidates.push({row, column: column+ moveright});
              if (rightImmediateFoundOpponent)
                continue;
            }
            else if (this.snap.map[row][column+ moveright] == unit.player && rightCandidates.length > 0) {
              victims = victims.concat(rightCandidates);
            }
            else if (this.snap.map[row][column+ moveright] == unit.player) {
              rightImmediateFoundOpponent = false;
              continue;
            }
            break;
          }

          if (leftCandidates.length > 0 && rightCandidates.length > 0) {
            victims.push(leftCandidates[0]);
            victims.push(rightCandidates[0]);
          }

        }
      }
    }

    ret = State.uniqueCoordinates(victims);

    return ret;
  }

  static uniqueCoordinates(list) {
    var ret = [];
    list.forEach(item => {
      if (!ret.find(elm => elm.row === item.row && elm.column === item.column))
        ret.push(item);
    });
    return ret;
  }

  getTheWinner(table) {
    let possibleMoves = [0, 0];
    
    for(let row=0; row<this.snap.map.length; row++) {
      for(let column=0; column<this.snap.map[row].length; column++) {
        for (let player=1; player<=2; player++) {
          if (this.snap.map[row][column] === player)
            possibleMoves[player-1] += this.getPossibleMoves(table, { player, coordinate: { row, column }}).length;
        }
      }
    }

    if (possibleMoves[0] === 0)
      return 2;
    if (possibleMoves[1] === 0)
      return 1;

    return 0; //no winner yet
  }

}
