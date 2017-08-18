
module.exports = function Viewport(canvas, map, startCorner){

  this.map = map;
  this.canvas = canvas;
  this.scrollSpeed = 2;
  this.viewportCorner = {x:startCorner.x,y:startCorner.y};
  this.convertMapCoordsToDisplayCoords = (x,y) => {
    return {x:(x - this.viewportCorner.x), y:(y-this.viewportCorner.y)};
  }

  this.convertDisplayCoordsToMapCoords = (x,y) => {
    return {x:(x + this.viewportCorner.x), y:(y+this.viewportCorner.y)};
  }

  this.updateScroll = () => {
    var scrollMargin = 30;
    if(this.mouseX > canvas.width - scrollMargin && this.mouseX < canvas.width){ this.scrollRight();}
    if(this.mouseY > canvas.height - scrollMargin && this.mouseY < canvas.height){ this.scrollDown();}
    if(this.mouseX < scrollMargin && this.mouseX > 0){ this.scrollLeft();}
    if(this.mouseY < scrollMargin && this.mouseY > 0){ this.scrollUp();}
  }

  this.handleMove = coords =>{
    this.mouseX = coords.x;
    this.mouseY = coords.y;
  }

  this.scrollRight = () => {
    this.scroll(this.scrollSpeed,0);
  }

  this.scrollDown = () => {
    this.scroll(0,this.scrollSpeed);
  }

  this.scrollLeft = () => {
    this.scroll(-this.scrollSpeed,0);
  }

  this.scrollUp = () => {
    this.scroll(0,-this.scrollSpeed);
  }

  this.scroll = (x,y) => {
    if(this.viewportCorner.x < -50 && x < 0){
      //skip x
    }
    else if(this.viewportCorner.x + this.canvas.width -50 > this.map.position.w && x > 0){
      //skip x
    } else{
      this.viewportCorner.x += x;
    }

    if(this.viewportCorner.y < -25 && y < 0){
      //skip y
    }
    else if(this.viewportCorner.y + this.canvas.height - 25 > this.map.position.h && y > 0){
      //skip y
    } else{
      this.viewportCorner.y += y;
    }
  }
}
