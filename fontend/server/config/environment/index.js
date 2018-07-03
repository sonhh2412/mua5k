'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
  if(!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// All configurations will extend these options
// ============================================

process.env.NODE_ENV = 'production';

process.env.PORT = 9979; //cau hinh port chay ngnix

process.env.PREFIX = 'rmp_';

process.env.PREFIX_ERR_MQ = 'err_rmp_'
// proxy_set_header  X-Real-IP  $remote_addr;
var all = {  

  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server port
  port: process.env.PORT || 9000,

  // Server IP
  ip: process.env.IP || '0.0.0.0',

  // Should we populate the DB with sample data?
  seedDB: false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: 'fd34s@!@dfa453f3DF#$D&W'
  },


  /*doamin dung de bam vao link khich hoat trong email*/

  domain : 'mua5k.com',

  /*cau hinh sms nap tien VMG*/

  sms : {
    cmdCode : 'BulkSendSms', //loai gui tin nhan cham soc khach hang
    alias : '0901766199', //alias cua VND
    authenticateUser: 'azcom',
    authenticatePass : 'vmg123456',
    url : 'http://brandsms.vn:8018/vmgApi',
    msisdn : '84',
    createUser : 'Mua5k thong bao MA KICH HOAT cua ban la: ', //ky tu gui tin nhan khi tao user
    descriptionUser: '. Tin nhan co hieu luc trong 15 phut', //ky tu mo ta thoi gian hieu luc khi tao user
    forgotPassword : 'Mua5k thong bao ma QUEN MAT KHAU cua ban la: ', //ky tu gui tin nhan Quen mat khau
    descriptionPassword: '. Tin nhan co hieu luc trong 15 phut', //ky tu mo ta thoi gian hieu luc Quen mat khau
    sendTime : '' //thoi gian cho gui di

  },

  /*cau hinh email smtp cho user 
  dung dang ky tai khoan moi va quem mat khau*/
  // ylgstkyubljtblch
  // email : {
  //   service : 'Gmail',
  //   auth : {
  //        user: "mua5k.com@gmail.com",
  //        pass: "ylgstkyubljtblch" //mat kau smtp gmail
  //   },
  //   from : '<mua5k.com@gmail.com>'
  // },

  email : {
    service : 'Sparkpost',
    auth : {
         user: "SMTP_Injection",
         pass: "8da890b7179d2f3fbc4262c6d5f5773a518faa63" //mat kau smtp gmail
    },
    from : 'support@mua5k.com'
  },

  /*API ngan luong*/

  nganluong_card : {
    func : 'CardCharge', /*dung cho NTC goi function ben nganluong*/
    version : '2.0', /*version ma ngan luong dang su dung*/
    merchant_id : '50575', /*id tai khoan*/
    merchant_account : 'mua5k.com@gmail.com', /*account tai khoan*/
    merchant_password : 'd70fb8db9a88e97cece8f12ec48403ba', /*mat khau bi mat cua ngan luong*/
    merchant_url : 'http://exu.vn/mobile_card.api.post.v2.php', /*link dung de goi function */

  },

  nganluong_napcard : {
    func : 'CardCharge', /*dung cho NTC goi function ben nganluong*/
    version : '2.0', /*version ma ngan luong dang su dung*/
    merchant_id : '52468', /*id tai khoan*/
    merchant_account : 'sonhh2412@gmail.com', /*account tai khoan*/
    merchant_password : '144c741dcfa7665ffcca0527546735a5', /*mat khau bi mat cua ngan luong*/
    merchant_url : 'https://www.nganluong.vn/mobile_card.api.post.v2.php', /*link dung de goi function */

  },

  /* Cau hinh VNPT Epay */
  // vnptepay : {
  //   ws_url : 'http://naptien.thanhtoan247.net.vn:8082/CDV_Partner_Services_V1.0/services/Interfaces?wsdl', /*link webservice*/
  //   partnerName : 'azcom', /*partner username*/
  //   partnerPassword : 'hson2412', /*partner password*/
  //   key_sofpin : '82360BD051D96D49A81F0642875B9E47', /*key sofpin*/
  //   time_out : 150, /*thời gian tối đa thực hiện giao dịch (tính bằng giây)*/
  //   VNPT_EPAY_CODE: {
  //     /* Success */
  //     0: "Thành công.",
  //     /* Đang nạp tiền */
  //     23: "Tài khoản đang được nạp tiền.",
  //     /* Cần kiểm tra */
  //     99: "Pending",
  //     /* Thất bại */
  //     10: "Tài khoản đang bị khóa.",
  //     11: "Tên partner không đúng.",
  //     12: "Địa chỉ IP không cho phép.",
  //     13: "Mã đơn hàng bị lỗi.",
  //     14: "Mã đơn hàng đã tồn tại.",
  //     15: "Mã đơn hàng không tồn tại.",
  //     17: "Sai tổng tiền.",
  //     21: "Sai chữ ký.",
  //     22: "Dữ liệu gửi lên rỗng hoặc có ký tự đặc biệt.",
  //     30: "Số dư không khả dụng.",
  //     31: "Chiết khấu chưa được cập nhật cho partner.",
  //     32: "Partner chưa cập nhật Public key.",
  //     33: "Partner chưa được set IP.",
  //     35: "Hệ thống đang bận.",
  //     52: "Loại hình thanh toán không hỗ trợ.",
  //     101: "Mã giao dịch truyền lên sai địng dạng.",
  //     102: "Mã giao dịch đã tồn tại.",  
  //     103: "Tài khoản nạp tiền bị sai.",
  //     104: "Sai mã nhà cung cấp hoặc nhà cung cấp hệ thống không hỗ trợ.",
  //     105: "Mệnh giá nạp tiền không hỗ trợ.",
  //     106: "Mệnh giá thẻ không tồn tại.",
  //     107: "Thẻ trong kho không đủ cho giao dịch.",
  //     108: "Số lượng thẻ mua vượt giới hạn cho phép.",
  //     109: "Kênh nạp tiền đang bảo trì.",
  //     110: "Giao dịch thất bại.",
  //     111: "Mã giao dịch không tồn tại.",
  //     112: "Tài khoản chưa có key mã hóa softpin.",
  //     113: "Tài khoản nhận tiền chưa đúng."
  //   },
  //   VNPT_EPAY_PROVIDER: {
  //     VTT: "Viettel",
  //     VMS: "Mobifone",
  //     VNP: "Vinaphone",
  //     // VNM: "Vietnamobile",
  //     // BEE: "Beeline",
  //     // ZING: "VinaGame",
  //     // GATE: "FPT",
  //     // ONCASH: "NET2E",
  //   },
  //   VNPT_EPAY_AMOUNT_MOBILE_CARD: {
  //     VNP : [10000, 20000, 30000, 50000, 100000, 200000, 300000, 500000],
  //     VMS : [10000, 20000, 30000, 50000, 100000, 200000, 300000, 500000],
  //     VTT : [10000, 20000, 30000, 50000, 100000, 200000, 300000, 500000, 1000000],
  //     // VNM : [10000, 20000, 50000, 100000, 200000, 300000, 500000],
  //   },
  //   VNPT_EPAY_HEAD_NUMBER: {
  //     VNP: ['094', '0124', '0125', '0123', '0127', '0129', '091'],
  //     VMS: ['0128', '0126', '0122', '0120', '093', '090', '0121'],
  //     VTT: ['098', '097', '096', '0169', '0168', '0167', '0166', '0162', '0165', '0164', '0163'],
  //     VNM: ['092', '0188', '0186'],
  //   }
  // },

  // List of user roles
  userRoles: ['guest', 'user', 'admin'],

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },

  facebook: {
    clientID:     process.env.FACEBOOK_ID || 'id',
    clientSecret: process.env.FACEBOOK_SECRET || 'secret',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/facebook/callback'
  },

  twitter: {
    clientID:     process.env.TWITTER_ID || 'id',
    clientSecret: process.env.TWITTER_SECRET || 'secret',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/twitter/callback'
  },

  google: {
    clientID:     process.env.GOOGLE_ID || 'id',
    clientSecret: process.env.GOOGLE_SECRET || 'secret',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/google/callback'
  }
};


module.exports = _.merge(
  all,
  require('./' + process.env.NODE_ENV + '.js') || {});
