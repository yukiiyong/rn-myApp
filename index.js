/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';

import {MyStackNavigators} from './app/components/navigators/navigators'
import {
  StyleSheet,
  Text,
  TabBarIOS,
  View,
  AsyncStorage,
  AppRegistry
} from 'react-native';


export default class myApp extends Component {
  constructor() {
    super();
    this.state = {
      selectedTab: 'list',
      user: {},
      logined: false
    };
  }
  componentDidMount() {
    this._asyncAppStatus()
  }
  _asyncAppStatus() {
    let newState = {}
    // const user1 = ''
    // AsyncStorage.setItem('user', user1)
    AsyncStorage.getItem('user')
        .then((data) => {
          const user = JSON.parse(data)
          if(user && user.accessToken) {
            newState = {
              user: user,
              logined: true,
            }
            this.setState(newState)
          }else {
            newState = {
              logined: false
            }
            this.setState(newState)
            this.refs.myStackNavigators._navigation.navigate('Login')
          }
        })
  }
  render() {
    return (
        <MyStackNavigators ref="myStackNavigators" />      
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  }
});

AppRegistry.registerComponent('myApp', () => myApp);