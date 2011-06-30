function MacrosAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

MacrosAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	this.listModel = 
	{
		listTitle: "Saved macros",
		items: savedMacros
	};
	this.listAttributes =
	{
		itemTemplate: "macros/list-entry",
		listTemplate:"macros/list-container",
		swipeToDelete:true,
		reorderable:false,
		autoconfirmDelete:false
	};
	if(macro.length > 0)
	{
		this.listAttributes.addItemLabel = "Save current macro";
	}
	this.controller.setupWidget("macrosList",this.listAttributes,this.listModel);
	
	/* add event handlers to listen to events from widgets */
	
	Mojo.Event.listen(this.controller.get("macrosList"),Mojo.Event.listTap, this.handleListTap.bind(this));
	Mojo.Event.listen(this.controller.get("macrosList"),Mojo.Event.listDelete, this.handleListDelete.bind(this));
	Mojo.Event.listen(this.controller.get("macrosList"),Mojo.Event.listAdd, this.handleListAdd.bind(this));
	
	
	this.controller.setupWidget(Mojo.Menu.appMenu, appMenuAttr, appMenuModel);
};

MacrosAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

MacrosAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

MacrosAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

MacrosAssistant.prototype.handleListTap = function(event)
{
	macro = event.item.macro;
	this.controller.stageController.popScene();
};

MacrosAssistant.prototype.handleListDelete = function(event)
{
	savedMacros.splice(event.index,1);
	(new Mojo.Model.Cookie("savedMacros")).put(savedMacros);
};

MacrosAssistant.prototype.handleListAdd = function(event)
{
	this.controller.showDialog({
		template: 'dialogs/save-dialog',
		assistant: new SaveNameAssistant(this),
		preventCancel:false
	});
};

MacrosAssistant.prototype.doSaveMacro = function(macroSaveName)
{
	var toSave = new Array();
	for(var i = 0; i < macro.length; i++)
	{
		toSave.push(macro[i]);
	}
	savedMacros.push({"macro":toSave,"name":macroSaveName});
	this.controller.get("macrosList").mojo.noticeAddedItems(savedMacros.length-1,[{"macro":toSave,"name":macroSaveName}]);
	(new Mojo.Model.Cookie("savedMacros")).put(savedMacros);
	
};

MacrosAssistant.prototype.handleCommand = function (event)
{
	if(event.type == Mojo.Event.command)
	{
		if(event.command == Mojo.Menu.helpCmd)
		{
			Mojo.Controller.stageController.pushScene({name:"help"},{section:"macro"});
			event.stopPropagation();
		}
	}		
};
