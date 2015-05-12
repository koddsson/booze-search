/* jshint esnext: true */
  
'use strict';

class BoozeManager {
  constructor(data) {
    console.log('Got data');
    this.data = data;
  }

  filter(searchTerm) {
    console.log('Filtering by ' + searchTerm);
    if (searchTerm === '') {
      return this.data;
    } else {
      return this.data.filter(function(item) {
        return item.title.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1;
      });
    }
  }
}

var manager;

(function() {
  var doc = document.currentScript.ownerDocument;
  var boozePrototype = Object.create(HTMLElement.prototype);

  var display_data = function(data, shadow) {
    data.forEach(function(item) {
      let row = document.createElement('a');
      row.innerHTML = item.title;
      row.setAttribute('href', item.link);
      row.classList.add('row');
      shadow.querySelector('.data').appendChild(row);
    });
  };

  boozePrototype.createdCallback = function() {
    var template = doc.querySelector('#booze-template');
    var usr = template.content.cloneNode(true);
    this.shadow = this.createShadowRoot();
    this.shadow.appendChild(usr);
  
    this.shadow.querySelector('.search').addEventListener('keyup', function(event) {
      console.log('Firing event');
      this.shadow.querySelector('.data').innerHTML = '';
      if (manager) {
        display_data(manager.filter(event.path[0].value), this.shadow);
      }
    }.bind(this));
  };

  boozePrototype.attachedCallback = function() {
    fetch('http://tldr.is/vinbud.json')
      .then(function(response) {
        return response.json();
      }).then(function(json) {
        manager = new BoozeManager(json);
        display_data(json, this.shadow);
      }.bind(this)).catch(function(ex) {
        console.log(ex);
        this.shadow.querySelector('.error').textContent = 'Something went wrong';
      }.bind(this));
  };

  // Register our newly created lottery element.
  var booze = doc.registerElement(
    'booze-table', {'prototype': boozePrototype}
  );
})();
