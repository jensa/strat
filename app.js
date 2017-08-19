var Peon = require('./gameobjects/peon.js');
var Game = require('./game.js');
var Constants = require('./constants.js');
window.oncontextmenu = function ()
{
    return false;
}
window.onload = () => {
  runGame();
}

function runGame(){
  var canvas = document.getElementById('canvas');
  var game = new Game(canvas);
  var unitSize = Constants.gridUnitSize;
  var peon = new Peon(unitSize*10,unitSize*4, game.map.gridUnitSize, 1);
  var peon2 = new Peon(unitSize*9,unitSize*4, game.map.gridUnitSize,1);
  var peon3 = new Peon(unitSize*8,unitSize*4, game.map.gridUnitSize,1);
  game.baseLayer.push(peon);
  game.baseLayer.push(peon2);
  game.baseLayer.push(peon3);
  var enemy = new Peon(unitSize*12,unitSize*4,game.map.gridUnitSize,2);
  game.baseLayer.push(enemy);
  /*setInterval(()=>{
    enemy.moveTo(getRandomArbitrary(0,200), getRandomArbitrary(0,200));
  }, 3000); */
  game._intervalId = setInterval(game.run, 1000 / game.fps);
}


function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
