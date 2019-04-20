import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-picker'
import * as Progress from 'react-native-progress'
import sha1 from 'sha1'
import request from '../../api/request'
import config from '../../api/config'
import Login from '../login/login'
import CommonHeader from '../commonHeader/commonHeader'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ImageBackground,
  AsyncStorage,
  Alert,
  Dimensions
} from 'react-native';
const width = Dimensions.get('window').width
const ImagePickerOptions = {
  title: '',
  cancelButtonTitle: '取消',
  takePhotoButtonTitle: '拍照',
  chooseFromLibraryButtonTitle: '选择照片',
  allowsEditing: true,
  noData: false,
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
}
const CloudinaryOption = {
  baseUrl: 'http://res.cloudinary.com/yukiii',
  secureUrl: 'https://res.cloudinary.com/yukiii',
  ApiBaseUrl: 'https://api.cloudinary.com/v1_1/yukiii',
  imageUrl: 'https://api.cloudinary.com/v1_1/yukiii/image/upload',
  cloud_name: 'yukiii',
  api_key: '169617237948914', 
  api_secret: 'dDPQXMb-wNAgiBBmrxxozqT4Qng'
}
export default class Account extends Component {
  constructor(props) {
    super(props);
    this.state={
      avatarUploading: false,
      avatarProgress: 0,
      user: {},
      logined: true
    };
  }
  componentDidMount() {
    console.log(this.props.navigation.state)
    AsyncStorage.getItem('user')
      .then((data) => {
        if(data) {
          var user = JSON.parse(data)
          if(user && user.accessToken) {
            this.setState({
              user: user,
              logined: true
            })
          }
          else {
            this.setState({
              logined: false
            })
          }
        }
      })
      .catch((error) => {
        console.log(error)
      })
  }
  _getCloudinaryToken(type) {
    const timestamp = Date.now()
    const getSignUrl = config.api.base + config.api.signature
    var user = this.state.user
    var data
    var postBody = {
      accessToken: user.accessToken,
      type: type,
      timestamp: timestamp
    }

    return request.post(getSignUrl, postBody)
            .catch((e) => {
              console.log(e)
              if(type === 'avatar') {
                 Alert.alert('头像上传失败！')
               }else if(type === 'video') {
                Alert.alert('视频上传失败！')
               }           
            })
  }
  _pickPhoto() {
    if(this.state.avatarUploading) { return}
    ImagePicker.showImagePicker(ImagePickerOptions, (resp) => {
      if(resp.didCancel) {
        console.log('User cancelled image picker')
        return
      } else if(resp.error) {
        console.log('ImagePicker Error: ', resp.error)
        return
      } else {
        console.log(resp)
        var user = this.state.user
        var avatarData = 'data:image/jpeg;base64,' + resp.data

        var folder = 'avatar'
        var tags = 'app,avatar'
        var timestamp = Date.now()

        this._getCloudinaryToken('avatar')
          .then((data) => {
            if(data && data.success) {             

              var xhrBody = new FormData()
              var signature = data.data.token

              xhrBody.append('folder', folder)
              xhrBody.append('signature', signature)
              xhrBody.append('tags', tags)
              xhrBody.append('resource_type', 'image')
              xhrBody.append('file', avatarData)
              xhrBody.append('timestamp',timestamp)
              xhrBody.append('api_key', CloudinaryOption.api_key)

              this._upload(xhrBody)
            }
          })
      } 
    })
  }
  _avatar(public_id,version,type,resource_type) {
    if(public_id) {
      return CloudinaryOption.baseUrl + '/' + resource_type + '/' + type + '/v' + version + '/' + public_id + '.jpg'
    }
  }
  _upload(body) {
    const xhr = new XMLHttpRequest()
    const url = CloudinaryOption.imageUrl

    this.setState({
      avatarUploading: true,
      avatarProgress: 0
    })
    xhr.open('POST', url)
    xhr.onload = () => {
      if(xhr.status !== 200) {
        Alert.alert('请求失败 ') 
        console.log(xhr.responseText)
        return 
      }

      if(!xhr.responseText) {
        Alert.alert('请求失败') 
        return 
      }

      var response 
      try {
        response = JSON.parse(xhr.responseText)
      }catch (e) {
        console.log(e)
        console.log(' xhr response parse fail')
      }

      if(response && response.public_id) {
        var user = this.state.user

        user.avatar = this._avatar(response.public_id,response.version, response.type, response.resource_type)
        this.setState({
          user: user,
          avatarUploading: false,
          avatarProgress: 0
        })
        this._asyncUser(true)
      }
    }
    if(xhr.upload) {
      xhr.upload.onprogress = ((event) => {
        if(event.lengthComputable) {
          var progress = Number((event.loaded / event.total).toFixed(2))

          this.setState({
            avatarProgress: progress
          })
        }
      })
    }

    xhr.send(body)
  }
  _asyncUser(isAvatar) {
    const updateUrl = config.api.base + config.api.update
    const user = this.state.user
    const postBody = {
      accessToken: user.accessToken,
      user: user
    }

    request.post(updateUrl, postBody)
      .then((data) => {

        if(data && data.success) {
          if(isAvatar) {
            Alert.alert('头像更新成功')
          }
          const userData = data.data
          if(userData && userData.accessToken) {
            console.log(userData)
            this.setState({
              user: userData
            }, () => {
              AsyncStorage.setItem('user', JSON.stringify(userData))
            }) 
          }
        }
      })
  }
  _afterLogin(user) {
    var user = JSON.stringify(user)
    AsyncStorage.setItem('user', user)
      .then(() => {
        this.setState({
          user: user,
          logined: true
        })
        console.log(this.state.user)
      })
  }
  _toDetail(routeName) {
    console.log(this.props.navigation)
    console.log(routeName)
    this.props.navigation.navigate(routeName)
  }
  _logout() {
    AsyncStorage.setItem('user', '')
      .then(() => {
        console.log('logout')
        this.setState({
          user: {},
          logined: false
        })
        this.props.navigation.navigate('Login')
      })
  }
  render() {
    const user = this.state.user
    return (
      <View style={styles.container}>
        <CommonHeader title='我的账户' rightTitle='编辑' rightNavigation='UserEdit' navigation={this.props.navigation} /> 
        {
          user.avatar ?
            <ImageBackground source={{uri: user.avatar}} style={styles.avatarBackground} >
              <View style={styles.layer} >
                <TouchableOpacity style={styles.avatarBox} onPress={this._pickPhoto.bind(this)} >
                  {
                    this.state.avatarUploading ?
                      <Progress.Circle size={70}
                                       color='#800002'
                                       showsText={true}
                                       animated={true}
                                       progress={this.state.avatarProgress} />
                    : 
                      <Image source={{uri: user.avatar}}
                          style={styles.avatar} />
                  }
                </TouchableOpacity>
                <Text style={styles.avatarTip}>{user.nickname}</Text>
              </View>
            </ImageBackground>
          :
            <View style={styles.avatarContainer}>          
              <TouchableOpacity style={styles.avatarBox} onPress={this._pickPhoto.bind(this)}>
              {
                this.state.avatarUploading ? 
                  <Progress.Circle size={70}
                                   color='#800002'
                                   showsText={true}
                                   animated={true}
                                   progress={this.state.avatarProgress} />
                :
                  <Icon name='ios-add'
                    style={styles.uploadBtn} />
              }
              </TouchableOpacity>
              <Text style={styles.avatarTip} >上传头像</Text>
            </View>
        }
        <TouchableOpacity style={styles.btnBox} onPress={() => {this._toDetail('MyVideo')}} >
          <Text style={styles.btnText} >我的发布</Text>
          <Icon name='ios-arrow-forward' size={28} style={styles.btnRightIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutBox} onPress={this._logout.bind(this)} >
          <Text style={styles.logoutText} >注销</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF'
  },
  avatarContainer: {
    width: width,
    height: 140,
    backgroundColor: '#E6E6E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  avatarBackground: {
    width: width,
    height: 140,
    marginBottom: 20
  },
  layer: {
    width: width,
    height: 140,
    backgroundColor: 'rgba(0,0,0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarTip: {
    padding: 5,
    color: '#999',
    fontSize: 20,
    fontWeight: '600'
  },
  avatarBox: {
    marginTop: 10,
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    resizeMode: 'cover'
  }, 
  uploadBtn: {
    fontSize: 60,
    backgroundColor: 'transparent',
    color: '#333',
    borderRadius: 15
  },
  btnBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: width,
    height: 40,
    paddingLeft: 20,
    paddingRight: 20,
    borderBottomWidth: 1,
    borderColor: '#999',
    marginBottom: 15
  },
  btnText: {
    fontSize: 20,
    color: '#333'
  },
  btnRightIcon: {
    color: '#666'
  },
  logoutBox: {
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 10   
  },
  logoutText: {
    backgroundColor: '#800002',
    textAlign: 'center',
    height: 40,
    lineHeight: 40, 
    fontSize: 20,
    color: '#fff',
    borderRadius: 8
  }
});
