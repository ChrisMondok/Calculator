function PreferencesAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	this.prefsMenuDisabled = true;
}

PreferencesAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	this.vertical = (new Mojo.Model.Cookie("vertical")).get();
	this.vertical = (this.vertical || this.vertical == undefined);
	this.inputStack = (new Mojo.Model.Cookie("inputStack")).get();
	this.inputStack = (this.inputStack || this.inputStack == undefined);
	this.saveStack = (new Mojo.Model.Cookie("saveStack")).get();
	this.compact = (new Mojo.Model.Cookie("compact")).get();
	this.precision = (new Mojo.Model.Cookie("precision")).get() || 10;
	this.reverseRoot = (new Mojo.Model.Cookie("reverseRoot")).get();
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	var disableCompact = false;
	if(Mojo.Environment.DeviceInfo.maximumCardHeight < 450)
	{
		this.controller.get("compactRow").addClassName("disabled");
		disableCompact = true;
	}	
	
	this.controller.setupWidget("verticalToggle",{}, this.model={value: this.vertical});
	this.controller.setupWidget("inputStackToggle",{}, this.model={value: this.inputStack});
	this.controller.setupWidget("saveStackToggle",{}, this.model={value: this.saveStack});
	this.controller.setupWidget("compactToggle",{}, this.model={value: this.compact, disabled:disableCompact});
	this.controller.setupWidget("precisionPicker",{label:"\0", modelProperty: 'value', min:0, max:20, padNumbers:true},{value:this.precision});
	this.controller.setupWidget("reverseRootToggle",{}, this.model={value: this.reverseRoot});
	this.controller.setupWidget("reverseRootToggle",{}, this.model={value: this.reverseRoot});
	this.controller.setupWidget("keysButton",{"label":"Customize keys"},{});
	
	this.listModel = 
	{
		listTitle: "Saved macros",
		items: savedConstants
	}
	this.controller.setupWidget("constantsList",
		this.listAttributes =
		{
			itemTemplate: "preferences/list-entry",
			listTemplate:"preferences/list-container",
			swipeToDelete:true,
			reorderable:false,
			autoconfirmDelete:false
		},
		this.listModel
	);
	
	if(savedConstants.length > 0)
	{
		this.controller.get("emptyList").hide();
	}
	
	/* add event handlers to listen to events from widgets */
	Mojo.Event.listen(this.controller.get("verticalToggle"), Mojo.Event.propertyChange, this.setValue.bind(this));
	Mojo.Event.listen(this.controller.get("inputStackToggle"), Mojo.Event.propertyChange, this.setValue.bind(this));
	Mojo.Event.listen(this.controller.get("saveStackToggle"), Mojo.Event.propertyChange, this.setValue.bind(this));
	Mojo.Event.listen(this.controller.get("compactToggle"), Mojo.Event.propertyChange, this.setValue.bind(this));
	Mojo.Event.listen(this.controller.get("precisionPicker"), Mojo.Event.propertyChange, this.setPrecision.bind(this));
	Mojo.Event.listen(this.controller.get("reverseRootToggle"), Mojo.Event.propertyChange, this.setValue.bind(this));
	
	Mojo.Event.listen(this.controller.get("constantsList"),Mojo.Event.listDelete, this.handleListDelete.bind(this));
	
	Mojo.Event.listen(this.controller.get("keysButton"),Mojo.Event.tap, this.customizeKeys.bind(this));
	
	this.controller.setupWidget(Mojo.Menu.appMenu, appMenuAttr, appMenuModel);
	
	
};

PreferencesAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	//   this.handleCookies();
};

PreferencesAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

PreferencesAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

PreferencesAssistant.prototype.customizeKeys = function(event)
{
	Mojo.Controller.stageController.pushScene("keys");
};

PreferencesAssistant.prototype.setValue = function(event)
{
	switch(event.srcElement.id)
	{
	case "verticalToggle":
		this.vertical = event.model.value;
		(new Mojo.Model.Cookie("vertical")).put(this.vertical);
		break;
	case "inputStackToggle":
		this.inputStack = event.model.value;
		(new Mojo.Model.Cookie("inputStack")).put(this.inputStack);
		break;
	case "saveStackToggle":
		this.saveStack = event.model.value;
		(new Mojo.Model.Cookie("saveStack")).put(this.saveStack);
		break;
	case "compactToggle":
		this.compact = event.model.value;
		(new Mojo.Model.Cookie("compact")).put(this.compact);
		break;
	case "reverseRootToggle":
		this.reverseRoot = event.model.value;
		(new Mojo.Model.Cookie("reverseRoot")).put(this.reverseRoot);
		break;
	default:
		Mojo.Log.error("Source element "+event.srcElement.id+" called setValue");
	}
};

PreferencesAssistant.prototype.setPrecision = function(event)
{
	(new Mojo.Model.Cookie("precision")).put(event.model.value);
};


PreferencesAssistant.prototype.handleListDelete = function(event)
{
	savedConstants.splice(event.index,1);
	(new Mojo.Model.Cookie("savedConstants")).put(savedConstants);
	if(savedConstants.length == 0)
	{
		this.controller.get("constantsList").hide();
		this.controller.get("emptyList").show();
	}
};
PreferencesAssistant.prototype.handleCommand = function (event)
{
	if(event.type == Mojo.Event.command)
	{
		if(event.command == Mojo.Menu.helpCmd)
		{
			Mojo.Controller.stageController.pushScene({name:"help"},{section:"prefs"});
			event.stopPropagation();
		}
	}		
};
