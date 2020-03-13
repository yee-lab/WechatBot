/*
 * @Author: Yee
 * @Date: 2020-03-11 14:06:42
 * @LastEditors: Yee
 * @LastEditTime: 2020-03-13 12:29:34
 * @FilePath: \WechatBot\config\formatDate.js
 * @Description: 获取日期
 */
const formatDate = date => {
  let tempDate = new Date(date);
  let year = tempDate.getFullYear();
  let month = tempDate.getMonth() + 1;
  let day = tempDate.getDate();
  let hour = String(tempDate.getHours()).padStart(2, '0');
  let min = String(tempDate.getMinutes()).padStart(2, '0');
  let second = String(tempDate.getSeconds()).padStart(2, '0');
  let week = tempDate.getDay();
  let str = '';
  switch (week) {
    case 0:
      str = '星期日';
      break;
    case 1:
      str = '星期一';
      break;
    case 2:
      str = '星期二';
      break;
    case 3:
      str = '星期三';
      break;
    case 4:
      str = '星期四';
      break;
    case 5:
      str = '星期五';
      break;
    case 6:
      str = '星期六';
      break;
  }
  return month + '月' + day + '日' + hour + ':' + min + ' ' + str;
};

module.exports = {
  formatDate
};
