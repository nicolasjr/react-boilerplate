import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import App from '../src/App';

let wrapper;

describe('Test suite for App component', () => {
  beforeEach(() => {
    wrapper = shallow(
      <App />
    );
  });

  it('component should exist', () => {
    expect(wrapper).to.exist;
  });

  it('correctly creates a div', () => {
    expect(wrapper.type()).to.equal('div');
  });
});
