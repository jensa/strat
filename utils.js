
module.exports.getCanvasCoords = function(event, canvas) {
  var style = canvas.currentStyle || window.getComputedStyle(canvas);
  var leftMargin = style.marginLeft.slice(0, -2);
  var topMargin = style.marginTop.slice(0, -2);
  var modelX = Math.round( (event.clientX- leftMargin) * (canvas.width / canvas.offsetWidth));
  var modelY = Math.round( (event.clientY - topMargin) * (canvas.height / canvas.offsetHeight));
  return {x:modelX, y:modelY};
}
