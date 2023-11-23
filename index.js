const axios = require('axios');
const citys = require('./city');
const categorys = require('./category');
const fs = require('fs');

const fetchUrl = 'https://jzapi.baidu.com/cirrus/search/shops';
const result = [];

async function fetchData(city, category) {
  const params = {
    city: city,
    categoryLv1: category,
    sid: '',
    srcId: '',
    source: '',
    qid: '',
    query: '',
    longitude: '',
    latitude: '',
    pageNum: 1,
    pageSize: 20,
    clientType: 1,
    sortType: '0'
  };

  try {
    const response = await axios.post(fetchUrl, params);
    if (response.data.data?.list) {
      for (const shop of response.data.data.list) {
        if (shop.shopUrl) {
          result.push(shop.shopUrl);
        }
      }
    }
  } catch (error) {
    console.error(`请求数据出错: ${error.message}`);
  }
}

(async () => {
  const promiseArr = [];
  for (const city of citys) {
    for (const category of categorys) {
      console.log(`正在抓取${city} ${category}`);
      promiseArr.push(fetchData(city, category));
    }
  }

  await Promise.all(promiseArr);

  // result去重，去掉含义 wjzqtq0m wjzf8xem 的url
  // 途虎养车 德国马牌
  const set = new Set(result);
  result.length = 0;
  set.forEach(item => {
    if (!item.includes('wjzqtq0m') && !item.includes('wjzf8xem')) {
      result.push(item);
    }
  });

  // 写入文件，没有则创建
  fs.writeFile('./result.txt', result.join('\n'), { flag: 'w' }, function (err) {
    if (err) {
      throw err;
    }
    console.log('写入成功');
  });
})();

// const fetchQd = () => {
//   axios.get('https://jiazheng.58.com/api/v1/c/demands/sendCodeMsg?phone=18259606013').then(res => {
//     console.log('请求成功');
//     setTimeout(() => {
//       fetchQd();
//     }, 2000);
//   });
// };

// fetchQd();
