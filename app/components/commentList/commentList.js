import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
// import Buttons from 'react-native-button'
import request from '../../api/request';
import config from '../../api/config'
import {
  StyleSheet,
  Text,
  Platform,
  Image,
  ImageBackground,
  TouchableHighlight,
  TouchableOpacity,
  ActivityIndicator,
  AsyncStorage,
  View,
  TextInput,
  ListView,
  Button,
  Modal,
  Alert,
  Dimensions
} from 'react-native';
const width = Dimensions.get('window').width
var cached = {
  page: 1,
  perpage: 10,
  hasMore: true,
  list: [],
  isLoadingTail:false,
  totalnum: 0
}
let btnColor = Platform.OS === 'ios' ? '#fff' : '#800002'
export default class CommentList extends Component {
  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state={
      dataSource: ds.cloneWithRows([]),
      isRefreshing: false,
      isLoadingTail:false,
      data: this.props.data,
      user: {},
      modalVisible: false,
      isSending: false,
      content: ''
    }
  }
  componentDidMount() {
    AsyncStorage.getItem('user')
      .then((data) => {
        if(data) {
          var user = JSON.parse(data)
          if(user && user.accessToken) {
            this.setState({
              user:user
            },() => {
              this._getCommentList()
            })
          }
        }
      })
  }
  _getCommentList() {
    if(this.state.isRefreshing) {
      return
    }
    cached.page = 1
    this.setState({
      isRefreshing: true
    })
    request.get(config.api.base+config.api.comments, {
      accessToken: this.state.user.accessToken,
      page: cached.page,
      creationId: this.state.data._id
    })
      .then((data) => {
        if(data && data.success) {
          console.log(data)
          cached.list = data.data
          cached.totalnum = data.total
          this.setState({
            dataSource: this.state.dataSource.cloneWithRows(cached.list),
            isRefreshing: false
          })
        }
      })
      .catch((error) => {
        console.warn('error '+error)
      })
  }
  _fetchMoreData() {
    if(!this._checkMore() || this.state.isLoadingTail){return}
    cached.page++
    this.setState({
      isLoadingTail: true
    })

    request.get(config.api.base + config.api.comments, {
      accessToken: this.state.user.accessToken,
      creationId: this.state.data._id,
      page: cached.page
    })
      .then((data) => {
        if(data && data.success) {
          cached.list = cached.list.concat(data.data)
          cached.totalnum = data.total
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
    if(cached.page * cached.perpage > cached.totalnum) {
      return false
    }
    else {return true}
  }
  _setModalVisible(bool) {
    this.setState({
      modalVisible: bool
    })
  }
  _submit() {
    if(this.state.isSending) {
      Alert.alert('评论正在发送中')
      return 
    }
    if(this.state.content === '') {
      Alert.alert('评论不能为空')
      return
    }
    this.setState({
      isSending: true
    }, () => {
      const url = config.api.base + config.api.comments
      const body = {
        accessToken: this.state.user.accessToken,
        comment:{
          creation: this.state.data._id,
          content: this.state.content
        }
      }
      console.log(this.state.data)
      request.post(url,body)
        .then((data) => {
          if(data && data.success) {
            console.log(data)
            var content = this.state.content
            let item ={
              replyBy: this.state.user,
              content: content
            }
            let items = [item].concat(cached.list)
            cached.list = items
            cached.totalnum += 1

            this.setState({
              content: '',
              dataSource: this.state.dataSource.cloneWithRows(items),
              isSending: false,
              modalVisible: false
            })
          }
        })
        .catch((err) => {
          console.log(err)
          this.setState({
            isSending: false,
            modalVisible: false
          })
        })
    })
    
  }
  _renderRow(row) {
    return (      
      <View key={row.replyBy._id} style={styles.commentWrapper} >
        <Image source={{uri:row.replyBy.avatar}}
               style={styles.commentAvatar} ></Image>
        <View style={styles.commentBox} >
          <Text style={styles.commentReplyNickname} >{row.replyBy.nickname}</Text>
          <Text style={styles.commentContent} >{row.content}</Text>
        </View>
      </View>
    )
  }
  _renderHeader() {
    const data = this.state.data
    console.log(data)
    return (
      <View style={styles.headerWrapper} > 
        <View key={data.author._id} style={styles.infoBox} >
          <Image source={{uri:data.author.avatar}}
                 style={styles.authorAvatar} ></Image>
          <View style={styles.descBox} >
            <Text style={styles.authorNickname} >{data.author.nickname}</Text>
            <Text style={styles.videoTitle} >{data.title}</Text>
          </View>
        </View>
        <View style={styles.txtWrapper} >
          <Text style={styles.txt} > 评论列表</Text>
        </View>
      </View>
    )
  }
  _renderFooter() { 
    if(!this._checkMore()) {
      return (
        <View style={styles.loadingMore}><Text style={styles.loadingText}>没有更多了</Text></View>
      )
    }
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator 
            style={styles.loadingMore}
            size = "small"
        /><Text style={styles.loadingText}>加载中，请稍后</Text>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container} >
        <ListView 
            style={styles.listView}
            dataSource={this.state.dataSource}
            renderRow={this._renderRow.bind(this)}
            enableEmptySections = {true}
            automaticallyAdjustContentInsets= {false}
            onEndReached={this._fetchMoreData.bind(this)}
            onEndReachedThreshold= {28}
            renderHeader={this._renderHeader.bind(this)}
            renderFooter={this._renderFooter.bind(this)}
            showsVerticalScrollIndicator = {false}
        /> 
        <View style={styles.commentsBox} >
          <TextInput  ref='remarkInput'
                      style={styles.remarks}
                      multiline={false}
                      underlineColorAndroid='transparent'
                      placeholder='你有什么精彩意见？'
                      defaultValue={this.state.content}
                      onChangeText={(text) => {
                        this.setState({
                          content: text
                        })
                      }} />
          <View style={styles.submitBtnWrapper} >
            <Button ref='submitBtn' 
                  color={btnColor}
                  title='评论' 
                  disabled={this.state.isSending} 
                  onPress={this._submit.bind(this)} />
          </View>         
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  listView: {
    marginBottom: 60
  },
  loadingContainer: {
    height: 100,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  txtWrapper: {
    margin: 5,
    padding: 5,
    backgroundColor: '#eee'
  },
  txt: {
    fontSize: 20,
    color: '#333'
  },
  commentsBox: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    width: width,
    height: 60,
    backgroundColor: '#333',
    overflow: 'hidden'
  },
  remarks: {
    width: width * 0.6,
    height: 36,
    fontSize: 14,
    color: '#333',
    paddingLeft: 5,
    paddingRight: 10,
    paddingVertical:0,
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 6,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        lineHeight: 36
      },
      android: {
        textAlignVertical: 'center'
      }
    })
  },
  submitBtnWrapper: {
    width: 60,
    height: 36,
    backgroundColor: '#800002',
    borderRadius: 4,
    overflow: 'hidden'
  },
  loadingMore: {
    margin: 5
  },
  loadingText: {
    color: '#ccc',
    textAlign: 'center',
    fontSize: 16,
    flex: 1
  },
  infoBox: {
    width: width,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    padding: 8
  },
  descBox: {
    flex: 1
  },
  authorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15
  },
  authorNickname: {
    fontSize: 18
  },
  videoTitle: {
    fontSize: 16,
    marginTop: 8,
    color: '#333'
  },
  commentWrapper: {
    width: width,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    paddingLeft: 15,
    paddingRight: 15
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 5
  },
  commentBox: {
    flex: 1
  },
  commentReplyNickname: {
    fontSize: 16
  },
  commentContent: {
    fontSize: 14,
    marginTop: 6,
    color: '#333'
  }
});
