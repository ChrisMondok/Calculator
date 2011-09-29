//TODO: figure out how to make the list's margin-bottom value equal to the height of the functionsDiv

function FirstAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

var savedMacros = (new Mojo.Model.Cookie("savedMacros")).get() || new Array();
var savedConstants = (new Mojo.Model.Cookie("savedConstants")).get() || new Array();

//allFunctions = ["add","subtract","multiply","divide","macro","negate","percent","power","root","log","sin","cos","tan","swap","clear","duplicate","rotate up","rotate down","!","permutation","combination","mean","std dev"];	
allFunctions = ["add","subtract","multiply","divide","macro","negate","percent","power","root","log","sin","cos","tan","swap","clear","duplicate","rotate_up","rotate_down","factorial","permutation","combination","mean","standard_deviation"];
var defaultKeys = {
	"add":87,
	"subtract":83,
	"multiply":90,
	"divide":81,
	"macro":77,
	"negate":78,
	"percent":73,
	"rotate_down":74,
	"rotate_up":75
};
var keys = (new Mojo.Model.Cookie("keys")).get();
if(keys == undefined)
{
	keys = {};
	for(var f = 0; f < allFunctions.length; f++)
	{
		eval("keys."+allFunctions[f]+" = defaultKeys."+allFunctions[f]);
	}
}
var macro = new Array();

FirstAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	this.base = 10;
	this.precision = 10;
	this.oldInput = "";
	this.verticalStack = true;
	this.reverseRoot = false;
	this.saveStack = false;
	this.inputStack = true;
	this.compact = false;
	this.zoom = false;
	this.input = "";
	this.recordingMacro = false;
	
	this.stack = new Array();
	this.listItems = [];
	this.size = 0;
	this.inverse = false;
	//this.allStacks = new Array();
	
	/* setup widgets here */
	this.controller.setupWidget("inputScroller", {mode: 'horizontal'}, {});
	this.controller.setupWidget("field", {autoFocus: false, focusMode: Mojo.Widget.focusSelectMode, modifierState: Mojo.Widget.numLock}, {disabled:true});
	//this.controller.setupWidget("inputDrawer", {modelProperty: "open", unstyled: true}, {open:true});
	this.compactSnapElements = { x: [this.controller.get("scrollerItem:1"),this.controller.get("scrollerItem:2")] };
	this.tallSnapElements = { x: $$('.scrollerItem') };
	this.scrollerModel = {
		snapElements: this.tallSnapElements,
		snapIndex: 0
	}
	this.snapIndex = 0;
	this.controller.setupWidget("scrollerId", {
			mode: 'horizontal-snap'
		}, this.scrollerModel);
	this.pushButtonModel = {label : "↓", buttonClass: "affirmative", disabled:true};
	this.controller.setupWidget("PushButton", {disabledProperty: 'disabled'}, this.pushButtonModel);
	this.popButtonModel = {label : "↑", buttonClass: "negative", disabled:true};
	this.controller.setupWidget("PopButton", {disabledProperty: 'disabled'}, this.popButtonModel);
	
	this.controller.setupWidget("AddButton",{}, {label : "+"});
	this.controller.setupWidget("SubtractButton",{}, {label : "-"});
	this.controller.setupWidget("MultiplyButton",{}, {label : "×"});
	this.controller.setupWidget("DivideButton",{}, {label : "÷"});
	
	this.controller.setupWidget("PowerButton",{}, {label : "x^y", buttonClass: "un-capitalize"});
	this.controller.setupWidget("RootButton",{}, {label : "root", buttonClass: "un-capitalize"});
	this.controller.setupWidget("LogButton",{}, {label : "log", buttonClass: "un-capitalize"});
	this.controller.setupWidget("ConstantsButton", {}, {label:"C"});
	
	this.controller.setupWidget("SinButton",{}, {label : "sin", buttonClass: "un-capitalize"});
	this.controller.setupWidget("CosButton",{}, {label : "cos", buttonClass: "un-capitalize"});
	this.controller.setupWidget("TanButton",{}, {label : "tan", buttonClass: "un-capitalize"});
	
	this.controller.setupWidget("DegToRadButton",{}, {label : "D→R"});
	this.controller.setupWidget("RadToDegButton",{}, {label : "R→D"});
	this.inverseModel = {value:false, disabled:false};
	this.controller.setupWidget("InverseButton",{trueValue: true, falseValue: false}, this.inverseModel);
	
	this.controller.setupWidget("SwapXYButton",{}, {label : "swap"});
	this.controller.setupWidget("ClearButton",{}, {label : "clear"});
	this.controller.setupWidget("CloneButton",{}, {label : "dup"});
	this.controller.setupWidget("MacroButton",{}, {label : "run"});
	
	this.controller.setupWidget("RotateUpButton",{}, {label : "Rot U"});
	this.controller.setupWidget("RotateDownButton",{}, {label : "Rot D"});
	//this.controller.setupWidget("RadixButton",{}, {label : "Radix"});
	this.RadixSelectorModel = {value: "dec",disabled: false};
	this.controller.setupWidget("RadixSelector",this.attributes = {choices: [{label: "bin", value: 'bin'},{label: "oct", value: 'oct'},{label: "dec", value: 'dec'},{label: "hex", value: 'hex'},{label: "Custom", value: 'custom'}]},this.RadixSelectorModel); 
	
	this.controller.setupWidget("FactorialButton",{}, {label : "factorial"});
	this.controller.setupWidget("PermutationButton",{}, {label : "P"});
	this.controller.setupWidget("CombinationButton",{}, {label : "C"});
	
	this.controller.setupWidget("MeanButton",{}, {label : "μ", buttonClass: "un-capitalize"});
	this.controller.setupWidget("StdDevButton",{}, {label : "σ", buttonClass: "un-capitalize"});
	
	this.controller.setupWidget("AButton",{}, {label : "A"});
	this.controller.setupWidget("BButton",{}, {label : "B"});
	this.controller.setupWidget("CButton",{}, {label : "C"});
	this.controller.setupWidget("DButton",{}, {label : "D"});
	this.controller.setupWidget("EButton",{}, {label : "E"});
	this.controller.setupWidget("FButton",{}, {label : "F"});
	
	//set up the list
	this.controller.setupWidget("list",
		this.listAttributes =
		{
			itemTemplate: "first/list-entry",
			listTemplate:"first/list-container",
			swipeToDelete:true,
			reorderable:false,
			autoconfirmDelete:true
		},
		this.listModel = 
		{
			listTitle: "Stack stack",
			items: this.listItems,
			
		});
		
	/* add event handlers to listen to events from widgets */
	Mojo.Event.listen(this.controller.get("PushButton"), Mojo.Event.tap, this.handlePush.bind(this));
	Mojo.Event.listen(this.controller.get("PopButton"), Mojo.Event.tap, this.handlePop.bind(this));
	
	Mojo.Event.listen(this.controller.get("AddButton"), Mojo.Event.tap, this.operateSingle.bind(this,"+"));
	Mojo.Event.listen(this.controller.get("SubtractButton"), Mojo.Event.tap, this.operateSingle.bind(this,"-"));
	Mojo.Event.listen(this.controller.get("MultiplyButton"), Mojo.Event.tap, this.operate.bind(this,"*"));
	Mojo.Event.listen(this.controller.get("DivideButton"), Mojo.Event.tap, this.operate.bind(this,"/"));
	
	Mojo.Event.listen(this.controller.get("PowerButton"), Mojo.Event.tap, this.operate.bind(this,"pow"));
	Mojo.Event.listen(this.controller.get("RootButton"), Mojo.Event.tap, this.operate.bind(this,"root"));
	Mojo.Event.listen(this.controller.get("LogButton"), Mojo.Event.tap, this.operate.bind(this,"log"));
	Mojo.Event.listen(this.controller.get("ConstantsButton"), Mojo.Event.tap, this.constants.bind(this));
	
	Mojo.Event.listen(this.controller.get("SinButton"), Mojo.Event.tap, this.operateSingle.bind(this,"sin"));
	Mojo.Event.listen(this.controller.get("CosButton"), Mojo.Event.tap, this.operateSingle.bind(this,"cos"));
	Mojo.Event.listen(this.controller.get("TanButton"), Mojo.Event.tap, this.operateSingle.bind(this,"tan"));
	
	Mojo.Event.listen(this.controller.get("DegToRadButton"), Mojo.Event.tap, this.operateSingle.bind(this,"degtorad"));
	Mojo.Event.listen(this.controller.get("RadToDegButton"), Mojo.Event.tap, this.operateSingle.bind(this,"radtodeg"));
	Mojo.Event.listen(this.controller.get("InverseButton"), Mojo.Event.propertyChange, this.setInverse.bind(this));
	
	Mojo.Event.listen(this.controller.get("SwapXYButton"), Mojo.Event.tap, this.operate.bind(this,"swap"));
	Mojo.Event.listen(this.controller.get("ClearButton"), Mojo.Event.tap, this.clearAll.bind(this));
	Mojo.Event.listen(this.controller.get("CloneButton"), Mojo.Event.tap, this.operateSingle.bind(this,"clone"));
	Mojo.Event.listen(this.controller.get("MacroButton"), Mojo.Event.tap, this.runMacro.bind(this));
	
	Mojo.Event.listen(this.controller.get("RotateUpButton"), Mojo.Event.tap, this.rotateUp.bind(this));
	Mojo.Event.listen(this.controller.get("RotateDownButton"), Mojo.Event.tap, this.rotateDown.bind(this));
	//Mojo.Event.listen(this.controller.get("RadixSelector"), Mojo.Event.hold, this.customRadix.bind(this));
	this.controller.listen('RadixSelector', Mojo.Event.propertyChange, this.radixChanged.bind(this));
	
	Mojo.Event.listen(this.controller.get("FactorialButton"), Mojo.Event.tap, this.operateSingle.bind(this,"!"));
	Mojo.Event.listen(this.controller.get("PermutationButton"), Mojo.Event.tap, this.operate.bind(this,"permutation"));
	Mojo.Event.listen(this.controller.get("CombinationButton"), Mojo.Event.tap, this.operate.bind(this,"combination"));
	
	Mojo.Event.listen(this.controller.get("MeanButton"), Mojo.Event.tap, this.operateSingle.bind(this,"mean"));
	Mojo.Event.listen(this.controller.get("StdDevButton"), Mojo.Event.tap, this.operateSingle.bind(this,"stddev"));
	
	Mojo.Event.listen(this.controller.get("AButton"), Mojo.Event.tap, this.typeLetter.bind(this,"A"));
	Mojo.Event.listen(this.controller.get("BButton"), Mojo.Event.tap, this.typeLetter.bind(this,"B"));
	Mojo.Event.listen(this.controller.get("CButton"), Mojo.Event.tap, this.typeLetter.bind(this,"C"));
	Mojo.Event.listen(this.controller.get("DButton"), Mojo.Event.tap, this.typeLetter.bind(this,"D"));
	Mojo.Event.listen(this.controller.get("EButton"), Mojo.Event.tap, this.typeLetter.bind(this,"E"));
	Mojo.Event.listen(this.controller.get("FButton"), Mojo.Event.tap, this.typeLetter.bind(this,"F"));
	
	Mojo.Event.listen(this.controller.get("list"),Mojo.Event.listTap, this.handleListTap.bind(this));
	Mojo.Event.listen(this.controller.get("list"),Mojo.Event.listDelete, this.handleListDelete.bind(this));
	
	//Listen for scroller change, to save for next run.
	Mojo.Event.listen(this.controller.get("scrollerId"), Mojo.Event.propertyChange, this.setSnapIndex.bind(this));
	
	//Handle enlarging text when minimizing card
	this.controller.listen(this.controller.stageController.document, Mojo.Event.stageDeactivate, this.zoomIn.bind(this));
	this.controller.listen(this.controller.stageController.document, Mojo.Event.stageActivate, this.zoomOut.bind(this));
	
	
	/* edit menu */
	this.appMenuModel = {visible: true, items: [
		//Copy and paste not supported. Maybe there's some way to do this? I don't know.
		//Mojo.Menu.editItem,
		//{label: "Copy", command: 'setClipboard', disabled:true, checkEnabled:true},
		{label: "Save constant", command: 'saveConstant', disabled:true, checkEnabled:true},
		{label: "Save stack", command: 'saveStack', shortcut: 's', disabled:true, checkEnabled:true},
		{label: "Macro" , items:[
			{label:"Run macro", command:'runMacro'},
			{label: "Record macro", command: 'toggleMacro', shortcut:'m'},
			{label: "Save macro", command: 'saveMacro'},
			{label: "Manage macros", command: 'manageMacros'}
		]},
		Mojo.Menu.prefsItem,
		Mojo.Menu.helpItem
	]};
	//this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true},this.appMenuModel);
	this.controller.setupWidget(Mojo.Menu.appMenu, appMenuAttr, this.appMenuModel);
	/* initialize the scene. */
	this.zoom = false;
	this.animationTime = 0.125;
	
	this.handleCookies();
	
	if(this.saveStack)
	{
		var oldStack = (new Mojo.Model.Cookie("oldStack")).get();
		if(oldStack != undefined)
			this.stack = oldStack;
		var oldList = (new Mojo.Model.Cookie("oldList")).get();
		if(oldList != undefined)
			this.listItems = oldList;
		var oldMacro = (new Mojo.Model.Cookie("oldMacro")).get();
		if(oldMacro != undefined)
		{
			macro = oldMacro;
		}
		this.snapIndex = (new Mojo.Model.Cookie("snapIndex")).get();
		if(this.snapIndex == undefined)
			this.snapIndex = 0;
		
	}
	
	this.controller.get("recordingRow").hide();
	this.controller.get("letterRow").hide();
};

FirstAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	
	this.controller.get("scrollerId").mojo.setSnapIndex(this.snapIndex);
	this.keyListener = this.handleKeys.bind(this);
	this.startListening();
	this.handleCookies();
	this.updateStack();
	if (this.controller.stageController.setWindowOrientation)
	{
    		this.controller.stageController.setWindowOrientation("up");
	}
};

FirstAssistant.prototype.startListening = function()
{
	Mojo.Event.listen( this.controller.document,"keydown", this.keyListener, true);
}

FirstAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	$$('body')[0].removeClassName('palm-dark');
	Mojo.Event.stopListening( this.controller.document,"keydown", this.keyListener, true);
	//TODO: stop zooming in / out when we're not the active scene.
};

FirstAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	if(this.saveStack)
	{
		(new Mojo.Model.Cookie("oldStack")).put(this.stack);
		(new Mojo.Model.Cookie("oldList")).put(this.listItems);
		if(macro.length > 1)
			(new Mojo.Model.Cookie("oldMacro")).put(macro);
		(new Mojo.Model.Cookie("oldBase")).put(this.base);
		(new Mojo.Model.Cookie("snapIndex")).put(this.snapIndex);
	}
};

FirstAssistant.prototype.updateDiv = function(event)
{
	//Update the entire input div (field and buttons)
	this.controller.get("inputDiv").update(this.input);
	this.controller.get("inputScroller").mojo.scrollTo(-this.controller.get("inputDiv").offsetWidth,0,false,true);
	if(this.base == 16)
	{
		this.controller.get("letterRow").show();
	}
	else
	{
		this.controller.get("letterRow").hide();
	}
	//Update input buttons
	this.pushButtonModel.disabled = (this.input.length == 0 && this.oldInput == "");
	this.popButtonModel.disabled = (this.stack.length == 0 && this.input == "");
	this.controller.modelChanged(this.pushButtonModel,this);
	this.controller.modelChanged(this.popButtonModel,this);
};

FirstAssistant.prototype.handlePush = function(event)
{

	if(this.recordingMacro)
	{
		macro.push({"func":"push","arg":this.input});
		this.controller.get("instructionsCount").update(macro.length + " instructions");
	}
	if(this.input == "")
	{
		this.input = this.oldInput;
		this.oldInput = "";
	}
	else
	{
		this.stack.push(this.parse(this.input));
		this.updateStack(event);
		this.input = "";
	}
	this.updateDiv();
};

FirstAssistant.prototype.handlePop = function(event)
{
	if(this.recordingMacro)
	{
		macro.push({"func":"pop"});
		this.controller.get("instructionsCount").update(macro.length + " instructions");
	}
	if(this.input != "")
	{	
		this.oldInput = this.input;
	}
	if(this.stack.length > 0)
	{
		this.oldInput = this.input;
		this.input = (Math.round(this.stack.pop()*Math.pow(10,this.precision))/Math.pow(10,this.precision)).toString(this.base);
		this.updateStack(event);
	}
	else
	{
		this.input = "";
	}
	this.updateDiv();
};

FirstAssistant.prototype.customRadix = function(value)
{
	if(value != undefined)
	{
		this.base = value;
		this.input = "";
		this.updateDiv();
		this.updateStack();
	}
	//update radix selector.
	switch (this.base)
	{
		case 2:
			this.RadixSelectorModel.value = 'bin';
			break;
		case 8:
			this.RadixSelectorModel.value = 'oct';
			break;
		case 10:
			this.RadixSelectorModel.value = 'dec';
			break;
		case 16:
			this.RadixSelectorModel.value = 'hex';
			break;
		default:
			this.RadixSelectorModel.value = this.base.toString();
			break;
	}
	this.controller.modelChanged(this.RadixSelectorModel,this);
}

//This is the function that handles all the two value operations.
FirstAssistant.prototype.operate = function(operation)
{
	if(this.recordingMacro)
	{
		macro.push({"func":"operate","arg":operation});
		this.controller.get("instructionsCount").update(macro.length + " instructions");
	}
	if (this.inputStack && this.input != "")
	{
		this.handlePush();
	}
	if(this.stack.length<2)
	{
		Mojo.Controller.errorDialog("You must have at least two values on the stack to perform this operation!");
	}
	else
	{
		switch(operation)
		{
			/* moved to operateSingle (defined special cases for their use on an empty stack)
			case "+":
			case "add":
				this.stack.push(this.stack.pop()+this.stack.pop());
				break;
			case "-":
			case "subtract":
				this.stack.push(-(this.stack.pop()-this.stack.pop()));
				break;
			*/
			case "*":
			case "multiply":
				this.stack.push(this.stack.pop()*this.stack.pop());
				break;
			case "/":
			case "divide":
				this.stack.push(1/(this.stack.pop()/this.stack.pop()));
				break;
			case "pow":
			case "power":
				var temp = this.stack.pop();
				this.stack.push(Math.pow(this.stack.pop(),temp));
				break;
			case "root":
				var temp = this.stack.pop();
				this.stack.push(Math.pow(this.stack.pop(),1/temp));
				break;
			case "log":
				this.stack.push(Math.log(this.stack.pop())/Math.log(this.stack.pop()));
				break;
			case "swap":
			case "swapxy":
			case "swapXY":
				var temp = this.stack.pop();
				var temp2 = this.stack.pop();
				this.stack.push(temp);
				this.stack.push(temp2);
				break;
			case "permutation":
				var k = this.stack.pop();
				var n = this.stack.pop();
				var top = 1;
				if(n > k)
				{
					for(var i = n; i > 0; i--)
					{
						top*=i;
					}
				
					var bottom = 1;
					for(var i = (n-k); i > 0; i--)
					{
						bottom*=i;
					}
					this.stack.push(top / bottom);
				}
				else
				{
					Mojo.Controller.errorDialog("This function requires that k be greater than n.");
					this.stack.push(n);
					this.stack.push(k);
				}
				break;
			case "combination":
				var k = this.stack.pop();
				var n = this.stack.pop();
				var top = 1;
				if(n > k)
				{
					for(var i = n; i > 0; i--)
					{
						top*=i;
					}
				
					var bottom = 1;
					for(var i = (n-k); i > 0; i--)
					{
						bottom*=i;
					}
					for(var i = k; i > 0; i--)
					{
						bottom*=i;
					}
					this.stack.push(top / bottom);
				}
				else
				{
					Mojo.Controller.errorDialog("This function requires that k be greater than n.");
					this.stack.push(n);
					this.stack.push(k);
				}
				break;
			default:
				Mojo.Controller.errorDialog("Oh dear, this is embarrassing. I don't know how to perform the \""+operation+"\" operation.");
				break;
			
		}
		this.updateStack(event);
	}
};

//This is the function that handles all the single value operations.
FirstAssistant.prototype.operateSingle = function(operation)
{
	if(this.recordingMacro)
	{
		macro.push({"func":"operateSingle","arg":operation});
		this.controller.get("instructionsCount").update(macro.length + " instructions");
	}
	if (this.inputStack && this.input != "")
	{
		//Make adding to no stack push the value, and subtracting from no stack push the negative value.
		if(this.stack.length == 0)
		{
			if(operation == "-" || operation == "subtract" || operation == "+" || operation == "add")
			{
				this.stack.push(0);
			}
		}
		this.handlePush();
	}
	if(this.stack.length<1)
	{
		Mojo.Controller.errorDialog("You must have a value on the stack to perform this operation!");
	}
	else
	{
		switch(operation)
		{
			case "+":
			case "add":
				this.stack.push(this.stack.pop()+this.stack.pop());
				break;
			case "-":
			case "subtract":
				this.stack.push(-(this.stack.pop()-this.stack.pop()));
				break;
			case "sin":
				if(!this.inverse)
				{
					this.stack.push(Math.sin(this.stack.pop()));
				}
				else
				{
					this.stack.push(Math.asin(this.stack.pop()));
				}
				break;
			case "cos":
				if(!this.inverse)
				{
					this.stack.push(Math.cos(this.stack.pop()));
				}
				else
				{
					this.stack.push(Math.acos(this.stack.pop()));
				}
				break;
			case "tan":
				if(!this.inverse)
				{
					this.stack.push(Math.tan(this.stack.pop()));
				}
				else
				{
					this.stack.push(Math.atan(this.stack.pop()));
				}
				break;
			case "factorial":
			case "fact":
			case "!":
				var output = 1;
				for(var i = this.stack.pop(); i > 0; i--)
				{
					output*=i;
				}
				this.stack.push(output);
				break;
			case "mean":
			case "average":
				var mean = 0;
				for(var i = 0; i < this.stack.length; i++)
				{
					mean += this.stack[i];
				}
				mean /= this.stack.length;
				this.stack.push(mean);
				break;
			case "stddev":
			case "std_dev":
			case "standarddeviation":
			case "standard deviation":
			case "standard_deviation":
				//find mean
				var mean = 0;
				for(var i = 0; i < this.stack.length; i++)
				{
					mean += this.stack[i];
				}
				mean = mean/this.stack.length;
				//find variance
				var variance = 0;
				for(var i = 0; i < this.stack.length; i++)
				{
					variance += Math.pow(this.stack[i] - mean,2);
				}
				//square root of variance
				this.stack.push(Math.pow(variance/this.stack.length,0.5));
				break;
			case "degtorad":
			case "d2r":
				this.stack.push((this.stack.pop()*Math.PI) / 180);
				break;
			case "radtodeg":
			case "r2d":
				this.stack.push((this.stack.pop()*180) / Math.PI);
				break;
			case "clone":
			case "duplicate":
			case "dup":
				var temp = this.stack.pop();
				this.stack.push(temp);
				this.stack.push(temp);
				break;
			default:
				Mojo.Controller.errorDialog("Oh dear, this is embarrassing. I don't know how to perform the \""+operation+"\" operation.");
				break;
			
		}
		this.updateStack(event);
	}
};

FirstAssistant.prototype.setInverse = function(event)
{
	this.inverse = event.value;
	this.inverseModel.value = event.value;
	this.controller.modelChanged(this.inverseModel,this);
	if(this.recordingMacro)
	{
		macro.push({"func":"setInverse", "arg":this.inverse});
	}
};

FirstAssistant.prototype.constants = function(event)
{
	this.popupIndex = event.index;
	this.items = [
		{label: 'π', command: 'pi'},
		{label: 'e', command: 'e'},
	];
	if(savedConstants.length > 0) 
	{
		this.items.push({label: 'Custom constants'});
	}
	for(var i = 0; i < savedConstants.length; i++)
	{
		this.items.push({label: savedConstants[i].name, command: 'customConstant-'+i})
	}
	this.controller.popupSubmenu({onChoose: this.popupHandler,placeNear: event.target,items:this.items});
};
/*
FirstAssistant.prototype.radix = function(event)
{
	this.popupIndex = event.index;
	this.controller.popupSubmenu({onChoose: this.popupHandler,placeNear: event.target,items: [{label: 'Bin', command: 'bin'},{label: 'Oct', command: 'oct'},{label: 'Dec', command: 'dec'},{label: 'Hex', command: 'hex'}]});
};
*/


FirstAssistant.prototype.typeLetter = function(letter)
{
	this.input = this.input+""+letter;
	this.updateDiv();
}

FirstAssistant.prototype.toggleMacro = function()
{
	this.recordingMacro = !this.recordingMacro
	if(this.recordingMacro)
	{
		//Mojo.Controller.errorDialog("Start recording macro");
		this.controller.get("recordingRow").show();
		while(macro.pop()){};
		macro = new Array();
		this.appMenuModel.items[2].items[1].label = "Stop recording";
		macro.push({"func":"setInverse", "arg":this.inverse});
		this.updateMacroDiv();
	}
	else
	{
		this.controller.get("recordingRow").hide();
		this.appMenuModel.items[2].items[1].label = "Record macro";
		if(macro.length < 2) //Always at least one, which sets the inverse state.
			macro = new Array();
	}
}

FirstAssistant.prototype.updateMacroDiv = function()
{
	this.controller.get("instructionsCount").update(macro.length + " instructions");
}

FirstAssistant.prototype.runMacro = function()
{
	//var transition = this.controller.prepareTransition(Mojo.Transition.crossFade,false);
	if(this.recordingMacro)
	{
		Mojo.Controller.errorDialog("Can't run macro while still recording!");
	}
	else
	{
		if(macro.length == 0)
		{
			Mojo.Controller.errorDialog("No macro loaded!");
		}
		else
		{
			for(var i = 0; i < macro.length; i++)
			{
				switch(macro[i].func)
				{
					case "push":
						this.input = macro[i].arg;
						this.handlePush();
						break;
					case "pop":
						this.handlePop();
						break;
					case "operate":
						this.operate(macro[i].arg);
						break;
					case "operateSingle":
						this.operateSingle(macro[i].arg);
						break;
					case "rotateDown":
						this.rotateDown();
						break;
					case "rotateUp":
						this.rotateUp();
						break;
					case "setInverse":
						var ev = {"value":macro[i].arg};
						this.setInverse(ev);
						break;
				}
			}
		}
	}
	this.updateDiv();
	//transition.run();
}

FirstAssistant.prototype.handleKeys = function(event)
{
	var temp;
	temp = "";
	if (event.keyCode <= 57 && event.keyCode >= 48)
	{
		temp = event.keyCode-48;
	}
	else
	{
		//This switch does not run if meta is held
		if(!event.metaKey)
		{
			//Type letters if alt is held.
			//TODO: make this alt instead of shift.
			if(event.shiftKey)
			{
				if(event.keyCode >= 65 && event.keyCode <= 90)
				{
					if(event.keyCode - 55 < this.base)
					{
						this.typeLetter(String.fromCharCode(event.keyCode));
					}
					else
					{
						Mojo.Controller.errorDialog("The input can't contain letters greater than the radix!");
					}
				}
			}
			else
			{
				//Check if it's bound
				var matched = false;
				for(key in keys)
				{
					if(event.keyCode == eval("keys."+key))
					{
						matched = true;
						var operation = key;
						if(operation.indexOf("runMacro_") == 0)
						{
							var macroName = operation.slice(9).replace(/ /g,"_");
							var found = false;
							//Load macro with corresponding name
							for(var m = 0; m < savedMacros.length; m++)
							{
								if(savedMacros[m].name.replace(/ /g,"_") == macroName)
								{
									found = true;
									macro = savedMacros[m].macro;
									this.runMacro();
									break;
								}
							}
							if(!found)
							{
								Mojo.Controller.errorDialog("The macro "+macroName+" no longer exists. This key is now unbound.");
								eval("keys.runMacro_"+macroName.replace(/ /g,"_")+" = undefined");
							}
						}
						else
						{
							switch(operation)
							{
							//Special cases
							case "clear":
								this.clearAll();
								break;
							case "macro":
								this.runMacro();
								break;
							case "percent":
								if(this.base == 10) this.input = this.input/100;
								break;
							case "negative":
							case "negate":
								temp = "";
								if(this.input[0] == "-")
								{
									this.input = this.input.substr(1);
								}
								else this.input = "-"+this.input;
								break;
							case "rotate_up":
								this.rotateUp();
								break;
							case "rotate_down":
								this.rotateDown();
								break;
							case "sin":
							case "cos":
							case "tan":
							case "factorial":
							case "add":
							case "subtract":
							case "+":
							case "-":
							case "standard_deviation":
							case "stddev":
							case "std_dev":
							case "standarddeviation":
							case "standard deviation":
							case "mean":
								this.operateSingle(operation);
								break;
							default:
								this.operate(operation);
								break;
						
							}
						}
						break; //Break out of for loop, a key shouldn't have two actions.
					}
				}
				if(!matched)
				{
					switch(event.keyCode)
					{
					case (64):
						temp = 0;
						break;
					case (69):
						temp = 1;
						break;
					case (82):
						temp = 2;
						break;
					case (84):
						temp = 3;
						break;
					case (68):
						temp = 4;
						break;
					case (70):
						temp = 5;
						break;
					case (71):
						temp = 6;
						break;
					case (88):
						temp = 7;
						break;
					case (67):
						temp = 8;
						break;
					case (86):
						temp = 9;
						break;
					case (190):
						temp = ".";
						break;
					}
				}
			}
		}
	}
	if(parseInt(temp) != Number.NaN)
	{
		if(temp >= this.base)
		{
			Mojo.Controller.errorDialog("The input can't contain numbers greater than the radix.");
			temp = "";
		}
	}
	this.input = this.input+""+temp;
	//backspace
	if (event.keyCode == 8)
	{
		if(event.metaKey)
		{
			this.handlePop();
		}
		else
		{
			var oldstring;
			oldstring = this.input
			this.input = oldstring.substr(0,oldstring.length-1);
		}
	}
	if (Mojo.Char.isEnterKey(event.keyCode))
	{
		this.handlePush();
		this.input = "";
	}
	this.updateDiv();
};


FirstAssistant.prototype.updateStack = function(event)
{
	this.controller.get("stackList").style.paddingTop = (this.controller.get("inputBox").offsetHeight+8)+"px";
	if(isNaN(this.stack[this.stack.length-1]))
	{
		this.stack.pop();
	}
	var string = "";
	var prefix = "";
	var postfix = ", ";
	var prestack = "<div>";
	var poststack = "</div>"
	
	if ((this.verticalStack)||this.zoom)
	{
		prefix = "<div class='stackElement'>";
		postfix = "</div>";
		prestack = "";
		poststack = "";
	}
	
	
	//Draw operational stack
	string = string + prestack;
	if(this.stack.length == 0)
	{
		string += prefix + "(empty)" + postfix;
	}
	else
	{
		//Number base indicator
		switch(this.base)
		{
			case 16:
				prefix += "0x<span class='caps'>";
				postfix = "</span>" + postfix;
				break;
			case 10:
				//Don't do anything for base 10.
				break;
			default:
				postfix = "<span class='base'>" + this.base + "</span>" + postfix;
				break;			
		}
		for(var i = this.stack.length-1; i >= 0; i--)
		{
			if(isNaN(this.stack[i]))
			{
				string = string +prefix+ 0 + postfix;
			}
			else
			{
				string = string + prefix +(Math.round(this.stack[i]*Math.pow(10,this.precision))/Math.pow(10,this.precision)).toString(this.base) + postfix;
			}
		}
	}
	string = string + poststack;
	this.controller.get("stackList").update(string);
	this.controller.modelChanged(this.popButtonModel,this);
};

FirstAssistant.prototype.handleCommand = function (event)
{ 
	if(event.type == Mojo.Event.commandEnable)
	{
		switch (event.command)
		{
		case "palm-copy-cmd":
		case "setClipboard":
		case "saveConstant":
			if(this.stack.length == 0 && this.input == "")
			{
				event.preventDefault();
			}
			break;
		case "saveStack":
			if(this.stack.length == 0)
			{
				event.preventDefault();
			}
			break;
		}
	}
	if(event.type == Mojo.Event.command)
	{
		switch (event.command)
		{
		case "clearStack":
			this.clearAll();
			break;
		case "clearStack":
			this.clearAll();
			break;
		case "runMacro":
			this.runMacro();
			break;
		case "toggleMacro":
			this.toggleMacro();
			break;
		case "saveStack":
			if (this.stack.length > 0)
			{
				//var transition = this.controller.prepareTransition(Mojo.Transition.crossFade,false);
				string = "";
				for(var i = this.stack.length-1; i >= 0; i--)
				{
					if(isNaN(this.stack[i]))
					{
						string = string + 0 + ", ";
					}
					else
					{
						string = string +this.stack[i] + ", ";
					}
				}
				this.listModel.items.unshift({data:string, stack:this.stack});
				this.controller.modelChanged(this.listModel,this);
				//this.allStacks.push(this.stack);
				this.stack = new Array();
				this.updateStack();
				this.controller.get("list").style.display = "block";
				//transition.run();
				this.updateDiv();
			}
			else
			{
				Mojo.Controller.errorDialog("Can't save a stack with no items!");
			}
			break;
		case "popStack":
			delete this.stack;
			this.stack = this.listItems[0].stack;
			this.listItems.splice(0,1);
			this.controller.modelChanged(this.listModel,this);
			this.updateStack();
			break;
			break;
		case "manageMacros":
			Mojo.Controller.stageController.pushScene("macros");
			break;
		case "saveMacro":
			Mojo.Event.stopListening( this.controller.document,"keydown", this.keyListener, true);
			this.controller.showDialog({
				template: 'dialogs/save-dialog',
				assistant: new SaveNameAssistant(this),
				preventCancel:false
			});
			break;
		case "saveConstant":
			Mojo.Event.stopListening( this.controller.document,"keydown", this.keyListener, true);
			this.controller.showDialog({
				template: 'dialogs/save-constant-dialog',
				assistant: new SaveConstantAssistant(this),
				preventCancel:false
			});
			break;
		case "setClipboard":
			if(this.input != "")
			{
				this.handlePush();
			}
			var value = this.stack.pop();
			this.stack.push(value)
			Mojo.Controller.stageController.setClipboard(value);
			break;
		}
	}
};

FirstAssistant.prototype.clearAll = function(event)
{
	while(this.stack.length)
	{
		this.oldInput = "";
		this.stack.pop();
	}
	this.updateStack();
};

FirstAssistant.prototype.rotateDown = function(event)
{
	var temp = this.stack[0];
	if(this.recordingMacro)
	{
		macro.push({"func":"rotateDown"});
		this.controller.get("instructionsCount").update(macro.length + " instructions");
	}
	for(var i = 1; i < this.stack.length; i++)
	{
		this.stack[i-1] = this.stack[i];
	}
	this.stack[this.stack.length-1] = temp;
	this.updateStack();
};

FirstAssistant.prototype.rotateUp = function(event)
{
	var temp = this.stack[this.stack.length-1];
	if(this.recordingMacro)
	{
		macro.push({"func":"rotateDown"});
		this.controller.get("instructionsCount").update(macro.length + " instructions");
	}
	for(var i = this.stack.length-2; i >= 0; i--)
	{
		this.stack[i+1] = this.stack[i];
	}
	this.stack[0] = temp;
	this.updateStack();
};

FirstAssistant.prototype.radixChanged = function(event)
{	
	this.oldValue = "";
	switch(event.value)
	{	
		case 'bin':
			this.base = 2;
			this.input = "";
			this.updateDiv();
			this.updateStack();
			break;
		case 'oct':
			this.base = 8;
			this.input = "";
			this.updateDiv();
			this.updateStack();
			break;
		case 'dec':
			this.base = 10;
			this.input = "";
			this.updateDiv();
			this.updateStack();
			break;
		case 'hex':
			this.base = 16;
			this.input = "";
			this.updateDiv();
			this.updateStack();
			break;
		case 'custom':
			Mojo.Event.stopListening( this.controller.document,"keydown", this.keyListener, true);
			this.controller.showDialog({
				template: 'dialogs/custom-radix-dialog',
				assistant: new CustomRadixAssistant(this),
				preventCancel:false
			});
		default:
			Mojo.Controller.errorDialog(radix +" is a strange radix, don't you think?");
			break;
	};
	

};

FirstAssistant.prototype.popupHandler = function(command)
{
	if(command != undefined)
	{
		if(command.indexOf("customConstant-") != -1)
		{
			var index = command.replace("customConstant-","");
			this.input = savedConstants[index].value;
			this.updateDiv();
		}
		else
		{
			switch(command)
			{
				case 'pi':
					this.input = Math.PI;
					this.updateDiv();
					break;
				case 'e':
					this.input = Math.E;
					this.updateDiv();
					break;
				case undefined:
					//The user probably tapped outside the popup. Don't do anything.
					break;
				default:
					Mojo.Controller.errorDialog("I'm not quite sure what to do with "+command+".");
					break;
			}
		}
	}
};

FirstAssistant.prototype.handleCookies = function()
{
	var version = "1.6.6";
	var versionCookie = new Mojo.Model.Cookie("versionCookie");
	cookieData = versionCookie.get() || "0";
	if(cookieData != version)
	{
		this.controller.showAlertDialog({
		            onChoose: function(value) {},
		            title: "New with version "+version+":",
		            message: "Decimals allowed in ANY RADIX! Improved handling of preferences (by a whole bunch). Fixed a few really weird, really obscure bugs.",
		            choices:[
		                {label:"Well, it's about time!", value:"ok", type:"dismiss"}
		            ]
		        });
		versionCookie.put(version);
	}
	
	//Load everything from cookies
	var precisionCookie = new Mojo.Model.Cookie("precision");
	this.precision = precisionCookie.get();
	if(this.precision == undefined)
		this.precision = 10;
	this.reverseRoot = (new Mojo.Model.Cookie("reverseRoot").get());
	this.verticalStack = (new Mojo.Model.Cookie("vertical").get());
	this.verticalStack = (this.verticalStack || this.verticalStack == undefined);
	this.saveStack = (new Mojo.Model.Cookie("saveStack").get());
	this.inputStack = (new Mojo.Model.Cookie("inputStack").get());
	this.inputStack = (this.inputStack || this.inputStack == undefined);
	this.compact = (new Mojo.Model.Cookie("compact").get());
	if(Mojo.Environment.DeviceInfo.maximumCardHeight < 450) this.compact = false;
	if(this.compact)
	{
		this.controller.get("scrollerContainer").style.width = "200%";
		this.scrollerModel.snapElements = this.compactSnapElements;
		var toChange = $('scrollerContainer').getElementsByClassName('operationGroup');
		for(var i = 0; i < toChange.length; i++)
		{
			toChange[i].addClassName('unlabeled');
			toChange[i].removeClassName('palm-group');
			var last = toChange[i].getElementsByClassName('endofgroup');
			for(var j = 0; j < last.length; j++)
			{
				last[j].removeClassName('last');
			}
		}
		this.controller.modelChanged(this.scrollerModel,this);
	}
	else
	{
		this.controller.get("scrollerContainer").style.width = "400%";
		this.scrollerModel.snapElements = this.tallSnapElements;
		var toChange = $('scrollerContainer').getElementsByClassName('operationGroup');
		for(var i = 0; i < toChange.length; i++)
		{
			toChange[i].removeClassName('unlabeled');
			toChange[i].addClassName('palm-group');
			var last = toChange[i].getElementsByClassName('endofgroup');
			for(var j = 0; j < last.length; j++)
			{
				last[j].addClassName('last');
			}
		}
		this.controller.modelChanged(this.scrollerModel,this);
	}
};

FirstAssistant.prototype.zoomIn = function()
{
	this.zoom = true;
	this.updateStack();
	Mojo.Animation.animateStyle(this.controller.get("stackList"),'fontSize','ease-in',{from:20, to:50, duration:this.animationTime});
	Mojo.Animation.animateStyle(this.controller.get("stackList"),'paddingTop','ease-in',{from:(this.controller.get("inputBox").offsetHeight+8), to:0, duration:this.animationTime});
	Mojo.Animation.animateStyle(this.controller.get("inputBox"),'top','ease-in',{from:0, to:-(this.controller.get("inputBox").offsetHeight+this.controller.get("inputBox").offsetTop), duration:this.animationTime});
	Mojo.Animation.animateStyle(this.controller.get("functionsDiv"),'bottom','ease-in',{from:0, to:-this.controller.get("functionsDiv").offsetHeight, duration:this.animationTime});
	Mojo.Animation.animateStyle(this.controller.get("list"),'left','ease-in',{from:0, to:-320, duration:this.animationTime}); //TODO: replace 320 with the width of the card.
};

FirstAssistant.prototype.zoomOut = function()
{
	if(this.zoom)
	{
		this.zoom = false;
		this.updateStack();
		this.controller.get("stackList").style.paddingTop = "0";
		Mojo.Animation.animateStyle(this.controller.get("stackList"),'fontSize','ease-in',{from:50, to:20, duration:this.animationTime});
		Mojo.Animation.animateStyle(this.controller.get("stackList"),'paddingTop','ease-in',{to:(this.controller.get("inputBox").offsetHeight+8), from:0, duration:this.animationTime});
		Mojo.Animation.animateStyle(this.controller.get("inputBox"),'top','ease-in',{from:-100, to:0, duration:this.animationTime});
		Mojo.Animation.animateStyle(this.controller.get("functionsDiv"),'bottom','ease-in',{from:-this.controller.get("functionsDiv").offsetHeight, to:0, duration:this.animationTime});
		Mojo.Animation.animateStyle(this.controller.get("list"),'left','ease-in',{from:-320, to:0, duration:this.animationTime}); //TODO: replace 320 with the width of the card.
	}
};

FirstAssistant.prototype.handleListTap = function(event)
{
	delete this.stack;
	this.stack = event.item.stack;
	this.listItems.splice(event.index,1);
	this.controller.modelChanged(this.listModel,this);
	this.updateStack();
	this.updateDiv();
};

FirstAssistant.prototype.handleListDelete = function(event)
{
	this.listItems.splice(event.index,1);
	if(this.listItems.length == 0)
	{
		this.controller.get("list").style.display = "none";
	}
};

FirstAssistant.prototype.doSaveMacro = function(macroSaveName)
{
	//See if this macro exists.
	for(var i = 0; i < savedMacros.length; i++)
	{
		if (savedMacros[i].name.replace(/ /g,"_") == macroSaveName.replace(/ /g,"_")) //Treat underscores and spaces as the same. The keys-assistant cannot differentiate them.
		{
			Mojo.Controller.errorDialog("A macro with this name already exists!");
			return;
		}
	}
	var toSave = new Array();
	for(var i = 0; i < macro.length; i++)
	{
		toSave.push(macro[i]);
	}
	savedMacros.push({"macro":toSave,"name":macroSaveName});
	(new Mojo.Model.Cookie("savedMacros")).put(savedMacros);
};

FirstAssistant.prototype.doSaveConstant = function(constantSaveName)
{
	var value = this.stack.pop();
	this.stack.push(value);
	savedConstants.push({"name":constantSaveName,"value":value});
	(new Mojo.Model.Cookie("savedConstants")).put(savedConstants);
}

FirstAssistant.prototype.parse = function(string)
{
	var negative = (string[0] == '-');
	var decimalPlace = string.indexOf(".");
	if(decimalPlace < 0)
		decimalPlace = string.length;
	//Whole part
	var integer = 0;
	for(var c = (negative?1:0); c < decimalPlace; c++)
	{
		integer += this.charValue(string[c])*Math.pow(this.base,decimalPlace-(c+1));
	}
	//Fractional part
	var fraction = 0;
	for(var c = decimalPlace+1; c < string.length; c++)
	{
		fraction += this.charValue(string[c])*Math.pow(this.base,decimalPlace-c);
	}
	return integer + fraction;
}

FirstAssistant.prototype.charValue = function(character)
{
	character = character.toUpperCase();
	if(character.charCodeAt(0) >= 48) //Zero.
	{
		if(character.charCodeAt(0) <= 57)
		{
			return character.charCodeAt(0)-48;
		}
		else
		{
			if(character.charCodeAt(0) >= 65) //A
			{
				if(character.charCodeAt(0) <= 90)
				{
					return character.charCodeAt(0)-55;
				}
			}
		}
	}
	return 0;
}

FirstAssistant.prototype.setSnapIndex = function(event)
{
	this.snapIndex = event.value;
}
