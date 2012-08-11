
// Create or open the data store where objects are stored for offline use
var store = new Lawnchair({name: 'entries', record: 'entry'}, function() {
  //TODO: this should probably go in the item store
  this.toggleRead = function(key, value) {
    this.get(key, function(entry) {
      entry.read = value;
      this.save(entry);
    });
  };

  //TODO: this should probably go in the item store
  this.toggleStar = function(key, value) {
    this.get(key, function(entry) {
      entry.starred = value;
      this.save(entry);
    });
  };
});


// Create the all up Ember application
var DesignAdmin = Em.Application.create({
  ready: function() {
    // Call the superclass's `ready` method.
    this._super();

    //On mobile devices, hide the address bar
    window.scrollTo(0);

    // Load items from the local data store first
    //DesignAdmin.GetClientsFromDataStore();
  }
});


DesignAdmin.GetClientsFromDataStore = function() {
  // Get all items from the local data store.
  //  We're using store.all because store.each returns async, and the
  //  method will return before we've pulled all the items out.  Then
  //  there is a strong likelyhood of GetItemsFromServer stomping on
  //  local items.
  var clients = store.all(function(arr) {
    arr.forEach( function(entry) {
      var client = DesignAdmin.Client.create(client);
      DesignAdmin.dataController.addClient(client);
		});
    console.log("Entries loaded from local data store:", arr.length);

    // Set the default view to any unread items
		DesignAdmin.clientsController.showDefault();

    // Load items from the server after we've loaded everything from
    //  the local data store
    DesignAdmin.GetItemsFromServer();
	});
};


DesignAdmin.GetItemsFromServer = function() {
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
      var clients = data.query.results.rss.channel.item;

      // Get the original feed URL from the result
      var feedLink = data.query.results.rss.channel.link;

      // Use map to iterate through the items and create a new JSON object for
      //  each item
      clients.map(function(entry) {
        var client = {};
        // Set the item ID to the item GUID
        client.clientId = entry.guid.content;
        // Set the publication name to the RSS Feed Title
        
        client.title = entry.title;
		client.subtitle = entry.subtitle;
		client.description = entry.description;
		client.isVisible = entry.isVisible;
		client.projects = entry.projects;
		client.thumbnail = entry.thumbnail;
		if (entry.description){
			client.short_desc = entry.description.substr(0, 128) + "...";
		}
		client.key = client.clientId;
	
        // Create the Ember object based on the JavaScript object
        var emItem = DesignAdmin.Client.create(client);
        // Try to add the item to the data controller, if it's successfully
        //  added, we get TRUE and add the item to the local data store,
        //  otherwise it's likely already in the local data store.
        if (DesignAdmin.dataController.addClient(emItem)) {
          store.save(client);
        }
      });

      // Refresh the visible items
      DesignAdmin.clientsController.showDefault();
      console.log("Entries successfully updated from server.");

    }
  });
};



DesignAdmin.HandleSpaceKey = function() {
  var itemHeight = $('.entry.active').height() + 60;
  var winHeight = $(window).height();
  var curScroll = $('.entries').scrollTop();
  var scroll = curScroll + winHeight;
  if (scroll < itemHeight) {
    $('.entries').scrollTop(scroll);
  } else {
    DesignAdmin.selectedClientController.next();
  }
};

function handleBodyKeyDown(evt) {
  if (evt.srcElement.tagName === "BODY") {
    switch (evt.keyCode) {
      case 34: // PgDn
      case 39: // right arrow
      case 40: // down arrow
      case 74: // j
        DesignAdmin.selectedClientController.next();
        break;

      case 32: // Space
        DesignAdmin.HandleSpaceKey();
        evt.preventDefault();
        break;

      case 33: // PgUp
      case 37: // left arrow
      case 38: // up arrow
      case 75: // k
        DesignAdmin.selectedClientController.prev();
        break;

      case 85: // U
        DesignAdmin.selectedClientController.toggleRead();
        break;

      case 72: // H
        DesignAdmin.selectedClientController.toggleStar();
        break;
      }
    }
}

function handlePopState(evt) {
  console.log("Pop State", evt);
}

document.addEventListener('keydown', handleBodyKeyDown, false);
window.addEventListener('popstate', handlePopState, false);
