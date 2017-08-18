var utils = require('./utils.js');
var SelectionRectangle = require('./gameobjects/selectionRectangle.js');
var Rectangle = require('./rectangle.js');
var Viewport = require('./viewport.js');
var Map = require('./map.js');

module.exports = function Game(canvas){
  this.canvas = canvas;
  this.map = new Map(300,300);
  this.viewport = new Viewport(canvas, this.map, {x:100,y:100});
  this.ctx = canvas.getContext('2d');
  //this.ctx.translate(0.5, 0.5);
  this.localPlayer = 1;
  this.fps = 50;
  this.baseLayer = [];
  this.topLayer = [];
  this.selected = [];
  this.update = () => {
    this.baseLayer = this.baseLayer.filter(o => {return o.alive();});
    this.baseLayer.forEach(obj => {
      var preUpdatePosition = new Rectangle(obj.position.x,obj.position.y,obj.position.h,obj.position.w);
      var newPosition = obj.update();
      //check map collision
      if(!this.map.isObjectInside(newPosition)){
        obj.position = preUpdatePosition;
        return;
      }
      var insersects = false;
      this.baseLayer.forEach(other =>{
        if(other === obj || insersects){ return;}
        if(obj.position.intersectRect(other.position)){
          obj.position = preUpdatePosition;
        }
      });
    });
    this.topLayer = this.topLayer.filter(o => {return o.alive();});
    this.topLayer.forEach(obj => {
      obj.update();
    });
  }
  this.draw = () => {
    this.ctx.clearRect(-0.5, -0.5, this.canvas.width, this.canvas.height);
    var context = this.ctx;
    this.baseLayer.forEach(obj => {
      obj.draw(context, this.viewport);
    });
    this.topLayer.forEach(obj => {
      obj.draw(context, this.viewport);
    });
  }
  this.run = () => {
    this.update();
    this.draw();
    this.viewport.updateScroll();
  };

  this.selectObjectsInRect = (x,y,h,w,player) => {

    //var translatedPosition = this.viewport.convertMapCoordsToDisplayCoords(x, y);
    this.selected.map(obj =>{ obj.deselect(); });
    this.selected.length = 0;
    var selectionRect = new Rectangle(x,y,h,w);
    var toSelect = this.baseLayer.filter(obj => {
      return obj.owner == player && selectionRect.intersectRect(obj.position);
    });
    toSelect.forEach(obj => { obj.select(); });
    this.selected.push(...toSelect)
  }

  document.onmousedown = event => {
    var canvasCoords = utils.getCanvasCoords(event, this.canvas);
    var coords = this.viewport.convertDisplayCoordsToMapCoords(canvasCoords.x,canvasCoords.y)
    if(event.which !== 3){
      this.selectionRectangle.handleDown(coords);
      return;
    }
    if(event.which == 3){
      //do right click actions here
      var affectedObject = this.baseLayer.find(obj => { return obj.position.contains(coords.x, coords.y); })
      this.selected.forEach(obj => {
        obj.rightClickAction(coords, affectedObject);
      })
    }
  }
  document.onmousemove = event => {
    var coords = utils.getCanvasCoords(event, this.canvas);
    var translatedCoords = this.viewport.convertDisplayCoordsToMapCoords(coords.x,coords.y)
    if(!this.selectionRectangle.handleMove(translatedCoords)){
      this.viewport.handleMove(coords);
    }
  }
  this.selectionRectangle = new SelectionRectangle(this);
  this.topLayer.push(this.selectionRectangle);
  this.topLayer.push(this.map)
}
