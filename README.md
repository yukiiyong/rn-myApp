### 介绍
  使用react-native进行开发, 实现了一个对视频进行重新配音的app
### 界面截图
1. 登录操作 （手机号+验证码）
2. 查看视频列表，对视频进行点赞，评论和播放控制 
3. 上传视频
4. 账户页面操作和注销，查看自己上传的视频
5. 修改个人信息

![登录操作](https://github.com/yukiiyong/rn-myApp/blob/master/assets/login.gif)
![查看视频并评论](https://github.com/yukiiyong/rn-myApp/blob/master/assets/list.gif)
![对视频进行配音](https://github.com/yukiiyong/rn-myApp/blob/master/assets/edit.gif)
![账户页面操作和注销](https://github.com/yukiiyong/rn-myApp/blob/master/assets/account.gif)

## 功能列表
> 已有功能   
1. 查看视频列表，并对视频进行点赞
2. 观看视频并对视频进行播放控制
3. 查看视频的评论和对视频进行评论
4. 上传个人头像和编辑个人资料
5. 查看自己发布的视频
6. 上传视频并发布
### 下载运行
* 拉取资源  git pull https://github.com/yukiiyong/rn-myApp.git
* npm install
* react-native link
* （这个版本使用的react-native为0.55，使用es6语法 用拉取下来的react-native-sk-count-down代替install的版本）
* android 使用前需要开启虚拟机
* 运行 react-native run-android / react-native run-ios 
* 此app需要配合后台程序 （https://github.com/yukiiyong/myAppServer）