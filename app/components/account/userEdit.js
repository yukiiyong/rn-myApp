import React, {Component} from 'react'
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Button,
  Alert,
  AsyncStorage
} from 'react-native'
import request from '../../api/request'
import config from '../../api/config'
import CommonHeader from '../commonHeader/commonHeader'

export default class UserEdit extends Component {
  constructor(props) {
    super(props);
  
    this.state = {
      user: {}
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
            user.gender = 'male'
          }
          this.setState({
            user: user
          })
        }
      })
  }
  _changeInfo(type, value) {
    const user = this.state.user
    // if(type === 'age') {
    //   value = Number(value)
    // }
    user[type] = value

    this.setState({
      user: user
    })
  }
  _submit() {
    const postBody = {
      accessToken: this.state.user.accessToken,
      user: this.state.user
    }
    const userEditUrl = config.api.base + config.api.update
    request.post(userEditUrl, postBody)
        .then((data) => {
          if(data && data.success) {
            let userData = data.data
            AsyncStorage.setItem('user', JSON.stringify(userData))
                .then(() => {
                  this.setState({
                    user: userData
                  })
                  Alert.alert('用户信息更新成功')
                  this.props.navigation.navigate('AccountTab',{userData: userData})
                })
                .catch(err => {
                  console.log(err)
                })
          }
        })
        .catch(err => {
          console.log(err)
        }) 
  }
  render() {
    const user = this.state.user
    return (
      <View style={styles.container} >
        <CommonHeader title='用户资料编辑' leftTitle='返回' navigation={this.props.navigation} /> 
        <View style={styles.infoWrapper} >
          <View style={styles.infoGroup} >
            <Text style={styles.infoName} >昵称</Text>
            <TextInput style={styles.infoValue} 
                        placeholder='请输入你的昵称'
                        autoCorrect={false}
                        autoCapitalize={'none'}
                        defaultValue={user.nickname}
                        onChangeText={(text) => {
                          this._changeInfo('nickname', text)
                        }} />
          </View>
          <View style={styles.infoGroup} >
            <Text style={styles.infoName} >性别</Text>
            <TextInput style={styles.infoValue} 
                        placeholder='请输入你的性别'
                        autoCorrect={false}
                        autoCapitalize={'none'}
                        defaultValue={user.gender}
                        onChangeText={(text) => {
                          this._changeInfo('gender', text)
                        }} />
          </View>
          <View style={styles.infoGroup} >
            <Text style={styles.infoName} >年龄</Text>
            <TextInput style={styles.infoValue} 
                        placeholder='请输入你的年龄'
                        autoCorrect={false}
                        autoCapitalize={'none'}
                        keyboardType='number-pad'
                        defaultValue={user.age + ''}
                        onChangeText={(text) => {
                          this._changeInfo('age', text)
                        }} />
          </View>
          <View style={styles.submitBtnWrapper} >
            <Button style={styles.submitBtn}
                    color= '#fff'
                    title='提交'
                    onPress={this._submit.bind(this)} />
          </View>
        </View>
        
      </View>
    )
  }
}

const styles = StyleSheet.create({
  infoWrapper: {
    paddingLeft: 50,
    paddingRight: 50,
    marginTop: 100 
  },
  infoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  infoName: {
    fontSize: 20,
    color: '#333',
    marginRight: 10
  },
  infoValue: {
    flex: 1,
    height: 30,
    paddingLeft: 5,
    lineHeight: 24,
    fontSize: 20,
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 8
  },
  submitBtnWrapper: {
    backgroundColor: '#800002',
  },
  submitBtn: {
    borderRadius: 8
  }
})