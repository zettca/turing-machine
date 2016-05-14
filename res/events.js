var tape = document.getElementById("tape");
var text = document.getElementsByName("tapeText")[0];

text.onkeypress = function(e){
  if (e.keyCode == 13){ // Enter
	loadTape();
	this.blur();
  }
};

document.onkeypress = function(e){  // (Ctrl + S)ave to cookies
	if (!(e.ctrlKey && e.which == 115) && !(e.which == 19)) return true;
	saveToCookies();
	fillTMCookieList();
	e.preventDefault();
	return false;
};

var selected = null;
var x_pos = 0, x_elem = 0;

function onDown(e){
	selected = this;
	x_pos = e.touches ? e.touches[0].pageX : e.pageX;
	x_elem = x_pos - selected.offsetLeft;
	document.body.style.cursor = "ew-resize";
	return false;
}

function onDrag(e){
	if (selected){
		x_pos = e.touches ? e.touches[0].pageX : e.pageX;
		selected.style.left = (x_pos - x_elem - 20) + 'px';
	}
}

function onUp(e){
	document.body.style.cursor = "default";
	if (selected && parseInt(selected.style.left, 10)>0){
		selected.style.left = 0 + 'px';
	}
	selected = null;
}

tape.onmousedown = onDown;
document.onmousemove = onDrag;
document.onmouseup = onUp;
tape.addEventListener("touchstart", onDown);
tape.addEventListener("touchmove", onDrag);
tape.addEventListener("touchend", onUp);