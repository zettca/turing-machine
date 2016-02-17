var turingMachine = function(el){
    this.tapeEle = el;
    this.tapeStr = "";
    this.tapeLen = 200;
    this.tapePos = 1;
    this.state = 1;
    this.iters = 0;
    this.trans = {};
    
    this.restart = function(){
        this.tapeStr = "";
        this.tapeLen = 200;
        this.tapePos = 1;
        this.state = 1;
        this.iters = 0;
        this.clearTransitions();
    };
    
    this.clearTape = function(){
        this.tapeStr = "";
        while (this.tapeEle.firstChild){
            this.tapeEle.removeChild(this.tapeEle.firstChild);
        }
    };
    
    this.readSymbol = function(){
        return this.tapeStr[this.tapePos-1];
    };
    
    this.writeTape = function(symb, i){
        if (i && symb.length == 1){
            this.tapeStr[i] = symb;
            this.tapeEle.children[i-1].innerHTML = symb;
        }
    };
    
    this.setTape = function(str, k){
        log("Loading to Tape: " + str);
        this.clearTape();
        this.tapeStr = " ".repeat(k-1 || 0) + str;

        for (var i=0; i<this.tapeLen; i++){
            var cell = document.createElement("div");
            cell.classList.add("cell");
            if (this.tapeStr[i]){
                cell.innerHTML = this.tapeStr[i];
            } else{
                cell.innerHTML = " ";
                cell.classList.add("no-select");
            }
            cell.setAttribute("index", (this.tapeStr[i]) ? i+1 : "");
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
        
        log(this.iters + ": State " + this.state + " | Position " + this.tapePos);
        
        
        var j = -1;
        
        for (var i=0; i<stateTrans.length; i++){
            if (stateTrans[i].r == this.readSymbol()){
                j = i;
                break;
            }
        }
        
        if (j!=-1){
            this.iters++;
            this.tapeEle.children[this.tapePos-1].classList.remove("head");
            //log("Transition matched. Actually doing stuff...");
            this.writeTape(stateTrans[j].w, this.tapePos);
            this.state = stateTrans[j].ns;
            switch (this.state){
                case 'T':
                case 'A':
                    log("Program finished due to Accept State");
                    return false;
                case 'F':
                case 'R':
                    log("Program finished due to Reject State");
                    return false;
                case 'H':
                case 'S':
                    log("Program finished due to Stop/Halt State");
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
            return true;
        } else{
            log("No transition found. Stopping permanently.");
            return false;
        }
    };
    
    this.exec = function(limit){
        if (limit && this.execTransition()){
            setTimeout(this.exec(limit--), 1000);
        }
    };
    
};

/* ==================== */

var tape = document.getElementById("tape");
var code = document.getElementById("code");
var text = document.getElementsByName("tapeText")[0];
var startPos = document.getElementsByName("tapeStart")[0];


text.onkeypress = function(e){
  if (e.keyCode == 13){ // Enter
    load();
  }
};

var tm = new turingMachine(tape);
tm.setTape("HELLO WORLD");

function load(){
    tm.setTape(text.value, startPos.value);
}

function clear(){
    tm.clearTape();
}

function run(){
    tm.exec(100);
}

function stepe(){
    tm.execTransition();
}

function reset(){
    tm.restart();
    tape.style.left = 0 + "px";
}

function compile(){
    tm.clearTransitions();
    var err = "";
    var lines = code.value.split("\n");
    
    for (var i=0; i<lines.length; i++){ // check for errors
        var args = lines[i].split(",");
        if (!lines[i]){
            err = "line is empty.";
            break;
        } else if (lines[i][0] == ";"){
            continue;
        } else if (args.length != 5){
            err = "incorrect argument number.";
            break;
        } else if (!isState(args[0]) || !isState(args[2])){
            err = "states must be integers or T|F|S.";
            break;
        } else if (!isSymb(args[1]) || !isSymb(args[3])){
            err = "symbols must be single characters.";
            break;
        } else if (!args[4] || "LRN<|>".indexOf(args[4]) == -1){
            err = "transition must be either L|R|N or < | >.";
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


/* ==================== */

function isSymb(str){
    return (str && str.length == 1);
}

function isState(exp){
    if (!exp) return false;
    if (!isNaN(exp) && (exp % 1 == 0)){
        return true; // is Integer
    } else if(exp.length == 1 && "TFS".indexOf(exp) != -1){
        return true; // is T/F/S/H
    } else{
        return false;
    }
}

function log(msg){
    console.log(msg);
}


/* ==================== */

var el = tape;
var selected = null;
var x_pos = 0, x_elem = 0;

el.onmousedown = function(){
    selected = this;
    x_elem = x_pos - selected.offsetLeft;
    return false;
};

document.onmousemove = function(e){
    x_pos = document.all ? window.event.clientX : e.pageX;
    if (selected){
        selected.style.left = (x_pos - x_elem) + 'px';
    }
};

document.onmouseup = function(){
    if (selected && parseInt(selected.style.left, 10)>0){
        selected.style.left = 0 + 'px';
    }
    selected = null;
};