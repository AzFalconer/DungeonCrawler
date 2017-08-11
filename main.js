$(document).ready(function() {
//Variables
var map = [],
    level = 1,
    levelUp = [0,49,99,199,399,799,1599],
    xp = 0,
    maxHealth = 12,
    health = 12,
    userIcon = 'https://www.redtailbooks.com/codeCamp/images/live.png',
    userLoc = [1,1],
    rat = [4,4,12,25], //hp,damage,ac,xp
    kobold = [5,6,12,25],
    goblin = [7,8,15,50],
    hobgoblin = [11,11,18,100],
    orc = [15,15,13,100],
    ogre = [59,20,11,450],
    potionCount = 0,
    weaponDamage = [4,6,8,10,12],
    weaponType = ["fist", "club", "dagger", "mace", "sword"],
    weaponIndex = 0,
    dead = false,
    damage = 0;
//Listen
$("#restart").click(function(){location.reload(true);})
document.onkeydown = function(event) {event = event || window.event; event.preventDefault(); if (dead==false) {moveUser(event.keyCode)}}; //console.log(event.keyCode);
//Execute
buildMap();
hideCells();
showNearCells();
window.focus();
//Functions
function hideCells() {
  for (row=0;row<map.length;row++) {
    for (col=0;col<map[row].length;col++) {
      $("#cell"+ row + "-" + col).addClass('fow');
    }
  }
}
function showNearCells () {
  for (row = userLoc[0]-3; row < 5 + userLoc[0]; row++) {
    for (col = userLoc[1]-3; col < 5 + userLoc[1]; col++) {
      $("#cell"+ row + "-" + col).removeClass('fow');
    }
  }
}
function moveUser(key) {
  if (key != 83 && key != 40 && key != 87 && key != 38 && key != 65 && key != 37 && key != 68 && key != 39 && key != 32) {return;} //ignore other key presses...
  $("#displayDiagText").text(''); // Clear out last event on new move...
      showNearCells();
  var newLoc = [], oldRow = 0, oldCol = 0;
  oldRow = userLoc[0], oldCol = userLoc[1];
  if (key == 83 || key == 40) {newLoc = [(oldRow+1),oldCol];} //down
  if (key == 87 || key == 38) {newLoc = [(oldRow-1),oldCol];} //up
  if (key == 65 || key == 37) {newLoc = [(oldRow),oldCol-1];} //left
  if (key == 68 || key == 39) {newLoc = [(oldRow),oldCol+1];} //right
  if (key == 32) {newLoc = [oldRow,oldCol]; drinkPotion();} //Drink potion
  //Test location
  if (newLoc[0] < 0 || newLoc[1] < 0) { //User went home
    $("#messageText").html("You decide you would really rather not know what lies further in the dungeon and go home.<br><br>But ... After a couple of days you start to think about the dungeon...<br><br>Would you like to try again?<br><br>");
    $("#message").show();
  }
  if ($("#cell" + newLoc[0] + "-" + newLoc[1]).hasClass("wall")) { //You hit the wall
    newLoc[0] = userLoc[0], newLoc[1] = userLoc[1]; //return to where you started move from
    health = health - 1;
    if (health < 1) {died(userLoc[0], userLoc[1]); return;}
    $("#health").html("Health: " + health + " (" + maxHealth + ") &emsp; Potions: " + potionCount + " (1d4 + " + level + ")");
    $("#displayDiagText").append("Ouch!<br>You ran into the wall doing 1hp of damage...<br>Perhaps you need more practice walking?<br>");
  }
  if ($("#cell" + newLoc[0] + "-" + newLoc[1]).hasClass("chest")) { //You open the chest
    loot(1);
    $("#cell" + newLoc[0] + "-" + newLoc[1]).removeClass("chest");
    $("#cell" + newLoc[0] + "-" + newLoc[1]).addClass("empty");
  }
  if ($("#cell" + newLoc[0] + "-" + newLoc[1]).hasClass("monster")) { //Attack!
    attack(newLoc[0], newLoc[1]);
  }
  if (dead == false) { //Finish the move
    $("#cell" + oldRow + "-" + oldCol).removeClass().addClass('empty');
    userLoc[0] = newLoc[0], userLoc[1] = newLoc[1];
    $("#cell" + userLoc[0] + "-" + userLoc[1]).removeClass().addClass('user');
    if (userLoc[1] > 49) {// User exited for the win
      $("#messageText").html("Congratulations you have escaped from the dungeon<br><br>You return home and revel in your new experince<br><br>But ... After a couple of days you start to think about the dungeon...<br><br>Would you like to try again?<br><br>");
      $("#message").show();
    }
  }
}
function buildMap () {
  for (row=0;row<25;row++) { //build grid array, will be 50x25 for testing.
    map.push([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
  }
  //build map
  mapWalls();
  var state = 'empty';
  for (row=0;row<map.length;row++) {
    $("table").append('<tr id="row' + row +'" class="game"></tr>');
    for (col=0;col<map[row].length;col++) {
      if (map[row][col] == 1) {state = 'wall'} else {state = 'empty'}
      $("#row"+row).append('<td id="cell' + row + '-' + col +'"></td>')
      $("#cell"+ row + "-" + col).addClass(state);
    }
  }
  seed(); // Randomly populate dungeon. Let the Record show I'm against this feature, a planned dungeon provides for a better game...
  //Add user to map
  $("#cell" + userLoc[0] + "-" + userLoc[1]).removeClass().addClass('user');
  //Add boss to map
  $("#cell12-47").removeClass().addClass('ogre monster');
  //Set stats
  $("#health").html("Health: " + health + " (" + maxHealth + ") &emsp; Potions: " + potionCount + " (1d4 + " + level + ")");
  $("#level").text("Level: " + level + " (" + xp + ")");
  $("#damage").text("Weapon: " + weaponType[weaponIndex] + " (1d" + weaponDamage[weaponIndex] + "+" + level + ")");
  $("#displayDiagText").append("Keyboard Controls:<br>You can use the arrow keys or<br>a, w, s, d to move<br>And spacebar to use a healing potion.");
}
function seed() { //Place a random number of Monsters & chests at random locations avoiding walls and the starting corner.
  var monsterList = ["rat","kobold","goblin","hobgoblin","orc"],
      emptyLocations = [];
  for (row=1;row<map.length-1;row++) { // Build an array of empty locations
    for (col=1;col<map[row].length-1;col++) {
      if (map[row][col] == 0) {emptyLocations.push([row,col]);}
    }
  }
  var numberOfMonsters = random(15,40);
  var numberOfChests = random(10,20);
  for (i=0;i<numberOfChests;i++) { //Place chests
    rand = random(0,emptyLocations.length);
    tempLoc = emptyLocations[rand];
    emptyLocations.splice(rand,1);
    row = tempLoc[0]; col = tempLoc[1];
    $("#cell" + row + "-" + col).removeClass().addClass('chest');
  }
  for (i=0;i<numberOfMonsters;i++) { //Place monsters
    rand = random(0,emptyLocations.length);
    tempLoc = emptyLocations[rand];
    emptyLocations.splice(rand,1);
    row = tempLoc[0]; col = tempLoc[1];
    creature = monsterList[random(0,monsterList.length-1)]; //Randomly select Monster type
    $("#cell" + row + "-" + col).removeClass().addClass( creature + ' monster');
  }
}
function mapWalls () {
  map[0] = [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
  map[1] = [0,0,0,1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,1,1,0,0,0,1,0,0,0,1,0,0,0,0,1];
  map[2] = [0,0,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,1,1,0,1,0,1,0,1,0,0,0,0,0,0,1];
  map[3] = [1,1,1,1,1,1,0,0,0,0,0,0,0,1,0,0,0,1,1,1,0,1,1,0,1,1,1,1,1,0,0,0,1,0,0,1,0,0,1,0,0,0,1,0,1,0,0,0,0,1];
  map[4] = [1,0,0,0,0,1,0,0,0,0,1,1,1,1,1,1,0,1,0,0,0,1,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,1,1,0,1,1,1,0,1,0,0,0,0,1];
  map[5] = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,1,0,0,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,1,0,0,1,1,1,1,1,1];
  map[6] = [1,1,0,1,1,1,0,1,1,1,1,0,1,0,0,1,0,1,0,0,0,0,1,1,1,1,1,0,1,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1];
  map[7] = [1,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,1,1,1,1,0,1,0,0,0,0,1];
  map[8] = [1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1];
  map[9] = [1,0,0,0,0,1,0,0,0,0,1,0,1,0,0,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,1,1,1,0,0,0,0,0,0,1];
 map[10] = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,1,1,0,1,0,0,0,0,1];
 map[11] = [1,0,0,0,0,1,0,0,0,0,0,0,1,1,0,0,0,0,1,0,0,0,1,0,1,1,1,1,1,1,0,1,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,1];
 map[12] = [1,0,0,0,0,1,0,0,0,0,1,0,1,1,1,1,1,1,1,1,1,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,1];
 map[13] = [1,0,0,1,0,0,0,1,1,1,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,1];
 map[14] = [1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1];
 map[15] = [1,0,0,0,0,1,0,0,0,0,1,0,1,1,1,1,0,1,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,1,1,0,1,1,1,0,0,0,0,0,0,1];
 map[16] = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,1,0,0,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,1,0,0,1,1,1,1,1,1];
 map[17] = [1,1,0,1,1,1,0,1,1,1,1,0,1,0,0,1,0,1,0,0,0,0,1,1,1,1,1,0,1,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1];
 map[18] = [1,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,1,1,1,1,0,1,0,0,0,0,1];
 map[19] = [1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1];
 map[20] = [1,0,0,0,0,1,0,0,0,0,1,0,1,0,0,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,1,1,1,0,0,0,0,0,0,1];
 map[21] = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,1,1,1,1,0,0,0,0,1];
 map[22] = [1,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,0,0,0,1,0,1,1,1,1,1,1,0,1,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,1];
 map[23] = [1,0,0,0,0,1,0,0,0,0,1,0,1,1,1,1,1,1,1,1,1,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
 map[24] = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
}
function died (row,col) {
  dead = true;
  $("#cell" + row + "-" + col).removeClass().addClass('dead');
  $("#messageText").html("Unfortunately you have died.<br><br>After a brief and uneventful reincarnation as a fruit fly, you are once again reincarnated as a human.<br><br>Would you like to try again?<br><br>");
    $("#message").show();
}
function attack (row, col) {
  //Get monster stats
  //mHp,mDamage,mAc,mXp
  var monster = '', mHp = 0, mDamage = 0, mAc = 0, mXp = 0;
  if ($("#cell" + row + "-" + col).hasClass( "rat" )) {monster = 'Giant Rat', mHp = rat[0], mDamage = rat[1], mAc = rat[2], mXp = rat[3];}
  if ($("#cell" + row + "-" + col).hasClass( "kobold" )) {monster = 'Kobold', mHp = kobold[0], mDamage = kobold[1], mAc = kobold[2], mXp = kobold[3];}
  if ($("#cell" + row + "-" + col).hasClass( "goblin" )) {monster = 'Goblin', mHp = goblin[0], mDamage = goblin[1], mAc = goblin[2], mXp = goblin[3];}
  if ($("#cell" + row + "-" + col).hasClass( "hobgoblin" )) {monster = 'Hobgoblin', mHp = hobgoblin[0], mDamage = hobgoblin[1], mAc = hobgoblin[2], mXp = hobgoblin[3];}
  if ($("#cell" + row + "-" + col).hasClass( "orc" )) {monster = 'Orc', mHp = orc[0], mDamage = orc[1], mAc = orc[2], mXp = orc[3];}
  if ($("#cell" + row + "-" + col).hasClass( "ogre" )) {monster = 'Ogre', mHp = ogre[0], mDamage = ogre[1], mAc = ogre[2], mXp = ogre[3];}
  //Now fight
  $("#displayDiagText").html("It's a " + monster + "!<br>");
  var over = false;
  while (over == false) {
    if (mHp > 0 && health > 0) { //User roll for hit & damage
      var hitCheck = random(1,20);
      if (hitCheck >= mAc-level) { //Hit
        if (hitCheck == 20) {$("#displayDiagText").append("You decapitate the " + monster + " killing it instantly!<br>");mHp = 0;}
        else {
          //Get damage weaponDamage + level
          var hitDamage = random(1,weaponDamage[weaponIndex]) + level;
          $("#displayDiagText").append("You strike the " + monster + " with your " + weaponType[weaponIndex] + " for " + hitDamage + " points of damage!<br>");
          mHp -= hitDamage;
        }
      } else { //Miss
        $("#displayDiagText").append("You miss the " + monster + "!<br>");
      }
      if (mHp < 1) {over = true; win(monster,mXp); return;} //User wins
      // Now it's the monsters turn...
      hitCheck = random(1,20);
      if (hitCheck >= 12 + level) { //Hit
        //Get damage
        hitDamage = random(1,mDamage);
          $("#displayDiagText").append("The " + monster + " strikes you doing " + hitDamage + " points of damage!<br>");
          health -= hitDamage;
      }
      else {$("#displayDiagText").append("The " + monster + " misses you!<br>");} //Miss
      $("#health").html("Health: " + health + " (" + maxHealth + ") &emsp; Potions: " + potionCount + " (1d4 + " + level + ")");
      if (health < 1) {over = true; died(userLoc[0], userLoc[1]);} //User dies
    }
  } // end of While...
}
function random (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function win(monster,mXp) {
  $("#cell" + userLoc[0] + "-" + userLoc[1]).removeClass().addClass('user');
  $("#displayDiagText").append("You've killed the " + monster + "! Earning " + mXp + " more experince.<br>");
  xp += mXp;
      $("#level").text("Level: " + level + " (" + xp + ")");
  checkLevel();
  $("#displayDiagText").append("You search the body and find ... " + loot(0) + "!<br>");
  if(monster == 'Ogre') { //Open up exit...
    $("#displayDiagText").append("After you kill the Ogre you notice that a secret exit has opened up...<br>");
    $("#cell13-49").removeClass('wall').addClass('empty');
  }
}
function checkLevel() {
  if (levelUp[level] < xp) {
    level += 1;
    $("#displayDiagText").append("Congratulations! You are now level " + level + "<br>");
    maxHealth = maxHealth + random(1,6) + level;
    //Update stats
    $("#health").html("Health: " + health + " (" + maxHealth + ") &emsp; Potions: " + potionCount + " (1d4 + " + level + ")");
    $("#level").text("Level: " + level + " (" + xp + ")");
    $("#damage").text("Weapon: " + weaponType[weaponIndex] + " (1d" + weaponDamage[weaponIndex] + "+" + level + ")");
  }
}
function loot(type) {
  if (type > 0) { //Chest Search
    var max = level; if (max > 4) {max = 4;}
    var find = random(1,max);
    if (find <= weaponIndex) { //Don't want...
      $("#displayDiagText").append("You find a " + weaponType[find] + ", but decide to keep using your current " + weaponType[weaponIndex] + ".");
      return;
    }
    else { //Upgrade!
      $("#displayDiagText").append("You find a " + weaponType[find] + ". Upgrade!<br>You know wield a " + weaponType[find]);
      weaponIndex = find;
      $("#damage").text("Weapon: " + weaponType[weaponIndex] + " (1d" + weaponDamage[weaponIndex] + "+" + level + ")");
      return;
    }
  }
  else { //Body Search
    if (random(1,20) < 10) {return "nothing";}
    else {
      potionCount += 1;
      $("#health").html("Health: " + health + " (" + maxHealth + ") &emsp; Potions: " + potionCount + " (1d4 + " + level + ")");
      return "a healing potion";
    }
  }
}
function drinkPotion() { //Healing 1d4 + level spacebar to use...
  if (potionCount > 0) {
    potionCount -= 1;
    var bump = random(1,4) + level;
    health = health + bump;
    if (health > maxHealth) {health = maxHealth};
    $("#health").html("Health: " + health + " (" + maxHealth + ") &emsp; Potions: " + potionCount + " (1d4 + " + level + ")");
    $("#displayDiagText").append("You drink a healing potion and regain " + bump + " hitpoints<br>");
  } else {
    $("#displayDiagText").append("Drink what? You don't have any potions...<br>");
  }
}
});
