// ---------- Elements ----------
var intro = document.getElementById("intro");
var setup = document.getElementById("setup");
var stage = document.getElementById("stage");
var startBtn = document.getElementById("startBtn");
var accounts = document.getElementById("accounts");
var countEl = document.getElementById("count");
var messageEl = document.getElementById("message");
var importBtn = document.getElementById("importBtn");
var csvFile = document.getElementById("csvFile");
var drawBtn = document.getElementById("drawBtn");
var stageText = document.getElementById("stageText");
var deck = document.getElementById("deck");
var actions = document.getElementById("actions");
var againBtn = document.getElementById("againBtn");
var backBtn = document.getElementById("backBtn");

var SUITS = ["♠", "♥", "♦", "♣"];
var busy = false;

// ---------- Clean one account ----------
// "@Ali", "instagram.com/ali/", "https://instagram.com/ali?x=1"  ->  "ali"
function cleanName(raw) {
    var name = raw.split('"').join("").trim().toLowerCase();
    var marker = "instagram.com/";
    var pos = name.indexOf(marker);

    if (pos !== -1) {
        name = name.slice(pos + marker.length);
    }

    name = name.split("?")[0];
    name = name.split("/")[0];

    while (name.charAt(0) === "@") {
        name = name.slice(1);
    }
    return name;
}

// ---------- Read the list from the text box ----------
function getNames() {
    var text = accounts.value;
    text = text.split("\r").join("\n");
    text = text.split("\t").join("\n");
    text = text.split(",").join("\n");
    text = text.split(";").join("\n");
    text = text.split(" ").join("\n");

    var parts = text.split("\n");
    var skip = ["", "username", "account", "instagram", "name"];
    var list = [];

    for (var i = 0; i < parts.length; i++) {
        var n = cleanName(parts[i]);

        if (skip.indexOf(n) !== -1) {
            continue;
        }
        if (list.indexOf(n) !== -1) {
            continue;
        }
        list.push(n);
    }
    return list;
}

function updateCount() {
    var n = getNames().length;
    if (n === 1) {
        countEl.textContent = "1 account";
    } else {
        countEl.textContent = n + " accounts";
    }
}

accounts.addEventListener("input", function () {
    messageEl.textContent = "";
    updateCount();
});

// ---------- Screen 1 -> screen 2 ----------
startBtn.addEventListener("click", function () {
    intro.classList.add("hidden");
    setup.classList.remove("hidden");
    accounts.focus();
});

// ---------- Import CSV ----------
importBtn.addEventListener("click", function () {
    csvFile.click();
});

csvFile.addEventListener("change", function () {
    var file = csvFile.files[0];
    if (!file) {
        return;
    }

    var reader = new FileReader();

    reader.onload = function () {
        if (accounts.value.trim() !== "") {
            accounts.value = accounts.value + "\n";
        }
        accounts.value = accounts.value + reader.result;

        // show the cleaned list in the box
        accounts.value = getNames().join("\n");

        updateCount();
        messageEl.className = "message ok";
        messageEl.textContent = "CSV imported.";
        csvFile.value = "";
    };

    reader.readAsText(file);
});

// ---------- Random number ----------
function randomIndex(max) {
    var buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] % max;
}

// ---------- Build the 5 cards ----------
function buildDeck(winner, suit) {
    var isRed = (suit === "♥");
    if (suit === "♦") {
        isRed = true;
    }

    deck.className = "deck";
    deck.innerHTML = "";

    for (var i = 0; i < 5; i++) {
        var card = document.createElement("div");
        card.className = "pcard";
        if (i === 2) {
            card.className = "pcard chosen";
        }
        card.style.setProperty("--i", i);

        var front = "face front";
        if (isRed) {
            front = "face front red";
        }
        card.innerHTML =
            '<div class="face back">♠</div>' +
            '<div class="' + front + '">' +
                '<span class="corner tl">A<br>' + suit + '</span>' +
                '<span class="pcard-name"></span>' +
                '<span class="corner br">A<br>' + suit + '</span>' +
            '</div>';

        if (i === 2) {
            card.querySelector(".pcard-name").textContent = "@" + winner;
        }
        deck.appendChild(card);
    }
}

// ---------- The trick ----------
function reveal(names) {
    if (busy) {
        return;
    }
    busy = true;

    var winner = names[randomIndex(names.length)];
    var suit = SUITS[randomIndex(SUITS.length)];
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setup.classList.add("hidden");
    stage.classList.remove("hidden");
    actions.classList.add("hidden");

    buildDeck(winner, suit);
    stageText.textContent = "Watch closely…";
    deck.classList.add("shuffling");

    var shuffleTime = 2600;
    var flipTime = 1100;
    if (reduce) {
        shuffleTime = 0;
        flipTime = 0;
    }

    setTimeout(function () {
        deck.classList.remove("shuffling");
        deck.classList.add("picked");
        stageText.textContent = "Now you see me.";

        setTimeout(function () {
            actions.classList.remove("hidden");
            busy = false;
        }, flipTime);
    }, shuffleTime);
}

// ---------- Buttons ----------
function startDraw() {
    var names = getNames();

    if (names.length < 2) {
        messageEl.className = "message error";
        messageEl.textContent = "The show needs at least 2 names.";
        return;
    }
    reveal(names);
}

drawBtn.addEventListener("click", startDraw);
againBtn.addEventListener("click", startDraw);

backBtn.addEventListener("click", function () {
    stage.classList.add("hidden");
    setup.classList.remove("hidden");
    accounts.focus();
});
