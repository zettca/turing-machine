var turingMachine = function(el){
    this.tapeEle = el;
    this.tapeCellNum = 200;
    this.tapeWord = "";
    this.tapePos = 1;
    this.nullChar = " ";
    this.state = "I";
    this.iter = 1;
    this.trans = {};
    this.msg = "";
    
    this.restart = function(){
        this.tapeCellNum = 200;
        this.tapeWord = "";
        this.tapePos = 1;
        this.nullChar = " ";
        this.state = "I";
        this.iter = 1;
        this.clearTransitions();
        this.msg = "";
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
        function replaceAt(str, i, c){
            return str.substr(0, i) + c + str.substr(i+c.length);
        }
        if (i && symbol.length == 1){
            this.tapeWord = replaceAt(this.tapeWord, i-1, symbol);
            this.tapeEle.children[i-1].innerHTML = symbol;
        }
    };
    
    this.setTape = function(str){
        this.msg = "Loading to Tape: " + str;
        this.clearTape();
        this.tapeWord = str;

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
            this.msg = "No possible transitions. Stopping permanently.";
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
            this.msg = "No transition found. Stopping permanently.";
            return false;
        }
        
        this.iter++;
        this.tapeEle.children[this.tapePos-1].classList.remove("head");
        //this.msg = "Transition matched. Actually doing stuff...";
        this.setSymbol(stateTrans[j].w, this.tapePos);
        this.state = stateTrans[j].ns;
        switch (this.state){
            case 'A':
                this.msg = "Program finished with Accept";
                return false;
            case 'R':
                this.msg = "Program finished with Reject";
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
        this.msg = "@ Iteration " + this.iter + ", State " + this.state + ", Position " + this.tapePos;
        return true;
    };
    
    this.compute = function(limit){
        if (limit && this.execTransition()){
            setTimeout(this.compute(limit--), 1000);
        }
    };
};