import React, { Component } from 'react';
import List from '../list/list'
import Edit from '../edit/edit'
import Account from '../account/account'
import Login from '../login/login'
import UserEdit from '../account/userEdit'
import Record from '../edit/record'
import MyVideo from '../account/myVideo'
import VideoDetail from '../videoDetail/videoDetail'
import {TabNavigator,StackNavigator,TabBarBottom} from 'react-navigation'
// import MyTabNavigator from './myTabNavigator'
import Icon from 'react-native-vector-icons/Ionicons'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native';

const NavigationOptions = {
  header: null,
  headerTintColor: '#800002',
  headerBackTitle: null,
  headerLeft: null,
  headerStyle: {
    backgroundColor: '#FCFFFF'
  },
  headerBackTitleStyle: {
    fontSize: 16,
    color: '#7F7F7F' 
  }
}
export const MyTabNavigators = TabNavigator({
    ListTab: {
      screen: List,
      navigationOptions: ({navigation}) => ({
        tabBarIcon: ({focused, tintColor}) => {
          const iconName = focused ? 'ios-home' : 'ios-home-outline'
          return (<Icon name={iconName} size={28} style={[styles.tabIcon,{color: tintColor}]} />)
        }
      })
    }, 
    EditTab: {
      screen: Edit,
      navigationOptions: ({navigation}) => ({
        tabBarIcon: ({focused, tintColor}) => {
          const iconName = focused ? 'ios-add-circle' : 'ios-add-circle-outline'
          return (<Icon name={iconName} size={36} style={[styles.tabIcon,{color: tintColor}]} />)
        }
        
      })
    },
    AccountTab: {
      screen: Account,
      navigationOptions: ({navigation}) => ({
        tabBarIcon: ({focused, tintColor}) => {
          const iconName = focused ? 'ios-person' : 'ios-person-outline'
          return (<Icon name={iconName} size={28} style={[styles.tabIcon, {color: tintColor}]} />)
        }
      })
    }
  },
  {
    // tabBarComponent: TabBarBottom,
    animationEnabled: false,
    tabBarPosition: 'bottom',
    swipeEnabled: false,
    lazy: true,
    backBehavior: 'none',
    tabBarOptions: {
      activeTintColor: '#800002',
      inactiveTintColor: '#666',
      showLabel: false,
      showIcon: true,
      style: {
        backgroundColor: '#fff'
      }
    }
  }
)
export const MyStackNavigators = StackNavigator(
  {
    MyTabNavigators: {
      screen: MyTabNavigators
    },
    
    VideoDetail: {
      screen: VideoDetail,
    },
    
    UserEdit: {
      screen: UserEdit,
    },
    Login: {
      screen: Login,
    },
    MyVideo: {
      screen: MyVideo,
    }
  },
  {
    navigationOptions: NavigationOptions
  }
)

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 30
  }
})