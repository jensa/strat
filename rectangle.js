module.exports = function Rectangle(x,y,h,w){
  this.h = h;
  this.w = w;
  this.x = x;
  this.y = y;
  this.left = () => { return this.w < 0 ? this.x + this.w : this.x;};
  this.top = () => { return this.h < 0 ? this.y + this.h : this.y;};
  this.bottom = () => { return this.h < 0 ? this.y : this.y + this.h;};
  this.right = () => { return this.w < 0 ? this.x :  this.x + this.w;};
  this.middleX = () => { return this.left() + ((this.right() - this.left()) /2);};
  this.middleY = () => { return this.left() + ((this.bottom() - this.top()) /2);};

  this.contains = (x,y) =>{
    return this.left() <= x && x <= this.right() &&
           this.top() <= y && y <= this.bottom();
  }
  this.intersectRect = function(other) {
    return !(other.left() > this.right() ||
             other.right() < this.left() ||
             other.top() > this.bottom() ||
             other.bottom() < this.top());
  }
}
