
// View for the Selected Item
DesignAdmin.EntryItemView = Em.View.extend({
  tagName: 'article',

  contentBinding: 'DesignAdmin.selectedClientController.selectedClient',

  classNames: ['well', 'entry'],

  classNameBindings: ['active', 'read', 'prev', 'next'],

  // Enables/Disables the active CSS class
  active: function() {
    return true;
  }.property('DesignAdmin.selectedClientController.selectedClient'),

  // Enables/Disables the read CSS class
  read: function() {
    var read = this.get('content').get('read');
    return read;
  }.property('DesignAdmin.clientsController.@each.read'),

  // Returns a human readable date
  formattedDate: function() {
    var d = this.get('content').get('pub_date');
    return moment(d).format("MMMM Do YYYY, h:mm a");
  }.property('DesignAdmin.selectedClientController.selectedClient')
});


// Top Menu/Nav Bar view
DesignAdmin.NavBarView = Em.View.extend({
  // A 'property' that returns the count of items
  clientCount: function() {
    return DesignAdmin.dataController.get('clientCount');
  }.property('DesignAdmin.dataController.clientCount'),

  // A 'property' that returns the count of unread items
  unreadCount: function() {
    return DesignAdmin.dataController.get('unreadCount');
  }.property('DesignAdmin.dataController.unreadCount'),

  // A 'property' that returns the count of starred items
  starredCount: function() {
    return DesignAdmin.dataController.get('starredCount');
  }.property('DesignAdmin.dataController.starredCount'),

  // A 'property' that returns the count of read items
  readCount: function() {
    return DesignAdmin.dataController.get('readCount');
  }.property('DesignAdmin.dataController.readCount'),

  // Click handler for menu bar
  showAll: function() {
    DesignAdmin.clientsController.clearFilter();
  },

  // Click handler for menu bar
  showUnread: function() {
    DesignAdmin.clientsController.filterBy('read', false);
  },

  // Click handler for menu bar
  showStarred: function() {
    DesignAdmin.clientsController.filterBy('starred', true);
  },

  // Click handler for menu bar
  showRead: function() {
    DesignAdmin.clientsController.filterBy('read', true);
  },

  // Click handler for menu bar
  refresh: function() {
    DesignAdmin.GetItemsFromServer();
  }
});

// Left hand controls view
DesignAdmin.NavControlsView = Em.View.extend({
  tagName: 'section',

  classNames: ['controls'],

  classNameBindings: ['hide'],

  hide: function() {
    return false;
  }.property('DesignAdmin.settingsController.tabletControls'),

  // Click handler for up/previous button
  navUp: function(event) {
    DesignAdmin.selectedClientController.prev();
  },

  // Click handler for down/next button
  navDown: function(event) {
    DesignAdmin.selectedClientController.next();
  },

  // Click handler to toggle the selected items star status
  toggleStar: function(event) {
    DesignAdmin.selectedClientController.toggleStar();
  },

  // Click handler to toggle the selected items read status
  toggleRead: function(event) {
    DesignAdmin.selectedClientController.toggleRead();
  },

  // Click handler to mark all as read
  markAllRead: function(event) {
    DesignAdmin.clientsController.markAllRead();
  },

  // Click handler for refresh
  refresh: function(event) {
    DesignAdmin.GetItemsFromServer();
  },


  starClass: function() {
    var selectedClient = DesignAdmin.selectedClientController.get('selectedClient');
    if (selectedClient) {
      if (selectedClient.get('starred')) {
        return 'icon-star';
      }
    }
    return 'icon-star-empty';
  }.property('DesignAdmin.selectedClientController.selectedClient.starred'),
  readClass: function() {
    var selectedClient = DesignAdmin.selectedClientController.get('selectedClient');
    if (selectedClient) {
      if (selectedClient.get('read')) {
        return 'icon-ok-sign';
      }
    }
    return 'icon-ok-circle';
  }.property('DesignAdmin.selectedClientController.selectedClient.read'),
  nextDisabled: function() {
    return !DesignAdmin.selectedClientController.get('hasNext');
  }.property('DesignAdmin.selectedClientController.selectedClient.next'),
  prevDisabled: function() {
    return !DesignAdmin.selectedClientController.get('hasPrev');
  }.property('DesignAdmin.selectedClientController.selectedClient.prev'),
  buttonDisabled: function() {
    var selectedClient = DesignAdmin.selectedClientController.get('selectedClient');
    if (selectedClient) {
      return false;
    }
    return true;
  }.property('DesignAdmin.selectedClientController.selectedClient')
});
