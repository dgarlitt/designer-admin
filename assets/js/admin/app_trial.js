var HelenAdmin = Em.Application.create({
	ready: function() {
		this._super();
		HelenAdmin.GetItemsFromServer();
		console.log(this)
	}
});


WReader.GetItemsFromServer = function() {
  // URL to data feed that I plan to consume
  //var feedURL = "http://rss.news.yahoo.com/rss/topstories";
  var feed = "http://blog.chromium.org/feeds/posts/default?alt=rss";
  feed = encodeURIComponent(feed);

  // Feed parser that supports CORS and returns data as a JSON string
  var feedPipeURL = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'";
  feedPipeURL += feed + "'&format=json";
  //var feedPipeURL = "https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&q=";
  //feedPipeURL += feed;

  console.log("Starting AJAX Request:", feedPipeURL);

  $.ajax({
    url: feedPipeURL,
    dataType: 'json',
    success: function(data) {
      // Get the items object from the result
      var items = data.query.results.rss.channel.item;

      // Get the original feed URL from the result
      var feedLink = data.query.results.rss.channel.link;

      // Use map to iterate through the items and create a new JSON object for
      //  each item
      items.map(function(entry) {
        var item = {};
        // Set the item ID to the item GUID
        item.item_id = entry.guid.content;
        // Set the publication name to the RSS Feed Title
        item.pub_name = data.query.results.rss.channel.title;
        item.pub_author = entry.author;
        item.title = entry.title;
        // Set the link to the entry to it's original source if it exists
        //  or set it to the entry link
        if (entry.origLink) {
          item.item_link = entry.origLink;
        } else if (entry.link) {
          item.item_link = entry.link;
        }
        item.feed_link = feedLink;
        // Set the content of the entry
        item.content = entry.description;
        // Ensure the summary is less than 128 characters
        if (entry.description) {
          item.short_desc = entry.description.substr(0, 128) + "...";
        }
        // Create a new date object with the entry publication date
        item.pub_date = new Date(entry.pubDate);
        item.read = false;
        // Set the item key to the item_id/GUID
        item.key = item.item_id;
        // Create the Ember object based on the JavaScript object
        var emItem = WReader.Item.create(item);
        // Try to add the item to the data controller, if it's successfully
        //  added, we get TRUE and add the item to the local data store,
        //  otherwise it's likely already in the local data store.
        if (WReader.dataController.addItem(emItem)) {
          store.save(item);
        }
      });

      // Refresh the visible items
      WReader.itemsController.showDefault();
      console.log("Entries successfully updated from server.");

    }
  });
};










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
	
	
});

HelenAdmin.selectedClientController = Em.Object.create({
	selectedClient: null,
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


// Top Menu/Nav Bar view
HelenAdmin.NavBarView = Em.View.extend({
  // A 'property' that returns the count of items
  itemCount: function() {
    return HelenAdmin.dataController.get('itemCount');
  }.property('HelenAdmin.dataController.itemCount'),

  // A 'property' that returns the count of unread items
  unreadCount: function() {
    return HelenAdmin.dataController.get('unreadCount');
  }.property('HelenAdmin.dataController.unreadCount'),

  // A 'property' that returns the count of starred items
  starredCount: function() {
    return HelenAdmin.dataController.get('starredCount');
  }.property('HelenAdmin.dataController.starredCount'),

  // A 'property' that returns the count of read items
  readCount: function() {
    return HelenAdmin.dataController.get('readCount');
  }.property('HelenAdmin.dataController.readCount'),

  // Click handler for menu bar
  showAll: function() {
    HelenAdmin.clientsController.clearFilter();
  },

  // Click handler for menu bar
  showUnread: function() {
    HelenAdmin.clientsController.filterBy('read', false);
  },

  // Click handler for menu bar
  showStarred: function() {
    HelenAdmin.clientsController.filterBy('starred', true);
  },

  // Click handler for menu bar
  showRead: function() {
    HelenAdmin.clientsController.filterBy('read', true);
  },

  // Click handler for menu bar
  refresh: function() {
    HelenAdmin.GetItemsFromServer();
  }
});



// View for the ClientsList
HelenAdmin.ClientListView = Em.View.extend({
  tagName: 'article',

  classNames: ['well', 'summary'],

  classNameBindings: ['active', 'read', 'prev', 'next'],

  // Handle clicks on item summaries with the same code path that
  // handles the touch events.
  click: function(evt) {
    this.touchEnd(evt);
  },

  // Handle clicks/touch/taps on an item summary
  touchEnd: function(evt) {
    // Figure out what the user just clicked on, then set selectedItemController
    var content = this.get('content');
    HelenAdmin.selectedClientController.select(content);
  },

  // Enables/Disables the active CSS class
  active: function() {
    var selectedClient = HelenAdmin.selectedClientController.get('selectedItem');
    var content = this.get('content');
    if (content === selectedItem) {
      return true;
    }
  }.property('HelenAdmin.selectedClientController.selectedClient')
	
/*	
  // Enables/Disables the read CSS class
  read: function() {
    var read = this.get('content').get('read');
    return read;
  }.property('WReader.itemsController.@each.read'),

  // Returns the date in a human readable format
  formattedDate: function() {
    var d = this.get('content').get('pub_date');
    return moment(d).fromNow();
  }.property('WReader.selectedItemController.selectedItem')
*/
});


