var SaveNameAssistant = Class.create( SaveNameAssistant, {

	initialize: function(sceneAssistant) {
		this.sceneAssistant = sceneAssistant;
		this.controller = sceneAssistant.controller;
		this.saveNameModel = {value:""};
		this.controller.setupWidget('saveName', {hintText:"Enter macro name", changeOnKeyPress:true}, this.saveNameModel);
		this.buttonModel = {label:"save", disabled:true, buttonClass: "affirmative"};
		this.controller.setupWidget('saveButton',{}, this.buttonModel);
	},
	
	setup : function(widget) {
		this.widget = widget;
		Mojo.Event.listen(this.controller.get("saveName"),Mojo.Event.propertyChange, this.handlePropertyChange.bind(this));
		Mojo.Event.listen(this.controller.get("saveButton"), Mojo.Event.tap, this.handleSave.bind(this));
	},
	
	deactivate : function(event){
		this.sceneAssistant.startListening();
	},
	
	handleSave: function()
	{
		this.sceneAssistant.doSaveMacro(this.controller.get('saveName').mojo.getValue());
		this.widget.mojo.close();
	},

	handlePropertyChange: function(event)
	{
		this.buttonModel.disabled = (this.controller.get("saveName").mojo.getValue().length == 0);
		this.controller.modelChanged(this.buttonModel,this);
	}
});
