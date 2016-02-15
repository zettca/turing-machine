var turingMachine = function(el){
    this.tapeEle = el;
    this.tapeStr = "";
    this.tapeLen = 69;
    this.tapePos = 1;
    this.state = 1;
    this.trans = {};
    
    this.reset = function(){
        this.tapeStr = "";
        this.tapeLen = 69;
        this.tapePos = 1;
        this.state = 1;
        this.trans = {};
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
    
    this.setTape = function(str){
        this.clearTape();
        this.tapeStr = str;
    
        for (var i=0;i<this.tapeLen;i++){
            var cell = document.createElement("div");
            cell.innerHTML = str[i] || " ";
            cell.className = "cell";
            cell.setAttribute("index", (str[i]) ? i+1 : "");
            this.tapeEle.appendChild(cell);
        }
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
        var todos = this.trans[this.state];
        
        if (!todos){
            console.log("idk what to do!");
            return;
        }
        
        console.log("running on state="+this.state + " | tapePos="+this.tapePos);
        
        
        for (var i=0; i<todos.length;i++){
            if (todos[i].r == this.readSymbol()){
                console.log("matched. actually doing stuff");
                this.writeTape(todos[i].w, this.tapePos);
                this.tapePos = (todos[i].d == ">") ? this.tapePos+1 : (this.tapePos-1 || 1);
                this.state = todos[i].ns;
                break;
            }
        }
        

    };
    
    this.exec = function(limit){
        limit = limit || 100;
        for (var i=0;i<limit;i++){
            this.execTransition();
        }
    };
    
};

var cnsl = document.getElementById("console");
var code = document.getElementById("code");
var text = document.getElementsByName("tapeText")[0];

var tm = new turingMachine(document.getElementById("tape"));
tm.setTape("AAAAAAAAAAAAAAAAAAAA");

function load(){
    tm.setTape(text.value);
}

function clear(){
    tm.clearTape();
}

function stepe(){
    tm.execTransition();
}

function compile(){
    tm.clearTransitions();
    cnsl.value = "";
    var err = "";
    var lines = code.value.split("\n");
    for (var i=0; i<lines.length; i++){
        var args = lines[i].split(",");
        if (args.length != 5){
            err = "incorrect argument number.";
            break;
        } else if (!isState(args[0]) || !isState(args[2])){
            err = "states must be integers.";
            break;
        } else if (!args[4] || "<>".indexOf(args[4]) == -1){
            err = "transition must be either > or <.";
            break;
        } else{ // no errors in line, wee
            tm.pushTransition(args[0], args[1], args[2], args[3], args[4]);
        }
        
    }
    if (!err){
        log("Program successfully compiled.");
        console.log(JSON.stringify(tm.trans));
        return true;
    } else{
        log("Error compiling program...");
        log("Line " + (i+1) + ": " + err);
        tm.clearTransitions();
        return false;
    }
}





// ============================ */

function isState(exp){
    if (!exp) return false;
    if (!isNaN(exp) && (exp % 1 == 0)){
        return true; // is Integer
    } else if(exp.length == 1 && "TFSH".indexOf(exp) != -1){
        return true; // is T/F/S/H
    } else{
        return false;
    }
}

function log(msg){
    console.log(msg);
    cnsl.value += msg + '\n';
}