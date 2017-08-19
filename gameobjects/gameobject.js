var Rectangle = require('../rectangle.js');
var Constants = require('../constants.js');
var Utils = require('../utils.js');

class GameObject {
  constructor(x,y,h,w,owner) {
    this.id = Utils.getId();
    var height = h - (h%Constants.gridUnitSize);
    var width = w - (w%Constants.gridUnitSize);
    this.position = new Rectangle(x,y,height,width);
    this.size = {w,h};
    this.visible = false;
    this.owner = owner;
    this.update = map => {
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
