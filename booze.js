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
      let row = document.createElement('div');
      
      let title = document.createElement('a');
      title.setAttribute('href', item.link);
      title.innerHTML = item.title;
      title.classList.add('title');
     
      let price = document.createElement('span');
      price.innerHTML = item.price;
      price.classList.add('price');
      
      let weight = document.createElement('span'); 
      weight.innerHTML = item.weight;
      weight.classList.add('weight');
     
      row.appendChild(title); 
      row.appendChild(price);
      row.appendChild(weight);
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
    fetch('http://beta.apis.is/vinbud/items/')
      .then(function(response) {
        return response.json();
      }).then(function(json) {
        manager = new BoozeManager(json);
        this.shadow.querySelector('.data').classList.remove('is-loading');
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
