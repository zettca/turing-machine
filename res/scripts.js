String.prototype.replaceAt = function(i, c){
    return this.substr(0, i) + c + this.substr(i+c.length);
};

/* ========== Turing Machine class ========== */

var turingMachine = function(el){
    this.tapeEle = el;
    this.tapeWord = "";
    this.tapeCellNum = 200;
    this.tapePos = 1;
    this.nullChar = " ";
    this.state = "I";
    this.iter = 1;
    this.trans = {};
    
    this.restart = function(){
        this.tapeWord = "";
        this.tapeCellNum = 200;
        this.tapePos = 1;
        this.state = "I";
        this.iter = 1;
        this.clearTransitions();
    };
    
    this.clearTape = function(){
        this.tapeWord = "";
        while (this.tapeEle.firstChild){
            this.tapeEle.removeChild(this.tapeEle.firstChild);
        }
    };
    
    this.getSymbol = function(){
        return this.tapeWord[this.tapePos-1] || this.nullChar;
    };
    
    this.setSymbol = function(symbol, i){
        if (i && symbol.length == 1){
            this.tapeWord = this.tapeWord.replaceAt(i-1, symbol);
            this.tapeEle.children[i-1].innerHTML = symbol;
        }
    };
    
    this.setTape = function(str, k){
        log("Loading to Tape: " + str);
        this.clearTape();
        this.tapeWord = " ".repeat(k-1 || 0) + str;

        for (var i=0; i<this.tapeCellNum; i++){
            var cell = document.createElement("div");
            cell.classList.add("cell");
            cell.innerHTML = this.tapeWord[i] ? this.tapeWord[i] : " ";
            cell.setAttribute("index", (this.tapeWord[i]) ? i+1 : "");
            this.tapeEle.appendChild(cell);
        }
        
        this.tapeEle.children[this.tapePos-1].classList.add("head");
    };
    
    this.clearTransitions = function(){
        this.trans = {};
    };
    
    this.pushTransition = function(cs, csR, ns, csW, dir){
        if (!this.trans[cs]){
            this.trans[cs] = [];
        }
        this.trans[cs].push({r: csR, ns: ns, w: csW, d: dir});
    };
    
    this.execTransition = function(){
        var stateTrans = this.trans[this.state];
        
        if (!stateTrans){
            log("No possible transitions. Stopping permanently.");
            return false;
        }
        
        
        var j = -1;
        
        for (var i=0; i<stateTrans.length; i++){
            if (stateTrans[i].r == this.getSymbol()){
                j = i;
                break;
            }
        }
        
        if (j==-1){
            log("No transition found. Stopping permanently.");
            return false;
        }
        
        this.iter++;
        this.tapeEle.children[this.tapePos-1].classList.remove("head");
        //log("Transition matched. Actually doing stuff...");
        this.setSymbol(stateTrans[j].w, this.tapePos);
        this.state = stateTrans[j].ns;
        switch (this.state){
            case 'A':
                log("Program finished with Accept");
                return false;
            case 'R':
                log("Program finished with Reject");
                return false;
        }
        switch (stateTrans[j].d){
            case 'L':
            case '<':
                this.tapePos = this.tapePos-1 || 1;
                break;
            case 'R':
            case '>':
                this.tapePos++;
                break;
            case 'N':
                break;
        }
        this.tapeEle.children[this.tapePos-1].classList.add("head");
        log("@ Iteration " + this.iter + ", State " + this.state + ", Position " + this.tapePos);
        return true;
    };
    
    this.compute = function(limit){
        if (limit && this.execTransition()){
            setTimeout(this.compute(limit--), 1000);
        }
    };
};

/* ========== Load Select from machines.json ========== */

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
    var tms;
    programListSaved = [];
    try{
        tms = JSON.parse(Cookies.get("tms") || "[]");
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
var startPos = document.getElementsByName("tapeStart")[0];

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

function load(){
    tm.setTape(text.value, startPos.value);
}

function run(){
    tm.compute(100);
}

function stepe(){
    tm.execTransition();
    //label.innerHTML = "Iteration "+tm.iter+" State "+tm.state+" Position "+tm.tapePos;
}

function reset(){
    tm.restart();
    load();
    compile();
    tape.style.left = 0 + "px";
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
        tm.tapeEle.children[tm.tapePos-1].classList.add("head");
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
            tms = JSON.parse(Cookies.get("tms")) || [];
        } catch (e){
            console.log("sighfuck");
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
    load();
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