var Rectangle = require('../rectangle.js');

class GameObject {
  constructor(x,y,h,w,owner) {
    this.position = new Rectangle(x,y,h,w);
    this.size = {w,h};
    this.visible = false;
    this.owner = owner;
    this.update = () => {
      return this.position;
    };
    this.draw = (ctx, mapper) => {
    };
    this.printPosition = () => {
        console.log('at ' + this.position.x + ','+this.position.y);
    };
    this.rightClickAction = event => {
      console.log('right click');
    }
    this.select = () => {
      console.log('select');
    }
    this.deselect = () => {
      console.log('deselect');
    }
    this.alive = () => {
      return true;
    }
  }
}
module.exports = GameObject;
