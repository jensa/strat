var GameObject = require('./gameobject.js');

class SelectionRectangle extends GameObject {
  constructor(game) {
    super(0,0,0,0);
    this.game = game;
    this.draw = (ctx,viewport) => {
      if(!this.visible){ return; }
      ctx.strokeStyle='red';
      ctx.lineWidth=1;
      var translatedPos = viewport.convertMapCoordsToDisplayCoords(this.x,this.y);
      ctx.strokeRect(translatedPos.x,translatedPos.y,this.w,this.h);
    };

    this.holding = false;
    this.handleDown = coords => {
      if(!this.holding){
        this.holding = true;
        this.x = coords.x;
        this.y = coords.y;
        this.visible = true;
      }
    }
    document.onmouseup = event => {
      if(event.which == 3){ return;} //right click
      if(this.holding){
        this.game.selectObjectsInRect(this.x,this.y,this.h,this.w, game.localPlayer);
        this.visible = false;
        this.x = 0;
        this.y = 0;
        this.h = 0;
        this.w = 0;
        this.holding = false;
      }
    }
    this.handleMove = coords =>{
      if(this.visible){
        this.w = coords.x - this.x;
        this.h = coords.y - this.y;
        return true;
      }
      return false;
    }

  }
}

module.exports = SelectionRectangle;
