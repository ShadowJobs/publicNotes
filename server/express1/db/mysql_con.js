
const mysql = require('mysql2');

// const db = mysql.createConnection({
const db = mysql.createPool({ //createConnection时间久了会自动断开连接，所以用pool
  // host: 'localhost',//用localhost会报错,因为可能根据系统的默认值会解析成ipv6，所以改成ipv4地址,
  host: '127.0.0.1',
  user: 'root',
  password: 'mmtly',
  database: 'antdp1use'
});
db.on('connection', (stream) => {
  console.log('mysql connected!');
});
db.on('error', (err) => {
  console.log('mysql error', err);
});
module.exports = db;