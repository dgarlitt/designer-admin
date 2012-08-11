// Visible Item Controller - we never really edit any of the content
//  in here, it's solely used to decide what we're showing, pulling from
//  the data controller.
DesignAdmin.clientsController = Em.ArrayController.create({
  // content array for Ember's data
  content: [],

  // Sets content[] to the filtered results of the data controller
  filterBy: function(key, value) {
    this.set('content', DesignAdmin.dataController.filterProperty(key, value));
  },

  // Sets content[] to all items in the data controller
  clearFilter: function() {
    this.set('content', DesignAdmin.dataController.get('content'));
  },

  // Shortcut for filterBy
  showDefault: function() {
    this.filterBy('read', false);
  },

  // Mark all visible items read
  markAllRead: function() {
    // Iterate through all items, and set read=true in the item controller
    // then set read=true in the data store.
    this.forEach(function(client) {
      //item.set('read', true);
      store.toggleRead(client.get('clientId'), true);
    });
  },

  // A 'property' that returns the count of visible items
  clientCount: function() {
    return this.get('length');
  }.property('@each'),

  // A 'property' that returns the count of read items
  readCount: function() {
    return this.filterProperty('read', true).get('length');
  }.property('@each.read'),

  // A 'property' that returns the count of unread items
  unreadCount: function() {
    return this.filterProperty('read', false).get('length');
  }.property('@each.read'),

  // A 'property' that returns the count of starred items
  starredCount: function() {
    return this.filterProperty('starred', true).get('length');
  }.property('@each.starred')

});


DesignAdmin.dataController = Em.ArrayController.create({
  // content array for Ember's data
  content: [],

  // Adds an item to the controller if it's not already in the controller
  addClient: function(client) {
    // Check to see if there are any items in the controller with the same
    //  clientId already
    var exists = this.filterProperty('clientId', client.clientId).length;
    if (exists === 0) {
      // If no results are returned, we insert the new client into the data
      // controller in order of client id
      var length = this.get('length'), idx;
      idx = this.binarySearch(Date.parse(client.get('clientId')), 0, length);
      this.insertAt(idx, client);
      return true;
    } else {
      // It's already in the data controller, so we won't re-add it.
      return false;
    }
  },

  // Binary search implementation that finds the index where a entry
  // should be inserted when sorting by date.
  binarySearch: function(value, low, high) {
    var mid, midValue;
    if (low === high) {
      return low;
    }
    mid = low + Math.floor((high - low) / 2);
    midValue = Date.parse(this.objectAt(mid).get('pub_date'));

    if (value < midValue) {
      return this.binarySearch(value, mid + 1, high);
    } else if (value > midValue) {
      return this.binarySearch(value, low, mid);
    }
    return mid;
  },

  // A 'property' that returns the count of items
  clientCount: function() {
    return this.get('length');
  }.property('@each'),

  // A 'property' that returns the count of read items
  readCount: function() {
    return this.filterProperty('read', true).get('length');
  }.property('@each.read'),

  // A 'property' that returns the count of unread items
  unreadCount: function() {
    return this.filterProperty('read', false).get('length');
  }.property('@each.read'),

  // A 'property' that returns the count of starred items
  starredCount: function() {
    return this.filterProperty('starred', true).get('length');
  }.property('@each.starred'),

  markAllRead: function() {
    // Iterate through all items, and set read=true in the data controller
    // then set read=true in the data store.
    this.forEach(function(item) {
      //client.set('read', true);
      store.toggleRead(client.get('clientId'), true);
    });
  }
});


// Selected Item Controller - and provides functionality to hook into
// all details for a specific item.
DesignAdmin.selectedClientController = Em.Object.create({
  // Pointer to the seclected item
  selectedClient: null,

  hasPrev: false,

  hasNext: false,

  // Called to select an item
  select: function(client) {
    this.set('selectedClient', client);
    if (client) {
     // this.toggleRead(true);

      // Determine if we have a previous/next item in the array
      var currentIndex = DesignAdmin.clientsController.content.indexOf(this.get('selectedClient'));
      if (currentIndex + 1 >= DesignAdmin.clientsController.get('clientCount')) {
        this.set('hasNext', false);
      } else {
        this.set('hasNext', true);
      }
      if (currentIndex === 0) {
        this.set('hasPrev', false);
      } else {
        this.set('hasPrev', true);
      }

      //TODO: Update the address bar
      //var url = location.origin + location.pathname + '';
      //var item_url = "" + item.get('clientId');
      //history.pushState(item.get('clientId'), 'title', url + item_url);

    } else {
      this.set('hasPrev', false);
      this.set('hasNext', false);
    }
  },

  // Toggles or sets the read state with an optional boolean
  toggleRead: function(read) {
    if (read === undefined) {
      read = !this.selectedClient.get('read');
    }
    this.selectedClient.set('read', read);
    var key = this.selectedClient.get('clientId');
    store.toggleRead(key, read);
  },

  // Toggles or sets the starred status with an optional boolean
  toggleStar: function(star) {
    if (star === undefined) {
      star = !this.selectedClient.get('starred');
    }
    this.selectedClient.set('starred', star);
    var key = this.selectedClient.get('clientId');
    store.toggleStar(key, star);
  },

  // Selects the next item in the item controller
  next: function() {
    // Get's the current index in case we've changed the list of items, if the
    // item is no longer visible, it will return -1.
    var currentIndex = DesignAdmin.clientsController.content.indexOf(this.get('selectedClient'));
    // Figure out the next item by adding 1, which will put it at the start
    // of the newly selected items if they've changed.
    var nextItem = DesignAdmin.clientsController.content[currentIndex + 1];
    if (nextItem) {
      this.select(nextItem);
    }
  },

  // Selects the previous item in the item controller
  prev: function() {
    // Get's the current index in case we've changed the list of items, if the
    // item is no longer visible, it will return -1.
    var currentIndex = DesignAdmin.clientsController.content.indexOf(this.get('selectedClient'));
    // Figure out the previous item by subtracting 1, which will result in an
    // item not found if we're already at 0
    var prevItem = DesignAdmin.clientsController.content[currentIndex - 1];
    if (prevItem) {
      this.select(prevItem);
    }
  }
});


// A special observer that will watch for when the 'selectedClient' is updated
// and ensure that we scroll into a view so that the selected item is visible
// in the summary list view.
DesignAdmin.selectedClientController.addObserver('selectedClient', function() {
  var curScrollPos = $('.summaries').scrollTop();
  var itemTop = $('.summary.active').offset().top - 60;
  $(".summaries").animate({"scrollTop": curScrollPos + itemTop}, 200);
});

// View for the ItemsList
DesignAdmin.SummaryListView = Em.View.extend({
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
    // Figure out what the user just clicked on, then set selectedClientController
    var content = this.get('content');
    DesignAdmin.selectedClientController.select(content);
  },

  // Enables/Disables the active CSS class
  active: function() {
    var selectedClient = DesignAdmin.selectedClientController.get('selectedClient');
    var content = this.get('content');
    if (content === selectedClient) {
      return true;
    }
  }.property('DesignAdmin.selectedClientController.selectedClient'),

  // Enables/Disables the read CSS class
  read: function() {
    var read = this.get('content').get('read');
    return read;
  }.property('DesignAdmin.clientsController.@each.read'),

  // Returns the date in a human readable format
  formattedDate: function() {
    var d = this.get('content').get('pub_date');
    return moment(d).fromNow();
  }.property('DesignAdmin.selectedClientController.selectedClient')
});
