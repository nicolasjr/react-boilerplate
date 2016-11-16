require('babel-register')();

const jsdom = require('jsdom').jsdom;
const chai = require('chai');
const chaiEnzyme = require('chai-enzyme');

chai.use(chaiEnzyme());

const exposedProperties = ['window', 'navigator', 'document'];

global.document = jsdom('');
global.window = document.defaultView;
Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});

global.navigator = {
  userAgent: 'node.js',
};

documentRef = document;
