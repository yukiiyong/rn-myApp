import React, { Component } from 'react';
import config from '../../api/config'
import request from '../../api/request'
import CommonHeader from '../commonHeader/commonHeader'
import { NavigationActions } from 'react-navigation'
import {CountDownText} from 'react-native-sk-countdown'
import {
  StyleSheet,
  Platform,
  Text,
  Image,
  ImageBackground,
  TouchableHighlight,
  TextInput,
  Button,
  AsyncStorage,
  View,
  Alert,
  Dimensions
} from 'react-native';
const width = Dimensions.get('window').width;
const resetAction = NavigationActions.reset({
  index: 0,
  actions: [NavigationActions.navigate({routeName: 'MyTabNavigators'})]
})
let btnColor = Platform.OS === 'ios' ? '#fff' : '#800002'
export default class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      phoneNumber: '',
      code: '',
      sendCode: false,
      countingDone: false
    }
  }
  componentDidMount() {
    console.log(this.props.navigation)
    console.log(Platform)
  }
  _sendCode() {
    this.setState({
      countingDone: false
    })
    const phoneNumber = this.state.phoneNumber 
    if(phoneNumber.length < 11) {
      Alert.alert('您输入的手机号不正确，请重新输入')
      return
    }
    const body = {
      phoneNumber: this.state.phoneNumber 
    }
    const sendCodeURL = config.api.base + config.api.signup
    request.post(sendCodeURL, body)
            .then((data) => {
              if(data && data.success) {
                this.setState({
                  sendCode: true
                })
              } 
              else {
                Alert.alert('您输入的手机号有误')
                return 
              }          
            }) 
            .catch((err) => {
              console.log(err)
              this.setState({
                  sendCode: false
                })
              Alert.alert('网络状况不佳，请稍后重试')
            })
  }
  _submit() {
    const phoneNumber = this.state.phoneNumber 
    const code = this.state.code
    if(phoneNumber.length < 11) {
      Alert.alert('您输入的手机号不正确，请重新输入')
      return
    }
    
    if(code.length !== 4) {
      Alert.alert('您输入的验证码有误')
      return
    }
    const body = {
      phoneNumber: this.state.phoneNumber,
      code: this.state.code
    }
    const loginURL = config.api.base + config.api.login
    request.post(loginURL, body)
            .then((data) => {
              console.log(data)
              if(data && data.success) {
                AsyncStorage.setItem('user', JSON.stringify(data.data))
                this.props.navigation.dispatch(resetAction)
              }  
              else {
                Alert.alert('您输入的手机号有误')
                return 
              }          
            }) 
            .catch((err) => {
              console.log(err)
              Alert.alert('网络状况不佳，请稍后重试')
            })         
  }
  render() {
    return (
      <View style={styles.container} >
        <CommonHeader title='登录页' /> 
        <TextInput style={styles.loginInput}
                   placeholder='请输入您的手机号' 
                   autoCorrect={false}
                   autoCapitalize={'none'}
                   underlineColorAndroid='transparent'
                   keyboardType='number-pad'
                   onChangeText={(text) => {
                    this.setState({
                      phoneNumber: text
                    })
                   }}
        />
        {
          this.state.sendCode ?
            <View style={styles.verifyBox} >
              <TextInput style={[styles.loginInput,styles.verify]}
                       placeholder='请输入验证码' 
                       autoCorrect={false}
                       autoCapitalize={'none'}
                       underlineColorAndroid='transparent'
                       keyboardType='number-pad'
                       onChangeText={(text) => {
                        this.setState({
                          code: text
                        })
                       }}
              />
              {this.state.countingDone ? 
                <View style={styles.sendCodeBtn} >
                  <Button color={btnColor}
                      onPress={this._sendCode.bind(this)}
                      title='发送验证码' />
                </View>          
              :                
                <CountDownText
                  style={[styles.sendCodeBtn,styles.countDown]}
                  countType='seconds' // 计时类型：seconds / date
                  auto={true} // 自动开始
                  afterEnd={() => {
                    this.setState({countingDone: true})
                  }} // 结束回调
                  timeLeft={60} // 正向计时 时间起点为0秒
                  step={-1} // 计时步长，以秒为单位，正数则为正计时，负数为倒计时
                  startText='获取验证码' // 开始的文本
                  endText='获取验证码' // 结束的文本
                  intervalText={(sec) => sec + '秒重新获取'} // 定时的文本回调
                />
              }
              
            </View>
          :
            null
        }
        
        <View style={styles.sendBtn} >
          {this.state.sendCode ? 
            <Button onPress={this._submit.bind(this)}
                    color={btnColor}
                    title='登录' />
          :
            <Button onPress={this._sendCode.bind(this)}
                    color={btnColor}
                    title='发送验证码'  />
          }
        </View>
        
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loginInput: {
    height: 40,
    margin: 10,
    marginTop: 20,
    paddingLeft: 20,
    borderWidth: 1,
    borderRadius: 2,
    fontSize: 16,
    borderColor: '#800002'
  },
  sendBtn: {
    height: 40,
    margin: 10,
    backgroundColor: '#800002',
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#800002'
  },
  verifyBox: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  verify: {
    flex: 1
  },
  sendCodeBtn: {
    width: 140,
    height: 40,
    margin: 10,
    marginTop: 20,
    backgroundColor: '#800002',
    color: '#fff',
    fontSize: 16,
    borderRadius: 8,
    overflow: 'hidden'
  },
  countDown: {
    textAlign: 'center',    
    ...Platform.select({
      ios: {
        lineHeight: 40, //lineHeight在android不生效
      },
      android: {
        textAlignVertical: 'center',  //此属性ios不生效
      }
    })
  },
  notDisplay: {
    display: 'none'
  }
});