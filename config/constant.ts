const roleKey = {
  root: 'root',
  ministry: 'ministry',
  lecturers: 'lecturers'
}

const numberInMonth = {
  "01": 31,
  "02": 28,
  "03": 31,
  "04": 30,
  "05": 31,
  "06": 30,
  "07": 31,
  "08": 31,
  "09": 30,
  "10": 31,
  "11": 30,
  "12": 31
}

const numberInMonthProfit = {
  "01": 31,
  "02": 29,
  "03": 31,
  "04": 30,
  "05": 31,
  "06": 30,
  "07": 31,
  '08': 31,
  "09": 30,
  "10": 31,
  '11': 30,
  "12": 31
}

const hallFormat = {
  "1": "2D",
  "2": "3D",
  "3": "IMAX",
  "4": "4DX",
  "5": "SCREENX"
}

const movieStatus = {
  "1": "Đang hoạt động",
  "2": "Ngừng hoạt động",
  "3": "Chưa hoạt động"
}

const paymentStatus = {
  "0": "Thất bại",
  "1": "Thành công"
}

const paymentType = {
  "1": "Momo",
  "2": "VNPay"
}

export default {
  roleKey, numberInMonth, numberInMonthProfit, hallFormat, movieStatus, paymentStatus, paymentType
}

