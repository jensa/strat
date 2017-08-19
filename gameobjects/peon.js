var GameObject = require('./gameobject.js');
var Utils = require('../utils.js');

class Peon extends GameObject {
  constructor(x,y, gridUnitSize, owner) {
    super(x,y,gridUnitSize*1,gridUnitSize*1, owner);
    this.image = new Image();
    this.image.src = 'images/peon_reversed.png';
    var that = this;
    this.image.onload = function() {
      that.render = true;
    };
    this.imageSize = 50;
    this.frameCount = 4;
    this.spriteHorizontalOffset = 0;
    this.spriteVerticalOffset = 0;
    this.updatesPerFrame = 20;
    this.animationUpdateCounter = 0;
    this.animationFrameIndex = 0;
    this.directionOffset = 0;
    this.moving = 0;
    this.speedFactor = 0.9; //movement per update
    this.visible = true;
    this.render = false;
    this.directionX = 0;
    this.directionY = 0;
    this.currentWaypoints = [];
    this.range = 2;
    this.damage = 5;
    this.hitpoints = 100;
    this.lastAttack = 0;
    this.secondsPerAttack = 0.4;
    this.draw = (ctx, viewport) => {
      if(!this.visible || !this.render){ return; }
      var translatedPosition = viewport.convertMapCoordsToDisplayCoords(this.position.x, this.position.y);
      this.updatesPerFrame = this.moving() ? 10 : 60;
      ctx.drawImage(
        this.image,
        this.directionOffset,
        this.animationFrameIndex * (this.imageSize-10),
        this.imageSize,
        this.imageSize-15,
        translatedPosition.x,
        translatedPosition.y,
        this.position.w* (this.flipSprite ? -1 : 1),
        this.position.h
      );
      ctx.fillStyle=this.color;
      if(this.selected){
        ctx.fillStyle = 'green';
        ctx.fillRect(translatedPosition.x,translatedPosition.y - 3,this.position.w,3);
      }
      this.drawPath(ctx,viewport, translatedPosition);

    };

    this.moving = () =>{
      return this.currentWaypoints.length > 0;
    }

    this.getDirectionInfo = map =>{
      if(this.currentWaypoints.length < 1){
          return {offset: this.imageSize * Math.floor((Math.random() * (4 - 0)))};
      }
      var gridPosition = map.calculateGridPositionsFromPosition(this.position)[0];
      var positionAndTargetSame = this.currentWaypoints[0].x == gridPosition.x && this.currentWaypoints[0].y == gridPosition.y
      var target = positionAndTargetSame && this.currentWaypoints.length > 2 ? this.currentWaypoints[1] : this.currentWaypoints[0];
      var direction = Utils.getFaceDirection(gridPosition, target);
      var offset = 0;
      switch(direction){
        case 'N': offset = 0; break;
        case 'NE': offset = 1; break;
        case 'E': offset = 2; break;
        case 'SE': offset = 3; break;
        case 'S': offset = 4; break;
        case 'SW': offset = 5; break;
        case 'W': offset = 6; break;
        case 'NW': offset = 7; break;
        case null: offset = Math.floor(this.directionOffset/this.imageSize); break;
      }
      return {offset: this.imageSize * offset};
    }

    this.drawPath = (ctx,viewport, translatedPosition) =>{
      if(this.selected && this.currentWaypoints.length > 1){
        ctx.fillStyle='gray';
        ctx.beginPath();
        ctx.moveTo(translatedPosition.x + this.position.w/2,translatedPosition.y + this.position.h/2);
        this.currentWaypoints.forEach(wp =>{
          var trwp = viewport.convertMapCoordsToDisplayCoords(wp.mapX, wp.mapY);
          ctx.lineTo(trwp.x + this.position.w/2,trwp.y+ this.position.h/2);
        });
        ctx.stroke();
      }
    }

    this.update = map => {
      if(this.target){
        this.tryAttack();
      }

      if(this.moveTarget){
        if(this.currentWaypoints.length == 0 || map.isBlocked(this.currentWaypoints[0], this.position, this.id)){
          this.createPath(map, this.moveTarget);
        }
        if(this.currentWaypoints.length > 0){
          this.moveTowards(this.currentWaypoints[0].mapX, this.currentWaypoints[0].mapY);
        }
      }
      this.animationUpdateCounter++;
      if(this.animationUpdateCounter > this.updatesPerFrame){
        this.animationFrameIndex = (this.animationFrameIndex + 1) % (this.frameCount +1);
        this.animationUpdateCounter = 0;
        var directionInfo = this.getDirectionInfo(map);
        this.directionOffset = directionInfo.offset;
        if(!this.moving()){ this.animationFrameIndex = 0;}
      }

      return this.position;
    };

    this.createPath = (map, target) =>{
      var toX = target.x;
      var toY = target.y;
      this.currentWaypoints = map.calculatePath(this.position, toX, toY);
    };

    this.moveTo = (x,y) => {
      this.moveTarget = {x,y};
      this.currentWaypoints.length = 0;
    };
    this.moveTowards = (x,y) => {
      var isAtX = Math.abs(this.position.x - x) < 0.5;
      var isAtY = Math.abs(this.position.y - y) < 0.5;
      if( isAtX && isAtY){
        this.currentWaypoints.splice(0,1);
        if(this.currentWaypoints.length == 0){ this.moveTarget = null;}
        return;
      }
      if(!isAtX){
        this.position.x += this.speedFactor * (this.position.x > x ? -1 : 1);
      }
      if(!isAtY){
        this.position.y += this.speedFactor * (this.position.y > y ? -1 : 1);
      }
    }

    this.tryAttack = () => {
      var xInRange = Math.abs(this.position.middleX() - this.target.position.middleX()) <= this.range;
      var yInRange = Math.abs(this.position.middleY() - this.target.position.middleY()) <= this.range;
      var attackSpeedTimerUp = (Date.now() - this.lastAttack) /1000 > this.secondsPerAttack;
      if( xInRange && yInRange && attackSpeedTimerUp){
        this.currentWaypoints.splice(0,1);
        this.attackCurrentTarget();
        return;
      }
    }

    this.attackCurrentTarget = () => {
      if(this.target.alive()){
        this.target.hit(this.damage);
        this.lastAttack = Date.now();
        if(!this.target.alive()){
          this.target = null;
        }
      }
    }

    this.hit = dmg => {
      console.log('hit for ' + dmg + ' damage');
      this.hitpoints -= dmg;
    }

    this.alive = () => {
      return this.hitpoints > 0;
    }

    this.attackTo = object => {
      this.target = object;
      this.moveTarget = object;
      this.moveTo(this.target.position.x, this.target.position.y);
    }

    this.rightClickAction = (pos,object) =>{
      if(object){
        if(object.owner != this.owner){
          this.attackTo(object);
          return;
        }
      }
      this.target = null;
      this.moveTo(pos.x, pos.y);
    }

    this.select = () => {
      this.selected = true;
    }

    this.deselect = () => {
      this.selected = false;
    }
  }
}

module.exports = Peon;
