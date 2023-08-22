/*

CUSTOM CONSOLE

*/

let console = {};

console.log = function(text) {
    document.getElementById("console").innerHTML += text + "<br>";
}

console.clear = function() {
    document.getElementById("console").innerHTML = "";
}

window.console = console; // Just in case.

/*

SPACE TYPES:

START SPACE - Gain 4 coins when passing this space (also when starting the game)
POWERUP SPACE - Gain a powerup if you don't have one already, or a second one if you're Wario.
GAIN COIN SPACE - Gain a coin
LOSE COIN SPACE - Lose a coin, unless you are Mario
SPECIAL DIE 123 - Get a special die with the numbers 1, 2, and 3 on it
SPECIAL DIE 456 - Get a special die with the numbers 4, 5, and 6 on it
BOSS BATTLE - Fight a boss, if you win, you get a coin from the other players, if lose, then half of your coins go bye bye

*/

const Space = {
    START: 0,
    POWERUP: 1,
    GAIN_COIN: 2,
    LOSE_COIN: 3,
    DIE_123: 4,
    DIE_456: 5,
    BOSS: 6
}

/*

CHARACTERS

Mario - Immune to the -1 coin board space.
Peach - Optionally can move 1 extra space on any dice roll
Daisy - Can reroll any die once per turn
Yoshi - When mushroom powerup used, Yoshi moves double the amount
Koopa Troopa - 1 extra coin when passing start
Luigi - Extra slot for special dice
DK - Immune to bananas
Birdo - Immune to shells
Toad - Move +2 spaces on every dice roll
Wario - Can hold 2 power-ups

*/

const Character = {
    MARIO: 0,
    PEACH: 1,
    DAISY: 2,
    YOSHI: 3,
    KOOPA_TROOPA: 4,
    LUIGI: 5,
    DONKEY_KONG: 6,
    BIRDO: 7,
    TOAD: 8,
    WARIO: 9
}

/*

POWERUPS - Gained when landing on powerup space

BANANA - Dropped on game space, next character to stop on that space loses a turn (no space benefit when landing on banana either)
RED SHELL - Toss up to 4 spaces ahead, target loses turn and 1/4 of their coins
BOO - Immune for 1 turn and steal an unused powerup from another character
MUSHROOM - Character gets an extra roll; roll twice and move the sum
STAR - Immune for 2 turns
BOB-OMB - Toss up to 3 spaces ahead, target character loses a turn, all special dice, and 1/4 of coins

*/

const Powerup = {
    BANANA: 0,
    RED_SHELL: 1,
    BOO: 2,
    MUSHROOM: 3,
    STAR: 4,
    BOB_OMB: 5 // tfw school appropriate
}

/*

DICE

There are two special dice types

*/

const Dice = {
    DIE_123: 0,
    DIE_456: 1
}

/*

BOSSES

The bosses are Bowser, Kamek, Iggy Koopa, and King Boo
The bosses as of now do not appear to be distinct from each other in terms of functionality, so they are not distinct from each other in the simulation.

*/

// Some functions

function createBoard(spaces) {
    let board = [];

    for (i = 0; i < spaces.length; i++) {
        board.push(space(spaces[i]));
    }

    return board;
}

function space(id) {
    return { id: id, banana: false }; // No spaces on the board start with a banana
}

function spaceName(id) {
    let keys = Object.keys(Space);
    for (let i = 0; i < keys.length; i++) {
        if (Space[keys[i]] == id) return keys[i];
    }
    return "UNKNOWN";
}

function characterName(id) {
    let keys = Object.keys(Character);
    for (let i = 0; i < keys.length; i++) {
        if (Character[keys[i]] == id) return keys[i];
    }

    return "UNKNOWN";
}

function powerupName(id) {
    let keys = Object.keys(Powerup);
    for (let i = 0; i < keys.length; i++) {
        if (Powerup[keys[i]] == id) return keys[i];
    }

    if (i === -1) return "NONE"; // -1 will be used to signify there is no powerup.
    return "UNKNOWN";
}

function createCharacters(characters) {
    let chars = [];

    for (let i = 0; i < characters.length; i++) {
        chars.push(character(characters[i]));
    }

    return chars;
}

function character(id) {
    let coins = Config.startSpaceValue; // Koopa Troopa as far as I know doesn't get an extra one of these on game start.
    let powerups = id === Character.WARIO ? [-1, -1] : [-1]; // Wario can hold 2 powerups
    let dice = id === Character.LUIGI ? [-1, -1] : [-1]; // Luigi can hold 2 special dice
    let lostTurn = false;
    let space = 0; // Characters always start on the first space.

    return { id: id, coins: coins, powerups: powerups, dice: dice, lostTurn: lostTurn, space: space };
}

// Inclusive
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function newSpaceIndex(currentSpace, numberOfSpaces, totalSpaces) {
    currentSpace += numberOfSpaces;
    if (currentSpace >= totalSpaces) currentSpace -= totalSpaces;
    return currentSpace;
}


// Alright let's finally start coding the simulation itself!
// Config values

let Config = {
    startingCharacters: [Character.PEACH, Character.DAISY, Character.MARIO, Character.WARIO, Character.TOAD], // Original characters in original game.
    boardSpaces: [
        Space.START,
        Space.POWERUP,
        Space.GAIN_COIN,
        Space.DIE_123,
        Space.POWERUP,
        Space.GAIN_COIN,
        Space.GAIN_COIN,
        Space.POWERUP,
        Space.DIE_456,
        Space.GAIN_COIN,
        Space.DIE_123,
        Space.BOSS,

        Space.LOSE_COIN,
        Space.GAIN_COIN,
        Space.DIE_456,
        Space.DIE_123,
        Space.GAIN_COIN,
        Space.GAIN_COIN,
        Space.POWERUP,
        Space.LOSE_COIN,
        Space.POWERUP,
        Space.POWERUP,
        Space.GAIN_COIN,
        Space.BOSS,

        Space.GAIN_COIN,
        Space.POWERUP,
        Space.LOSE_COIN,
        Space.GAIN_COIN,
        Space.DIE_456,
        Space.LOSE_COIN,
        Space.GAIN_COIN,
        Space.POWERUP,
        Space.BOSS,

        Space.LOSE_COIN,
        Space.POWERUP,
        Space.GAIN_COIN,
        Space.DIE_123,
        Space.GAIN_COIN,
        Space.DIE_456,
        Space.POWERUP,
        Space.GAIN_COIN,
        Space.LOSE_COIN,
        Space.BOSS
    ], // Original game board

    startSpaceValue: 4, // Coins given for passing/landing on start space, also given at the start of the game.
    gainCoinValue: 1, // Coins gained for landing on a gain coin space
    loseCoinValue: 1, // Coins lost for landing on a lose coin space
    bossBattleChance: 80, // Percent chance of winning a given boss battle
    daysToSimulate: 180, // School year length or smth
}

// Cool coding wizardry starts here

let board = createBoard(Config.boardSpaces);
let characters = createCharacters(Config.startingCharacters);

// Game loop

let day = 0;
let daysLeft = Config.daysToSimulate;

function characterTurn(character) {
    let name = characterName(character.id);

    console.log("> " + name + "'s turn:");

    if (character.lostTurn) {
        console.log(name + " lost their turn.")
        character.lostTurn = false;
        return;
    }

    let roll = random(1, 6);
    let bonusRoll = 0;

    if (character.id === Character.TOAD) bonusRoll += 2;
    console.log(name + " rolled a " + (roll + bonusRoll) + (bonusRoll > 0 ? " (+" + bonusRoll + ")" : ""));

    let newSpace = newSpaceIndex(character.space, roll + bonusRoll, Config.boardSpaces.length);
    character.space = newSpace;
    // console.log(name + " is on index " + newSpace);
    console.log(name + " landed on " + spaceName(Config.boardSpaces[newSpace]));

    switch (Config.boardSpaces[newSpace]) {
        case Space.GAIN_COIN:
            character.coins += Config.gainCoinValue;
            console.log(name + " gained " + Config.loseCoinValue + " coin(s)!");
            console.log(name + " now has " + character.coins + " coin(s).");
            break;
        case Space.LOSE_COIN:
            if (character.id === Character.MARIO) {
                console.log(name + " is immune to this space!");
                break;
            }
            character.coins -= Config.loseCoinValue;
            console.log(name + " lost " + Config.loseCoinValue + " coin(s)...");
            console.log(name + " now has " + character.coins + " coins(s) left.");
            break;
    }
}

let paused = false;
function togglePause() {
    paused = !paused;
}

function nextDay() {
    if (daysLeft < 1 || paused) return;
    day++;
    console.clear();
    console.log("========== DAY " + day + " ==========");

    for (let i = 0; i < characters.length; i++) {
        characterTurn(characters[i]);
    }

    // End of day
    daysLeft--;
    console.log("Days left: " + daysLeft);

    // Update HTML
    let charactersHtml = ""
    for (let i = 0; i < characters.length; i++) {
        charactersHtml += characterName(characters[i].id) + "<br>Coins: " + characters[i].coins + "<br>";
        charactersHtml += "<br>";
    }
    document.getElementById("characters").innerHTML = charactersHtml;

    document.getElementById("daysLeft").innerHTML = "Days left: " + daysLeft;
}

setInterval(nextDay, 100);