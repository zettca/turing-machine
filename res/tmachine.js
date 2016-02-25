var turingMachine = function(el){
    this.tapeEle = el;
    this.nullChar = " ";
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
        this.iter = 1;
        this.msg = "";
    };
    
    this.restart();
    
    this.setState = function(st){
        this.state = st;
        if (this.state == this.stateAbort || 
            this.state == this.stateAccept ||
            this.state == this.stateReject){
            this.canRun = false;
            this.msg = "Program finished with Abort";
        }
    };
    
    this.addHeadPos = function(i){
        this.headPos = this.headPos+i;
        if (this.headPos < 1 || this.headPos > this.tapeCellNum){
            this.canRun = false;
            this.setState(this.stateAbort);
        }
    };
    
    this.clearTape = function(){
        this.tapeWord = "";
        while (this.tapeEle.firstChild){
            this.tapeEle.removeChild(this.tapeEle.firstChild);
        }
    };
    
    this.getSymbol = function(){
        return this.tapeWord[this.headPos-1] || this.nullChar;
    };
    
    this.setSymbol = function(symbol, i){
        function replaceAt(str, i, c){
            return str.substr(0, i) + c + str.substr(i+c.length);
        }
        this.tapeWord = replaceAt(this.tapeWord, i-1, symbol);
        this.tapeEle.children[i-1].innerHTML = symbol;
    };
    
    this.setTape = function(str){
        this.msg = "Loading to Tape: " + str;
        this.clearTape();
        this.tapeWord = str;

        for (var i=0; i<this.tapeCellNum; i++){
            var cell = document.createElement("div");
            cell.classList.add("cell");
            cell.innerHTML = this.tapeWord[i] ? this.tapeWord[i] : this.nullChar;
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
    
    this.execTransition = function(){
        if (this.iter >= 1000) this.canRun = false;
        if (!this.canRun) return;
        var tranState = this.trans[this.state][this.getSymbol()];
        
        if (!tranState){
            this.setState(this.stateAbort);
            this.msg = "No possible transitions. Aborting.";
            return;
        }
        
        this.iter++;
        this.setSymbol(tranState.w, this.headPos);
        this.setState(tranState.s);
        
        switch (tranState.d){
            case 'L':
            case '<':
                this.addHeadPos(-1);
                break;
            case 'R':
            case '>':
                this.addHeadPos(1);
                break;
            case 'N':
            case 'S':
            case '-':
                break;
        }
        
        switch (this.state){
            case 'A':
                this.setState(this.stateAccept);
                this.msg = "Program finished with Accept";
                return;
            case 'R':
                this.setState(this.stateReject);
                this.msg = "Program finished with Reject";
                return;
        }

        this.msg = "@ Iteration " + this.iter + ", State " + this.state + ", Position " + this.headPos;
    };
    
};