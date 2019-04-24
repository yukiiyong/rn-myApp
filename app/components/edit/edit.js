
import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import VideoPicker from 'react-native-image-picker'
import _ from 'lodash'
import * as Progress from 'react-native-progress'
import {AudioRecorder, AudioUtils} from 'react-native-audio'
import Video from 'react-native-video'
import {CountDownText} from 'react-native-sk-countdown'
import CommonHeader from '../commonHeader/commonHeader'
import request from '../../api/request'
import config from '../../api/config'
import {
  StyleSheet,
  Text,
  Platform,
  TextInput,
  View,
  Dimensions,
  Alert,
  Button,
  Modal,
  AsyncStorage,
  TouchableOpacity
} from 'react-native';
const width = Dimensions.get('window').width
const height = Dimensions.get('window').height
let btnColor = Platform.OS === 'ios' ? '#fff' : '#800002'
const VideoPickerOptions = {
  title: '选择视频',
  cancelButtonTitle: '取消',
  takePhotoButtonTitle: '录视频',
  chooseFromLibraryButtonTitle: '选择视频',
  videoQuality: 'medium',
  mediaType: 'video',
  durationLimit: 10,
  noData: false,
  storageOptions: {
    skipBackup: true,
    path: 'videos'
  }
}
var submitInterval
const defaultState = {
  user: null,
  previewVideo: null,
  modalVisible: false,
  title: '',

  //video
  rate: 1,
  muted: true,
  resizeMode: 'contain',
  repeat: false,

  paused: false,
  loaded: false, 
  error: false,
  ended: false,

  //playing
  videoPlaying: false,
  currentTime: 0,
  totalTime: 0,
  videoProgress: 0,

  //videoUpload
  videoUploading: false,
  videoUploadProgress: 0.01,
  videoUploaded: false,

  //audio
  audioPath: AudioUtils.DocumentDirectoryPath + 'mine.aac',
  audioName: 'mine.aac',
  audioPlaying: false,
  counting: false,
  recording: false,
  recordingDone: false,

  //audio upload
  audioUploading: false,
  audioUploaded: false,
  audioUploadProgress: 0,

  //Id
  videoId: '',
  audioId: '',
  video: null,
  audio: null,

  willPublish: false,
  publishing: false,
  publishProgress: 0
}
export default class Edit extends Component {
  constructor() {
    super();
    const state = Object.assign({}, defaultState)

    this.state= state;
  }
  componentDidMount() {
    //配置react-native-audio
    let audioPath = this.state.audioPath
    AudioRecorder.prepareRecordingAtPath(audioPath, {
      Samplerate: 22050,
      Channels: 1,
      AudioQuality: 'Low',
      AudioEncoding: 'aac'
    })
    AsyncStorage.getItem('user')
        .then((data) => {
          if(data) {
            var user = JSON.parse(data)
            if(user && user.accessToken) {
              this.setState({
                user: user,
                audioPath: audioPath
              })
            }
          }
        })
  }
  _setModalVisible(visible) {
    this.setState({
      modalVisible: visible
    })
  }
  _toggleVideoPlaying(state) {
    let rate = state ?  1 : 0
    let paused = !state
    if(this.state.videoProgress === 1 && state) {
      this.refs.videoPlayer.seek(0)
      return
    }
    console.log('paused',paused)
    console.log('rate',rate)
    this.setState({
      rate: rate,
      paused: paused,
      videoPlaying: state
    })
  }
  _getToken(body) {
    //获取token，参数为body，后台判断获取七牛或cloudinary
    //cloudinary body 为accessToken,type,timestamp
    //qiniu body 为 accessToken type cloud
      const getSignUrl = config.api.base + config.api.signature
      return request.post(getSignUrl, body)
            .catch((e) => {
              console.log(e)
              if(body.type === 'avatar') {
                 Alert.alert('头像上传失败！')
               }else if(body.type === 'video') {
                Alert.alert('视频上传失败！')
               }           
            })
  }
  _uploadAudio() {
    const timestamp = Date.now()
    const body = {
      accessToken: this.state.user.accessToken,
      type: 'audio',
      timestamp: timestamp
    }
    this._getToken(body) 
      .then((data) => {
        console.log(data)
        if(data && data.success) {
          const token = data.data.token
          const key = data.data.key
          var xhrBody = new FormData()

          xhrBody.append('signature', token)
          xhrBody.append('folder', 'audio')
          xhrBody.append('tags', 'app,audio')
          xhrBody.append('timestamp', timestamp)
          xhrBody.append('resource_type', 'video')
          xhrBody.append('api_key', config.cloudinary.api_key)
          xhrBody.append('file', {
            type: 'video/mp4',
            uri: this.state.audioPath,
            name: key
          })

          this._upload(xhrBody, 'audio')
        }
      })
  }
  _pickVideo() {
    VideoPicker.showImagePicker(VideoPickerOptions, (resp) => {
      if(resp.didCancel) {
         console.log('User cancelled image picker')
         return
      } else if(resp.error) {
        console.log('ImagePicker Error: ', resp.error)
        return
      } else {
        const timestamp = Date.now()
        const uri = resp.uri
        const body = {
          accessToken: this.state.user.accessToken,
          type: 'video',
          timestamp: timestamp
        }
        //重新设置state
        const state = Object.assign({}, defaultState)
        state.user = this.state.user
        state.previewVideo = uri

        this.setState(state)

        this._getToken(body)
          .then((data) => {
            if(data && data.success) {
              const token = data.data.token
              const key = data.data.key
              //组建body异步上传到qiniu 
              var body = new FormData()

              body.append('signature', token)
              body.append('folder', 'video')
              body.append('tags', 'app,video')
              body.append('timestamp', timestamp)
              body.append('resource_type', 'video')
              body.append('api_key', config.cloudinary.api_key)
              body.append('file', {
                'type': 'video/mp4', 
                'uri': uri,
                'name': key
              })

              this._upload(body, 'video')
            }
          })
      } 
    })
  }
  _upload(body, type) {
    //video上传到qiniu，audio上传到cloudinary
    const xhr = new XMLHttpRequest()
    var url
    if(type === 'audio') {
      url = config.cloudinary.video
    } else if(type === 'video') {
      url = config.cloudinary.video
      // url = config.qiniu.upload1
    }

    let state = {}
    xhr.open('POST', url)

    state[type+'Uploading'] = true
    state[type+'Uploaded'] = false
    state[type+'UploadProgress'] = 0
    this.setState(state)


    xhr.onload = () => {

      if(xhr.status !== 200) {
        Alert.alert('视频上传失败！')
        console.log(xhr.responseText)
        return
      }

      if(!xhr.responseText) {
        Alert.alert('视频上传失败')
        return
      }

      var response 

      try{
        response = JSON.parse(xhr.response)
      }catch(e) {
        console.log(e)
        console.log('video upload responseText parse fail')
      }

      if(response) {
        state[type+'Uploading'] = false
        state[type+'Uploaded'] = true
        state[type+'UploadProgress'] = 0
        state[type] = response
        this.setState(state)
        //把上传到云空间的video信息传到后台保存
        const updateUrl = config.api.base + config.api[type]
        let postBody = {
          accessToken: this.state.user.accessToken
        }
        postBody[type] = response

        if(type === 'audio') {
          postBody.videoId = this.state.videoId
        }

        request.post(updateUrl, postBody)
          .then((data) => {
              console.log(data)
            if(data && data.success) {
              let mediaState = {}
              mediaState[type + 'Id'] = data.data
              if(type === 'audio') {
                this._setModalVisible(true)

                mediaState.willPublish = true
              } else if(type === 'video') {
                console.log('videoUploaded')
                this.refs.videoPlayer.seek(0)
              }
              this.setState(mediaState)
            }
          })
          .catch((err) => {
            console.log(err)
            if(type === 'video') {
              Alert.alert('视频同步失败，请重新上传')
            } else if(type === 'audio') {
              Alert.alert('音频同步失败，请重新上传')
            }
          })
      }
    }

    if(xhr.upload) {
      xhr.upload.onprogress = ((event) => {
        if(event.lengthComputable) {
          var progress = Number((event.loaded / event.total).toFixed(2))
          var progressName = type + 'UploadProgress'
          const state = {}
          state[type + 'UploadProgress'] = progress
          this.setState(state)
        }
      })
    }
    xhr.send(body)
  }
  
  _onProgress(data) {
    let currentTime = Number(data.currentTime.toFixed(2))
    let totalTime = data.playableDuration
    let progress = Number((currentTime / totalTime).toFixed(2)) 
    if(totalTime === 0) {return }
    this.setState({
      currentTime: currentTime,
      totalTime: totalTime,
      videoProgress: progress
    })
  }
  _onEnd() {
    this.setState({
      videoProgress: 1,
      ended: true
    })  
  }
  _publish() {
    this._setModalVisible(true)
  }
  _submit() {
    const submitUrl = config.api.base + config.api.creations
    const user = this.state.user
    let body = {
      videoId: this.state.videoId,
      title: this.state.title
    }
    if(user && user.accessToken) {
      body.accessToken = user.accessToken
      //  发布视频时publishing才为true
      this.setState({
        publishing: true
      })
      console.log(this.state.title)
      request.post(submitUrl, body)
        .then((data) => {
          if(data && data.success) {
            this.setState({
              publishProgress: data.data.finish / 100
            })
            console.log(data.data.finish)
            if(data.data.finish === 100) {
              clearInterval(submitInterval)             
              this._setModalVisible(false)
              var submitTimeout = setTimeout(() => {
                let state = Object.assign({}, defaultState)
                this.setState(state)
                Alert.alert('视频发布成功')
                clearTimeout(submitTimeout)
              }, 1000)
            } else {
              this._checkSubmit()
            }
          } else {
            this.setState({
              publishing: false
            }) 
           Alert.alert('视频发布失败')
          }
        })
    }
  }
  _checkSubmit() {
    submitInterval = setInterval(() => {
      this._submit()
    }, 2000)
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header} >
          <Text style={styles.headerTitle} >来分享乐趣</Text>
          {
            this.state.previewVideo && this.state.videoUploaded ? 
              <TouchableOpacity style={styles.headerRight} onPress={this._pickVideo.bind(this)} >
                <Text style={styles.headerRightTitle} >更换视频</Text>
              </TouchableOpacity>
            : null
          }
        </View>
        <View style={styles.page} >
          {
            this.state.previewVideo ? 
              <View style={styles.videoContainer} >
                <Video 
                  ref='videoPlayer'
                  style={styles.video}
                  source={{uri: this.state.previewVideo}}
                  muted={this.state.muted}
                  volume={5}
                  paused={this.state.paused}
                  rate={this.state.rate}
                  resizeMode={this.state.resizeMode}
                  repeat={this.state.repeat}
                  onProgress={this._onProgress.bind(this)}
                  onEnd={this._onEnd.bind(this)}  />
                  
                {
                  !this.state.videoUploaded && this.state.videoUploading ?
                    <View style={styles.progressBar} >
                      <View ref="progress" style={[styles.progress, {width: width * this.state.videoUploadProgress}]} ></View>
                      <View ref='progressBtn' style={[styles.progressBtnWrapper, {transform: [{translateX: this.state.videoUploadProgress * width}]} ]}>
                        <View style={styles.progressBtn} ></View>
                      </View>
                      <Text style={styles.progressTip} >正在上传视频，已完成{(this.state.videoUploadProgress * 100).toFixed(2)}% </Text>
                    </View>  
                  : null
                }
                {
                  //视频播放控制
                  this.state.videoUploaded ?
                  <TouchableOpacity style={styles.videoControl} onPress={() => {this._toggleVideoPlaying(false)}}>
                    {this.state.paused && <Icon name="ios-play" style={styles.pauseBtn} onPress={() => {this._toggleVideoPlaying(true)}} />}
                  </TouchableOpacity> 
                  : null
                }
                {
                  //视频进度控制
                  this.state.videoUploaded && 
                  <View style={styles.progressBar}>
                    <View ref="progress" style={[styles.progress, {width: width * this.state.videoProgress}]} ></View>
                  </View>
                }
             </View>
            : 
              <TouchableOpacity style={styles.uploadContainer} onPress={() => {this._pickVideo()}} >
                  <Icon style={styles.uploadIcon} name='logo-octocat' size={35} />
                  <Text style={styles.uploadText} >开始分享乐趣</Text>
                  <Text style={styles.uploadDesc} >建议视频不超过30秒</Text>
              </TouchableOpacity>
          }
          {
            //视频上传完成触发下一步按钮
            this.state.videoUploaded ? 
              <View style={styles.uploadReadyBox} >
                <Text style={styles.uploadReadyText} onPress={() => {this._publish()}} >下一步</Text>
              </View>
            : null
          }

          <Modal 
                  animationType='fade'
                  onRequestClose={() => {console.log('modal close')}}
                  transparent={true}
                  visible={this.state.modalVisible} >
            <View style={styles.modalContainer} >
              <Icon style={styles.closeIcon}
                    name='ios-close-outline'
                    onPress={() => {this._setModalVisible(false)}} />
              <View style={styles.fieldsBox} >
                {
                  this.state.videoUploaded && !this.state.publishing ?
                    <TextInput style={styles.inputField}
                                autoCapitalize={'none'}
                                autoCorrect={false}
                                underlineColorAndroid='transparent'
                                placeholder='请输入一个标题'
                                onChangeText={(text) => {
                                  console.log(text)
                                  this.setState({
                                    title: text
                                  })
                                }} />
                  : <Text style={styles.titleText}>{this.state.title}</Text>
                }
              </View>
              {
                 this.state.publishing ? 
                  <View style={styles.progressBox} >
                  {
                    this.state.willPublish ?
                      <Text style={styles.loadingText} >正在为您生成视频</Text>
                    : null
                  }
                  {
                    this.state.publishing ? <Text style={styles.loadingText} >正在上传视频</Text> : null
                  }
                      <Progress.Bar style={styles.progressBar}
                                    progress={this.state.publishProgress}
                                    color={'#800002'}  />
                      <Text>{this.state.publishProgress * 100}%</Text>
                  </View>
                : null
              }
              {
                this.state.videoUploaded && !this.state.publishing ?
                  <View style={styles.submitBtn} >
                    <Button onPress={this._submit.bind(this)}  
                            color={btnColor}
                            title='提交' />
                  </View>
                : null
              }
            </View>
          </Modal>
        </View>       
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  header: {
    width: width,
    height: 60,
    borderBottomWidth: 1,
    borderColor: '#999',
    paddingTop: 30
  },
  headerTitle: {
    alignSelf: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#800002'
  },
  headerRight: {
    position: 'absolute',
    right: 5,
    top: 30
  },
  headerRightTitle: {
    fontSize: 16,
    color: '#800002'
  },
  page: {
    flex: 1,
    alignItems: 'center'
  },
  uploadContainer: {
    marginTop: 90,
    width: width - 40,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderWidth: 1,
    borderColor: '#800002',
    borderRadius: 10
  },
  uploadIcon: {
    color: '#333',
    fontSize: 100
  },
  uploadText: {
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 20
  },
  uploadDesc: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center'
  },
  videoContainer: {
    position: 'relative',
    width: width,
    height: height * 0.6
  },
  video: {
    width: width,
    height: height * 0.6,
    backgroundColor: '#333'
  },
  progressBar: {
    width: width,
    backgroundColor: 'rgba(0,0,0,0.2)'
  },
  progress: {
    position: 'absolute',
    top:-4,
    height: 4,
    width: width,
    backgroundColor: '#800002'
  },
  progressBtnWrapper: {
    position: 'absolute',
    top: -8,
    left: 0,
    width: 14,
    height: 14
  },
  progressBtn: {
    width: 12,
    height: 12,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: '#fff',
    borderColor: 'rgba(0,0,0,0.6)'
  },
  progressTip: {
    color: '#000',
    fontSize: 14,
    height: 25,
    paddingTop: 3
  },
  videoControl: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height * 0.6,
    backgroundColor: 'transparent'
  },
  pauseBtn: {
    position: 'absolute',
    left: width * 0.45,
    top: width * 0.45,
    width: 60,
    height: 60,
    paddingLeft: 5,
    paddingTop: 3,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 30,
    backgroundColor: 'transparent',
    color: '#800002',
    fontSize: 50
  },
  recordBox: {
    width: width,
    marginTop: -20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  recordIconBox: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#800002',
    backgroundColor: '#800002'
  },
  countDown: {
    fontSize: 20,
    color: '#fff'
  },
  recordIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  recordIcon: {
    color: '#fff'
  },
  recordOn: {
    backgroundColor: '#ccc',
    borderColor: '#ccc'
  },
  previewBox: {
    position: 'absolute',
    right: 10,
    bottom: 12,
    width: 60,
    height: 26,
    paddingTop: 3,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 2,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  previewIcon: {
    color: '#fff',
    fontSize: 20,
    marginRight: 5
  },
  previewText: {
    fontSize: 16,
    color: '#fff'
  },
  uploadReadyBox: {
    marginTop: 40,
    width: width,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center'
  },
  uploadReadyText: {
    width: width - 20,
    height: 40,
    padding: 8,
    fontSize: 20,
    color: '#fff',
    backgroundColor: '#800002',
    borderRadius: 3,
    borderWidth: 1,
    textAlign: 'center',
    borderColor: '#800002'
  },
  modalContainer: {
    width: width,
    // height: height/2,
    padding: 40,
    paddingTop: 60,
    marginTop: 100,
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth:1,
    borderColor: '#666'
  },
  closeIcon: {
    position: 'absolute',
    right: 12,
    top: 2,
    fontSize: 50,
    color: '#666'
  },
  fieldsBox: {
    width: width - 40,
    height: 30,
    borderBottomWidth: 1,
    borderColor: '#333'
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    paddingLeft: 10,
    paddingVertical: 0,
    color: '#333'
  },
  titleText: {
    width: width - 40,
    height: 30,
    fontSize: 14,
    paddingLeft: 10,
    color: '#333',
  },
  progressBox: {
    marginTop: 20,
    width: width - 40,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 20,
    marginBottom: 20,
    fontSize: 14,
    color: '#800002',
    textAlign: 'center'
  },
  submitBtn: {
    marginTop: 20,
    width: width - 40,
    height: 30,
    backgroundColor: '#800002',
    borderRadius: 6,
    overflow: 'hidden'
  },
  progressBar: {
    width: width - 40,
    height: 5
  }
});
