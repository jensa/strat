var GameObject = require('./gameobject.js');

class Peon extends GameObject {
  constructor(x,y, owner) {
    super(x,y,15,15, owner);
    this.color = 'blue';
    this.moving = 0;
    this.speedFactor = 0.9; //movement per update
    this.visible = true;
    this.directionX = 0;
    this.directionY = 0;
    this.currentWaypoints = [];
    this.range = 20;
    this.damage = 5;
    this.hitpoints = 100;
    this.lastAttack = 0;
    this.secondsPerAttack = 0.4;
    this.draw = (ctx, viewport) => {
      if(!this.visible){ return; }
      ctx.fillStyle=this.color;
      var translatedPosition = viewport.convertMapCoordsToDisplayCoords(this.position.x, this.position.y);
      ctx.fillRect(translatedPosition.x,translatedPosition.y,this.position.h,this.position.w);
    };

    this.update = () => {
      if(this.target){
        this.moveTo(this.target.position.x, this.target.position.y);
        this.tryAttack();
      }
      if(this.currentWaypoints.length > 0){
        this.moveTowards(this.currentWaypoints[0].x, this.currentWaypoints[0].y);
      }
      return this.position;
    };
    this.moveTo = (x,y) => {
      //todo calculate a non/blocking set of waypoints to x,y
      this.currentWaypoints.length = 0;
      this.currentWaypoints.push({x,y});
    };
    this.moveTowards = (x,y) => {
      var isAtX = Math.abs(this.position.x - x) < 0.5;
      var isAtY = Math.abs(this.position.y - y) < 0.5;
      if( isAtX && isAtY){
        this.currentWaypoints.splice(0,1);
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
      this.color = 'red';
      this.target = object;
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
      this.color = 'green';
      this.moveTo(pos.x, pos.y);
    }

    this.select = () => {
      this.color = 'green';
    }

    this.deselect = () => {
      this.color = 'blue';
    }
  }
}

module.exports = Peon;
