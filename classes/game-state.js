'use strict'

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
      ],
      collapse: [
        [26, 29, 32, 35, 38, 41, 44, 47],
        [23, 62, 64, 66, 68, 70, 72, 50],
        [20, 60, 78, 79, 80, 81, 74, 53],
        [17, 58, 77, 83, 84, 82, 76, 56],
        [56, 76, 82, 85, 83, 77, 58, 17],
        [53, 74, 81, 80, 79, 78, 60, 20],
        [50, 72, 70, 68, 66, 64, 62, 23],
        [47, 44, 41, 38, 35, 32, 29, 26],
      ]
    }
  }

  constructor() {
    this.snap = State.DefaultSnap();
  }

  reset() {
    this.snap = State.DefaultSnap();
  }

  static move(snap, unit, tile) {
    snap.map[unit.coordinate.row][unit.coordinate.column] = 0;
    snap.map[tile.coordinate.row][tile.coordinate.column] = unit.player;
    unit.coordinate = tile.coordinate;
    snap.player = unit.player == 1 ? 2 : 1;
    snap.turnCount ++;
  }

  static getUnits(snap, player) {
    var coordinates = [];
    for(let row = 0; row<snap.map.length; row++) {
      for (let column=0; column<snap.map[row].length; column++) {
        if (snap.map[row][column] === player)
          coordinates.push({ player, coordinate: { row, column }});
      }
    }
    return coordinates;
  }

  static getPossibleMoves(snap, unit) {
    var possibleMoves = [];

    //Up
    for (let row = unit.coordinate.row-1; row >= 0; row--) {
      if (snap.map[row][unit.coordinate.column] != 0)
        break;
      possibleMoves.push({
        unit,
        tile: {
          coordinate: { row, column: unit.coordinate.column }
        }
      });
    }

    //Down
    for (let row = unit.coordinate.row+1; row < snap.map.length; row++) {
      if (snap.map[row][unit.coordinate.column] != 0)
        break;
      possibleMoves.push({
        unit,
        tile: {
          coordinate: { row, column: unit.coordinate.column }
        }
      });
    }

    //Left
    for (let column = unit.coordinate.column-1; column >= 0; column--) {
      if (snap.map[unit.coordinate.row][column] != 0)
        break;
      possibleMoves.push({
        unit,
        tile: {
          coordinate: { row : unit.coordinate.row, column }
        }
      });
    }

    //Right
    for (let column = unit.coordinate.column+1; column < snap.map[unit.coordinate.row].length; column++) {
      if (snap.map[unit.coordinate.row][column] != 0)
        break;
      possibleMoves.push({
        unit,
        tile: {
          coordinate: { row: unit.coordinate.row, column }
        }
      });
    }

    return possibleMoves;
  }

  static getDeadList(snap) {

    var ret = [];
    var victims = [];
    var candidates = [];
    var unitPlayer = snap.player == 1 ? 2 : 1;
    var unitOpponent = snap.player; //player was a previous opponent

    for(let row=0; row<snap.map.length; row++) {
      for(let column=0; column<snap.map[row].length; column++) {
        if (snap.map[row][column] == unitPlayer) {

          let upCandidates = [];
          let upImmediateFoundOpponent = true;
          for(let moveup = 1; row - moveup >= 0; moveup ++) {
            if (snap.map[row-moveup][column] == unitOpponent) {
              upCandidates.push({row: row-moveup, column});
              if (upImmediateFoundOpponent)
                continue;
            }
            else if (snap.map[row-moveup][column] == unitPlayer && upCandidates.length > 0) {
              victims = victims.concat(upCandidates);
            }
            else if (snap.map[row-moveup][column] == unitPlayer) {
              upImmediateFoundOpponent = false;
              continue;
            }
            break;
          }

          var downCandidates = [];
          var downImmediateFoundOpponent = true;
          for(let movedown = 1; row + movedown < snap.map.length; movedown ++) {
            if (snap.map[row+movedown][column] == unitOpponent) {
              downCandidates.push({row: row+movedown, column});
              if (upImmediateFoundOpponent)
                continue;
            }
            else if (snap.map[row+movedown][column] == unitPlayer && downCandidates.length > 0) {
              victims = victims.concat(downCandidates);
            }
            else if (snap.map[row+movedown][column] == unitPlayer) {
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
            if (snap.map[row][column-moveleft] == unitOpponent) {
              leftCandidates.push({row, column: column - moveleft});
              if (leftImmediateFoundOpponent)
                continue;
            }
            else if (snap.map[row][column-moveleft] == unitPlayer && leftCandidates.length > 0) {
              victims = victims.concat(leftCandidates);
            }
            else if (snap.map[row][column-moveleft] == unitPlayer) {
              leftImmediateFoundOpponent = false;
              continue;
            }
            break;
          }

          var rightCandidates = [];
          var rightImmediateFoundOpponent = true;
          for(let moveright = 1; column + moveright < snap.map[row].length; moveright ++) {
            if (snap.map[row][column+ moveright] == unitOpponent) {
              rightCandidates.push({row, column: column+ moveright});
              if (rightImmediateFoundOpponent)
                continue;
            }
            else if (snap.map[row][column+ moveright] == unitPlayer && rightCandidates.length > 0) {
              victims = victims.concat(rightCandidates);
            }
            else if (snap.map[row][column+ moveright] == unitPlayer) {
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

    var collapseCoordinates = State.getQuakeAndCollapseCoodinates(snap).collapseCoordinates;
    collapseCoordinates.forEach(coordinate => {
      if (snap.map[coordinate.row][coordinate.column] === 1 ||
          snap.map[coordinate.row][coordinate.column] === 2)
          victims.push(coordinate);
      snap.map[coordinate.row][coordinate.column] = -1;
    });

    ret = State.uniqueCoordinates(victims);

    return ret;
  }

  static getQuakeAndCollapseCoodinates(snap) {
    var ret = {
      quakeCoordinates: [],
      collapseCoordinates: []
    };
    for (let row = 0; row<snap.collapse.length; row++) {
      for(let column = 0; column < snap.collapse[row].length; column++) {
        if (snap.map[row][column] != -1 &&
            snap.turnCount >= snap.collapse[row][column] - 2)
          ret.quakeCoordinates.push({row, column});
        if (snap.map[row][column] != -1 &&
            snap.turnCount == snap.collapse[row][column])
          ret.collapseCoordinates.push({row, column});
      }
    }
    return ret;
  }

  static remove(snap, coordinates) {
    coordinates.forEach(coordinate => {
      if (snap.turnCount < snap.collapse[coordinate.row][coordinate.column])
        snap.map[coordinate.row][coordinate.column] = 0;
    });
  }

  static uniqueCoordinates(list) {
    var ret = [];
    list.forEach(item => {
      if (!ret.find(elm => elm.row === item.row && elm.column === item.column))
        ret.push(item);
    });
    return ret;
  }

  static getQuakeAndCollapseCoodinates(snap) {
    var ret = {
      quakeCoordinates: [],
      collapseCoordinates: []
    };
    for (let row = 0; row<snap.collapse.length; row++) {
      for(let column = 0; column < snap.collapse[row].length; column++) {
        if (snap.map[row][column] != -1 &&
            snap.turnCount >= snap.collapse[row][column] - 2)
          ret.quakeCoordinates.push({row, column});
        if (snap.map[row][column] != -1 &&
            snap.turnCount == snap.collapse[row][column])
          ret.collapseCoordinates.push({row, column});
      }
    }
    return ret;
  }

  static getTheWinner(snap) {
    let possibleMoves = [0, 0];

    for(let row=0; row<snap.map.length; row++) {
      for(let column=0; column<snap.map[row].length; column++) {
        for (let player=1; player<=2; player++) {
          if (snap.map[row][column] === player)
            possibleMoves[player-1] += State.getPossibleMoves(snap, { player, coordinate: { row, column }}).length;
        }
      }
    }

    if (possibleMoves[0] === 0)
      return 2;
    if (possibleMoves[1] === 0)
      return 1;

    return 0; //no winner yet
  }

  static getPoint(snap) {
    var point = 0;
    var unit = snap.player === 1 ? 2 : 1;
    snap.map.forEach(row => row.forEach(n => {
      if (n <= 0)
        return;
      var isMyUnit = n === unit;
      point += isMyUnit ? 2 : -1;
    }));

    return point;
  }

  static getPlayerUnits(snap) {
    var ret = [];
    for(let row=0; row<snap.map.length; row++) {
      for(let column=0; column<snap.map[row].length; column++) {
        if (snap.map[row][column] === snap.player)
          ret.push({ player: snap.player, coordinate: { row, column }});
      }
    }
    return ret;
  }
}

module.exports = State;
