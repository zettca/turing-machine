var programList = 
{
    flipHA: ["HAHAHAHAHAAAA", "I,H,I,A,R\nI,A,I,H,R"],
    altBinary: ["101010001", "I,0,0,0,R\nI,1,1,1,R\n; last was 0\n0,0,R,0,R\n0,1,1,1,R\n; last was 1\n1,0,0,0,R\n1,1,R,1,R"],
    seq000111: ["0000011111", "I,1,R,1,R\nI,0,0,0,R\n0,0,0,0,R\n0,1,1,1,R\n1,0,R,0,R\n1,1,1,1,R"]
};

var turingMachine = function(el){
    this.tapeEle = el;
    this.tapeWord = "";
    this.tapeCellNum = 200;
    this.tapePos = 1;
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
    
    this.readSymbol = function(){
        return this.tapeWord[this.tapePos-1];
    };
    
    this.writeTape = function(symb, i){
        if (i && symb.length == 1){
            this.tapeWord[i] = symb;
            this.tapeEle.children[i-1].innerHTML = symb;
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
        
        log(this.iter + ": State " + this.state + " | Position " + this.tapePos);
        
        var j = -1;
        
        for (var i=0; i<stateTrans.length; i++){
            if (stateTrans[i].r == this.readSymbol()){
                j = i;
                break;
            }
        }
        
        if (j!=-1){
            this.iter++;
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
    loadTape();
  }
};

var tm = new turingMachine(tape);
tm.setTape("HELLO WORLD");

function loadTape(){
    tm.setTape(text.value, startPos.value);
}

function loadProgram(val){
    if (!programList[val]){
        alert("Program not found. wat " + val);
        return;
    }
    
    text.value = programList[val][0];
    code.value = programList[val][1];
    tm.setTape(text.value, startPos.value);
    compile();
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
    loadTape();
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
            err = "states must be integers or special states IAR.";
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


/* ==================== */

function isSymb(str){
    return (str && str.length == 1);
}

function isState(exp){
    if (!exp) return false;
    if (!isNaN(exp) && (exp % 1 == 0)){
        return true; // is Integer
    } else if(exp.length == 1 && "IAR".indexOf(exp) != -1){
        return true; // is accept/reject state
    } else{
        return false;
    }
}

function log(msg){
    console.log(msg);
}


/* ==================== */

var selected = null;
var x_pos = 0, x_elem = 0;

tape.onmousedown = function(e){
    selected = this;
    x_pos = document.all ? window.event.clientX : e.pageX;
    x_elem = x_pos - selected.offsetLeft;
    document.body.style.cursor = "ew-resize";
    return false;
};

document.onmousemove = function(e){
    if (selected){
        x_pos = document.all ? window.event.clientX : e.pageX;
        selected.style.left = (x_pos - x_elem - 20) + 'px';
    }
};

document.onmouseup = function(e){
    document.body.style.cursor = "default";
    if (selected && parseInt(selected.style.left, 10)>0){
        selected.style.left = 0 + 'px';
    }
    selected = null;
};
