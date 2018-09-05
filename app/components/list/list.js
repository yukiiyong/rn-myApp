
import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import request from '../../api/request';
import config from '../../api/config'
import VideoItem from './videoItem'
import CommonHeader from '../commonHeader/commonHeader'

import {
  StyleSheet,
  Text,
  View,
  ListView,
  ActivityIndicator,
  RefreshControl,
  AsyncStorage,
  Alert,
  Dimensions
} from 'react-native';
const width = Dimensions.get('window').width
var cached = {
  page: 1,
  perpage: 10,
  list: [],
  totalnum: 0
}
export default class List extends Component {
  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state={
      dataSource: ds.cloneWithRows([]),
      isLoadingTail:false,
      user: {},
      isRefreshing: false
    };
  }
  componentDidMount() {
    AsyncStorage.getItem('user')
      .then((data) => {
        const user = JSON.parse(data)
        if(user && user.accessToken) {
          this.setState({
            user: user
          },() => {
            this._getVideoList();           
          })
        }
      })
  }
  _getVideoList() {
    if(this.state.refreshing) {return }
    cached.page = 1
    this.setState({
      isRefreshing: true
    })
    request.get(config.api.base+config.api.creations, {
      accessToken: this.state.user.accessToken,
      page: cached.page
    })
      .then((data) => {
        console.log(data)
        if(data && data.success) {
          cached.totalnum = parseInt(data.total) || 0

          if(cached.totalnum === 0) {
            cached.list = []            
          } else {
            cached.list = data.data
          }
          this.setState({
            dataSource: this.state.dataSource.cloneWithRows(cached.list),
            isRefreshing: false
          })
        }

      })
      .catch((error) => {
        console.warn('error '+error)
        this.setState({
          isRefreshing: false
        }, () => {
          Alert.alert('没有数据')
        })
      })
  }
  _fetchMoreData() {
    if(!this._checkMore() || this.state.isLoadingTail){return}
    cached.page++
    this.setState({
      isLoadingTail: true
    })

    request.get(config.api.base + config.api.creations, {
      accessToken: this.state.user.accessToken,
      page: cached.page
    })
      .then(data => {
        console.log(data)
        if(data && data.success) {
          cached.totalnum = parseInt(data.total) || 0

          if(cached.totalnum === 0) {
            cached.list = []            
          } else {
            cached.list = cached.list.concat(data.data)
          }
          this.setState({
            dataSource: this.state.dataSource.cloneWithRows(cached.list),
            isLoadingTail: false
          })
        }
      })
      .catch((error) => {
        console.log('error'+error)
      })

  }
  _checkMore(data) {
    // console.log(cached)
    if(cached.totalnum === 0) {
      return false
    }
    if(cached.page * cached.perpage > cached.totalnum) {
      return false
    }
    else {return true}
  }
  _toDetail(row) {
    this.props.navigation.navigate('VideoDetail', {data: row})
  }
  _renderRow(row) {
    return <VideoItem row={row} user={this.state.user} key={row._id} onSelect={() => {this._toDetail(row)}} />
  }
  _renderFooter() { 
    if(!this._checkMore() && !this.state.isRefreshing) {
      return (
        <View style={styles.loadingMore}><Text style={styles.loadingText}>没有更多了</Text></View>
      )
    }
    else if(this.state.isRefreshing) {return}
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator 
            style={styles.loadingMore}
            size = "small"
        />
        <Text style={styles.loadingText}>加载中，请稍后</Text>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <CommonHeader title='视频列表页' /> 
        <ListView 
            dataSource={this.state.dataSource}
            renderRow={this._renderRow.bind(this)}
            enableEmptySections = {true}
            automaticallyAdjustContentInsets= {false}
            onEndReached={this._fetchMoreData.bind(this)}
            onEndReachedThreshold= {28}
            renderFooter={this._renderFooter.bind(this)}
            showsVerticalScrollIndicator = {false}
            refreshControl={
              <RefreshControl
                refreshing={this.state.isRefreshing}
                onRefresh={this._getVideoList.bind(this)}
                tintColor="#800002"
                title="加载中..." 
              />
            }
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  loadingContainer: {
    width: width,
    height: 100,
    paddingLeft: width*0.2,
    paddingRight: width * 0.2,
    paddingBottom: 40,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  loadingMore: {
    marginRight: 10,
    width: 40,
    height: 40
  },
  loadingText: {
    color: '#ccc',
    height: 40,
    lineHeight: 40,
    textAlign: 'center',
    fontSize: 16,
    flex: 1
  }
});
