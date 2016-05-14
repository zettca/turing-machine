/* ========== Load Selects ========== */

var programList, programListSaved;

var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function(){
	if (xhr.readyState === 4 && xhr.status === 200){
		var res = JSON.parse(xhr.responseText);
		programList = res.machines;
		fillTMList();
	}
};

xhr.open("GET", "res/machines.json");
xhr.send();

function fillTMList(){
	var tmList = document.getElementById("tmList");
	clearSelect(tmList);
	for (var i=0; i<programList.length; i++){
		var opt = document.createElement("option");
		opt.value = programList[i].id;
		opt.innerHTML = programList[i].name;
		tmList.appendChild(opt);
	}
}

function fillTMCookieList(){
	var tmCookieeList = document.getElementById("tmListSaved");
	clearSelect(tmCookieeList);
	programListSaved = [];
	var tms;
	try{
		tms = JSON.parse(Cookies.get("tms"));
	} catch (e){
		console.log("Error JSON-parsing cookie " + Cookies.get("tms"));
		return;
	}
	for (var i=0; i<tms.length; i++){
		programListSaved.push(tms[i]);
		
		var opt = document.createElement("option");
		opt.value = tms[i].id;
		opt.innerHTML = tms[i].name;
		tmCookieeList.appendChild(opt);
	}
}

fillTMCookieList();


/* ========== Aux functions ========== */

function hasParams(url){
	if (!url) url = window.location.href;
	var loc = window.location;
	return url[url.indexOf(loc.pathname)+loc.pathname.length] == "?";
}

function getParam(name, url){
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function clearSelect(select){ // clear all but first
	while (select.length>1) select.remove(1);
}
