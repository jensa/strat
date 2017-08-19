
module.exports.getCanvasCoords = function(event, canvas) {
  var style = canvas.currentStyle || window.getComputedStyle(canvas);
  var leftMargin = style.marginLeft.slice(0, -2);
  var topMargin = style.marginTop.slice(0, -2);
  var modelX = Math.round( (event.clientX- leftMargin) * (canvas.width / canvas.offsetWidth));
  var modelY = Math.round( (event.clientY - topMargin) * (canvas.height / canvas.offsetHeight));
  return {x:modelX, y:modelY};
}


var idCounter = 0;
module.exports.getId = () => {
  return idCounter++;
}


module.exports.getFaceDirection = (position,target) =>{
  var targetY = target.y;
  var targetX = target.x;
  var margin = 0;
    if(target.x -margin > position.x){
      //target is to the right
      if(targetY - margin > position.y){
        return 'SE';
      }
      else if(targetY + margin < position.y){
        return 'NE';
      }
      else {
        return 'E';
      }
    }
    else if(target.x + margin < position.x){
      //target is to the left
      if(targetY - margin > position.y){
        return 'SW';
      }
      else if(targetY + margin < position.y){
        return 'NW';
      } else{
        return 'W';
      }
    }
    else{
      //target is at same X
      if(targetY + margin > position.y){
        return 'S';
      }
      else if(targetY - margin < position.y){
        return 'N';
      }
    }
    return null;
};
