var game = {
  totalDays: 0,
  daysLeft: 50,
};

var caravan = {
  party: [],
  cash: 700,
  food: 200,
  medicine: 5
}

var checkpoints = ["Mars", "Neptune", "Andromeda Galaxy", "Center of the Universe"];

function Character(name) {
  this.name = name;
  this.health = 100;
  this.diseases = 0;
}

Character.prototype.healthGain = function() {
  var amount = rollNumber(5, 26);
  this.health += amount;
  if (this.health > 125) {
    this.health = 125;
  }
}

Character.prototype.healthLoss = function() { //daily health loss
  var starvingModifier = 1;
  var diseasedModifier = this.diseases * 2;
  if (caravan.food <= 0) {
    starvingModifier = 3;
  }

  this.health -= (3 + diseasedModifier) * starvingModifier;
}

Character.prototype.deathCheck = function(i) {
  if(this.health<=0) {
    return true;
  }
}

function foodLoss() {
  caravan.food -= 2 * caravan.party.length;
  if (caravan.food <= 0) {
    caravan.food = 0;
    console.log("Out of food!");
  }
}

function cashLoss() {
  caravan.cash -= 2 * caravan.party.length;
  if (caravan.cash <= 0) {
    caravan.cash = 0;
    console.log("Out of cash!");
  }
}

function checkDeath() {

  var deathString = "";

  for(var i = 0; i < caravan.party.length; i++) {
    if(caravan.party[i].deathCheck(i)) {
      deathString += caravan.party[i].name + " has died. ";
      caravan.party.splice(i, 1);
      $(".rest").hide();
      $(".mourn").show();
      $(".mourn").css("display", "inline-block");
      if (caravan.party.length <= 0) {
        $("#randomEventMessage, #checkPoint").empty();
        $("#gameScreen").hide();
        gameWinSong.play();
        $("#event").html("Everyone in your party has died. The game is over.");
        $(".restartGame").show();

        return;
      }
      i--;
    }
  }

  if (deathString) {
    deathString += "Bummer.";
    $("#event").html(deathString);
  }
}

function fates(roll, rivOrTrail) {
  var charIndex = rollNumber(0,caravan.party.length);
  var more = "";
  $("#event").html("Though the journey may be rough, the ship has continued on the trail.");

  if (rivOrTrail === "trail") {
    if (roll <= 10) {
      if (caravan.party[charIndex].diseases > 0) {
        more = "nother";
      }
      var diseaseNames = ["dysentery", "cholera", "typhoid", "measles", "diphtheria", "scurvy"];
      var diseaseIndex = rollNumber(0, diseaseNames.length);
      $("#randomEventMessage").text(caravan.party[charIndex].name+" contracted " + diseaseNames[diseaseIndex] + "!");
      caravan.party[charIndex].diseases += 1;
    } else if (roll<=14) {
      $("#randomEventMessage").text(caravan.party[charIndex].name + " broke a foot while reparing the ship.");
      caravan.party[charIndex].health -= 50;
    } else if (roll<=18 && caravan.food > 0){
      $("#randomEventMessage").text("Everyone shunned " + caravan.party[charIndex].name+" after dropping food in the shute.");
      caravan.food -= 50;
    } else if (roll<=21){
      $("#randomEventMessage").text("There was a small alien creature in " +  caravan.party[charIndex].name + "'s boot. " + caravan.party[charIndex].name + " contracted a disease.");
      caravan.party[charIndex].diseases += 1;
    } else if (roll >= 98) {
      caravan.food += 50;
      $("#randomEventMessage").text("Your caravan came across a field of ripe, delicous moonberries.");
    } else if (roll >= 95) {
      caravan.medicine += 1;
      $("#randomEventMessage").text("A generous, traveling doctor has gifted you 1 medicine.");
    } else if (roll >= 92) {
      caravan.party.forEach(function (element) {
        element.healthGain();
      });
      $("#randomEventMessage").text("You found an undiscovered moon and spent the day! Your party feels more rested.");
    } else {
      $("#event").html("You have traveled a day and are one step closer to Space.");
    }
  } else if (rivOrTrail === "river") {
    if (roll <= 10) {
      caravan.party[charIndex].health = 0;
      $("#randomEventMessage").text(caravan.party[charIndex].name + " has fallen out of the hangar.");
    } else if (roll <= 17) {
      var amount = rollNumber(10, 31);
      caravan.food -= amount;
      $("#randomEventMessage").text("The nebula was rough and " + caravan.party[charIndex].name + " dropped " + amount + " food in the shute by accident.");
    } else if (roll <= 25) {
      caravan.party[charIndex].diseases += 1;
      $("#randomEventMessage").text(caravan.party[charIndex].name + "  contracted a disease from poor air quality in the ship.");
    } else if (roll <= 36 && caravan.party.medicine > 0) {
      var amount = rollNumber(1, (caravan.party.medicine + 1));
      caravan.party.medicine -= amount;
      $("#randomEventMessage").text(caravan.party[charIndex].name + " dropped " + amount + " medicines.")
    } else if (roll <= 50) {
      var amount = rollNumber(5, 16);
      caravan.party.forEach(function(element) {
        element.health -= amount;
      });
      $("#randomEventMessage").text("The nebula's turbulence took a toll on the crew. Everyone loses " + amount + " health.");
    } else {
      $("#event").text("Your party successfully crossed the nebula. Onward to Space.")
      return;
    }
  } else {
    console.log("ERRORRR");
    return;
  }
}

function rollNumber(min, max) {
  min = Math.ceil(min);  //inclusive
  max = Math.floor(max); //exclusive
  return Math.floor(Math.random() * (max - min)) + min;
}

function talk() {
  var talkRoll = rollNumber(0, 4);
  if(talkRoll === 0) {
    $("#event").text("You meet two dock station workers who give you contradictory directions, and neither will admit who is wrong.");
  }else if(talkRoll === 1) {
    $("#event").text("Two of your fleet members get into a fight, but eventually decide to settle down.");
  }else if(talkRoll === 2) {
    $("#event").text("You travel to run some errands, and when you get back the ship has been looted.");
    caravan.cash - 100;
  }else if(talkRoll === 3) {
    $("#event").text("You meet a drunk alien at a bar onboard the local station.");
  }else {
    console.log("talk function error");
  }
}

function gameChecker() {
  if (game.daysLeft === 0) {  // GAME OVER WIN
    $("#randomEventMessage, #checkPoint, #event").empty();
    var left = caravan.party.length;
    $("#checkPoint").html("You have reached the end, with " + left + " of your party left.");
    $(".restartGame").show();
    $(".continueOnTrail, .rest, .mourn, .hunt, .talk, .heal").hide();
    gameWinSong.play();
  } else if (game.daysLeft === 40) { // 40 days from end (and multiples of 20)...fort
    $("#randomEventMessage, #checkPoint").empty();
    $("#checkPoint").html("Welcome. You've reached " + checkpoints[0] + "!");
    checkpoints.shift();
    $(".hunt").hide();
    $(".talk").show();
    $(".talk").css("display", "inline-block");
  } else if (game.daysLeft === 30) { // 30 days from end (and multiples of 20)...river
    $("#randomEventMessage, #checkPoint").empty();
    $("#checkPoint").html("You've reached " + checkpoints[0] + "! Proceed with caution.");
    checkpoints.shift();
    $(".hunt").hide();
    $(".continueOnTrail").hide();
    $(".crossRiver").show();
    $(".crossRiver").css("display", "inline-block");
    $(".talk").show();
    $(".talk").css("display", "inline-block");
  } else if (game.daysLeft === 20) { // 20 days from end (and multiples of 20)...river
    $("#randomEventMessage, #checkPoint").empty();
    $("#checkPoint").html("Welcome. You've reached " + checkpoints[0] + "!");
    checkpoints.shift();
    $(".hunt").hide();
    $(".talk").show();
    $(".talk").css("display", "inline-block");
  } else if (game.daysLeft === 10) { // 10 days from end (and multiples of 20)...river
    $("#randomEventMessage, #checkPoint").empty();
    $("#checkPoint").html("You've reached " + checkpoints[0] + "! Proceed with caution.");

    checkpoints.shift();
    $(".hunt").hide();
    $(".continueOnTrail").hide();
    $(".crossRiver").show();
    $(".crossRiver").css("display", "inline-block");
    $(".talk").show();
    $(".talk").css("display", "inline-block");
  }
}

function medicine() {
  $("#randomEventMessage, #checkPoint").empty();
  if (caravan.medicine <= 0) {
    $("#event").html("You don't have any medicine.");
  } else {
    var index;
    var lowestHealth = 1000;
    caravan.party.forEach(function(element, i) {
      if (element.diseases > 0) {
        if (element.health < lowestHealth) {
          lowestHealth = element.health;
          index = i;
        } else {
          return;
        }
      } else {
        return;
      }
    });
    if (lowestHealth === 1000) {
      $("#event").html("There is no one to heal.");
    } else {
      caravan.party[index].diseases -= 1;
      caravan.medicine -= 1;
      $("#event").html(caravan.party[index].name + " has been healed.");
    }
  }
  return;
}

function restMourn() {
  $("#randomEventMessage, #checkPoint").empty();
  foodLoss();
  caravan.party.forEach(function (element) {
    element.healthGain();
  });
  $("#event").html("Your party mourns the loss of a fallen fleet member.");
  game.totalDays++;
  $(".mourn").hide();
  $(".rest").show();
}

function rest() {
  $("#randomEventMessage, #checkPoint").empty();
  foodLoss();
  caravan.party.forEach(function (element) {
    element.healthGain();
  });
  $("#event").html("You dock your ship at local station to rest.");
  game.totalDays++;
}

function work() {
  $("#randomEventMessage, #checkPoint").empty();
  var cashGained = rollNumber(4, 16);
  caravan.cash += cashGained * caravan.party.length;
  $("#event").html("Everyone in your party found loot worth "+cashGained+" dollars!");
  cashLoss();
  caravan.party.forEach(function (element) {
    element.healthLoss();
  });
  checkDeath();
  game.totalDays++;

}

function hunt() {
  $("#randomEventMessage, #checkPoint").empty();
  var meatGained = rollNumber(4, 16);
  caravan.food += meatGained * caravan.party.length;
  $("#event").html("Everyone in your party gathered "+meatGained+" food!");
  foodLoss();
  caravan.party.forEach(function (element) {
    element.healthLoss();
  });
  checkDeath();
  game.totalDays++;

}

function travel(rivOrTrail) {
  var roll = rollNumber(1,101);
  console.log(roll);
  fates(roll, rivOrTrail);
  foodLoss();
  caravan.party.forEach(function (element) {
    element.healthLoss();
  });
  checkDeath();
  game.totalDays++;
  game.daysLeft--;
  $(".talk").hide();
  $(".hunt").show();
}

function updateStats() {
  
  var daysString = "";
  
  daysString = "Day " + game.totalDays;

  $(".totalDays").html(daysString);

  var nameString = "";
  caravan.party.forEach(function(member) {
    if (member.diseases < 1) {
      nameString += "<li>" + member.name + " <progress value='" + member.health + "'" + "max='100' style='border-radius: 25%;'></progress>" + "</li>";
    } else {
      var plural = "";
      if (member.diseases > 1) {
        plural = "s";
      }
      nameString += "<li><span id='memberSick'>" + member.name + " " + "<ion-icon name='medical' class='align-middle ml-2'></ion-icon>" + " <progress value='" + member.health + "'" + "max='100' style='border-radius: 25%;'></progress>" + "</span></li>";
    }
  });

  $(".wagonMembers").html(nameString);

  var cashString = "";
  if (caravan.cash <= 0) {
    cashString = "<span id='cashZero'>Cash: 0</span>";
  } else {
    cashString = "" + caravan.cash;
  }
  $(".cash").html(cashString);

  var foodString = "";
  if (caravan.food <= 0) {
    foodString = "<span id='foodZero'>Food: 0</span>";
  } else {
    foodString = "" + caravan.food;
  }
  $(".food").html(foodString);

  var medString = "";
  if (caravan.medicine <= 0) {
    medString = "<span id='foodZero'>Medicine: 0</span>";
  } else {
    medString = "" + caravan.medicine;
  }
  $(".medicine").html(medString);
}

$(function() {
  $("form#createParty").submit(function(event) {
    event.preventDefault();

    var wagonLeader = $("#addLeader").val();
    var member1 = $("#addMember1").val();
    var member2 = $("#addMember2").val();
    var member3 = $("#addMember3").val();
    var member4 = $("#addMember4").val();

    var char1 = new Character(wagonLeader);
    var char2 = new Character(member1);
    var char3 = new Character(member2);
    var char4 = new Character(member3);
    var char5 = new Character(member4);
    caravan.party.push(char1, char2, char3, char4, char5);

    var autoNames = ["Ryan", "Gloria", "Riley", "Megan", "Chris", "Colin", "Blake", "Grace", "Ben", "Mark", "Liam", "Shane", "Christian", "Chance", "Oliver", "Evan", "Perry", "Dallas", "Alex", "Xi Xia", "Jahan", "Kaya", "Josh", "Nathaniel", "Janek", "Clifford", "Cameron", "Keith", "Pizza", "Stormi"];
    caravan.party.forEach(function(member) {
      if (!member.name) {
        var index = rollNumber(0, autoNames.length);
        member.name = autoNames[index];
        autoNames.splice(index, 1);
      }
    });

    updateStats();
    $("#homeScreen").hide();
    $("#gameScreen").show();
  });

  $(".continueOnTrail").click(function() {
    $("#randomEventMessage, #checkPoint").empty();

    travel("trail");
    gameChecker();
    console.log(game.daysLeft);
    updateStats();
  });

  $(".crossRiver").click(function() {
    $("#randomEventMessage, #checkPoint").empty();

    travel("river");
    gameChecker();
    console.log(game.daysLeft);
    updateStats();
    $(".crossRiver").hide();
    $(".continueOnTrail").show();
  });

  $(".rest").click(function() {
    rest();
    updateStats();
  });

  $(".work").click(function() {
    work();
    updateStats();
  });

  $(".hunt").click(function() {
    hunt();
    updateStats();
  });

  $(".heal").click(function() {
    medicine();
    updateStats();
  });

  $(".mourn").click(function() {
    console.log("part1");
    restMourn();
    updateStats();
  });

  $(".talk").click(function() {
    talk();
  })

})
