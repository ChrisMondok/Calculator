function StageAssistant() {
	/* this is the creator function for your stage assistant object */
}

StageAssistant.prototype.setup = function()
{
	appMenuAttr = {omitDefaultItems: true};
	appMenuModel = {
		visible: true,
		items: [
			Mojo.Menu.prefsItem,
			Mojo.Menu.helpItem
			]
		};
	this.controller.pushScene("first");
};

StageAssistant.prototype.handleCommand = function (event) {
	var currentScene = this.controller.activeScene();
 
	switch(event.type)
	{
		case Mojo.Event.commandEnable:
			switch (event.command)
			{
			case Mojo.Menu.prefsCmd:
				if(!currentScene.assistant.prefsMenuDisabled)
				{
					event.stopPropagation();
				}
				break;
			case Mojo.Menu.helpCmd:
				if(!currentScene.assistant.helpMenuDisabled)
				{
					event.stopPropagation();
				}
				break;
			}
			break;
		case Mojo.Event.command:
			switch (event.command)
			{   
			case Mojo.Menu.helpCmd:
				Mojo.Controller.stageController.pushScene("help");
				event.stopPropagation();
				break;

			case Mojo.Menu.prefsCmd:
				this.controller.pushScene('preferences');
				break;
			}
		break;
	}
};
