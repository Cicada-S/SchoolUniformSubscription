// 将时间戳转换具体时间
const toDates = (times) => {
  const date = new Date(times)
  const Y = date.getFullYear()
  const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1)
  const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate())
  const H = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
  const Min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
  const dateTime = Y + '-' + M + '-' + D + ' ' + H + ':' + Min
  return dateTime
}

const pathOfDate = () => {
  let today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth() + 1;
  if (month < 10) {
    month = "0" + month;
  }
  let date = today.getDate();
  if (date < 10) {
    date = "0" + date;
  }
  return (year + "/" + month + "/" + date + "/");
}

export {
  toDates, pathOfDate
}
