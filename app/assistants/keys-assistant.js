function KeysAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

KeysAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	this.currentRow = null;
	/* setup widgets here */
	this.controller.setupWidget("resetButton",{}, {label : "Reset all keys", buttonClass: "negative"});
	
	/* add event handlers to listen to events from widgets */
	this.keyListener = this.handleKeyPress.bind(this);
	Mojo.Event.listen(this.controller.get("resetButton"),Mojo.Event.tap, this.resetAllKeys.bind(this));
	
	//step through all the rows, and set up action listeners for 'em.
	//Build list
	
	var keyRows = this.controller.get("functionKeyRows");
	for(var f = 0; f < allFunctions.length; f++)
	{
		var row = document.createElement("div");
		row.className = "palm-row"+(f == 0?" first":(f >= allFunctions.length-1 && savedMacros.length == 0?" last":""));
		row.id = allFunctions[f]+"Row";
		row.whichFunction = allFunctions[f];
		
		var wrapper = document.createElement("div");
		wrapper.className = "palm-row-wrapper";
		row.appendChild(wrapper);
		
		var title = document.createElement("div");
		title.className = "title";
		wrapper.appendChild(title);
		
		var span = document.createElement("span");
		span.id = allFunctions[f]+"Char";
		title.appendChild(span);
		
		var label = document.createElement("div");
		label.className = "label";
		label.update(allFunctions[f].replace(/_/g," "));
		title.appendChild(label);
		keyRows.appendChild(row);
		Mojo.Event.listen(row,Mojo.Event.tap,this.setKey.bind(this));		
	}
	
	//Macro rows
	keyRows = this.controller.get("macroKeyRows");
	for(var m = 0; m < savedMacros.length; m++)
	{
		var row = document.createElement("div");
		row.className = "palm-row"+(m >= savedMacros.length-1?" last":"");
		row.id = savedMacros[m]+"Row";
		row.whichFunction = "runMacro_"+savedMacros[m].name.replace(/ /g,"_");
		
		var wrapper = document.createElement("div");
		wrapper.className = "palm-row-wrapper";
		row.appendChild(wrapper);
		
		var title = document.createElement("div");
		title.className = "title";
		wrapper.appendChild(title);
		
		var span = document.createElement("span");
		span.id ="runMacro_"+savedMacros[m].name.replace(/ /g,"_")+"Char";
		title.appendChild(span);
		
		var label = document.createElement("div");
		label.className = "label";
		label.update(savedMacros[m].name.replace(/_/g," "));
		title.appendChild(label);
		keyRows.appendChild(row);
		Mojo.Event.listen(row,Mojo.Event.tap,this.setKey.bind(this));	
	}
	
	this.displayKeys(true);
	
	this.controller.setupWidget(Mojo.Menu.appMenu, appMenuAttr, appMenuModel);
};

KeysAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

KeysAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	   
	//Stop listening for key presses.
	Mojo.Event.stopListening( this.controller.document,"keydown", this.keyListener, true);
	(new Mojo.Model.Cookie("keys")).put(keys);
};

KeysAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

KeysAssistant.prototype.displayKeys = function(allkeys)
{
	if(allkeys)
	{
		for(f = 0; f < allFunctions.length; f++)
		{
			this.keyFunction = allFunctions[f];
			this.displayKeys(false);
		}
		for(m = 0; m < savedMacros.length; m++)
		{
			this.keyFunction = "runMacro_"+savedMacros[m].name.replace(/ /g,"_");
			this.displayKeys(false);
		}
		this.keyFunction = undefined;
	}
	else
	{
		this.controller.get(this.keyFunction.replace(/ /g,"_")+"Char").update(this.sanitize(eval("keys."+this.keyFunction)));
	}
};

KeysAssistant.prototype.sanitize = function(keyCode)
{
	if(keyCode == undefined) return "Undefined";
	if(keyCode == 190) return ". ("+keyCode+")"; //Note: key 190 seems to correspond to the 3/4 character...
	if(keyCode == "32") return "[space] ("+keyCode+")";
	return String.fromCharCode(keyCode)+" ("+keyCode+")";
}

KeysAssistant.prototype.setKey = function(event)
{
	//Mojo.View.clearTouchFeedback(this.controller.get("keyRows")); //Root? I'll use this, thanks.
	this.keyFunction = event.currentTarget.whichFunction;	
	if(this.keyFunction != undefined && this.keyFunction != null)
	{
		Mojo.View.addTouchFeedback(event.currentTarget);
		this.currentRow = event.currentTarget;
		//Start listening for the next key press.
		Mojo.Event.listen( this.controller.document,"keydown", this.keyListener, true);
	}
}

KeysAssistant.prototype.handleKeyPress = function(event)
{
	//See if it's a legal key
	switch(event.keyCode)
	{
	case 8:
		//Backspace: clear key
		eval("keys."+this.keyFunction+" = undefined");
		this.displayKeys(false);
		break;
	case 13:
		//Enter: reset to default
		eval("keys."+this.keyFunction+" = defaultKeys."+this.keyFunction);
		this.displayKeys(false);
		break;
	//Modifiers
	case 57575:	//Meta
	case 16:	//Shift
	case 17:	//Sym
	case 129:	//Alt
	case 0:		//EMULATOR: shift
	case 27:	//EMULATOR: esc
		//Don't do anything.
		return;
		break; //Probably superfluous.
	//Number keys
	case 48:
	case 49:
	case 50:
	case 51:
	case 52:
	case 53:
	case 54:
	case 55:
	case 56:
	case 57:
	case 69:
	case 82:
	case 84:
	case 68:
	case 70:
	case 71:
	case 88:
	case 67:
	case 86:
	case 190:
		Mojo.Controller.errorDialog("That key is reserved for numerical input!");
		break
	default:
		var notTaken = true;
		//check bound function keys
		for(var f = 0; f < allFunctions.length; f++)
		{
			if(eval("keys."+allFunctions[f]) == event.keyCode && allFunctions[f] != this.keyFunction)
			{
				notTaken = false;
				Mojo.Controller.errorDialog("That key is already bound to "+allFunctions[f]);
				break;
			}
		}
		//check bound macros
		for(var m = 0; m < savedMacros.length; m++)
		{
			if(eval("keys.runMacro_"+savedMacros[m].name.replace(/ /g,"_")) == event.keyCode && "runMacro_"+savedMacros[m].name.replace(/ /g,"_") != this.keyFunction)
			{
				notTaken = false;
				Mojo.Controller.errorDialog("That key is already bound to run the macro \""+savedMacros[m].name.replace(/_/g," ")+"\"");
				break;
			}
		}
		if(notTaken)
			eval("keys."+this.keyFunction+" = "+event.keyCode);
		this.displayKeys(false);
		break;
	}
}

KeysAssistant.prototype.resetAllKeys = function(event)
{
	keys = {};
	for(var f = 0; f < allFunctions.length; f++)
	{
		eval("keys."+allFunctions[f]+" = defaultKeys."+allFunctions[f]);
	}
	this.displayKeys(true);
};

KeysAssistant.prototype.handleCommand = function (event)
{
	if(event.type == Mojo.Event.command)
	{
		if(event.command == Mojo.Menu.helpCmd)
		{
			Mojo.Controller.stageController.pushScene({name:"help"},{section:"keys"});
			event.stopPropagation();
		}
	}		
};
