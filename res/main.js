/* ========== Main stuff | Input functions ========== */

var tape = document.getElementById("tape");
var code = document.getElementById("code");
var label = document.getElementById("tmState");
var text = document.getElementsByName("tapeText")[0];
var progName = document.getElementsByName("programName")[0];

var tm = new TuringMachine(tape);
var tmc = new TMCompiler(tm, code);

tm.setTape("101010");

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

function loadTape(){
	tm.setTape(text.value);
}

function run(){
	while (tm.canRun){
		stepe();
	}
}

function compile(){
	tmc.compile();
}

function runDelay(){
	stepe();
	if (tm.canRun) setTimeout(runDelay, 300);
}

function stepe(){
	tape.children[tm.headPos-1].classList.remove("head");
	tm.stepTransition();
	label.innerHTML = tm.msg;
	tape.children[tm.headPos-1].classList.add("head");
}

function reset(){
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
	
	var reads = [];
	for (var c of tm.tapeWord) if (reads.indexOf(c) == -1) reads.push(c);
	reads.push(tm.emptyChar);
	
	if (trans<2) return;
	
	/* States Header */
	var tr = table.insertRow(0);
	var td = tr.insertCell();
	td.rowSpan = 2;
	td.innerHTML = "Symbol";
	td = tr.insertCell();
	td.colSpan = reads;
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
				td.innerHTML = w+" <b>"+t.s+"</b> "+t.d;
				if (t.s == tm.stateAccept){
					td.classList.add("bg-green");
				} else if (t.s == tm.stateReject){
					td.classList.add("bg-red");
				}
			} else{
				td.innerHTML = "&#10008;";
				isDec = false;
				td.classList.add("#FFC");
			}
		}
	}

	var infos = document.getElementById("tmInfo");
	var wat = (isDec) ? "" : "not";
	infos.innerHTML = "Machine is <b>"+wat+"</b> decidible";
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

function saveToCookies(){
	if (!compile()){
		return;
	} else if (!progName.value){
		alert("Please give the program a name :)");
		return;
	} else if (!code.value && !text.value){
		alert("Code and Tape are blank!");
		return;
	} else{
		var tms;
		try{
			tms = JSON.parse(Cookies.get("tms"));
		} catch (e){
			tms = [];
		}
		var tm = {};
		tm.id = progName.value;
		tm.name = progName.value;
		tm.desc = "";
		tm.tape = text.value;
		tm.code = encodeURIComponent(code.value);
		tms.push(tm);
		
		var d = new Date();
		var days = 90;
		d.setTime(d.getTime() + (days*24*60*60*1000));
		
		progName.value = "";
		Cookies.set('tms', JSON.stringify(tms), { expires: 90 });
		fillTMCookieList();
	}
}