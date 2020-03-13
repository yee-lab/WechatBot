/*
 * @Date: 2020-03-07 04:25:14
 * @LastEditors: Yee
 * @LastEditTime: 2020-03-13 12:19:23
 * @FilePath: \WechatBot\index.js
 * @Description:入口文件
 */
const { Wechaty, Friendship } = require('wechaty');
const qrcodeTerminal = require('qrcode-terminal');
//const { PuppetPadplus } = require('wechaty-puppet-padplus');

const schedule = require('./config/schedule');
const formatDate = require('./config/formatDate');
const superagent = require('./config/getOne');

const token = 'puppet_padplus_54af780e447cfa1c';
const puppet = 'wechaty-puppet-padplus';
const name = 'Mr.Robot';
const roomId = '22224682717@chatroom';

//二维码生成
function onScan(qrcode, status) {
  qrcodeTerminal.generate(qrcode, { small: true });
}

//登录
async function onLogin(user) {
  console.log(`小机器人${user.name()} 登陆啦!!!`);
  //const roomList = await bot.Room.findAll();
  //console.log(roomList); //输出房间列表 , 在登陆之后
  await bot.say('Hello! , Robot has login'); //跟自己发条消息

  //登陆后创建定时任务
  await initDay();
}

//根据关键词自动通过好友请求
async function onFriendShip(friendship, msg) {
  let logMsg;
  try {
    logMsg = '添加好友' + friendship.contact().name();
    console.log(logMsg);
    switch (friendship.type()) {
      /**
       * 1.新的好友请求
       * 设置请求后,我们可以从'request.hello()'获取验证消息,并
       * 通过'request.accept()'接受此请求
       */
      case Friendship.Type.Receive:
        let addFriendKeywords = ['Hello', 'robot', '你好'];
        if (addFriendKeywords.some(str => str === friendship.hello())) {
          logMsg = `自动添加好友成功,因为验证消息是"${friendship.hello()}"`;
          //通过验证
          await friendship.accept();
        } else {
          logMsg = `没有通过验证:因为"${friendship.hello()}"不匹配`;
        }
        break;
      //友谊的小船确认
      case Friendship.Type.Confirm:
        logMsg = `${friendship.contact().name()}已经上了你的贼船`;
        //跟自己发个提示XX已经加了好友
        bot.say(`${friendship.contact().name()}添加了你为好友`);
        break;
    }
  } catch (e) {
    logMsg = e.message;
  }
  console.log(logMsg);
}

//进入房间
async function onRoomJoin(room, inviteeList, inviter) {
  if (roomId !== room.id) return;
  //如果bot在房间且已经设置新进入房间的人就会@并发送一条消息
  inviteeList.map(c => {
    room.say(
      '\n你好,欢迎你的加入 , 请自觉遵守群规则 , 文明交流 ,你可以通过@我进行对话 , 先介绍一下自己😄',
      c
    );
  });
}

//踢出房间 , 此功能仅限于bot踢出房间 , 如果房间用户自己退出 , 不会触发
async function onRoomLeave(room, leaverList) {
  if (roomId !== room.id) return;
  leaverList.map(c => {
    room.say(`「${c.name()}」被移除群聊`);
  });
}

//监听对话
async function onMessage(msg) {
  const contact = msg.from(); //发消息人
  const content = msg.text(); //消息内容
  const room = msg.room(); //是否是群消息
  //消息来自自己 , 直接return
  if (msg.self()) return;

  //只处理文本消息
  if (msg.type() === bot.Message.Type.Text) {
    //消息是否来自群聊
    if (room) {
      //如果消息来自群聊
      const topic = await room.topic(); //获取群聊名字
      //console.log(`群名: ${topic} 发消息人 :${contact.name()}内容:${content}`);
      //在群聊回复 疫情 会发送全国疫情消息
      if (content === '疫情') await msg.say(await superagent.getnCov());
      //收到消息并@了自己
      if (await msg.mentionSelf()) {
        //获取提到自己的名字
        let self = await msg.to();
        self = '@' + self.name();
        //获取消息内容 , 拿到整个消息文本 , 去掉@+名字 , 注意名字跟消息之间有空格
        let sendText = content.replace(self, '').trim();
        //如果发送 了 @疫情 , 那就会发送疫情消息 , 并return,为了不触发机器人自动对话
        if (sendText === '疫情') {
          await msg.say(await superagent.getnCov());
          return;
        }
        console.log(`${contact.name()}说:`, sendText);
        //请求机器人回复
        let res = await superagent.getReply(sendText);
        console.log('天行机器人回复：', res);
        //返回消息 , 并@来自人
        room.say(res, msg.from());
        return;
      }
    } else {
      //如果不是群消息 , 是 个人一对一
      //发送消息是 加群 不触发机器人
      if (await superagent.addRoom(this, msg)) return;
      if (content === '疫情') {
        await msg.say(await superagent.getnCov());
        return;
      }
      //请求机器人聊天
      console.log(`${contact.name()}:`, content);
      let res = await superagent.getReply(content);
      console.log('天行机器人：', res);
      //返回内容
      try {
        await contact.say(res);
      } catch (e) {
        console.log(e.message);
      }
    }
  } else {
    console.log('不是文本消息!');
  }
}

//创建微信每日说任务
async function initDay() {
  console.log('已经设定每日说任务');
  //每天早上7:30发送
  schedule.setSchedule('00 30 07 * * *', async () => {
    console.log('你的贴心小助理开始工作啦');
    let logMsg;
    //发送个指定联系人或者他的备注名字
    let contact =
      (await bot.Contact.find({ name: '小梦大半' })) ||
      (await bot.Contact.find({ alias: '小梦大半' }));
    let one = await superagent.getOne(); //获取每日一句
    let weather = await superagent.getWether(); //获取天气信息
    let today = await formatDate.formatDate(new Date()); //获取今天的日期
    let str = `${today}\n元气满满的一天开始啦 , 要开心😄\n\n${weather.todayWeather}\nTips:${weather.weatherTips}\n\n每日鸡汤\n${one}`;
    try {
      logMsg = str;
      await contact.say(str); //发送消息
    } catch (e) {
      logMsg = e.message;
    }
    console.log(logMsg);
  });
}
//登出
function onLogout(user) {
  console.log(`${user} 登出`);
}

//初始化bot
const bot = new Wechaty({
  name,
  puppet,
  puppetOptions: { token }
});
bot
  .on('scan', onScan) //扫码
  .on('message', onMessage) //消息
  .on('login', onLogin) //登录
  .on('friendship', onFriendShip) //好友添加
  .on('room-join', onRoomJoin) //加入房间
  .on('room-leave', onRoomLeave) //离开房间
  .on('error', error => {
    //错误消息
    console.log(error);
  })
  .on('logout', onLogout) //登出
  .start(); //启动
