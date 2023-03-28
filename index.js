/*
CSVファイルから年代別人口を集計して、人口が多い順でテキストファイルに出力する
形式は以下

2022年10月1日現在の年代別総人口ランキング [千人]
1位: 40代 9999
2位: 30代 9999
3位: 10代 9999
...

読み込むCSVファイル: popu_source.csv
出力するテキストファイル: popu_ranking.txt

集計する単位は、年代「10歳未満／10代／20代／（中略）／90代／100歳以上」とし、「年齢各歳」の列から変換して作る
集計する人口は「value」の列を利用する

データ出典：政府統計の総合窓口(e-Stat)（https://www.e-stat.go.jp/）
*/

const fs = require('fs');
const readline = require('readline');
const rs = fs.createReadStream('./popu_source.csv');
const rl = readline.createInterface({ input: rs });

const fileName = './popu_ranking.txt';
const popuMap = new Map(); // key: 年代, value: 年代別総人口

rl.on('line', lineString => {
  lineString = lineString.replaceAll('"', '');
  const columns = lineString.split(',');
  if (columns[1] !== '男女計') {
    return;
  }
  if (columns[3] !== '総人口') {
    return;
  }
  if (columns[5] === '総数') {
    return;
  }
  const age = parseInt(columns[5].replace(/歳(以上)?/));
  let ageGroup = '';
  if (age < 10) {
    ageGroup = '10歳未満';
  } else if (age < 100) {
    ageGroup = `${Math.floor(age / 10) * 10}代`;
  } else {
    ageGroup = '100歳以上';
  }
  const population = popuMap.has(ageGroup) ? popuMap.get(ageGroup) + parseInt(columns[11]) : parseInt(columns[11]);
  popuMap.set(ageGroup, population);
}).on('close', () => {
  const popuArray = Array.from(popuMap);
  popuArray.sort((a, b) => b[1] - a[1]);
  fs.appendFileSync(fileName, '2022年10月1日現在の年代別総人口ランキング [千人]\n', 'utf-8');
  for (let i = 0; i < popuArray.length; i++) {
    const arr = popuArray[i];
    fs.appendFileSync(fileName, `${i + 1}位: ${arr[0]} ${arr[1]}\n`);
  }
});
