var GameObject = require('./gameobjects/gameobject.js');
var Constants = require('./constants.js');

class Map extends GameObject {
  constructor(h,w) {
    var height = h - (h%Constants.gridUnitSize);
    var width = w - (w%Constants.gridUnitSize);
    super(0,0,height,width);
    this.gridUnitSize = Constants.gridUnitSize;
    this.color = 'black';
    this.visible = true;
    this.grid = [];
    this.debug = false;
    this.searchPatternDebugs = [];
    for(var i=0; i<width/this.gridUnitSize; i++) {
        this.grid[i] = new Array(height/this.gridUnitSize);
    }
    this.draw = (ctx, viewport) => {
      if(!this.visible){ return; }
      ctx.strokeStyle=this.color;
      var translatedPosition = viewport.convertMapCoordsToDisplayCoords(this.position.x, this.position.y);
      ctx.strokeRect(translatedPosition.x,translatedPosition.y,this.position.h,this.position.w);
      if(this.debug){
        for(var x = 0; x < this.grid.length; x++) {
          for(var y = 0; y < this.grid[x].length; y++) {
            var gridPos = viewport.convertMapCoordsToDisplayCoords(this.gridUnitSize * x, this.gridUnitSize * y);
            ctx.strokeStyle='black';
            ctx.strokeRect(gridPos.x,gridPos.y,this.gridUnitSize,this.gridUnitSize);
            if(this.grid[x][y]){
              ctx.strokeStyle='purple';
              ctx.strokeRect(gridPos.x + 2,gridPos.y + 2,this.gridUnitSize-4,this.gridUnitSize-4);
            }
          }
        }
        this.searchPatternDebugs.forEach(sp =>{
          var gridPos = viewport.convertMapCoordsToDisplayCoords(this.gridUnitSize * sp.x, this.gridUnitSize * sp.y);
          ctx.font="7px Helvetica";
          ctx.fillStyle = 'black';
          ctx.fillText(sp.f, gridPos.x + 1, gridPos.y+10);
        });
      }

    };

    this.isObjectInside = position =>{
      if(position.x < -0.5  || position.x + position.w > this.position.w+0.5){return false;}
      if(position.y < -0.5  || position.y + position.h > this.position.h+0.5){return false;}
      return true;
    };

    this.removeObjectFromGrid = position =>{
      var positions = this.calculateGridPositionsFromPosition(position);
      positions.forEach(pos =>{
        this.grid[pos.x][pos.y] = false;
      });
    };

    this.moveObjectInGrid = (oldPosition, newPosition, id) =>{
      var oldPositions = this.calculateGridPositionsFromPosition(oldPosition);
      var newPositions = this.calculateGridPositionsFromPosition(newPosition);
      oldPositions.forEach(pos =>{
        this.grid[pos.x][pos.y] = false;
      });
      newPositions.forEach(pos =>{
        this.grid[pos.x][pos.y] = id;
      });
    };

    this.isBlocked = (toCheck, currentPos, id) =>{
      var currentGridPositions = this.calculateGridPositionsFromPosition(currentPos);
      var isBlocked = this.grid[toCheck.x][toCheck.y] && this.grid[toCheck.x][toCheck.y] !== id;
      return isBlocked;
    };

    this.calculateGridPositionsFromPosition = position =>{
      var positions = [];
      var mapX = position.x+1;
      var mapY = position.y+1;
      var mapWidth = position.w;
      var mapHeight = position.h;
      var gridX = (mapX - (mapX% this.gridUnitSize))/ this.gridUnitSize;
      var gridY = (mapY - (mapY% this.gridUnitSize)) / this.gridUnitSize;
      var gridWidth = mapWidth / this.gridUnitSize;
      var gridHeight = mapHeight / this.gridUnitSize;

      for(var i = 0;i<gridWidth;i++){
        for(var j = 0;j<gridHeight;j++){
          positions.push({x:gridX + i, y:gridY + j});
        }
      }
      return positions;
    };

    this.calculatePath = (position, toX, toY) =>{
      this.searchPatternDebugs.length = 0;
      var gridWidth = position.w / this.gridUnitSize;
      var gridHeight = position.h / this.gridUnitSize;

      var fromGridX = (position.x - (position.x % this.gridUnitSize))/ this.gridUnitSize;
      var fromGridY = (position.y - (position.y % this.gridUnitSize)) / this.gridUnitSize;
      var toGridX = (toX - (toX % this.gridUnitSize))/ this.gridUnitSize;
      var toGridY = (toY - (toY % this.gridUnitSize))/ this.gridUnitSize;

      if(this.grid[toGridX][toGridY]){
        var closestPossiblePoint = this.getClosestPoint(fromGridX,fromGridY,toGridX,toGridY);
        toGridX = closestPossiblePoint.x;
        toGridY = closestPossiblePoint.y;
      }

      var openList = [];
      var grid = this.createSearchGrid();
      openList.push({x:fromGridX, y:fromGridY,g:0,f:0});
      while(openList.length > 0){
        var lowInd = 0;
        for(var i=0; i<openList.length; i++) {
          if(openList[i].f < openList[lowInd].f) { lowInd = i; }
        }
        var currentNode = openList[lowInd];
        currentNode.searched = true;
        if(this.debug){ this.searchPatternDebugs.push(currentNode); }

        if(currentNode.x == toGridX && currentNode.y == toGridY) {
          var curr = currentNode;
          var ret = [];
          while(curr.parent) {
            ret.push(curr);
            curr = curr.parent;
          }
          var toRet = ret.reverse();
          //toRet.shift();
          return toRet;
        }

        openList = openList.filter(item => item !== currentNode)
        var neighbors = this.neighbors(grid, currentNode);
        for(var i=0; i<neighbors.length;i++) {
         var neighbor = neighbors[i];
         if(neighbor.searched || neighbor.wall) {
           // not a valid node to process, skip to next neighbor
           continue;
         }

         // g score is the shortest distance from start to current node, we need to check if
         //   the path we have arrived at this neighbor is the shortest one we have seen yet
         var gScore = currentNode.g + 1; // 1 is the distance from a node to it's neighbor
         var gScoreIsBest = false;


         if(openList.indexOf(neighbor) < 0) {
           // This the the first time we have arrived at this node, it must be the best
           // Also, we need to take the h (heuristic) score since we haven't done so yet
           gScoreIsBest = true;
           neighbor.h = this.manhattan({x:neighbor.x, y:neighbor.y}, {x:toGridX, y:toGridY});
           openList.push(neighbor);
         }
         else if(gScore < neighbor.g) {
           // We have already seen the node, but last time it had a worse g (distance from start)
           gScoreIsBest = true;
         }

         if(gScoreIsBest) {
           // Found an optimal (so far) path to this node.   Store info on how we got here and
           //  just how good it really is...
           neighbor.parent = currentNode;
           neighbor.g = gScore;
           neighbor.f = neighbor.g + neighbor.h;
           neighbor.debug = "F: " + neighbor.f + "<br />G: " + neighbor.g + "<br />H: " + neighbor.h;
         }
        }
      }
      return [];
    };

    this.getClosestPoint = (fromGridX,fromGridY,toGridX,toGridY) =>{
      var yOffset = 0;
      var xOffset = 0;
      if(fromGridY < toGridY){
        yOffset = -1;
      }
      if(fromGridY > toGridY){
        yOffset = 1;
      }
      if(fromGridX < toGridX){
        //from above
        xOffset = -1;
      }
      if(fromGridX > toGridX){
        xOffset = 1;
      }
      return {x:toGridX + xOffset, y:toGridY+yOffset};
    };

    this.createSearchGrid = () => {
      var searchGrid = [];
      for(var x = 0; x < this.grid.length; x++) {
        searchGrid[x] = [];
        for(var y = 0; y < this.grid[x].length; y++) {
          searchGrid[x][y] = {};
          searchGrid[x][y].x = x;
          searchGrid[x][y].y = y;
          searchGrid[x][y].mapX = x * this.gridUnitSize;
          searchGrid[x][y].mapY = y * this.gridUnitSize;
          searchGrid[x][y].f = 0;
          searchGrid[x][y].g = 0;
          searchGrid[x][y].h = 0;
          searchGrid[x][y].searched = false;
          searchGrid[x][y].parent = null;
          searchGrid[x][y].wall = this.grid[x][y];
        }
      }
      return searchGrid;
  },

    this.neighbors = (grid, node) =>{
      var ret = [];
      var x = node.x;
      var y = node.y;
      if(grid[x-1] && grid[x-1][y]) {
          ret.push(grid[x-1][y]);
      }
      if(grid[x+1] && grid[x+1][y]) {
          ret.push(grid[x+1][y]);
      }
      if(grid[x][y-1] && grid[x][y-1]) {
          ret.push(grid[x][y-1]);
      }
      if(grid[x][y+1] && grid[x][y+1]) {
          ret.push(grid[x][y+1]);
      }
      // Southwest
      if(grid[x-1] && grid[x-1][y-1]) {
        ret.push(grid[x-1][y-1]);
      }

      // Southeast
      if(grid[x+1] && grid[x+1][y-1]) {
          ret.push(grid[x+1][y-1]);
      }

      // Northwest
      if(grid[x-1] && grid[x-1][y+1]) {
          ret.push(grid[x-1][y+1]);
      }

      // Northeast
      if(grid[x+1] && grid[x+1][y+1]) {
          ret.push(grid[x+1][y+1]);
      }
      return ret;
    };

    this.manhattan = (pos0, pos1) =>{
      var d1 = Math.abs(pos1.x - pos0.x);
      var d2 = Math.abs(pos1.y - pos0.y);
      return d1 + d2;
    };
  }
}

module.exports = Map;
