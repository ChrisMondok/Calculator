function HelpAssistant(arguments) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	if(arguments)
	{
		if(arguments.section)
		this.section = arguments.section;
	}
	this.helpMenuDisabled = true;
	var scenes = Mojo.Controller.stageController.getScenes();
	for(var i = 0; i < scenes.length; i++)
	{
		if(scenes[i].sceneName == "preferences")
		{
			this.prefsMenuDisabled = true;
			break;
		}
	}
}

HelpAssistant.prototype.aboutToActivate = function(callback)
{
	callback.defer();
};

HelpAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	//Highlight new features
	
	this.highlighted = new Array();
	
	this.versionChanged({"value":"v1-6-5"});
	
	/* setup widgets here */
	this.controller.setupWidget("versionSelectDrawer", {modelProperty: "open", unstyled: false}, {open:false});
	
	this.VersionSelectorModel = {value: 'v1-6-5',disabled: false};
	this.controller.setupWidget("versionSelector",this.attributes ={label:"Highlight",labelPlacement: Mojo.Widget.labelPlacementLeft, choices: [{label: "v 1.6.5", value: 'v1-6-5'},{label: "v 1.6.0", value: 'v1-6-0'},{label: "v 1.5.5", value: 'v1-5-5'},{label: "v 1.5.0", value: 'v1-5-0'},{label: "None", value:"v0-0-0"}]},this.VersionSelectorModel); 
	
	this.controller.setupWidget("helpDrawer", {modelProperty: "open", unstyled: false}, {open:(this.section != undefined)});
	this.controller.setupWidget("contactDrawer", {modelProperty: "open", unstyled: false}, {open:false});
	this.controller.setupWidget("rpnDrawer", {modelProperty: "open", unstyled: false}, {open:false});
	this.controller.setupWidget("usageDrawer", {modelProperty: "open", unstyled: false}, {open:false});
	this.controller.setupWidget("keysDrawer", {modelProperty: "open", unstyled: false}, {open:false});
	this.controller.setupWidget("prefsDrawer", {modelProperty: "open", unstyled: false}, {open:false});
	this.controller.setupWidget("advancedDrawer", {modelProperty: "open", unstyled: false}, {open:false});
	this.controller.setupWidget("macrosDrawer", {modelProperty: "open", unstyled: false}, {open:false});
	this.controller.setupWidget("stacksDrawer", {modelProperty: "open", unstyled: false}, {open:false});
	
	this.controller.setupWidget("wikiButton",{}, {label : "Read the wikipedia article", buttonClass:"small-button"});
	this.controller.setupWidget("emailButton",{}, {label : "Send me an email", buttonClass:"small-button"});
	
	/* add event handlers to listen to events from widgets */
	Mojo.Event.listen(this.controller.get("header"), Mojo.Event.tap, this.toggleVersionHighlight.bind(this));
	
	this.controller.listen('versionSelector', Mojo.Event.propertyChange, this.versionChanged.bind(this));
	this.controller.listen('versionSelector', Mojo.Event.propertyChange, this.versionChanged.bind(this));
	
	Mojo.Event.listen(this.controller.get("helpButton"), Mojo.Event.tap, this.toggleHelp.bind(this));
	Mojo.Event.listen(this.controller.get("contactButton"), Mojo.Event.tap, this.toggleContact.bind(this));
	Mojo.Event.listen(this.controller.get("rpnButton"), Mojo.Event.tap, this.toggleRPN.bind(this));
	Mojo.Event.listen(this.controller.get("usageButton"), Mojo.Event.tap, this.toggleUsage.bind(this));
	Mojo.Event.listen(this.controller.get("keysButton"), Mojo.Event.tap, this.toggleKeys.bind(this));
	Mojo.Event.listen(this.controller.get("prefsButton"), Mojo.Event.tap, this.togglePrefs.bind(this));
	Mojo.Event.listen(this.controller.get("advancedButton"), Mojo.Event.tap, this.toggleAdvanced.bind(this));
	Mojo.Event.listen(this.controller.get("macrosButton"), Mojo.Event.tap, this.toggleMacros.bind(this));
	Mojo.Event.listen(this.controller.get("stacksButton"), Mojo.Event.tap, this.toggleStacks.bind(this));
	
	
	Mojo.Event.listen(this.controller.get("wikiButton"), Mojo.Event.tap, this.readWiki.bind(this));
	Mojo.Event.listen(this.controller.get("emailButton"), Mojo.Event.tap, this.sendEmail.bind(this));
	
	this.controller.setupWidget(Mojo.Menu.appMenu, appMenuAttr, appMenuModel);
	
};

HelpAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	if (this.controller.stageController.setWindowOrientation)
	{
    		this.controller.stageController.setWindowOrientation("free");
	}
	
	//Go to appropriate section
	if(this.section)
	{
		switch(this.section)
		{
		case "keys":
			//this.controller.getSceneScroller().mojo.revealElement(this.controller.get("keyHelp"));
			this.controller.get("keysDrawer").mojo.setOpenState(true);
			break;
		case "macro":
			this.controller.get("macrosDrawer").mojo.setOpenState(true);
			break;
		case "prefs":
			this.controller.get("prefsDrawer").mojo.setOpenState(true);
			break;	
		}
	}
};

HelpAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	if (this.controller.stageController.setWindowOrientation)
	{
    		this.controller.stageController.setWindowOrientation("up");
	}
};

HelpAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

HelpAssistant.prototype.toggleVersionHighlight = function(event)
{
	this.controller.get("versionSelectDrawer").mojo.toggleState();
}

HelpAssistant.prototype.versionChanged = function(event)
{
	for(var i = 0; i < this.highlighted.length; i++)
	{
		this.highlighted[i].removeClassName("highlight");
	}
	this.highlighted = document.getElementsByClassName(event.value);
	for(var i = 0; i < this.highlighted.length; i++)
	{
		this.highlighted[i].addClassName("highlight");
	}
}

HelpAssistant.prototype.toggleHelp = function(event)
{
	this.controller.get("helpDrawer").mojo.toggleState();
	this.controller.get("contactDrawer").mojo.setOpenState(false);
};

HelpAssistant.prototype.toggleRPN = function()
{
	this.controller.get("rpnDrawer").mojo.toggleState();
	this.controller.get("keysDrawer").mojo.setOpenState(false);
	this.controller.get("usageDrawer").mojo.setOpenState(false);
	this.controller.get("advancedDrawer").mojo.setOpenState(false);
	this.controller.get("stacksDrawer").mojo.setOpenState(false);
	this.controller.get("macrosDrawer").mojo.setOpenState(false);
	this.controller.get("prefsDrawer").mojo.setOpenState(false);
};

HelpAssistant.prototype.toggleUsage = function()
{
	this.controller.get("usageDrawer").mojo.toggleState();
	this.controller.get("keysDrawer").mojo.setOpenState(false);
	this.controller.get("rpnDrawer").mojo.setOpenState(false);
	this.controller.get("advancedDrawer").mojo.setOpenState(false);
	this.controller.get("stacksDrawer").mojo.setOpenState(false);
	this.controller.get("macrosDrawer").mojo.setOpenState(false);
	this.controller.get("prefsDrawer").mojo.setOpenState(false);
};

HelpAssistant.prototype.toggleKeys = function()
{
	this.controller.get("keysDrawer").mojo.toggleState();
	this.controller.get("advancedDrawer").mojo.setOpenState(false);
	this.controller.get("rpnDrawer").mojo.setOpenState(false);
	this.controller.get("usageDrawer").mojo.setOpenState(false);
	this.controller.get("stacksDrawer").mojo.setOpenState(false);
	this.controller.get("macrosDrawer").mojo.setOpenState(false);
	this.controller.get("prefsDrawer").mojo.setOpenState(false);
};

HelpAssistant.prototype.togglePrefs = function()
{
	this.controller.get("prefsDrawer").mojo.toggleState();
	this.controller.get("advancedDrawer").mojo.setOpenState(false);
	this.controller.get("rpnDrawer").mojo.setOpenState(false);
	this.controller.get("usageDrawer").mojo.setOpenState(false);
	this.controller.get("stacksDrawer").mojo.setOpenState(false);
	this.controller.get("macrosDrawer").mojo.setOpenState(false);
	this.controller.get("keysDrawer").mojo.setOpenState(false);
};

HelpAssistant.prototype.toggleAdvanced = function()
{
	this.controller.get("advancedDrawer").mojo.toggleState();
	this.controller.get("keysDrawer").mojo.setOpenState(false);
	this.controller.get("rpnDrawer").mojo.setOpenState(false);
	this.controller.get("usageDrawer").mojo.setOpenState(false);
	this.controller.get("stacksDrawer").mojo.setOpenState(false);
	this.controller.get("macrosDrawer").mojo.setOpenState(false);
	this.controller.get("prefsDrawer").mojo.setOpenState(false);
};

HelpAssistant.prototype.toggleMacros = function()
{
	this.controller.get("macrosDrawer").mojo.toggleState();
	this.controller.get("advancedDrawer").mojo.setOpenState(false);
	this.controller.get("keysDrawer").mojo.setOpenState(false);
	this.controller.get("rpnDrawer").mojo.setOpenState(false);
	this.controller.get("usageDrawer").mojo.setOpenState(false);
	this.controller.get("stacksDrawer").mojo.setOpenState(false);
	this.controller.get("prefsDrawer").mojo.setOpenState(false);
};

HelpAssistant.prototype.toggleStacks = function()
{
	this.controller.get("stacksDrawer").mojo.toggleState();
	this.controller.get("keysDrawer").mojo.setOpenState(false);
	this.controller.get("rpnDrawer").mojo.setOpenState(false);
	this.controller.get("usageDrawer").mojo.setOpenState(false);
	this.controller.get("advancedDrawer").mojo.setOpenState(false);
	this.controller.get("macrosDrawer").mojo.setOpenState(false);
	this.controller.get("prefsDrawer").mojo.setOpenState(false);
};

HelpAssistant.prototype.readWiki = function()
{
this.controller.serviceRequest("palm://com.palm.applicationManager", {method: "open", parameters: {id: 'com.palm.app.browser',params: {target: "http://en.wikipedia.org/wiki/Stack_(data_structure)"}}});};

HelpAssistant.prototype.toggleContact = function(event)
{
	this.controller.get("contactDrawer").mojo.toggleState();
	this.controller.get("helpDrawer").mojo.setOpenState(false);
};

HelpAssistant.prototype.sendEmail = function()
{
	this.controller.serviceRequest('palm://com.palm.applicationManager',{method: 'open',parameters:{id: 'com.palm.app.email',params: {summary: "So, about that calculator...", text: "", recipients: [{value : "chris.mondok@gmail.com",contactDisplay : 'Chris Mondok'}]}}});
}
