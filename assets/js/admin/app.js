var HelenAdmin = Em.Application.Create({
	ready: function() {
		this._super();
			//WReader.GetItemsFromServer();
	}
});

HelenAdmin.Login = Em.Object.extend({
	userName: null,
	password: null,
	url: null
});

HelenAdmin.Image = Em.Object.extend({
	imageId: null,
	projectId: null,
	imagePath: null,
	description: null
});


HelenAdmin.Project = Em.Object.extend({
	projectId: null,
	clientId: null,
	thumbnail: null,
	projectType: null,
	description: null,
	isVisible: true,
	images: null
});	

HelenAdmin.Client = Em.Object.extend({
	clientId: null,
	title: null,
	subtitle: null,
	description: null,
	isVisible: true,
	projects: null,
	thumbnail: null
});

HelenAdmin.clientsController = Em.ArrayController.create({
	content: [],
	addProject: function(){
		
	},
	removeProject: function(){
		
	},
	filterBy: function(){
		
	},
	clearFilter: function(){
		
	}
	
	//
});

HelenAdmin.selectedClientController = Em.Object.create({
	selectedItem: null,
	hasPrev: false,
	hasNext: false,
	
	// caled to select a client
	select: function(client){
		this.set('selectedClient',client);
		
		if(client){
			// Determin if we have a previous/next client in the array
				var currentIndex = HelenAdmin.clientsController.content.indexOf(this.get('selectedClient'));
				if (currentIndex + 1 >= HelenAdmin.itemsController.get('clientCount')) {
					this.set('hasNext', false);
				}
				else {
					this.set('hasNext', true);
				}
				if (currentIndex === 0) {
					this.set('hasPrev', false);
				}
				else {
					this.set('hasPrev', true);
				}
		}
		else {
				this.set('hasPrev', false);
				this.set('hasNext', false);
		}
	},
	// selects the next client in the clients controller
	next: function () {
		// gets the current index in case we've changed the list of clients, if the client is no longer visible, it will return -1
		var currentIndex = HelenAdmin.clientsController.content.indexOf(this.get('selectedClient'));
		// figure out the next item by adding 1, which will put it at the start of the newly selected items if they've changed
		var nextItem = HelenAdmin.clientsController.content[currentIndex + 1];
		if (nextItem) {
			this.select(nextItem);
		}
	}, 
		
	// selects the previous client in the clients controller
	prev: function() {
		// gets the current index in case we've changed the list of items, if the item is no longer visible, it will return - 1
		var currentIndex = HelenAdmin.clientsController.content.indexOf(this.get('selectedClient'));
		// figure out the previous client by subtracting 1, which will result in an client not found if we're already at 0
		var prevItem = HelenAdmin.clientsController.content[currentIndex - 1];
		if (prevItem) {
			this.select(prevItem);
		}
	}
});

