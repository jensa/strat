var GameObject = require('./gameobjects/gameobject.js');

class Map extends GameObject {
  constructor(h,w) {
    super(0,0,h,w);
    this.color = 'black';
    this.visible = true;
    this.draw = (ctx, viewport) => {
      if(!this.visible){ return; }
      ctx.strokeStyle=this.color;
      var translatedPosition = viewport.convertMapCoordsToDisplayCoords(this.position.x, this.position.y);
      ctx.strokeRect(translatedPosition.x,translatedPosition.y,this.position.h,this.position.w);
    };

    this.isObjectInside = position =>{
      if(position.x < 0  || position.x + position.w > this.position.w){return false;}
      if(position.y < 0  || position.y + position.h > this.position.h){return false;}
      return true;
    }
  }
}

module.exports = Map;
