var user = {
  price: 10,
  birth: '2002-5-7',
};

observe(user); // 观察

// 显示姓氏
function showPrice() {
  document.querySelector('#price').textContent = `总价：${user.price*2.5}`;
}


// 显示年龄
function showAge() {
  var birthday = new Date(user.birth);
  var today = new Date();
  today.setHours(0), today.setMinutes(0), today.setMilliseconds(0);
  thisYearBirthday = new Date(
    today.getFullYear(),
    birthday.getMonth(),
    birthday.getDate()
  );
  var age = today.getFullYear() - birthday.getFullYear();
  if (today.getTime() < thisYearBirthday.getTime()) {
    age--;
  }
  document.querySelector('#age').textContent = '年龄：' + age;
}
autorun(showPrice);
autorun(showAge);
