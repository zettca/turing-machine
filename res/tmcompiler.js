var TMCompiler = function(tm, code){
	this.compiled = false; 
	
	function transDir(str){
		if ("L<-".indexOf(str) != -1){
			return tm.transLeft;
		} else if ("R+>".indexOf(str) != -1){
			return tm.transRight;
		} else if ("SN".indexOf(str) != -1){
			return tm.transStill;
		} else{
			return undefined;
		}
	}
	
	this.compile = function(){
		this.compiled = false;
		tm.clearTransitions();
		var err = "";
		var lines = code.value.split("\n");
		
		for (var i=0; i<lines.length; i++){ // check for errors
			var args = lines[i].split(",");
			if (!lines[i]){
				continue;   // empty line
			} else if (lines[i][0] == ";"){
				continue;   // comment
			} else if (args.length < 3 || args.length > 5){
				err = "incorrect argument number.";
				break;
			} else if (!isState(args[0])){
				err = "states must be ints or single characters.";
			} else if (!isSymb(args[1])){
				err = "symbols must be single characters.";
			} else if (args.length == 3){	// S,R,D
				if (!isTrans(args[2])){
					err = "transition must be either LRNS or <> +-.";
				}
				tm.pushTransition(args[0], args[1], args[0], args[1], transDir(args[2]));
			} else if (args.length == 4){	// S,R,S2,D
				if (!isState(args[2])){
					err = "states must be ints or single characters.";
				} else if (!isTrans(args[3])){
					err = "transition must be either LRNS or <> +-.";
				}
				tm.pushTransition(args[0], args[1], args[2], args[1], transDir(args[3]));
			} else if (args.length == 5){ // S,R,S2,W,D
				if (!isState(args[2])){
					err = "states must be ints or single characters.";
				} else if (!isSymb(args[3])){
					err = "symbols must be single characters.";
				} else if (!isTrans(args[4])){
					err = "transition must be either LRNS or <> +-.";
				}
				tm.pushTransition(args[0], args[1], args[2], args[3], transDir(args[4]));
			} else{
				err = "unexpected error";
			}
		}
		
		if (!err){
			console.log("Program compiled successfully.");
			tm.tapeEle.children[tm.headPos-1].classList.add("head");
			fillTable();
			drawGraph();
			this.compiled = true;
			return true;
		} else{
			console.log("Error compiling program...");
			console.log("Line " + (i+1) + ": " + err);
			tm.clearTransitions();
			this.compiled = false;
			return false;
		}
	};
};


function isSymb(str){
	return (str && str.length == 1);
}

function isTrans(str){
	return (str.length == 1 && "LRNS<>+-".indexOf(str) != -1);
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
