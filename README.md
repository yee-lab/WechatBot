# WechatBot
一个iPad协议的微信机器人 , 基于wechaty-puppet-padplus
---
#### 目前实现的功能

- 通过关键词自动通过好友的请求
- 私聊关键字进行回复相关内容
  + 例如回复`加群`推送群聊邀请
  + 例如回复`疫情`获取全国当前关于疫情的一些内容
- 自动聊天
  + 群聊中可以通过`@`机器人来进行聊天
  + 群聊中可以通过`@`机器人+`疫情`来获取全国疫情的一些相关内容
  + 私聊发送消息即可进行聊天
- 加入群聊
  + 当有新的朋友加入机器人所在群聊会`@新朋友`并且发送一段欢迎文字
- 踢出群聊
  + 当机器人把某个人踢出之后会发出`xxx已被移出群聊`的内容
- 定时发送消息给指定联系人
  + 设置一个时间 , 指定一个联系人 , 会在指定时间发送一些内容给联系人内容有日期 , 天气 , 鸡汤文
---

#### 使用的库

- [wechaty](https://github.com/wechaty/wechaty) -微信操作
- [wechaty-puppet-padplus](https://github.com/wechaty/wechaty-puppet-padplus) -iPad协议的wechaty
- [qrcode-terminal](https://github.com/gtanner/qrcode-terminal) -终端显示二维码
- [node-schedule](https://github.com/node-schedule/node-schedule) -定时任务
- [superagent](https://github.com/visionmedia/superagent) -爬取页面信息
- [cheerio](https://github.com/cheeriojs/cheerio#readme) -对DOM进行操作
---
#### 目录结构

```
|-- README.md                //项目说明
|-- config
|   |-- formatDate.js       //获取时间
|   |-- getOne.js           //一些模块 , 包含 : 每日一句 获取全国疫情 获取墨迹天气 天行机器人配置 加群关键字
|   |-- schedule.js         //定时任务的配置
|   `-- superagent.js       //superagent的配置
|-- index.js                //文件入口及一些实现功能模块
|-- package.json            //配置文件
```
---
#### 最后

你可以添加微信来进行测试,记得带上暗号`Hello`或者`robot`或`你好` , 加好友后 , 回复`加群`可以自动拉进去 , 由于群人少不会发送群链接 , 还有由于不定时在线 , 可能有时会失灵  , 理解一下哈 
![微信图片_20200313190617.jpg](https://i.loli.net/2020/03/13/oEtGCVmK2cQe976.jpg)
  
