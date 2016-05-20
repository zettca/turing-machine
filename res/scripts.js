var tape = document.getElementById("tape");
var code = document.getElementById("code");
var label = document.getElementById("tmState");
var text = document.getElementsByName("tapeText")[0];
var progName = document.getElementsByName("programName")[0];

var programList, programListSaved;
var arInterval, arSpeed = 200, isAutoRun = false;

var tm = new TuringMachine();
var tmc = new TMCompiler(tm, code);

loadTape("101010");

function loadProgram(val){
	var programs = programList.concat(programListSaved);
	for (var i=0; i<programs.length; i++){
		if (programs[i].id == val){
			text.value = programs[i].tape;
			code.value = decodeURIComponent(programs[i].code);
			reset();
			break;
		}
	}
}

function loadTape(str){
	while (tape.firstChild) tape.removeChild(tape.firstChild);
	tm.setWord(str || text.value);

    for (var i=1; i<=tm.tapeCellNum; i++){
      var cell = document.createElement("div");
      var worde = (tm.readSymbol(i) && tm.readSymbol(i) != tm.emptyChar);
      cell.innerHTML = worde ? tm.readSymbol(i) : " ";
      cell.classList.add("cell");
      cell.setAttribute("index", worde ? i : "");
      tape.appendChild(cell);
    }
}

function run(){
	while (tm.canRun) stepe();
}

function compile(){
	if (tmc.compile()){
		fillTable();
		drawGraph();
	}
}

function scrollSpeed(e){
	var scroll = (e.deltaY>0) ? 10 : -10;
	if (arSpeed >= 20 || scroll>0) arSpeed += scroll;
	clearInterval(arInterval);
	arInterval = setInterval(stepe, arSpeed);
}

function runDelay(el){
	el.addEventListener("wheel", scrollSpeed);
	if (!tm.canRun) return;
	if (!isAutoRun){
		arInterval = setInterval(stepe, arSpeed);
	} else{
		clearInterval(arInterval);
	}
	isAutoRun = !isAutoRun;
}

function stepe(){
	if (!tm.canRun && isAutoRun){
		isAutoRun = false;
		clearInterval(arInterval);
	}
	tape.children[(tm.headPos-1>0) ? tm.headPos-1 : 0].classList.remove("head");
	tm.stepTransition();
	loadTape(tm.tapeWord);
	tape.children[(tm.headPos-1>0) ? tm.headPos-1 : 0].classList.add("head");

	label.innerHTML = tm.msg;
}

function reset(){
	arSpeed = 200;
	isAutoRun = false;
	clearInterval(arInterval);
	tm.restart();
	loadTape();
	compile();
	tape.children[tm.headPos-1].classList.add("head");
	tape.style.left = 0 + "px";
	label.innerHTML = tm.msg;
}

function fillTable(){
	var table = document.getElementById("tableTrans");
	var trans = tm.trans;
	var isDec = true;
	while(table.rows.length > 0) table.deleteRow(0);
	
	var reads = [tm.emptyChar];
	for (var c of tm.tapeWord) if (reads.indexOf(c) == -1) reads.push(c);
	for (var st in trans){
		for (var c in trans[st]){
			if (reads.indexOf(c) == -1){
				reads.push(c);
			}
		}
	}
	
	if (trans<2) return;
	
	/* States Header */
	var tr = table.insertRow(0);
	var td = tr.insertCell();
	td.rowSpan = 2;
	td.innerHTML = "Symbol";
	td = tr.insertCell();
	td.colSpan = Object.keys(trans).length;
	td.innerHTML = "States";
	
	tr = table.insertRow();
	for (var t in trans){
		td = tr.insertCell();
		td.innerHTML = t;
	}

	for (var r of reads){
		tr = table.insertRow();
		td = tr.insertCell();
		td.innerHTML = (r==" ") ? "&#9633;" : r;
		
		for (var st in trans){
			var t = trans[st][r];
			td = tr.insertCell();
			if (t){
				var w = (t.w == " ") ? "&#9633;" : t.w;
				w = (w == r) ? "" : w;
				td.innerHTML = w+" <b>"+t.s+"</b> "+t.d;
				if (t.s == tm.stateAccept){
					td.classList.add("bg-green");
					td.title = "Transition to Accept state";
				} else if (t.s == tm.stateReject){
					td.classList.add("bg-red");
					td.title = "Transition to Reject state";
				}
			} else{
				td.innerHTML = "&#10008;";
				td.title = "Transition not defined";
				isDec = false;
				td.classList.add("bg-yellow");
			}
		}
	}

	var infos = document.getElementById("tmInfo");
	var dec = (isDec) ? "" : "not";
	infos.innerHTML = "Machine is <b>"+dec+"</b> decidible";
}

function drawGraph(){
	var render = function(r, n) {
		var set = r.set().push(
		r.rect(n.point[0] - 30, n.point[1] - 10, 60, 38).attr({"fill": "#ccc", r : "20px" })).push(
		r.text(n.point[0], n.point[1] + 10, n.label || n.id).attr({"font-size":"16px"}));
		return set;
	};
	
	var canvas = document.getElementById("canvas");
	var trans = tm.trans;
	
	canvas.innerHTML = "";
	
	var g = new Graph();
	
	for (var state in trans) g.addNode(state, {render: render});
	for (var state in trans){
		for (var read in trans[state]){
			var t = trans[state][read];
			if (state != t.s){
				var lbl = ((read == " ") ? "□" : read)+","+t.w+","+t.d;
				g.addEdge(state, t.s, {directed: true, stroke: "#999", label: lbl});
			}
		}
	}
	var layouter = new Graph.Layout.Spring(g);
	var renderer = new Graph.Renderer.Raphael('canvas', g, 500, 400);
	
	layouter.layout();
	renderer.draw();
}

function saveToLocal(){
	if (!progName.value){
		alert("Please give the program a name!");
		return;
	} else if (!code.value || !text.value){
		alert("Code or Tape are blank!");
		return;
	}
	
	var tms = JSON.parse(window.localStorage.getItem("tms")) || [];
	
	var tm = {};
	tm.id = encodeURIComponent(progName.value);
	tm.name = progName.value;
	tm.desc = "Program saved by user...";
	tm.tape = text.value;
	tm.code = encodeURIComponent(code.value);
	tms.push(tm);

	window.localStorage.setItem("tms", JSON.stringify(tms));
	
	fillTMLocalList();
}

/* ========== Load Selects ========== */

var req = new XMLHttpRequest();
req.onreadystatechange = function(){
	if (req.readyState === 4 && req.status === 200){
		var res = JSON.parse(req.responseText);
		programList = res.machines;
		fillTMList();
	}
};
req.open("GET", "res/machines.json");
req.overrideMimeType("application/json");
req.send();

function fillTMList(){
	var tmList = document.getElementById("tmList");
	fillSelect(tmList, programList);
}

function fillTMLocalList(){
	var tmLocalList = document.getElementById("tmListSaved");
	programListSaved = JSON.parse(window.localStorage.getItem("tms")) || [];
	fillSelect(tmLocalList, programListSaved);
}

fillTMLocalList();

function fillSelect(select, list){
	while (select.length>1) select.remove(1); // clear al but first
	for (var i=0; i<list.length; i++){
		var opt = document.createElement("option");
		opt.value = list[i].id;
		opt.innerHTML = list[i].name;
		select.appendChild(opt);
	}
}
