/* MD5 */
var faultylabs = {};

faultylabs.MD5 = function(data) {

    // for test/debug
    // function fflog(msg) {
    //     try {
    //     } catch(e) {}
    // }

    // convert number to (unsigned) 32 bit hex, zero filled string
    function to_zerofilled_hex(n) {
        var t1 = (n >>> 24).toString(16);
        var t2 = (n & 0x00FFFFFF).toString(16);
        return "00".substr(0, 2 - t1.length) + t1 +
        "000000".substr(0, 6 - t2.length) + t2;
    }

    // convert array of chars to array of bytes (note: Unicode not supported)
    function chars_to_bytes(ac) {
        var retval = [];
        for (var i = 0; i < ac.length; i++) {
            retval = retval.concat(str_to_bytes(ac[i]));
        }
        return retval;
    }


    // convert a 64 bit unsigned number to array of bytes. Little endian
    function int64_to_bytes(num) {
        var retval = [];
        for (var i = 0; i < 8; i++) {
            retval.push(num & 0xFF);
            num = num >>> 8;
        }
        return retval;
    }

    //  32 bit left-rotation
    function rol(num, places) {
        return ((num << places) & 0xFFFFFFFF) | (num >>> (32 - places));
    }

    // The 4 MD5 functions
    function fF(b, c, d) {
        return (b & c) | (~b & d);
    }

    function fG(b, c, d) {
        return (d & b) | (~d & c);
    }

    function fH(b, c, d) {
        return b ^ c ^ d;
    }

    function fI(b, c, d) {
        return c ^ (b | ~d);
    }

    // pick 4 bytes at specified offset. Little-endian is assumed
    function bytes_to_int32(arr, off) {
        return (arr[off + 3] << 24) | (arr[off + 2] << 16) | (arr[off + 1] << 8) | (arr[off]);
    }

  /*
  Conver string to array of bytes in UTF-8 encoding
  See: 
  http://www.dangrossman.info/2007/05/25/handling-utf-8-in-javascript-php-and-non-utf8-databases/
  http://stackoverflow.com/questions/1240408/reading-bytes-from-a-javascript-string
  How about a String.getBytes(<ENCODING>) for Javascript!? Isn't it time to add it?
  */
  function str_to_bytes(str) {
      var retval = [ ];
      for (var i = 0; i < str.length; i++)
          if (str.charCodeAt(i) <= 0x7F) {
              retval.push(str.charCodeAt(i));
          } else {
              var tmp = encodeURIComponent(str.charAt(i)).substr(1).split('%');
              for (var j = 0; j < tmp.length; j++) {
                  retval.push(parseInt(tmp[j], 0x10));
        }
          }
      return retval;
  };


  

    // convert the 4 32-bit buffers to a 128 bit hex string. (Little-endian is assumed)
    function int128le_to_hex(a, b, c, d) {
        var ra = "";
        var t = 0;
        var ta = 0;
        for (var i = 3; i >= 0; i--) {
            ta = arguments[i];
            t = (ta & 0xFF);
            ta = ta >>> 8;
            t = t << 8;
            t = t | (ta & 0xFF);
            ta = ta >>> 8;
            t = t << 8;
            t = t | (ta & 0xFF);
            ta = ta >>> 8;
            t = t << 8;
            t = t | ta;
            ra = ra + to_zerofilled_hex(t);
        }
        return ra;
    }

    // check input data type and perform conversions if needed
    var databytes = null;
    // String
    if (typeof data == 'string') {
        // convert string to array bytes
        databytes = str_to_bytes(data);
    } else if (data.constructor == Array) {
        if (data.length === 0) {
            // if it's empty, just assume array of bytes
            databytes = data;
        } else if (typeof data[0] == 'string') {
            databytes = chars_to_bytes(data);
        } else if (typeof data[0] == 'number') {
            databytes = data;
        } else {
            // fflog("input data type mismatch");
            return null;
        }
    } else {
        // fflog("input data type mismatch");
        return null;
    }

    // save original length
    var org_len = databytes.length;

    // first append the "1" + 7x "0"
    databytes.push(0x80);

    // determine required amount of padding
    var tail = databytes.length % 64;
    // no room for msg length?
    if (tail > 56) {
        // pad to next 512 bit block
        for (var i = 0; i < (64 - tail); i++) {
            databytes.push(0x0);
        }
        tail = databytes.length % 64;
    }
    for (i = 0; i < (56 - tail); i++) {
        databytes.push(0x0);
    }
    // message length in bits mod 512 should now be 448
    // append 64 bit, little-endian original msg length (in *bits*!)
    databytes = databytes.concat(int64_to_bytes(org_len * 8));

    // initialize 4x32 bit state
    var h0 = 0x67452301;
    var h1 = 0xEFCDAB89;
    var h2 = 0x98BADCFE;
    var h3 = 0x10325476;

    // temp buffers
    var a = 0,
    b = 0,
    c = 0,
    d = 0;


  function _add(n1, n2) {
    return 0x0FFFFFFFF & (n1 + n2)
  }
  
    // function update partial state for each run
    var updateRun = function(nf, sin32, dw32, b32) {
        var temp = d;
        d = c;
        c = b;
        //b = b + rol(a + (nf + (sin32 + dw32)), b32);
    b = _add(b, 
      rol( 
        _add(a, 
          _add(nf, _add(sin32, dw32))
        ), b32
      )
    );
        a = temp;
    };


    // Digest message
    for (i = 0; i < databytes.length / 64; i++) {
        // initialize run
        a = h0;
        b = h1;
        c = h2;
        d = h3;

        var ptr = i * 64;

        // do 64 runs
        updateRun(fF(b, c, d), 0xd76aa478, bytes_to_int32(databytes, ptr), 7);
        updateRun(fF(b, c, d), 0xe8c7b756, bytes_to_int32(databytes, ptr + 4), 12);
        updateRun(fF(b, c, d), 0x242070db, bytes_to_int32(databytes, ptr + 8), 17);
        updateRun(fF(b, c, d), 0xc1bdceee, bytes_to_int32(databytes, ptr + 12), 22);
        updateRun(fF(b, c, d), 0xf57c0faf, bytes_to_int32(databytes, ptr + 16), 7);
        updateRun(fF(b, c, d), 0x4787c62a, bytes_to_int32(databytes, ptr + 20), 12);
        updateRun(fF(b, c, d), 0xa8304613, bytes_to_int32(databytes, ptr + 24), 17);
        updateRun(fF(b, c, d), 0xfd469501, bytes_to_int32(databytes, ptr + 28), 22);
        updateRun(fF(b, c, d), 0x698098d8, bytes_to_int32(databytes, ptr + 32), 7);
        updateRun(fF(b, c, d), 0x8b44f7af, bytes_to_int32(databytes, ptr + 36), 12);
        updateRun(fF(b, c, d), 0xffff5bb1, bytes_to_int32(databytes, ptr + 40), 17);
        updateRun(fF(b, c, d), 0x895cd7be, bytes_to_int32(databytes, ptr + 44), 22);
        updateRun(fF(b, c, d), 0x6b901122, bytes_to_int32(databytes, ptr + 48), 7);
        updateRun(fF(b, c, d), 0xfd987193, bytes_to_int32(databytes, ptr + 52), 12);
        updateRun(fF(b, c, d), 0xa679438e, bytes_to_int32(databytes, ptr + 56), 17);
        updateRun(fF(b, c, d), 0x49b40821, bytes_to_int32(databytes, ptr + 60), 22);
        updateRun(fG(b, c, d), 0xf61e2562, bytes_to_int32(databytes, ptr + 4), 5);
        updateRun(fG(b, c, d), 0xc040b340, bytes_to_int32(databytes, ptr + 24), 9);
        updateRun(fG(b, c, d), 0x265e5a51, bytes_to_int32(databytes, ptr + 44), 14);
        updateRun(fG(b, c, d), 0xe9b6c7aa, bytes_to_int32(databytes, ptr), 20);
        updateRun(fG(b, c, d), 0xd62f105d, bytes_to_int32(databytes, ptr + 20), 5);
        updateRun(fG(b, c, d), 0x2441453, bytes_to_int32(databytes, ptr + 40), 9);
        updateRun(fG(b, c, d), 0xd8a1e681, bytes_to_int32(databytes, ptr + 60), 14);
        updateRun(fG(b, c, d), 0xe7d3fbc8, bytes_to_int32(databytes, ptr + 16), 20);
        updateRun(fG(b, c, d), 0x21e1cde6, bytes_to_int32(databytes, ptr + 36), 5);
        updateRun(fG(b, c, d), 0xc33707d6, bytes_to_int32(databytes, ptr + 56), 9);
        updateRun(fG(b, c, d), 0xf4d50d87, bytes_to_int32(databytes, ptr + 12), 14);
        updateRun(fG(b, c, d), 0x455a14ed, bytes_to_int32(databytes, ptr + 32), 20);
        updateRun(fG(b, c, d), 0xa9e3e905, bytes_to_int32(databytes, ptr + 52), 5);
        updateRun(fG(b, c, d), 0xfcefa3f8, bytes_to_int32(databytes, ptr + 8), 9);
        updateRun(fG(b, c, d), 0x676f02d9, bytes_to_int32(databytes, ptr + 28), 14);
        updateRun(fG(b, c, d), 0x8d2a4c8a, bytes_to_int32(databytes, ptr + 48), 20);
        updateRun(fH(b, c, d), 0xfffa3942, bytes_to_int32(databytes, ptr + 20), 4);
        updateRun(fH(b, c, d), 0x8771f681, bytes_to_int32(databytes, ptr + 32), 11);
        updateRun(fH(b, c, d), 0x6d9d6122, bytes_to_int32(databytes, ptr + 44), 16);
        updateRun(fH(b, c, d), 0xfde5380c, bytes_to_int32(databytes, ptr + 56), 23);
        updateRun(fH(b, c, d), 0xa4beea44, bytes_to_int32(databytes, ptr + 4), 4);
        updateRun(fH(b, c, d), 0x4bdecfa9, bytes_to_int32(databytes, ptr + 16), 11);
        updateRun(fH(b, c, d), 0xf6bb4b60, bytes_to_int32(databytes, ptr + 28), 16);
        updateRun(fH(b, c, d), 0xbebfbc70, bytes_to_int32(databytes, ptr + 40), 23);
        updateRun(fH(b, c, d), 0x289b7ec6, bytes_to_int32(databytes, ptr + 52), 4);
        updateRun(fH(b, c, d), 0xeaa127fa, bytes_to_int32(databytes, ptr), 11);
        updateRun(fH(b, c, d), 0xd4ef3085, bytes_to_int32(databytes, ptr + 12), 16);
        updateRun(fH(b, c, d), 0x4881d05, bytes_to_int32(databytes, ptr + 24), 23);
        updateRun(fH(b, c, d), 0xd9d4d039, bytes_to_int32(databytes, ptr + 36), 4);
        updateRun(fH(b, c, d), 0xe6db99e5, bytes_to_int32(databytes, ptr + 48), 11);
        updateRun(fH(b, c, d), 0x1fa27cf8, bytes_to_int32(databytes, ptr + 60), 16);
        updateRun(fH(b, c, d), 0xc4ac5665, bytes_to_int32(databytes, ptr + 8), 23);
        updateRun(fI(b, c, d), 0xf4292244, bytes_to_int32(databytes, ptr), 6);
        updateRun(fI(b, c, d), 0x432aff97, bytes_to_int32(databytes, ptr + 28), 10);
        updateRun(fI(b, c, d), 0xab9423a7, bytes_to_int32(databytes, ptr + 56), 15);
        updateRun(fI(b, c, d), 0xfc93a039, bytes_to_int32(databytes, ptr + 20), 21);
        updateRun(fI(b, c, d), 0x655b59c3, bytes_to_int32(databytes, ptr + 48), 6);
        updateRun(fI(b, c, d), 0x8f0ccc92, bytes_to_int32(databytes, ptr + 12), 10);
        updateRun(fI(b, c, d), 0xffeff47d, bytes_to_int32(databytes, ptr + 40), 15);
        updateRun(fI(b, c, d), 0x85845dd1, bytes_to_int32(databytes, ptr + 4), 21);
        updateRun(fI(b, c, d), 0x6fa87e4f, bytes_to_int32(databytes, ptr + 32), 6);
        updateRun(fI(b, c, d), 0xfe2ce6e0, bytes_to_int32(databytes, ptr + 60), 10);
        updateRun(fI(b, c, d), 0xa3014314, bytes_to_int32(databytes, ptr + 24), 15);
        updateRun(fI(b, c, d), 0x4e0811a1, bytes_to_int32(databytes, ptr + 52), 21);
        updateRun(fI(b, c, d), 0xf7537e82, bytes_to_int32(databytes, ptr + 16), 6);
        updateRun(fI(b, c, d), 0xbd3af235, bytes_to_int32(databytes, ptr + 44), 10);
        updateRun(fI(b, c, d), 0x2ad7d2bb, bytes_to_int32(databytes, ptr + 8), 15);
        updateRun(fI(b, c, d), 0xeb86d391, bytes_to_int32(databytes, ptr + 36), 21);

        // update buffers
        h0 = _add(h0, a);
        h1 = _add(h1, b);
        h2 = _add(h2, c);
        h3 = _add(h3, d);
    }
    // Done! Convert buffers to 128 bit (LE)
    return int128le_to_hex(h3, h2, h1, h0).toUpperCase();
};


/*
 * C端 接口
 * 
 * 
 */
// var BASE_URL = 'http://www.fishing-admin.local/';
// var BASE_URL = 'http://www.running-ponds.local/';
// var BASE_URL = 'http://api.apps.ewenlaz.com/'
// var BASE_URL = 'http://api.ewenlaz.com/'
// var BASE_URL = 'http://api.test.shanggou.la/'
var BASE_URL = 'http://api.shanggou.la/';
// var BASE_URL = 'http://api.shanggou.local/';
// var BASE_URL = 'http://192.168.100.13/';
// var BASE_URL = 'http://192.168.1.111/';

function URLConfig(name, data) {
  
  // common/auth.login?app=android&token=demo&time=123&device=demo&ver=2.0&sign=dd1a1b650f340a54e7737a9e1d3dccc8
  
  var SINGN = 'bc2a616abe6f6987f24e957a1a88c07d';
  
  switch(name) {
    
    case 'cityDetail':
      return BASE_URL + 'common/main.city_detail?' + getSignCode();
    //获取资讯信息
    case 'newsList':
      return BASE_URL + 'common/news.list?' + getSignCode();
    //获取整条资讯  id
    case 'newsInfo':
      return BASE_URL + 'common/news.info?' + getSignCode();
    //收藏接口  type' : 4, 'target' : feedId
    case 'favorite':
      return BASE_URL + 'common/favorite.do?' + getSignCode();
    //钓点列表
    case 'pondList':
      return BASE_URL + 'cpond/pond/lists?' + getSignCode();
    //钓点筛选
    case 'pondFilter':
      return BASE_URL + 'cpond/config/pondFilter?' + getSignCode();
    //搜索接口 q
    case 'search':
      return BASE_URL + 'cpond/pond/search?' + getSignCode();
    //搜索多多号&昵称
    case 'findByNo':
      return BASE_URL + 'common/user.findByNo?' + getSignCode();



    //头条列表  330110
    case 'putIn':
      return BASE_URL + 'common/poster.putin?' + getSignCode();
    //首页数据
    case 'index':
      return BASE_URL + 'common/main.index?' + getSignCode();
    //钓点详情页
    case 'pondInfo':
      return BASE_URL + 'cpond/pond/info?' + getSignCode();  

    //发送验证码
    case 'sendVerify':
      return BASE_URL + 'common/sms.send?' + getSignCode();

    //登陆
    case 'login':
      return BASE_URL + 'common/auth.login?' + getSignCode();

    //开放平台登陆
    case 'openLogin':
      return BASE_URL + 'common/auth.open_login?' + getSignCode();
    
      
    //验证昵称  nickname: 刘春发1
    case 'checkNickname':
      return BASE_URL + 'common/user.check_nickname?' + getSignCode();
    //清洗昵称 nickname: 刘春发d毛泽daf=dsaf+东_
    case 'clearNickname':
      return BASE_URL + 'common/user.clear_nickname?' + getSignCode();
    
    //登出
    case 'logout':
      return BASE_URL + 'common/auth.logout?' + getSignCode();
    
    //获取登陆用户信息
    case 'authInfo':
      return BASE_URL + 'common/auth.info?' + getSignCode();

    //等级 财富 
    case 'wealth':
      return  BASE_URL + 'cpond/user/wealth?' + getSignCode();

    //修改
    case 'userModify':
      return BASE_URL + 'common/user.modify?' + getSignCode();

    //上传图片（获取图片地址）
    case 'uploadPic':
      return BASE_URL + 'common/upload.pic?' + getSignCode();

    //卡券列表 expired 状态 ,  1 已过期,  0 : 未使用 page 页数  page_size 每页数量（默认20）
    case 'couponList':  
      return BASE_URL + 'common/user.coupon_list?' + getSignCode();
    
    //卡券详细页
    case 'couponInfo':
      return BASE_URL + 'common/user.coupon_info?' + getSignCode();
    //签到
    case 'sign':
      return BASE_URL + 'cpond/sign/sign?' + getSignCode();

    //订单列表  post  page page_size 
    case 'orderList':
      return BASE_URL + 'common/user.order_list?' + getSignCode();   
    //订单详细页
    case 'orderInfo':
      return BASE_URL + 'common/user.order_info?' + getSignCode();
    //我的收藏
    case 'favoriteList':
      return BASE_URL + 'common/favorite.list?' + getSignCode(); 

    // 核销 pond_id: 1   coupon_id: 2  
    case 'consume':
      return BASE_URL + 'cpond/coupon/consume?' + getSignCode();

    //推广员check 多多号
    case 'promoteCheck':
      return BASE_URL + 'common/promote.check?' + getSignCode();
    //扫码完获取 qrcode shanggoula://user.info?uid=3
    case 'qrDecode':  
      return BASE_URL + 'common/qr.decode?' + getSignCode();
    //通过uid 获取no
    case 'getNo':
      return BASE_URL + 'common/promote.get_no?' + getSignCode();

    
     
    //任务
    case 'mission':
      return BASE_URL + 'cpond/user/tasks?' + getSignCode();

    //任务详细
    case 'taskInfo':
      return BASE_URL + 'cpond/user/task_info?' + getSignCode();

    // key 
    case 'taskResult':
      return BASE_URL + 'cpond/user/task_result?' + getSignCode();
    
    //天气
    case 'weather':
      return BASE_URL + 'common/weather.forecast?' + getSignCode();

    //发表渔获读取天气接口
    case 'getWeather':
      return BASE_URL + 'common/weather.current?' + getSignCode();

    //评论列表
    case 'commentList':
      return BASE_URL + 'cpond/comment/lists?' + getSignCode();

    //评论列表
    case 'writeComment':
      return BASE_URL + 'cpond/comment/add?' + getSignCode();

    //精选优惠
    case 'benefit':
      return BASE_URL + 'common/poster.benefit?' + getSignCode();
    
    //查找卡券包   pond_id: 1
    case 'pondCoupon':
      return BASE_URL + 'cpond/coupon/pondCoupon?' + getSignCode();

    //卡券包详情 coupon_id   card_id(可选)
    case 'couponDetail':
      return BASE_URL + 'cpond/coupon/detail?' + getSignCode();
    //领取代金券 coupon_id
    case 'couponGet':
      return BASE_URL + 'cpond/coupon/get?' + getSignCode();
    // 隐藏帖子  feed_id 
    case 'hideFeed':
      return BASE_URL + 'cpond/admin/hideFeed?' + getSignCode();
    //绑定手机 领钓鱼券 mobile verify 
    case 'bindPhone': 
      return BASE_URL + 'cpond/coupon_new/coupon_by_bind_phone?' + getSignCode();
    //绑定手机
    case 'bindOtherPhone':
      return BASE_URL + 'common/auth.link?' + getSignCode();
    /* ++++++++++++++CPlus+++++++++++++++ */
    
    

    //+++++++发表渔获+++++++
    //获取鱼种(配置)
    case 'getFishes':
      return BASE_URL + 'cpond/extra/fishSpecies?' + getSignCode();
    //附近钓场
    case 'nearPonds':
      return BASE_URL + 'cpond/extra/ponds?' + getSignCode();
    //获取饵料(配置)
    case 'baitBrand':
      return BASE_URL + 'cpond/extra/baitBrand?' + getSignCode();

    //上传图片（发表渔获）
    case 'uploadPicForm':
      return BASE_URL + 'common/upload.pic_form?' + getSignCode();
    //发表渔获
    case 'addFeed':
      return BASE_URL + 'cpond/feed/add?' + getSignCode();
    //通过pondId获取 扫码概要结果
    case 'pondDetail':
      return BASE_URL + 'cpond/pond/detail?' + getSignCode();
    //通过shopId获取渔具店 信息
    case 'shopDetail':
      return BASE_URL + 'common/fishing_shop.detail?' + getSignCode();



    //Feed列表  pond_id,user_id
    case 'feedList':
      return BASE_URL + 'cpond/feed/all?' + getSignCode();
    //关注用户  uid
    case 'follow':
      return BASE_URL + 'cpond/fan/follow?' + getSignCode();
    //取消关注用户  uid
    case 'cancelFollow':
      return BASE_URL + 'cpond/fan/cancelFollow?' + getSignCode();
    //赞 feed_id
    case 'zan':
      return BASE_URL + 'cpond/feed/zan?' + getSignCode();
    //取消赞 feed_id
    case 'cancelZan':
      return BASE_URL + 'cpond/feed/cancelZan?' + getSignCode();
    //评论 feed_id   comment
    case 'comment':
      return BASE_URL + 'cpond/feed/comment?' + getSignCode();
    //Feed详情  feed_id
    case 'feedDetail':
      return BASE_URL + 'cpond/feed/detail?' + getSignCode();
    //个人主页 uid=14
    case 'userInfo':
      return BASE_URL + 'cpond/user/info?' + getSignCode();
    //渔获 传uid
    case 'myFeed':
      return BASE_URL + 'cpond/feed/my?' + getSignCode();
    // 成就：用  传uid
    case 'achievement':
      return BASE_URL + 'cpond/feed/my_achievement?' + getSignCode();
    // 饵料箱：用  传uid 
    case 'baitbox':
      return BASE_URL + 'cpond/feed/my_baitbox?' + getSignCode(); 
    //消息通知
    case 'msgNew':
      return BASE_URL + 'common/message.new?' + getSignCode();
    //消息列表
    case 'messageInbox':
      return BASE_URL + 'common/message.inbox?' + getSignCode();
    //关注列表
    case 'guanzhu':
      return BASE_URL + 'cpond/fan/guanzhu?' + getSignCode();
    //粉丝列表
    case 'fans':
      return BASE_URL + 'cpond/fan/fans?' + getSignCode();
    //附近的人
    case 'near':
      return BASE_URL + 'common/user.nearby?' + getSignCode();
    //Feed评论列表  feed_id lastId
    case 'comments':
      return BASE_URL + 'cpond/feed/comments?' + getSignCode();
    //通讯录比对
    case 'contact':
      return BASE_URL + 'common/user.find_from_contact?' + getSignCode();
    //feed举报
    case 'report':
      return BASE_URL + 'cpond/feed/report?' + getSignCode();
    //feed收藏  无效 
    // case 'feedFavorit':
    //   return BASE_URL + 'cpond/feed/favorite?' + getSignCode();
    //feed取消收藏
    case 'cancelFeedFavorit':
      return BASE_URL + 'cpond/feed/cancelFavorite?' + getSignCode();
    //Feed收藏列表
    case 'favoriteFeeds':
      return BASE_URL + 'cpond/feed/favoriteFeeds?' + getSignCode();
    //问卷调查 id,selected
    case 'suvery':
      return BASE_URL + 'cpond/suvery/result?' + getSignCode();
    //新的好友
    case 'newFriend':  //mobile: 2
      return BASE_URL + 'common/user.make_new_friend?' + getSignCode();
    //扫描核销 pond_id: 4741
    case 'scan':  //无效
      return BASE_URL + 'cpond/coupon/pond_coupon?' + getSignCode();
    //核销结果：pond_id: 1212  purchase_amount: 100  coupon_ids: 1,23,32
    case 'scanResult': //无效
      return BASE_URL + 'cpond/coupon/consume?' + getSignCode();
    //feed删除
    case 'feedDel':
      return BASE_URL + 'cpond/feed/delete?' + getSignCode();
    //feed删除(管理员)
    case 'feedAdminDel':
      return BASE_URL + 'cpond/admin/deleteFeed?' + getSignCode();
    //删除评论 comment_id 
    case 'deleteComment':
      return BASE_URL + 'cpond/admin/deleteComment?' + getSignCode();
    //话题列表
    case 'topicList':
      return BASE_URL + 'cpond/topic/all?' + getSignCode();
    //话题选项  暂时不用
    case 'topicOptions':
      return BASE_URL + 'cpond/topic/lists?' + getSignCode();
    // 账号禁用  /cpond/admin/banUser  参数 uid,  period [1， 2， 3， 4]  一天，三天，一周，永久 
    case 'banUser':
      return BASE_URL + 'cpond/admin/banUser?' + getSignCode();
    //检查版本更新接口
    case 'checkVer':
      return BASE_URL + 'common/main.update?' + getSignCode();
    //订单列表  POST：lastId
    case 'orderList_new':
      return BASE_URL + 'cpond/coupon_new/order_list?' + getSignCode();
    //支付pond_id coupon_id  amount  card_id
    case 'pay':
      return BASE_URL + 'cpond/coupon_new/pay?' + getSignCode();
    //获取支付信息  Post: pond_id
    case 'getPayInfo':
      return BASE_URL + 'cpond/coupon_new/get_pay_info?' + getSignCode();
    //卡券包列表 Post : lastId ,  status (0: 未使用， 1：已使用， 2 ：已过期)
    case 'couponNewList':
      return BASE_URL + 'cpond/coupon_new/list?' + getSignCode();
    
    //获取流量包
    case 'getGrade':
      return BASE_URL + 'cpond/coupon_new/get_mobile_grade?' + getSignCode();
    
    //判断是否可领流量包
    case 'checkGrade':
      return BASE_URL + 'cpond/coupon_new/check_mobile_grade?' + getSignCode();

    //卡券奖励检测
    case 'checkAward':
      return BASE_URL + 'cpond/sign/check_award?' + getSignCode();
    
    //视频详情source_url  发布  url
    case 'videoParse':
      return BASE_URL + 'cpond/video/parse?' + getSignCode();

    //移贴功能 id topic_id
    // case 'moveFeed':
    //   return BASE_URL +'cpond/feed/move?' + getSignCode();
    
    //抽奖次数
    case 'guaguaTimes':
      return BASE_URL + 'cpond/coupon_new/guagua_times?' + getSignCode();
    
    //抽奖结果
    case 'guagua':
      return BASE_URL + 'cpond/coupon_new/feed_guagua?' + getSignCode();

    //日志上报接口
    case 'errLog':
        return BASE_URL + 'common/main.log?' + getSignCode();

    //礼包检测接口
    case 'giftCheck':
      return BASE_URL + 'cpond/sign/check_gift_package?' + getSignCode();
    

    /* 约钓系列 */
    //活动列表  number 0 历史    number 1 本周
    case 'gatherList':
      return BASE_URL + 'cpond/fishing_activity/lists?' + getSignCode();
    //我的活动列表 page
    case 'gatherMeList':
      return BASE_URL + 'cpond/fishing_activity/me?' + getSignCode();
    //详细页  activity_id
    case 'gatherDetail':
      return BASE_URL + 'cpond/fishing_activity/detail?' + getSignCode();
    //发送验证码 activity_id  mobile
    case 'gatherSend':
      return BASE_URL + 'cpond/fishing_activity/code?' + getSignCode();
    //我要参加 activity_id  mobile  verify_code
    case 'gatherAttend':
      return BASE_URL + 'cpond/fishing_activity/attend?' + getSignCode();
    //活动提醒 interval（30分钟-5  1小时-4 4小时-3 8小时-2 12小时-1）  order_id
    case 'gatherNotifiy':
      return BASE_URL + 'cpond/fishing_activity/set_notified_at?' + getSignCode();
    //邀请好友
    case 'yudouInvite':
        return BASE_URL + 'cpond/mall/invited_users?' + getSignCode();




    //删除图片 （管理员） feed_id pic
    case 'delPic':
      return BASE_URL + 'cpond/admin/delete_pic?' + getSignCode();

    //周末福利
    case 'qiangList':
      return BASE_URL + 'cpond/qiang/lists?' + getSignCode();

    //周末福利详情
    case 'qiangDetail':
      return BASE_URL + 'cpond/qiang/detail?' + getSignCode();



    //静态页列表
    case 'giftList':
      return BASE_URL + 'cpond/weekend/gifts?' + getSignCode();

    //静态页详情  id
    case 'giftListDetail':
      return BASE_URL + 'cpond/weekend/gift_detail?' + getSignCode();



    //服务器时间
    case 'timeCheck':
      return BASE_URL + 'cpond/qiang/check?' + getSignCode();

    //抢福利 id
    case 'qiang':
      return BASE_URL + 'cpond/qiang/qiang?' + getSignCode();

    //兑换商城
    case 'redeem':
      return BASE_URL + 'cpond/redeem/login?' + getSignCode();

    /* 支付 */
    //获取charge
    // id: 10988
    // amount: 100
    // channel: alipay
    // pond_id: 520
    case 'payCharge':
      return BASE_URL + 'cpond/coupon_new/create_order?' + getSignCode();
    


    /*话题PK*/
    //本期话题
    case 'pkList':
      return BASE_URL + 'cpond/battlefield/pk?' + getSignCode();        
    
    //历史话题
    case 'historyPkList':
      return BASE_URL + 'cpond/battlefield/history_pk?' + getSignCode();

    //获奖名单
    case 'awardedList':
      return BASE_URL + 'cpond/battlefield/awarded_list?' + getSignCode();

    //投票评论
    case 'voteComment':
      return BASE_URL + 'cpond/battlefield/comment?' + getSignCode();
      
    //投票 vote_for pk_id
    case 'vote':
      return BASE_URL + 'cpond/battlefield/vote?' + getSignCode();
    
    //评论列表 type hot or new pk_id  和我相关 type: 'my'   pk_id
    case 'voteList':
      return BASE_URL + 'cpond/battlefield/comment_list?' + getSignCode();
    
    //点赞 vote_id
    case 'voteZan':
      return BASE_URL + 'cpond/battlefield/comment_zan?' + getSignCode();

    //指定楼层 pk_id  vote_sequence
    case 'goToFloor':
      return BASE_URL + 'cpond/battlefield/comment_detail?' + getSignCode();

    //删除帖子  管理员
    case 'delComment':
      return BASE_URL + 'cpond/battlefield/comment_del?' + getSignCode();




    //城市选择 gift
    case 'checkGiftSupport':
      return BASE_URL + 'cpond/sign/check_gift_package_support?' + getSignCode();


    /*鱼豆商城*/
    //抽奖结果
    case 'roll':
      return BASE_URL + 'cpond/mall/roll?' + getSignCode();

    //鱼豆数量
    case 'rollProducts':
      return BASE_URL + 'cpond/mall/roll_products?' + getSignCode();

    //鱼豆记录
    case 'yudouLogs':
      return BASE_URL + 'cpond/user/credit_logs?' + getSignCode(); 

    //用户当前流量
    case 'networkFlow':
      return BASE_URL + 'cpond/mall/network_flow?' + getSignCode();

    //兑换流量
    case 'networkFlowRedeem':
      return BASE_URL + 'cpond/mall/network_flow_redeem?' + getSignCode();

    //整点抢
    case 'qiangLottery':
      return BASE_URL + 'cpond/mall/lottery?' + getSignCode();

    //整点抢鱼豆状态
    case 'lotteryStatus':
      return BASE_URL + 'cpond/mall/lottery_status?' + getSignCode();


    //支付
    case 'payOrder':
      return BASE_URL + 'cpond/order/test?' + getSignCode();

    //支付
    case 'payOrder2':
      return BASE_URL + 'cpond/order/test2?' + getSignCode();
   }
  
 }



var aFaceList = {
    '害羞': '1',
    '鄙视': '2',
    '发怒': '3',
    '微笑': '5',
    '阴险': '6',
    '流泪': '7',
    '大兵': '9',
    '困': '10',
    '擦汗': '11',
    '猪头': '12',
    '奋斗': '13',
    '坏笑': '14',
    '晕': '15',
    '鼓掌': '16',
    '酷': '17',
    '色': '18',
    '发呆': '19',
    '惊讶': '20',
    '白眼': '21',
    '抓狂': '22',
    '憨笑': '23',
    '傲慢': '24',
    '敲打': '25',
    '衰': '26',
    '呲牙': '28',
    '惊恐': '29',
    '可怜': '30',
    '流汗': '31',
    '疑问': '32',
    '偷笑': '33',
    '撇嘴': '35'
  }



/*
 * 表情解析功能
 */
function analysisFaceToDom(content, url) {
  if(content && typeof content.replace === 'function') {
    content = content.replace(/\[\W+?\]/g, function(v) {
      var key = v.replace(/\[|\]/g, '')
      if(aFaceList[key]) {

        if(url) {
            return '<img style="width:16px; height:16px; vertical-align:-3px;" src="../../images/qq-face/' + aFaceList[key] + '.gif">'
        }else{
            return '<img style="width:16px; height:16px; vertical-align:-3px;" src="../images/qq-face/' + aFaceList[key] + '.gif">'
        }

        
      } else {
        return v;
      }
    })

    return content;
  }
}



function getSignCode() {
    return getSignCodeV2();
    // var curCityObj = $api.getStorage('curCityObj');
    // var mapInfo = $api.getStorage('mapInfo');
    // var winLat = $api && $api.getStorage('winLat');
    // var winLon = $api && $api.getStorage('winLon');
    // // 新增:  area_code=定位城市父级CODE,定位城市CODE,选择城市父级CODE,选择城市CODE
    // // 新增:  area_code=定位城市CODE 定位城市父级CODE,,,选择城市CODE 选择城市父级CODE
    // // var area_code = curCityObj['curCode']+','+curCityObj['area_code']+','+mapInfo['parent_code']+','+mapInfo['area_code'];
    // var area_code = curCityObj['area_code']+','+curCityObj['curCode']+','+mapInfo['area_code']+','+mapInfo['parent_code'];
    // return 'app=android&token=demo&time=123&device='+api.deviceId+'&ver=2.2&sign=bc2a616abe6f6987f24e957a1a88c07d&lat='+(winLat?winLat : 0)+'&lon='+(winLon?winLon : 0)+'&area_codes='+area_code;
}


function getSignCodeV2()
{
    // var VER = '2.3.2015090501';
    var VER = '2.3.2015101401';
    var SIGNKEY = 'yddapp';
    var curCityObj = $api.getStorage('curCityObj');
    var mapInfo = $api.getStorage('mapInfo');
    var winLat = $api && $api.getStorage('winLat');
    var winLon = $api && $api.getStorage('winLon');
    var area_code = curCityObj['area_code']+','+curCityObj['parent_code']+','+mapInfo['area_code']+','+mapInfo['parent_code'];
    var app = api.systemType;
    var date = new Date();
    var today = date.Format('yyyyMMdd');
    var token = today + '_' +   faultylabs.MD5(api.deviceId + date.getTime() + Math.random());
    var net = api.connectionType;
    var signStr = 'app='+app+'&token='+token+'&device='+api.deviceId+'&ver='+VER+'&net='+net+'&lon='+(winLon?winLon : 0)+'&lat='+(winLat?winLat : 0)+'&area_codes='+area_code;
    var sign = faultylabs.MD5(signStr + faultylabs.MD5(token) + SIGNKEY);
    signStr += '&sign=' + sign;
    
    return signStr;
}



function sendAjax(url, data, callback, debug) {
  if(!api) return;
  api.ajax({
      url: url,
      method: 'post',
      dataType: 'json',
      // timeout: 30,
      data:{
        values: data
      }
    },function(ret,err){
      if(debug) {
        api.toast({
          msg: 'err>' + JSON.stringify(err) +'   url>>'+url + '  ret>>'+JSON.stringify(ret),
          duration:15000,
          location: 'middle'
        });
        // return;
      }
      if(ret) {
        if(ret['errcode'] === 0) {
          callback(ret['response']['data'], ret['response']['code'], ret['response']['message']);
        }else{
          uploadErrLog('php err',ret['errmsg'] );
        }
      }else {
        api.refreshHeaderLoadDone();
        showButtonLoadDiv(false);
        api.hideProgress();
        // api.toast({
        //   msg: '错误码：'+err.code+'；错误信息：'+err.msg+'网络状态码：'+err.statusCode+ ' url>>'+url,
        //   duration:2000,
        //   location: 'middle'
        // });
      };
    });
  }

  
  //错误日志上报
  function uploadErrLog(type, msg) {
    sendAjax(URLConfig('errLog'), {
        type : type,
        msg : msg
    },  function(data, code, msg) {});
  }


  function openWin(name, url, params, flag) {
    if(!api) return;
    var options = {
      name: name,
      url: url,
      slidBackEnabled : false,
      pageParam: params,
      bounces : false
    }
    if(flag) {
      options['animation'] = {
        type:"none",                //动画类型（详见动画类型常量）
        subType:"from_right",       //动画子类型（详见动画子类型常量）
        duration:300                //动画过渡时间，默认300毫秒
      }
    }
    api.openWin(options);
  }



//判断是否已经登录
function authInfo(callback, flag) {
  api.ajax({
    url: URLConfig('authInfo'),
    method: 'post',
    dataType: 'json',
    data:null
  },function(ret,err){
    if(ret) {
      if(ret['errcode'] === 0) {
        var data = ret['response']['data'];
        var code = ret['response']['code'];
        var msg = ret['response']['message'];
        
        if(code === 0) {
          $api.setStorage('user',data);
          if(!data['nickname']) {
            api.removeLaunchView();
            //跳转资料
            var url = './html/complete-info.html';
            if(flag) {
              url = './complete-info.html';
            }
            api.openWin({
              'name' : 'complete-info',
              'url' : url,
              'bounces' : false,
              'pageParam' : {'nickname' : data['nickname'], 'avatar' : data['avatar']},
              'slidBackEnabled' : false
            });
            api.hideProgress();
            return;
          }
        }else if(code === 9) {
          api.openWin({
            'name' : 'updateApp',
            'url' : './html/appupdate.html',
            'pageParam' : {'url' : data['url'] || 'http://www.yddapp.com/'}
          });
        }
        callback(data, code, msg);
      }else if(ret['errcode'] === 20001 || ret['errcode'] === 10001) {
        $api.setStorage('user',null);
        callback(null, 2, '请先登录');
      }else{
        api.removeLaunchView();
        api.toast({
          msg: ret['errmsg'] || '请求失败，稍后再试',
          duration:2000,
          location: 'middle'
        });
      }
    }else{
      api.removeLaunchView();
    }
  });

}


//打开登录页
function openLoginIndex(url) {
  $api.setStorage('user',null);
  api.openWin({
    name: 'logo',
    url: url || './index.html',
    animation: {
      type: 'movein',
      subType: 'from_bottom',
      duration: 0
    }
  });
}

function showLoginConfirm(url) {
  api.confirm({
      title: '提示框',
      msg: '您尚未登录，是否立即登录？',
      buttons:['取消', '确定']
  },function(ret,err){
      if(ret.buttonIndex == 2){
          openLoginIndex(url);
      }
  });
}



//获取用户等级、财富信息
function wealthInfo(callback) {
  sendAjax(URLConfig('wealth'), null, function(data, code, msg) {
    if(code != 0 && code != 2) {
      api && api.toast({
        msg: msg || '获取登录信息失败',
        duration:2000,
        location: 'middle'
      });
    }

    callback(data, code, msg);
  });
}

//显示加载动画
function showLoadDiv(flag, con) {
  $('.load-page').addClass('hidden').removeClass('nomore').removeClass('error').removeClass('wait');
  if(flag) {
    $('.load-page').removeClass('hidden').addClass('wait');
    con.addClass('hidden');
  }else{
    $('.load-page').addClass('hidden');
    con.removeClass('hidden');
  }
}

//显示底部加载动画
function showButtonLoadDiv(flag, con, imgSrc) {
  // imgSrc = imgSrc || '../images/loadButton.gif';
  if(flag) {
    if($('#showBottomDiv')[0]) {
      $('#showBottomDiv').remove();  
    }
    var htmlStr = '<div id="showBottomDiv" class="load-more" style="background:#eee;"></div>';
    con.append(htmlStr);
  }else{
    $('#showBottomDiv').remove();
  }
}

//显示暂无数据
function showNoData(con) {
  con.addClass('hidden');
  $('#showBottomDiv').addClass('hidden');
  $('.load-page').removeClass('error').removeClass('wait').addClass('nomore').removeClass('hidden');
}

//智能填图
var picStack = {};

//获取样式单元节点
function getDomsWithData(data, style) {
    var htmlStr = '';
    switch(style) {
      case 1:
        htmlStr += '<li class="style-1 border-bottom" id="'+data['id']+'" onclick="enterDetail(this);">'
                + '  <h3 class="title">'+data['title']+'</h3>'
                + '  <div class="images">'
                + '    <div class="img-box" url="'+data['url']+'"><i class="icon-m icon-img"></i></div>'
                + '  </div>'
                if(data['area_views'] < 10) {
                  // htmlStr += '  <div class="count">您是本市第'+data['area_views']+'位知道</div>'
                }else{
                  // htmlStr += '  <div class="count">您是第'+data['views']+'位知道</div>'
                }
                htmlStr += '</li>'
          picStack[data['url']] = {'style' : 1, 'url' :  data['url']};
        return htmlStr;
      case 2:
        htmlStr += '<li class="style-3 border-bottom" id="'+data['id']+'" onclick="enterDetail(this);">'
                +'  <h3 class="title">'+data['title']+'</h3>'
                +'  <div class="images">'
                +'    <div url="'+data['url']+'" class="img-box"><i class="icon-m icon-img"></i></div>'
                +'  </div>'
                if(data['area_views'] < 10) {
                  // htmlStr += '  <div class="count">您是本市第'+data['area_views']+'位知道</div>'
                }else{
                  // htmlStr += '  <div class="count">您是第'+data['views']+'位知道</div>'
                }
                htmlStr += '</li>'
          picStack[data['url']] = {'style' : 2, 'url' :  data['url']};
        return htmlStr;
      case 3:
        htmlStr +='<li class="style-2 border-bottom" id="'+data['id']+'" onclick="enterDetail(this);">'
                +'  <h3 class="title">'+data['title']+'</h3>'
                +'  <div class="images">'
                +'    <div class="img-box" url="'+data['url'][0]+'"><i class="icon-m icon-img"></i></div>'
                +'    <div class="img-box" url="'+data['url'][1]+'"><i class="icon-m icon-img"></i></div>'
                +'    <div class="img-box" url="'+data['url'][2]+'"><i class="icon-m icon-img"></i></div>'
                +'  </div>'
                if(data['area_views'] < 10) {
                  // htmlStr += '  <div class="count">您是本市第'+data['area_views']+'位知道</div>'
                }else{
                  // htmlStr += '  <div class="count">您是第'+data['views']+'位知道</div>'
                }
                htmlStr += '</li>'

        picStack[data['url'][0]] = {'style' : 3, 'url' :  data['url'][0]};
        picStack[data['url'][1]] = {'style' : 3, 'url' :  data['url'][1]};
        picStack[data['url'][2]] = {'style' : 3, 'url' :  data['url'][2]};

        return htmlStr;
    }
  
}

//智能填图 params: rate  容器的宽高比
//mode null(默认)  满屏填充
//mode true  全屏填充  按比例填充
function getImageSize(imgObj, mode, avatar) {
  if($.isEmptyObject(imgObj)) return;
  
  $.each(imgObj,  function(key, val) {
      var curEl = $('div[url="'+key+'"]');
      var cW = curEl.width();
       
      if(avatar) {
          curEl.html('<img src="'+key+'" alt="" style="width:'+cW+'px; border-radius:50%;"/>');
      }else{
        curEl.html('<img src="'+key+'" alt="" style="width:'+cW+'px;"/>');
      }
      curEl.find('img').fadeIn(500, function() {})
  });
}


//************缓存机制****************//
var CacheData = {
  
  addData : function(which, k, data) {
    var datas = $api.getStorage(which) || {};
    if( datas === 'undefined' || $.isEmptyObject(datas)) {
      datas = {};
    }
    datas[k] = data;
    $api.setStorage(which, datas);
  },

  deleteDataForKey : function(which, k) {
    var datas = $api.getStorage(which);
    if(!$.isEmptyObject(which) && datas[k]) {
      delete datas[k];
      $api.setStorage(which, datas);
    }
  },

  deleteDataForDays : function(which, day) {
    var datas = $api.getStorage(which);
    var curTime = +new Date();
    if(!$.isEmptyObject(datas)) {
      for(var i in datas) {
        var time = datas[i]['time'];
        if(curTime - time >= 1000*60*60*24*day) {
          delete datas[time];
        }
      }
    }
    $api.setStorage(which, datas);
  },

  getDataFromCache : function(which, k) {
    var cacheData = $api.getStorage(which);
    if(!$.isEmptyObject(cacheData) && k && cacheData[k]) {
      return cacheData;
    }else{
      return null;
    }
  }
  
}

//imageCache  图片缓存
function getImageCache(imgUrl) {
  
  var cacheObj =  CacheData.getDataFromCache('feedPics', imgUrl);
  
  if($.isEmptyObject(cacheObj)) { //如果第一次线上图返回，并保存到本地
    api && api.imageCache({
        url: imgUrl
    },function(ret,err){
      if (ret) {
        var path = ret.url;
        CacheData.addData('feedPics', imgUrl, {
          'time' : +new Date(),
          'url' : path
        });
      }
    });
    return imgUrl;
  }else{
    //本地有缓存，返回本地地址
    return cacheObj[imgUrl]['url'];
  }

}



//************缓存机制****************//



//?imageMogr2/auto-orient/thumbnail/!300x100r/gravity/Center/crop/!300x100/interlace/1/quality/100
function getPicUrl(source, retWidth, retHeight, notToJpg, notRetCorp) {
    var net = api.connectionType;
    if (source && source.indexOf('.qiniu.') < 0) {

        if (source.indexOf('img1.') < 0) {
            return source;
        }
        
        var gif = source.indexOf('.gif') > -1 ? '?isgif=1' : '';

        if(retWidth <= 320) {
            return source + '@!thumb320' + gif;
        }else if( retWidth > 320 && retWidth < 540) {
            return source + '@!thumb480' + gif;
        }else if( retWidth >= 540 && retWidth < 720) {
            return source + '@!thumb640' + gif;
        }else if( retWidth >= 720 ) {
            return source + '@!thumb750' + gif;
        }
    }

    source = source.split('?');
    var info = source[1].split('-');
    var sourceFormat = info[0],
        sourceSize = info[1],
        sourceWidth = info[2],
        sourceHeight = info[3];
    var quality = '', corp = '', thumbnail = '';
    var param = '?imageMogr2/auto-orient';
    if (net == 'wifi') {
        quality = '/quality/100!';
        if (!notRetCorp) {
            corp = '/gravity/Center/crop/!'+retWidth+'x'+retHeight;
        }
        thumbnail = '/thumbnail/!'+retWidth+'x'+retHeight+'r';
    } else if (net == '2g') {
        return '';
    } else {
        if (!notRetCorp) {
            corp = '/gravity/Center/crop/!'+retWidth+'x'+retHeight;
        }
        thumbnail = '/thumbnail/!'+retWidth+'x'+retHeight+'r';
    }
    param += thumbnail + corp + quality;
    if (!notToJpg) {
        param += '/format/jpg';
    }

    if(sourceFormat === 'gif') {
        return source[0] + param + '&isgif=1';
    }else{
        return source[0] + param;
    }
    // return source[0] + param + (sourceFormat == 'gif' ? '&isgif=1' : '');
}


//获取分享图片
function getShareImg(source) {
  
  if (source.indexOf('.qiniu.') < 0) {

    if (source.indexOf('img1.') < 0) {
      return source;
    }

    return source + '@!thumb320';
  }

  source = source.split('?');

  var param = '?imageMogr2/auto-orient';
  var quality = '/quality/100!';
  var thumbnail = '/thumbnail/!30x30r/gravity/Center/crop/!30x30';

  param += thumbnail + quality + '/format/jpg';  

  return source[0] + param;
}



function singleInitSwipe(swipeDom, statusDom) {
 
  if(swipeDom.data('init')) return;
  if(swipeDom.find('ul li').length <= 1) return;
  swipeDom.data('init', true);

  var swipeObj = Swipe(swipeDom[0], {
    continuous: true,
    disableScroll: false,
    stopPropagation: false,
    callback: function(index, elem) {
      // $(elem).parents('.swipe-wrap').next().find('span[name=sliderNum]').text(index+1)
      statusDom.text(index+1);
    },
    transitionEnd: function(index, elem) {
      
    }
  });


}


function initSwipe() {
  // 轮播图
  var swipes = $('div[name=swipe]');
  for(var i = 0; i < swipes.length; i++) {
    if($(swipes[i]).find('ul li').length <= 1) continue;
    if($(swipes[i]).data('init')) continue;
    $(swipes[i]).data('init', true);
    Swipe(swipes.eq(i)[0], {
      // auto: 5000,
      continuous: true,
      disableScroll: false,
      stopPropagation: false,
      callback: function(index, elem) {
      },
      transitionEnd: function(index, elem) {
         $(elem).parents('.swipe-wrap').next().find('span[name=sliderNum]').text(index+1)
      }
    });
  }

}


function initSwipe2() {
  window.pageSlide = new mo.Slide({
    target: $('.slide li'),
    direction: 'x',
    circle: true
  });
}


//解析URL
function getValueByName(url) {
  if(!url) return null;
  var paramObj = {};
  if(url.indexOf('?') > -1) {
    var paramsUrl = url.split('?')[1];
    if(paramsUrl.indexOf('&') > -1){
      var pace = paramsUrl.split('&');
      for(var i=0; i<pace.length; i++) {
        var key = pace[i].split('=')[0];
        var value = pace[i].split('=')[1];
        paramObj[key] = value;
      }
    }else{
      var key = paramsUrl.split('=')[0];
      paramObj[key] = paramsUrl.split('=')[1]
    }
  }

  return paramObj;
}


function sendRewarbAjax(key) {
  sendAjax(URLConfig('taskResult'), {key : key}, function(data, code, msg) {
    if(code === 0) {
      if(data['exp']) {
        openRewarbTip({
          'gold' : data['gold'],
          'exp' : data['exp'],
          'tasks' : data['tasks'],
          'name' : data['name']
        });
      }
    }else{
      api.toast({
        msg: msg || '获取失败，稍后再试',
        duration:2000,
        location: 'middle'
      });
    }
  });
}

function openRewarbTip(params, url) {
  if(!params['exp']) return;
  api.openFrame({
    name: 'rewarbTip',
    url : url || '../html/rewarbTip_frame.html',
    rect:{x:0,y:0,w:'auto',h:'auto'},
    bgColor: 'rgba(0,0,0,0.0)',
    bounces : false,
    pageParam : params,
    vScrollBarEnabled:true,
    hScrollBarEnabled:true
  });
  
}

var GpsEncode = {
    bdDecrypt : function (lng, lat)
    {
      var x = lng - 0.0065;
      var y = lat - 0.006;
      var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * this.getPi());
      var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * this.getPi());
      lng = z * Math.cos(theta);
      lat = z * Math.sin(theta);
      return {'lng' : lng, 'lat' : lat};
    },

    getPi : function ()
    {
      return 3.14159265358979324 * 3000.0 / 180.0;
    },

    bdEncrypt : function (lng, lat)
    {
      var x = lng;
      var y = lat;
      var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * this.getPi());
      var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * this.getPi());
      lng = z * Math.cos(theta) + 0.0065 ;
      lat = z * Math.sin(theta) + 0.006;
      return {'lng' : lng, 'lat' : lat};
    }
}

function myFixIos7Bar(el, $title) {
  var strDM = api.systemType;
  if (strDM == 'ios') {
      var strSV = api.systemVersion;
      var numSV = parseInt(strSV,10);
      var fullScreen = api.fullScreen;
      var iOS7StatusBarAppearance = api.iOS7StatusBarAppearance;
      if (numSV >= 7 && !fullScreen && iOS7StatusBarAppearance) {
          $title.css('paddingTop','20px');
          $(el).removeClass('hidden');
      }
  }
}

var accuracyArr = ['100m', '1km', '3km'];
var accuracyCount = 0;

function startLocation(callback, accuracy) {
  var baiduLocation = api.require('baiduLocation');
  baiduLocation.startLocation({
    accuracy: accuracy || '100m',
    filter:1,
    autoStop: true
  }, function(ret, err){
    var sta = ret.status;
    var lat = ret.latitude;
    var lon = ret.longitude;
    accuracyCount++;
    if(sta){
      var placeObj = GpsEncode['bdDecrypt'](lon, lat);
      $api.setStorage('winLat', placeObj['lat']);
      $api.setStorage('winLon', placeObj['lng']);
      var lnglatXY = new AMap.LngLat(placeObj['lng'],placeObj['lat']);
      
      //加载地理编码插件
      AMap.service(["AMap.Geocoder"], function() {
        var MGeocoder = new AMap.Geocoder({ 
            radius: 0,
            extensions: "base"
        });
        //逆地理编码
        MGeocoder.getAddress(lnglatXY, function(status, result){
          if(status === 'complete' && result.info === 'OK'){
            var parent_code = parseInt(Number(result['regeocode']['addressComponent']['adcode'])/100)*100;
            var parent_name = result['regeocode']['addressComponent']['city'] || result['regeocode']['addressComponent']['province'];
            var area_code = result['regeocode']['addressComponent']['adcode'];
            var area_name = result['regeocode']['addressComponent']['district'];
            sendAjax(URLConfig('cityDetail'), {'area_code' : parent_code}, function(data, code, msg) {
              if(code === 0) {
                parent_name = data['city_name'].replace('市','');

                $api.setStorage('curCityObj', {
                  'parent_code' : parent_code,
                  'parent_name' : parent_name,
                  'area_code' : area_code,
                  'area_name' : area_name
                });
                
                var mapInfo = $api.getStorage('mapInfo');
                if($.isEmptyObject(mapInfo)) {
                  $api.setStorage('mapInfo', {
                    'parent_code' : parent_code,
                    'parent_name' : parent_name,
                    'area_code' : area_code,
                    'area_name' : area_name
                  });
                }
                
                accuracyCount = 0;
                callback(result);
              }else{
                api.toast({
                  msg: msg || '请求失败，稍后再试',
                  duration:2000,
                  location: 'middle'
                });
              }
            });
          }
        });
      });
    }else{
      if(accuracyArr[accuracyCount]) {
        startLocation(callback, accuracyArr[accuracyCount]);
      }else{
        uploadErrLog('startLocation fail!', '真的无法定位！'+ accuracyCount);
        callback();
      }
    }
  });
}


/* 微信分享 */
function shareForWeixin(scene, curDatas, which) {
  
  if(scene === 'timeline') {
    curDatas['info']['title'] = curDatas['info']['description'];
  }

  var url = curDatas['info']['imageUrl'];

  if(!url) {
    url = 'http://img1.shanggou.la/default/logo.jpg';
  }

  api.imageCache({
      url: url
  },function(ret,err){
      if (ret) {
        var path = ret.url;
        var weiXin = api.require('weiXin');
        
        weiXin.registerApp(function(ret,err){
          if (ret.status) {
            var options = {
                scene:scene,
                contentType:'web_page',
                title:curDatas['info']['title'],
                description:curDatas['info']['description'],
                thumbUrl: path,
                contentUrl: curDatas['info']['content_url']
            }
            
            var imageFilter = api.require("imageFilter");
            imageFilter.compress({
                img: path,
                quality: 0.5,
                scale: 0.5,
                save: {
                  imgPath: api.cacheDir,
                  imgName: 'share.jpg'
                }
            }, function(ret, err){
                options['thumbUrl'] = api.cacheDir+'/share.jpg';
                weiXin.sendRequest(options,function(ret,err){
                if(ret.status){
                    api.toast({
                      msg: '分享成功',
                      duration:2000,  
                      location: 'middle'
                    });
                  } else {
                    api.toast({
                      msg: '分享取消',
                      duration:2000,
                      location: 'middle'
                    });
                  };
               });
            });
          }
        });
        }
      });
}


function shareForQQ(type, curDatas, which) {
  var qq = api.require('qq');
  var url = curDatas['info']['imageUrl'];
  qq.shareNews({
      url:curDatas['info']['content_url'],
      title:curDatas['info']['title'],
      description:curDatas['info']['description'],
      imgUrl:url,
      type:type
  },  function(ret, err) {

    if(ret.status){
      api.toast({
        msg: '分享成功',
        duration:2000,
        location: 'middle'
      });

    }else{
      api.toast({
        msg: '分享取消',
        duration:2000,
        location: 'middle'
      });
    };



  });
}


function getObjSize(obj) {
  var size = 0;
  if(obj) {
    for(var i in obj) {
      size++;
    }
  }
  return size;
}

function getIndexForField(field, obj) {
  if(!field || $.isEmptyObject(obj)) return -1;
  var index = 0;
  for(var i in obj) {
    if( i === field ){
      return index;
    }
    index++;
  }

  return -1;
}



//打开个人简介页
window.enterProfile = function(el) {
  var uid = $(el).attr('uid')
  if(uid.indexOf('ss') > -1) {
    uid = uid.replace('ss','');
  }
  if(!uid) return;
  api.openWin({
    'name' : 'profile',
    'url' : 'profile.html',
    'bounces' : true,
    'bgColor' : '#507be7',
    'pageParam' : {'uid' : uid}
  });

}



//分享弹窗
window.sharePop = function(title, datas, weiXin) {
  var buttons = ['微信好友','微信朋友圈','QQ好友', 'QQ空间'];
  // if(api.systemType === 'ios') {  //测试版关闭QQ
  //   buttons = ['微信好友','微信朋友圈'];
  // }
  api.actionSheet({
      title: title,
      cancelTitle: '取消',
      buttons: buttons
  },function(ret,err){
      switch(ret.buttonIndex) {
        case 1:
          shareForWeixin('session', datas, 'share_art');
          break;
        case 2:
          shareForWeixin('timeline', datas, 'share_art');
          break;
        case 3:
          shareForQQ('QFriend', datas, 'share_art');
          break;
        case 4:
          shareForQQ('QZone', datas, 'share_art');
          break;
      }
  });
}

//分享弹窗QQ
window.shareQQPop = function(title, datas) {
  api.actionSheet({
      title: title,
      cancelTitle: '取消',
      buttons: ['QQ好友', 'QQ空间']
  },function(ret,err){
      switch(ret.buttonIndex) {
        case 1:
          shareForQQ('QFriend', datas, 'share_art');
          break;
        case 2:
          shareForQQ('QZone', datas, 'share_art');
          break;
      }
  });
}

//分享弹窗weixin
window.shareWeixinPop = function(title, datas) {
  api.actionSheet({
      title: title,
      cancelTitle: '取消',
      buttons: ['微信好友','微信朋友圈']
  },function(ret,err){
      switch(ret.buttonIndex) {
        case 1:
          shareForWeixin('session', datas, 'share_art');
          break;
        case 2:
          shareForWeixin('timeline', datas, 'share_art');
          break;
      }
  });
}

//删除、隐藏
window.actionPop = function(buttons,  callback) {
  var options = {
    cancelTitle: '取消',
    destructiveTitle : '删除'
  }
  if(buttons.length > 0) {
    options['buttons'] = buttons;
  } 
  
  api.actionSheet(options, function(ret,err){
      callback(ret.buttonIndex);
  });
}

//举报
window.reportPop = function(callback, rank) {
  var options = {
    cancelTitle: '取消',
    buttons : ['盗图','无关话题','广告','其他']
  }
  if(rank) {
    options['buttons'] = ['盗图','数据不实','无关话题','广告','其他'];
  }
  
  api.actionSheet(options, function(ret,err){
      callback(ret.buttonIndex);
  });
}


//管理员封号功能
window.accountAction = function(uid) {
  var options = {
    cancelTitle: '取消',
    buttons : ['一天','三天','一周','永久']
  }
  api.actionSheet(options, function(ret,err){
    var params = {
      uid : uid,
      period : ret.buttonIndex
    }
    if(ret.buttonIndex === 5) return;
    sendAjax(URLConfig('banUser'), params, function(data, code, msg) {
      if(code === 0) {
        api.toast({msg: '操作成功',duration:2000,location: 'middle'});
      }
    });
  });
}

//头像更换
window.avatarChange = function(callback) {
  api.actionSheet({
      title: '更换头像',
      cancelTitle: '取消',
      buttons: ['拍照','从手机相册选取']
  },function(ret,err){
      callback(ret.buttonIndex);
  });
}

//检查版本更新
window.checkAppVersion = function(url) {

  var params = {};

  params['app_id'] = api.appId;
  params['app_name'] = api.appName;
  params['app_version'] = api.appVersion;
  params['system_type']  = api.systemType;
  params['system_version'] = api.systemVersion;
  params['version']          = api.version;
  params['device_model'] = api.deviceModel;
  params['device_name'] = api.deviceName;
  params['operator']  = api.operator;
  params['connection_type'] = api.connectionType; 
  params['screen_width'] = api.screenWidth; 
  params['screen_height'] = api.screenHeight;
  params['win_width'] = api.winWidth; 
  params['win_height'] = api.winHeight;

  var registrationId = $api.getStorage('registrationId');
  params['registration_id'] = registrationId;

  sendAjax(URLConfig('checkVer'), params, function(data, code, msg) {
    if(code == 0) {
      api.removeLaunchView();
      if(data['code'] == 1) { // 强制更新
        api.openWin({
          'name' : 'updateApp',
          'url' : url || './html/appupdate.html',
          'pageParam' : {'url' : data['url'] || 'http://www.yddapp.com/'}
        });
      }else if(data['code'] == 2) { //选择更新
        api.confirm({
          title: '更新提示',
          msg: data['content'] || '有新版本发布了，是否下载更新？',
          buttons:['取消', '确定']
        },function(ret,err){
          if(ret.buttonIndex == 2){
            if(api.systemType === 'ios') {
              api.openApp({
                  iosUrl: data['url'] || 'http://www.yddapp.com/'
              },function(ret,err){});
            }else{
              api.openApp({
                  androidPkg: 'android.intent.action.VIEW',
                  mimeType: 'text/html',
                  uri: data['url'] || 'http://www.yddapp.com/'
              },function(ret,err){});
            }
          }
        });
      }
    }
    
  });

}


// 对Date的扩展，将 Date 转化为指定格式的String  
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，   
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)   
// 例子：   
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423   
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18   
Date.prototype.Format = function(fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

//极光推送通知
function jpushAction(url) {
  //shanggoula://news/info?id=74
  //shanggoula://user/qrcode?uid=11719
  //shanggoula://fishing_shop/detail?id=74
  //shanggoula://pond/detail?id=108198
  //shanggoula://feed/detail?id=3337
  // shanggoula://message/list
  var subfix = './html';
  if(typeof url != 'string') {
    url = $(url).attr('url');
    subfix = '.';
  }

  if(url.indexOf('shanggoula://') > -1) {
    if(url.indexOf('user/qrcode') > -1 || url.indexOf('user/info') > -1) { //打开个人简介页
      var uid = getValueByName(url)['uid'];
      api.openWin({
        'name' : 'profile',
        'url' : subfix + '/profile.html',
        'bounces' : true,
        'bgColor' : '#507be7',
        'pageParam' : {'uid' : uid}
      });
    }else if(url.indexOf('pond/detail') > -1) { //打开钓点详情页
      var pondId = getValueByName(url)['id'];
      api.openWin({
        name: 'pond_detail',
        url: subfix + '/pond-details.html',
        bounces : false,
        bgColor : '#fff',
        pageParam: {'pondId': pondId}
      });
    }else if(url.indexOf('feed/detail') > -1) { //打开Feed详情页
      var feedId = getValueByName(url)['id'];
      api.openWin({
        'name' : 'feedDetail',
        'url' : subfix + '/feedDetail.html',
        'pageParam' : {'id' : feedId},
        'bounces':true
      });
    }else if(url.indexOf('message/list') > -1) { //打开消息列表
      api.openWin({
        'name' : 'message',
        'url' : subfix + '/message.html',
        'bounces':true
      });
    }
  }else if(url.indexOf('http://') > -1) {  //网页
      api.openWin({
        name: 'adpics',
        url: subfix + '/adpics.html',
        bounces : false,
        pageParam: {'url': url, 'title' : ' '}
      });
    }

}



//头像渲染
function renderAvatar() {
  var boxs = $('.avatar-box i.icon-user');
  for(var i=0; i<boxs.length; i++) {
      var avatarBox = boxs.eq(i).parent();
      var imgAvatar = avatarBox.attr('url');
      if(imgAvatar && !avatarBox.find('img')[0]) {
        avatarBox.html('<img src="'+imgAvatar+'" style="border-radius:50%;" />');
      }
      // avatarBox.find('img').fadeIn(500, function() {})
  }
}


//图片渲染
function renderLogo() {
  var boxs = $('div[name=imgBox] i.icon-logo');
  for(var i=0; i<boxs.length; i++) {
      var logoBox = boxs.eq(i).parent();
      var imgLogo = logoBox.attr('url');
      if(imgLogo && !logoBox.find('img')[0]) {
        logoBox.html('<img src="'+imgLogo+'"/>');
      }
      // logoBox.find('img').fadeIn(500, function() {})
  }
}

//视频渲染
// function renderVideo() {
//   var videos = $('.video-box');
//   for(var i=0; i<videos.length; i++) {
//     var poster = videos.eq(i).attr('poster');
//     var src = videos.eq(i).attr('src');
//     var img = new Image();
//     img.src = poster;
//     img.onload = function() {
      
//     }

//   }
// }



var fishTypeObj = {
    '1' : '鱼塘',
    '2' : '野钓',
    '3' : '其他'
}
var notifyBeforeObj = {
    '1' : '提前24小时',
    '2' : '提前12小时',
    '3' : '提前4小时',
    '4' : '提前1小时',
    '5' : '提前30分钟'
}
