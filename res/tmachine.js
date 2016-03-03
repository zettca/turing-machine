var TuringMachine = function(el){
    this.tapeEle = el;
    this.emptyChar = " ";
    this.stateInit = "I";
    this.stateAbort = "X";
    this.stateAccept = "A";
    this.stateReject = "R";

    this.restart = function(){
        this.canRun = true;
        this.tapeCellNum = 100;
        this.tapeWord = "";
        this.headPos = 1;
        this.state = this.stateInit;
        this.trans = {};
        this.iters = 1;
        this.msg = "";
    };
    
    this.restart();
    
    this.setMsg = function(msg){
        this.msg = msg;
        console.log(msg);
    };
    
    this.iter = function(){
        this.iters++;
        if (this.iters > 1000){
            this.canRun = false;
        }
    };
    
    this.setState = function(st){
        this.state = st;
        switch (this.state){
            case this.stateAbort:
                this.canRun = false;
                this.setMsg("Machine Aborted!");
                break;
            case this.stateAccept:
                this.canRun = false;
                this.setMsg("Machine finished with Accept state.");
                break;
            case this.stateReject:
                this.canRun = false;
                this.setMsg("Machine finished with Reject state.");
                break;
            default:
                this.setMsg("@ Iteration " + this.iters + ", State " + this.state + ", Position " + this.headPos);
                break;
        }
    };
    
    this.incHeadPos = function(i){
        this.headPos = this.headPos+i;
    };
    
    this.moveHead = function(dir){
        switch (dir){
            case 'L':
            case '<':
                this.incHeadPos(-1);
                break;
            case 'R':
            case '>':
                this.incHeadPos(1);
                break;
            case 'N':
            case 'S':
            case '-':
            default:
                this.incHeadPos(0);
                break;
        }
    };
    
    this.clearTape = function(){
        this.tapeWord = "";
        while (this.tapeEle.firstChild){
            this.tapeEle.removeChild(this.tapeEle.firstChild);
        }
    };
    
    this.readSymbol = function(){
        return this.tapeWord[this.headPos-1] || this.emptyChar;
    };
    
    this.writeSymbol = function(symbol, i){
        function replaceAt(str, i, c){
            return str.substr(0, i) + c + str.substr(i+c.length);
        }
        this.tapeWord = replaceAt(this.tapeWord, i-1, symbol);
        this.tapeEle.children[i-1].innerHTML = symbol;
    };
    
    this.setTape = function(str){
        this.setMsg("Loading to Tape: " + str);
        this.clearTape();
        this.tapeWord = str;

        for (var i=0; i<this.tapeCellNum; i++){
            var cell = document.createElement("div");
            cell.classList.add("cell");
            cell.innerHTML = this.tapeWord[i] ? this.tapeWord[i] : this.emptyChar;
            cell.setAttribute("index", (this.tapeWord[i]) ? i+1 : "");
            this.tapeEle.appendChild(cell);
        }
    };
    
    this.clearTransitions = function(){
        this.trans = {};
    };
    
    this.pushTransition = function(cs, csR, ns, csW, dir){
        if (!this.trans[cs]) this.trans[cs] = {};
        this.trans[cs][csR] = {s: ns, w: csW, d: dir};
    };
    
    
    this.execTransition = function(newState, writeSymb, dir){
        this.iter();
        this.writeSymbol(writeSymb, this.headPos);
        this.moveHead(dir);
        this.setState(newState);
    };
    
    this.stepTransition = function(){
        if (!this.canRun) return;
        var tranState = this.trans[this.state][this.readSymbol()];
        
        if (this.headPos < 1 || this.headPos > this.tapeCellNum){
            this.setState(this.stateAbort);
            this.setMsg("Maching aborted. Head out of bounds!");
            return;
        }
        
        if (!tranState){
            this.setState(this.stateAbort);
            this.setMsg("Maching aborted. No transition state!");
            return;
        }
        
        this.execTransition(tranState.s, tranState.w, tranState.d);
    };
    
};