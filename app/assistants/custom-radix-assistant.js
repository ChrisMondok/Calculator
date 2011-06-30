var CustomRadixAssistant = Class.create( CustomRadixAssistant, {

	initialize: function(sceneAssistant) {
		this.sceneAssistant = sceneAssistant;
		this.base = sceneAssistant.base;
		this.controller = sceneAssistant.controller;
		this.saveNameModel = {value:""};
		this.buttonModel = {label:"ok", buttonClass: "affirmative"};
		this.controller.setupWidget('ok',{}, this.buttonModel);
		this.controller.setupWidget("radixPicker",{label:"\0", modelProperty: 'value', min:2, max:36, padNumbers:true},{value:this.base});
	},
	
	setup : function(widget) {
		this.widget = widget;
		Mojo.Event.listen(this.controller.get("ok"), Mojo.Event.tap, this.changeRadix.bind(this));
		Mojo.Event.listen(this.controller.get("radixPicker"),Mojo.Event.propertyChange, this.handleUpdate.bind(this));
	},
	
	deactivate : function(event){
		this.sceneAssistant.customRadix();
		this.sceneAssistant.startListening();
	},
	
	handleUpdate: function(event)
	{
		this.base = event.model.value;
	},
	
	changeRadix: function()
	{
		this.sceneAssistant.customRadix(this.base);
		this.widget.mojo.close();
	}
});
