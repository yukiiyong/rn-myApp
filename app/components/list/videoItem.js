import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import config from '../../api/config'
import request from '../../api/request'
import {
  StyleSheet,
  Text,
  Image,
  ImageBackground,
  TouchableHighlight,
  View,
  ListView,
  AppRegistry,
  Dimensions
} from 'react-native';
const width = Dimensions.get('window').width;
let cached = {
  row: {}
}
export default class VideoItem extends Component {
  constructor(props) {
    super(props)
    this.state = {
      row: this.props.row,
      user: this.props.user
    }
  }

  toggleFavorite() {
    const row = this.state.row
    const votesUrl = config.api.base + config.api.votesUrl
    row.isFavorite = !row.isFavorite
    const body = {
      accessToken: this.state.user.accessToken,
      id: row._id,
      favorite: row.isFavorite
    }
    this.setState({
      row: row
    })
    console.log(this.state.row.isFavorite)
  }

  render() {
    let row = this.state.row
    console.log(row)
    return (
      <TouchableHighlight onPress={this.props.onSelect.bind(this)} >
        <View style={styles.item}>
          <Text style={styles.title}>{row.title}</Text>
          <View style={styles.imageWrapper}>
            <Image
              source={{uri: row.thumb}}
              style={styles.thumb} 
            ></Image>
            <Icon 
              name='ios-play'
              size={28}
              style={styles.play} />  
          </View>                
          <View style={styles.itemFooter}>
            <View style={styles.handleBox}>
              <Icon 
                name={row.isFavorite ? 'ios-heart' : 'ios-heart-outline'}
                size={28}
                style={[styles.handleIcon, row.isFavorite ? styles.isFavorite : null]} 
                onPress={this.toggleFavorite.bind(this)}
              />
              <Text style={styles.handleText}>喜欢</Text>
            </View>
            <View style={styles.handleBox}>
              <Icon 
                name='ios-chatboxes-outline'
                size={28}
                style={styles.handleIcon} />
              <Text style={styles.handleText}>评论</Text>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    )
  }
}

const styles = StyleSheet.create({
  item: {
    width:width,
    marginBottom: 10,
    backgroundColor: '#fff'
  },
  imageWrapper: {
    position: 'relative'
  },
  thumb: {
    width: width,
    height: width * 0.56,
    resizeMode: 'cover'
  },
  play: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    width: 46,
    height: 46,
    borderRadius: 23,
    color: '#800002',
    borderColor: '#fff',
    borderWidth: 1,
    backgroundColor: 'transparent',
    paddingTop: 9,
    paddingBottom: 18,
    textAlign: 'center'
  },
  title: {
    padding: 10,
    fontSize: 18,
    color: '#333'
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#eee'
  },
  handleBox: {
    padding: 10,
    flexDirection: 'row',
    width: width / 2 - 0.5,
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  handleText: {
    paddingLeft: 12,
    fontSize: 18,
    color: '#333'
  },
  handleIcon: {
    fontSize: 22,
    color: '#333'
  },
  isFavorite: {
    color: '#800002'
  }
});