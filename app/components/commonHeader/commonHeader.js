import React, { Component} from 'react'
import Icon from 'react-native-vector-icons/Ionicons'

import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet
} from 'react-native'
const width = Dimensions.get('window').width
export default class CommonHeader extends Component {
  constructor(props) {
    super(props)
    this.state= {
      title: this.props.title,
      leftTitle: '',
      rightTitle: ''
    }
  }
  componentDidMount() {
    const leftTitle = this.props.leftTitle ? this.props.leftTitle : ''
    const rightTitle = this.props.rightTitle ? this.props.rightTitle : ''
    const rightNavigation = this.props.rightNavigation ? this.props.rightNavigation : ''
    
    this.setState({
      leftTitle: leftTitle,
      rightTitle: rightTitle,
      rightNavigation: rightNavigation
    })
  }
  render() {
    return (
      <View style={styles.commonHeader} >
        
        <Text style={styles.commonTitle} >{this.state.title}</Text>
        {
          this.state.leftTitle === '' ? 
            null
          : 
            <TouchableOpacity style={[styles.naviWrapper, styles.naviLeft]} onPress={() => this.props.navigation.goBack()} title='back' >
              <Icon style={styles.naviLeftIcon} name='ios-arrow-back' size={28}/>
              <Text style={styles.naviLeftText}>{this.state.leftTitle}</Text>
            </TouchableOpacity>
        }
        {
          this.state.rightTitle === '' ? 
            null
          : 
            <TouchableOpacity style={[styles.naviWrapper, styles.naviRight]} onPress={() => this.props.navigation.navigate(this.state.rightNavigation)} title='to' >
              <Text style={styles.naviRightText}>{this.state.rightTitle}</Text>
            </TouchableOpacity>
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  commonHeader: {
    position: 'relative',
    width: width,
    height: 60,
    borderBottomWidth: 1,
    borderColor: '#999',
    paddingTop: 30 
  },
  commonTitle: {
    flex: 1,
    color: '#800002',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600'
  },
  naviWrapper:{
    position: 'absolute',
    flexDirection: 'row',
    alignItems:'center'
  },
  naviLeft: {
    left: 5,
    top: 30
  },
  naviRight: {
    right: 5,
    top: 30
  },
  naviLeftIcon: {
    fontSize: 26,
    color: '#7F7F7F',
    fontWeight: '500'
  },
  naviLeftText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#7F7F7F' 
  },
  naviRightIcon: {
    fontSize: 20,
    color: '#7f7f7f'
  },
  naviRightText: {
    fontSize: 16,
    marginRight: 5,
    color: '#7f7f7f'
  }
})