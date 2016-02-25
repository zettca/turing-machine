/* ========== Load Selects ========== */

var programList, programListSaved;

var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function(){
    if (xhr.readyState === 4 && xhr.status === 200){
        programList = JSON.parse(xhr.responseText);
        fillTMList();
    }
};

xhr.open('GET', "res/machines.json");
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
        console.log("Error JSON-parsing " + Cookies.get("tms"));
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


/* ========== Main stuff | Input functions ========== */

var tape = document.getElementById("tape");
var code = document.getElementById("code");
var label = document.getElementById("tmInfos");
var text = document.getElementsByName("tapeText")[0];
var progName = document.getElementsByName("programName")[0];

var tm = new turingMachine(tape);
tm.setTape("HELLO WORLD");

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

function run(){
    while (tm.canRun){
        stepe();
    }
}

function runDelay(){
    stepe();
    if (tm.canRun) setTimeout(runDelay, 300);
}

function stepe(){
    tape.children[tm.headPos-1].classList.remove("head");
    tm.execTransition();
    label.innerHTML = tm.msg;
    tape.children[tm.headPos-1].classList.add("head");
}

function reset(){
    tm.restart();
    tm.setTape(text.value);
    compile();
    tape.children[tm.headPos-1].classList.add("head");
    tape.style.left = 0 + "px";
    label.innerHTML = tm.msg;
}

function compile(){
    tm.clearTransitions();
    var err = "";
    var lines = code.value.split("\n");
    
    for (var i=0; i<lines.length; i++){ // check for errors
        var args = lines[i].split(",");
        if (!lines[i]){
            continue;   // empty line
        } else if (lines[i][0] == ";"){
            continue;   // comment
        } else if (args.length != 5){
            err = "incorrect argument number.";
            break;
        } else if (!isState(args[0]) || !isState(args[2])){
            err = "states must be ints or single characters.";
            break;
        } else if (!isSymb(args[1]) || !isSymb(args[3])){
            err = "symbols must be single characters.";
            break;
        } else if (!args[4] || "LRN<|>".indexOf(args[4]) == -1){
            err = "transition must be either LRN or <>|.";
            break;
        } else{ // no errors in line, wee
            tm.pushTransition(args[0], args[1], args[2], args[3], args[4]);
        }
    }
    
    if (!err){
        log("Program compiled successfully.");
        tm.tapeEle.children[tm.headPos-1].classList.add("head");
        return true;
    } else{
        log("Error compiling program...");
        log("Line " + (i+1) + ": " + err);
        tm.clearTransitions();
        return false;
    }
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
        
        Cookies.set('tms', JSON.stringify(tms), { expires: 90 });
        fillTMCookieList();
    }
}


/* ========== EventListeners ========== */

text.onkeypress = function(e){
  if (e.keyCode == 13){ // Enter
    tm.setTape(text.value);
    this.blur();
  }
};

document.onkeypress = function(e){
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

/* ========== Aux functions ========== */

function log(msg){
    console.log(msg);
    label.innerHTML = msg;
}

function isSymb(str){
    return (str && str.length == 1);
}

function isState(exp){
    if (!exp) return false;
    if (!isNaN(exp) && (exp % 1 == 0)){
        return true; // is Integer
    } else if("IAR".indexOf(exp) != -1){ // is initial/accept/reject state
        return true;
    } else if(exp){ // meh, take anything
        return true;
    } else{
        return false;
    }
}

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
    while (select.length>1)
        select.remove(1);
}