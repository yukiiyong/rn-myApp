import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import config from '../../api/config'
import request from '../../api/request'
import {
  StyleSheet,
  Text,
  Platform,
  Image,
  ImageBackground,
  TouchableHighlight,
  View,
  ListView,
  AppRegistry,
  Dimensions
} from 'react-native';
const width = Dimensions.get('window').width;

export default class VideoItem extends Component {
  constructor(props) {
    super(props)
    this.state = {
      row: this.props.row,
      user: this.props.user,
      isFavorite: false
    }
  }
  componentWillMount() {
    let isFavorite = this.state.row.favorite.indexOf(this.state.user._id) === -1 ? false : true
    this.setState({
      isFavorite: isFavorite
    })
  }
  toggleFavorite() {
    const row = this.state.row
    const votesUrl = config.api.base + config.api.votes
    isFavorite = !this.state.isFavorite
    const user = this.state.user

    const body = {
      accessToken: user.accessToken,
      id: row._id,
      favorite: isFavorite
    }
    request.post(votesUrl, body)
      .then((data) => {
        if(data && data.success) {
          this.setState({
            row: data.data,
            isFavorite: isFavorite
          })      
        }
      }).catch((err) => {
        console.log(err)
      })
  }

  render() {
    const row = this.state.row
    
    return (
      <TouchableHighlight onPress={this.props.onSelect.bind(this)} >
        <View style={styles.item}>
          <View style={styles.infoBox} >
            <Image source={{uri: row.author.avatar}} 
                    style={styles.authorAvatar} ></Image>
            <Text style={styles.authorName} >{row.author.nickname}</Text>
          </View>
          <Text style={styles.title}>{row.title}</Text>
          <View style={styles.imageWrapper}>
            <Image
              source={{uri: row.cloudinary_thumb}}
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
                name={this.state.isFavorite ? 'ios-heart' : 'ios-heart-outline'}
                size={28}
                style={[styles.handleIcon, this.state.isFavorite ? styles.isFavorite : null]} 
                onPress={() => {this.toggleFavorite()}}
              />
              <Text style={styles.handleText}>喜欢{row.favorite_total}</Text>
            </View>
            <View style={styles.handleBox}>
              <MaterialIcons
                name='comment-processing-outline'
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
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 40,
    width: width,
    paddingLeft: 10,
    paddingRight: 10,
    borderBottomWidth: 1,
    borderColor: '#E6E6E6'
  },
  authorAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    marginRight: 10
  },
  authorName: {
    flex: 1,
    color: '#000',
    fontSize: 16,
    fontWeight: '600'
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
    color: '#fff',
    borderColor: '#fff',
    borderWidth: 1,
    backgroundColor: 'transparent',
    textAlign: 'center',
    ...Platform.select({
      ios: {
        lineHeight: 46, //lineHeight在android不生效
      },
      android: {
        textAlignVertical: 'center',  //此属性ios不生效
      }
    })
  },
  title: {
    fontSize: 18,
    color: '#333',
    height: 26,
    lineHeight: 26,
    paddingLeft: 16
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