import React, {Component} from 'react'
import {
  View,
  StyleSheet,
  AsyncStorage,
  Button,
  ListView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Text,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import request from '../../api/request'
import config from '../../api/config'
import CommonHeader from '../commonHeader/commonHeader'

const cached = {
  page: 1,
  perpage: 15,
  list: [],
  total: 0
}
const width = Dimensions.get('window').width
export default class MyVideo extends Component {
  constructor(props) {
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => {r1 !== r2}});
    super(props);

    this.state = {
      user: {},
      dataSource: ds.cloneWithRows([]),
      isLoadingTail: false,
      isRefreshing: false
    };
  }
  componentDidMount() {
    AsyncStorage.getItem('user')
      .then(data => {
        const user = JSON.parse(data)

        if(user && user.accessToken) {
          if(!user.age || user.age === 'undefined') {
            user.age = 0
          }
          if(!user.gender || user.gender === 'undefined') {
            user.gender === 'male'
          }
          this.setState({
            user: user
          },() => {
            this._getList()
          })
        }
      })
  }
  _getList() {
    if(this.state.isRefreshing) {return }
    cached.page = 1
    this.setState({
      isRefreshing: true
    })
    request.get(config.api.base + config.api.creationsByName, {
      accessToken: this.state.user.accessToken,
      author: this.state.user._id,
      page: cached.page
    }).then((data) => {
      console.log(data)
      if(data && data.success) {
        cached.total = parseInt(data.total) || 0
        if(cached.total === 0) {
          cached.list = []
        } else {
          cached.list = data.data
        }
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(cached.list),
          isRefreshing: false
        })
      }
    }).catch((err) => {
      console.warn('getList error',err)
      this.setState({
        isRefreshing: false
      },() => {
        Alert.alert('no data')
      })
    })
  }
  _fetchMoreData() {
    if(!this._checkMore() || this.state.isLoadingTail) {return}
    cached.page++
    this.setState({
      isLoadingTail: true
    })

    request.get(config.api.base + config.api.creationsByName, {
      accessToken: this.state.user.accessToken,
      author: this.state.user._id,
      page: cached.page
    })
      .then(data => {
        console.log(data)
        if(data && data.success) {
          cached.total = parseInt(data.total) || 0

          if(cached.total === 0) {
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
  _checkMore() {
    if(cached.total === 0) {
      return false
    }
    if(cached.page * cached.perpage > cached.total) {
      return false
    }
    return true
  }
  _toDetail(row) {
    this.props.navigation.navigate('VideoDetail', {data: row})
  }
  _renderRow(row) {
    return (
      <TouchableOpacity style={styles.listBox} onPress={() => {this._toDetail(row)}}>
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
      </TouchableOpacity>
    )
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
      <View style={styles.container} >
        <CommonHeader title='我的发布' leftTitle='返回' navigation={this.props.navigation} />
        <ListView dataSource={this.state.dataSource}
                  renderRow={this._renderRow.bind(this)}
                  enableEmptySections={true}
                  automaticallyAdjustContentInsets={false}
                  onEndReached={() => {this._fetchMoreData()}}
                  onEndReachedThreshold={28}
                  renderFooter={this._renderFooter.bind(this)}
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl refreshing={this.state.isRefreshing}
                                    onRefresh={this._getList.bind(this)}
                                    tintColor='#800002'
                                    title='加载中...'
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
    backgroundColor: '#E6E6E6'
  },
  listBox: {
    marginBottom: 8,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 20,
    color: '#000',
    height: 26,
    fontWeight: '600',
    lineHeight: 26,
    paddingLeft: 15
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
    color: '#E6E6E6',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 23,
    backgroundColor: 'rgba(0,0,0,0.3)',
    textAlign: 'center',
    lineHeight: 46,
    overflow: 'hidden'
  }
})