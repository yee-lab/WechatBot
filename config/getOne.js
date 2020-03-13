/*
 * @Author: Yee
 * @Date: 2020-03-11 14:56:57
 * @LastEditors: Yee
 * @LastEditTime: 2020-03-13 20:21:52
 * @FilePath: \WechatBot\config\getOne.js
 * @Description:获取每日一句 && 天行机器人聊天逻辑
 */
const superagent = require('../config/superagent');
const cheerio = require('cheerio');
const { machineIdSync } = require('node-machine-id');
const crypto = require('crypto');
let md5 = crypto.createHash('md5');
let uniqueId = md5.update(machineIdSync()).digest('hex');
const ONE = 'http://wufazhuce.com/'; //每日一句
const TXHOST = 'http://api.tianapi.com/txapi/'; //天行机器人api
const nCov = 'https://lab.isaaclin.cn/nCoV/api/'; //全国疫情

async function getOne() {
  //获取每日一句
  try {
    let res = await superagent.req(ONE, 'GET');
    let $ = cheerio.load(res.text);
    let todayOneList = $('#carousel-one .carousel-inner .item');
    let todayOne = $(todayOneList[0])
      .find('.fp-one-cita')
      .text()
      .replace(/\s+/g, '');
    return todayOne;
  } catch (err) {
    console.log('错误', err);
    return err;
  }
}

//获取全国疫情
async function getnCov() {
  let url = nCov + 'overall';
  let res = await superagent.req(url, 'GET');
  let content = JSON.parse(res.text);
  let results = content.results[0];

  if (content.success) {
    let str = `【全国累计确诊${results.confirmedCount}例,累计死亡${results.deadCount}例,累计治愈${results.curedCount}例,现存确诊${results.currentConfirmedCount}例,现存重症${results.seriousCount}例,现存疑似${results.suspectedCount}】(累计含港澳台)\n${results.generalRemark}\n${results.note1}\n${results.note2}\n${results.note3}\n\n${results.remark1}\n${results.remark2}\n${results.remark3}`;

    return str;
  }
  //return false;
}

//获取墨迹天气
async function getWether() {
  //采用城市加地区的形式 , 便于修改
  let url = 'https://tianqi.moji.com/weather/china/' + '城市/' + '地区';
  try {
    let res = await superagent.req(url, 'GET');
    let $ = cheerio.load(res.text);
    //天气提示
    let weatherTips = $('.wea_tips em').text();
    const today = $('.forecast .days')
      .first()
      .find('li');
    let todayInfo = {
      Day: $(today[0])
        .text()
        .trim(),
      WetherText: $(today[1])
        .text()
        .trim(),
      Temp: $(today[2])
        .text()
        .trim(),
      Wind: $(today[3])
        .find('em')
        .text()
        .trim(),
      WindLevel: $(today[3])
        .find('b')
        .text()
        .trim(),
      PollutionLevel: $(today[4])
        .find('strong')
        .text()
        .trim()
    };
    let obj = {
      weatherTips: weatherTips,
      todayWeather:
        todayInfo.Day +
        '天气:' +
        todayInfo.WetherText +
        '\n温度:' +
        todayInfo.Temp +
        '\n风向:' +
        todayInfo.Wind +
        '\n风级:' +
        todayInfo.WindLevel +
        '\n空气质量:' +
        todayInfo.PollutionLevel
    };
    console.log('获取天气成功');
    return obj;
  } catch (err) {
    console.log('天气获取失败', err);
  }
}

//天行机器人
async function getReply(word) {
  let url = TXHOST + 'robot/';
  let res = await superagent.req(url, 'GET', {
    key: 'APIKEY',
    question: word, //提问
    mode: 1, //工作模式，宽松0[默认]、精确1，私有2
    datatype: 0, //返回类型，文本0[默认]、语音1
    userid: uniqueId, //机器人上下文关联，必须唯一采用md5
    limit: 10
  });
  let content = JSON.parse(res.text);
  //请求成功
  if (content.code === 200) {
    let response = '';
    //消息是文字形式
    if (content.datatype === 'text') {
      //<br>在消息中不被识别 , 换成 '\n'
      response = content.newslist[0].reply.replace(
        /(\<br\>)|(\<br\/\>)/g,
        '\n'
      );
    } else if (content.datatype === 'view') {
      //消息是图文的处理
      response = `虽然我不太懂你说的是什么,但是感觉很高级的样子,因此我也查了类似的文章去学习,你觉得有用吗<br>《${content.newslist[0].title}》${content.newslist[0].url}`;
    } else {
      response =
        '你太厉害了 , 说的话把我难到了 , 我要去学习了 , 不然没办法回答你的问题';
    }
    return response;
  } else {
    return '我好像迷失在了无边的网络中了 , 你能找回我么';
  }
}

async function addRoom(that, msg) {
  if (msg.text() == '加群') {
    const room = await that.Room.find({ id: '******@chatroom' });
    //判断是否在房间中 , 在就提示并return false/true为了便于在onMessage()私人对话中进行判断
    if (room) {
      if (await room.has(msg.from())) {
        await msg.say(`你已经在〖${room.payload.topic}〗群组`);
        return true;
      }
      //添加
      await room.add(msg.from());
      //人数少自己直接就进去 , 并不会发送链接
      await msg.say(
        room.payload.memberIdList.length < 100
          ? '已经把你加进群组'
          : '群邀请链接已发送'
      );

      return true;
    }
  }
  return false;
}
module.exports = {
  getOne,
  getnCov,
  getWether,
  getReply,
  addRoom
};
