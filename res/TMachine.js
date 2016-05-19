var TuringMachine = function(){
  // constants
  this.emptyChar = " ";
  this.stateInit = "I";
  this.stateAbort = "X";
  this.stateAccept = "A";
  this.stateReject = "R";
  this.transLeft = "←";
  this.transRight = "→";
  this.transStill = "↓";

  this.restart = function(){
    this.canRun = true;
    this.tapeCellNum = 100;
    this.tapeWord = "";
    this.headPos = 1;
    this.state = this.stateInit;
    this.trans = {};
    this.iters = 0;
    this.msg = "";
  };
  
  this.restart();
  
  this.pushMsg = function(msg){
    this.msg = msg;
    console.log(msg);
  };
  
  this.iter = function(){
    this.iters++;
    this.canRun = !(this.iters > 10000);
  };
  
  this.setState = function(st){
    this.state = st;
    switch (this.state){
      case this.stateAbort:
        this.canRun = false;
        this.pushMsg("Machine Aborted!");
        break;
      case this.stateAccept:
        this.canRun = false;
        this.pushMsg("Machine finished in "+this.iters+" iterations with Accept state.");
        break;
      case this.stateReject:
        this.canRun = false;
        this.pushMsg("Machine finished in "+this.iters+" iterations with Reject state.");
        break;
      default:
        this.pushMsg(this.iters + " Iterations, State " + this.state + ", Position " + this.headPos);
        break;
    }
  };
  
  this.moveHead = function(dir){
    switch (dir){
      case this.transLeft:
        this.headPos--;
        break;
      case this.transRight:
        this.headPos++;
        break;
      case this.transStill:
        break;
    }
  };
  
  this.readSymbol = function(i){
    return this.tapeWord[(i ? i : this.headPos)-1] || this.emptyChar;
  };
  
  this.writeSymbol = function(symbol, i){
    function replaceAt(str, i, c){
      return str.substr(0, i) + c + str.substr(i+c.length);
    }
    this.tapeWord = replaceAt(this.tapeWord, i-1, symbol);
  };
  
  this.setWord = function(str){
    this.tapeWord = str;
  };
  
  this.clearTransitions = function(){
    this.trans = {};
  };
  
  this.pushTransition = function(cs, csR, ns, csW, dir){
    if (!this.trans[cs]) this.trans[cs] = {};
    this.trans[cs][csR] = {s: ns, w: csW, d: dir};
  };
  
  
  this.execTransition = function(newState, symbol, dir){
    this.iter();
    this.writeSymbol(symbol, this.headPos);
    this.moveHead(dir);
    this.setState(newState);
  };
  
  this.stepTransition = function(){
    if (!this.canRun) return;
    var tranState = this.trans[this.state][this.readSymbol()];
    
    if (this.headPos < 1 || this.headPos > this.tapeCellNum){
      this.setState(this.stateAbort);
      this.pushMsg("Machine aborted. Head out of bounds!");
      return;
    } else if (!tranState){
      this.setState(this.stateAbort);
      this.pushMsg("Machine aborted. No transition state!");
      return;
    }
    
    this.execTransition(tranState.s, tranState.w, tranState.d);
  };
  
};
