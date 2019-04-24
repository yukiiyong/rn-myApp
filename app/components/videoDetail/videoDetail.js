import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video'
import CommentList from '../commentList/commentList'
import CommonHeader from '../commonHeader/commonHeader'
import config from '../../api/config'
import {
  StyleSheet,
  Text,
  Image,
  ImageBackground,
  TouchableHighlight,
  TouchableOpacity,
  ActivityIndicator,
  View,
  ListView,
  Dimensions
} from 'react-native';
const width = Dimensions.get('window').width
export default class VideoDetail extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: this.props.navigation.state.params.data,
      //video
      rate: 1,
      muted: false,
      resizeMode: 'contain',
      repeat: false,

      playing:false,
      paused: false,
      loaded: false, 
      error: false,
      ended: false,
      //time
      currentTime: 0,
      totalTime: 0,
      rateTime: 0
    }
  } 
  _onLoad() {
    this.setState({
      loaded: true,
      error:false
    })
    console.log(config.cloudinary.baseUrl + '/' + this.state.data.cloudinary_video)
  }
  _onLoadStart() {
    console.log('onLoadStart')
    console.log(config.cloudinary.baseUrl + '/' + this.state.data.cloudinary_video)
    if(this.state.error) {
      this.setState({
        error: false
      })
    }
  }
  _onProgress(data) {
    let currentTime = Number(data.currentTime.toFixed(2))
    let totalTime = data.playableDuration
    let rateTime = Number((currentTime / totalTime).toFixed(2)) 
    if(totalTime === 0) {return }
    let newState = {
      currentTime: currentTime,
      totalTime: totalTime,
      rateTime: rateTime
    }

    if(!this.state.playing) {
      newState.playing = true
    }

    if(!this.state.loaded) {
      newState.loaded = true
    }
    if(this.state.ended) {
      newState.ended = false 
    }
    

    this.setState(newState)
  }
  _onEnd() {
    this.setState({
      playing: false,
      ended: true,
      rateTime: 1
    })
  }
  _onError(error) {
    console.log(error) 
    this.setState({
      error: true
    })
  }
  _rePlay() {
    this.refs.videoPlayer.seek(0)
  }
  _togglePlaying(playingState) {
    let rate = playingState ? 1 : 0
    let paused = playingState ? false : true
    this.setState({
      rate: rate,
      paused: paused,
      playing: playingState
    })
  }
  _renderPlayWrapper() { 
    return (
      <TouchableOpacity style={styles.playWrapper} 
                        onPress={() => {this._togglePlaying(false)}} >
        {
          this.state.paused && <Icon name='ios-play' style={styles.pauseBtn} onPress={() => {this._togglePlaying(true)}}/>
        }
        <Icon name={this.state.muted ? 'ios-volume-off' : 'ios-volume-up'}
              style={styles.muttedBtn}
              onPress={() => {this.state.muted = !this.state.muted}}  />
      </TouchableOpacity> 
    )
  }
  render() {
    const data = this.state.data
    return (
      <View style={styles.container}>
        <CommonHeader title='视频详情页' leftTitle='返回' navigation={this.props.navigation} /> 
        <View style={styles.videoWrapper}>
          <Video 
            ref='videoPlayer'
            style={styles.video}
            source={{uri: config.cloudinary.baseUrl + data.cloudinary_video}}
            muted={this.state.muted}
            volume={5}
            paused={this.state.paused}
            rate={this.state.rate}
            resizeMode={this.state.resizeMode}
            repeat={this.state.repeat}
            onLoad ={this._onLoad.bind(this)}
            onLoadStart={this._onLoadStart.bind(this)}
            onProgress={this._onProgress.bind(this)}
            onEnd={this._onEnd.bind(this)}
            onError={this._onError.bind(this)} />

          {!this.state.loaded && !this.state.error && <ActivityIndicator size="large" style={styles.videoLoading} />}

          {
            (this.state.loaded && this.state.ended ) || this.state.error
            ?
              <Icon name='ios-refresh-outline' 
                    style={styles.rePlay} 
                    onPress={this._rePlay.bind(this)} /> 
            : null 
          }
          
          {
            this.state.loaded && !this.state.ended && this._renderPlayWrapper()               
          }
          <View style={styles.progressBar} >
            <View ref="progress" style={[styles.progress, {width: width * this.state.rateTime}]} ></View>
            <View ref='progressBtn' style={[styles.progressBtnWrapper, {transform: [{translateX: this.state.rateTime * width}]} ]}>
              <View style={styles.progressBtn} ></View>
            </View>
          </View> 
        </View>
        
        <CommentList data={this.state.data} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF'    
  },
  videoWrapper: {
    position: 'relative',
    width: width,
    height: width * 0.56
  },
  video: {
    width: width,
    height: width * 0.56,
    backgroundColor: '#000'
  },
  videoLoading: {
    position: 'absolute',
    top: width * 0.26,
    left: 0,
    width: width,
    alignSelf: 'center',
    backgroundColor: 'transparent'
  },
  notDisplay: {
    display: 'none'
  },
  playWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: width * 0.56,
    backgroundColor: 'transparent'
  },
  muttedBtn: {
    position: 'absolute',
    bottom: 20,
    right: 30,
    fontSize: 40,
    color: '#fff'
  },
  pauseBtn: {
    position: 'absolute',
    left:  width * 0.5 - 30,
    top: width * 0.28 - 30,
    width: 60,
    height: 60,
    fontSize: 50,
    textAlign: 'center',
    lineHeight: 60,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.3)',
    color: '#800002',
    overflow: 'hidden',
    Platform.select({
      'ios': {
        lineHeight: 36
      },
      'android': {
        textAlignVertical: 'center'
      }
    })
  },
  rePlay: {
    position: 'absolute',
    top: width * 0.25,
    left: '45%',
    width: 40,
    height: 40,
    fontSize: 40,
    backgroundColor: 'rgba(0,0,0,0.3)',
    textAlign: 'center',
    paddingLeft: 5,
    color: '#fff'
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: width,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.2)'
  },
  progress: {
    position: 'absolute',
    height: 4,
    width: width,
    backgroundColor: '#800002'
  },
  progressBtnWrapper: {
    position: 'absolute',
    top: -4,
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
  }
})