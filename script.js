var editor = document.getElementById("editor");
var slideBox = document.getElementById("slide");
var pSlideBox = document.getElementById("pslide");
var countBox = document.getElementById("count");
var pCountBox = document.getElementById("pcount");
var presentScreen = document.getElementById("presentScreen");
var msg = document.getElementById("msg");

var leftBtn = document.getElementById("left");
var rightBtn = document.getElementById("right");
var fullBtn = document.getElementById("full");
var pLeftBtn = document.getElementById("pleft");
var pRightBtn = document.getElementById("pright");
var pFullBtn = document.getElementById("pfull");

var slides = [];
var current = 0;
var presenting = false;

var defaultText =
  "# Slide 1\n## Hello\n\nThis is my first slide.\n---\n" +
  "# Slide 2\n\n- Point one\n- Point two\n---\n" +
  "# Slide 3\n\nThe end.";

// Convert one slide of markdown to HTML
function toHtml(text) {
  var lines = text.split("\n");
  var html = "";
  var inList = false;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
      .replace(/\*(.+?)\*/g, "<i>$1</i>");

    var isItem = line.indexOf("- ") === 0;

    if (isItem && !inList) {
      html += "<ul>";
      inList = true;
    }
    if (!isItem && inList) {
      html += "</ul>";
      inList = false;
    }

    if (isItem) {
      html += "<li>" + line.substring(2) + "</li>";
    } else if (line.indexOf("### ") === 0) {
      html += "<h3>" + line.substring(4) + "</h3>";
    } else if (line.indexOf("## ") === 0) {
      html += "<h2>" + line.substring(3) + "</h2>";
    } else if (line.indexOf("# ") === 0) {
      html += "<h1>" + line.substring(2) + "</h1>";
    } else if (line.trim() !== "") {
      html += "<p>" + line + "</p>";
    }
  }

  if (inList) html += "</ul>";
  return html;
}

function update() {
  // split on lines that contain only ---
  slides = editor.value.split(/^---\s*$/m);

  if (current >= slides.length) current = slides.length - 1;

  var html = toHtml(slides[current]);
  slideBox.innerHTML = html;
  pSlideBox.innerHTML = html;

  var text = current + 1 + " / " + slides.length;
  countBox.textContent = text;
  pCountBox.textContent = text;

  var first = current === 0;
  var last = current === slides.length - 1;
  leftBtn.disabled = first;
  pLeftBtn.disabled = first;
  rightBtn.disabled = last;
  pRightBtn.disabled = last;

  fullBtn.textContent = presenting ? "Exit Full Screen" : "Full Screen";
  pFullBtn.textContent = presenting ? "Exit Full Screen" : "Full Screen";
}

function goLeft() {
  if (current > 0) {
    current--;
    update();
  }
}

function goRight() {
  if (current < slides.length - 1) {
    current++;
    update();
  }
}

function toggleFullScreen() {
  if (presenting) {
    presenting = false;
    presentScreen.classList.add("hidden");
    if (document.fullscreenElement) document.exitFullscreen();
  } else {
    presenting = true;
    presentScreen.classList.remove("hidden");
    document.documentElement.requestFullscreen();
  }
  update();
}

function save() {
  localStorage.setItem("slides", editor.value);
  msg.textContent = "Saved! ";
  setTimeout(function () {
    msg.textContent = "";
  }, 1500);
}

// buttons
editor.addEventListener("input", update);
leftBtn.onclick = goLeft;
rightBtn.onclick = goRight;
fullBtn.onclick = toggleFullScreen;
pLeftBtn.onclick = goLeft;
pRightBtn.onclick = goRight;
pFullBtn.onclick = toggleFullScreen;
document.getElementById("saveBtn").onclick = save;
document.getElementById("presentBtn").onclick = toggleFullScreen;

// keyboard
document.addEventListener("keydown", function (e) {
  if (e.ctrlKey && e.key.toLowerCase() === "s") {
    e.preventDefault();
    save();
  } else if (e.key === "F11") {
    e.preventDefault();
    toggleFullScreen();
  } else if (e.key === "ArrowRight" && (presenting || document.activeElement !== editor)) {
    goRight();
  } else if (e.key === "ArrowLeft" && (presenting || document.activeElement !== editor)) {
    goLeft();
  }
});

// if user presses Esc to leave browser full screen
document.addEventListener("fullscreenchange", function () {
  if (!document.fullscreenElement && presenting) {
    presenting = false;
    presentScreen.classList.add("hidden");
    update();
  }
});

// load saved slides
editor.value = localStorage.getItem("slides") || defaultText;
update();
