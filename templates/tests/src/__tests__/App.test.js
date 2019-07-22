import React from 'react';
import {shallow} from 'enzyme';
import App from '../app/App';

describe('App', () => {
    let props = {};
    let shallowedWrapper;
    let wrapper = () => {
        if(!shallowedWrapper) {
            shallowedWrapper = shallow(<App {...props}/>);
        }
        return shallowedWrapper;
    };

    beforeEach(() => {
        props = {
            
        };
        shallowedWrapper = undefined;
    });
    
    it('should render app', () => {
        expect(wrapper()).toMatchSnapshot();
    });
});