/*
 * type 1 feed
 * type 2 文章
 * type 3 选项调查
 * type 4 广告图
 * type 5 应用分享
 * type 6 推荐关注
 * type 7 开启通讯录
 * type 8 绑定手机
 */
var user = $api.getStorage('user');
var chatBox;
var isClick = true;

//flag 控制是否延迟加载 true 为不延迟加载
function getCurDoms(data) {
    var htmlStr = '';
    
    var pics = data['pics'];
    var fish_extra = data['fish_extra'];

    if(typeof pics === 'string'){
      try{
        pics = JSON.parse(pics);
      }catch(e){
        var errmsg = e.message+'   '+JSON.stringify(e);
        uploadErrLog('exception', errmsg);
      }
    }

    if(typeof fish_extra === 'string'){
      try{
        if(fish_extra) {
          fish_extra = JSON.parse(fish_extra);
        }else{
          fish_extra = {};
        }
      }catch(e){
        var errmsg = e.message+'   '+JSON.stringify(e);
        uploadErrLog('exception', errmsg);
      }
    }

    htmlStr += '  <div id="'+data['id']+'" topicId="'+data['topic_id']+'"  name="feedMode"  style="background:#fff;">'

    htmlStr += getInnerContent(fish_extra);
 
    var allCommentNum = 0;
    if(data['comments']) {
      allCommentNum = data['comment_total'];
    }

    htmlStr += '<div class="text-list mt10">'
    +'<ul class="border-top border-bottom">'
    +'  <li>'
    +'    <span class="r"><span name="content">'+data['p_name']+'</span></span>'
    +'    <span class="field">钓点</span>'
    +'  </li>'
    +'  <li type="device" name="ganzhang" class="border-top hidden">'
    +'    <span class="r"></span>'
    +'    <span class="field inner-field">竿长</span>'
    +'  </li>'
    +'  <li type="device" name="zhuxian" class="border-top hidden">'
    +'    <span class="r"></span>'
    +'    <span class="field inner-field">主线</span>'
    +'  </li>'
    +'  <li type="device" name="zixian" class="border-top hidden">'
    +'    <span class="r"></span>'
    +'    <span class="field inner-field">子线</span>'
    +'  </li>'
    +'  <li type="device" name="shuishen" class="border-top hidden">'
    +'    <span class="r"></span>'
    +'    <span class="field inner-field">水深</span>'
    +'  </li>'
    +'  <li type="device" name="yuer" class="border-top hidden">'
    +'    <span class="r"></span>'
    +'    <span class="field inner-field">鱼饵</span>'
    +'  </li>'
    +'  <li type="device" name="woliao" class="border-top hidden">'
    +'    <span class="r"></span>'
    +'    <span class="field inner-field">窝料</span>'
    +'  </li>'
    +'</ul></div>'


    
    htmlStr +=  '<div class="action-group border-bottom">'
    +'    <ul>'
    +'      <li onclick="commentAction(this);" name="comments" allCommentNum="'+allCommentNum+'" class="border-right"><span class="icon-box"><i class="icon-m icon-comment"></i></span>评论</li>'
    if(data['is_zaned']) {
      htmlStr += '<li onclick="zanAction(this);"  name="zan" zan="yes" class="border-right active"><span class="icon-box"><i class="icon-m icon-appreciate"></i><i class="icon-m icon-appreciate-fill"></i></span><span name="font">已赞</span></li>'
    }else{
      htmlStr += '<li onclick="zanAction(this);"  name="zan" zan="no" class="border-right"><span class="icon-box"><i class="icon-m icon-appreciate"></i><i class="icon-m icon-appreciate-fill"></i></span><span name="font">赞</span></li>'
    }

    var shareImg = getShareImg(pics[0]);
    if(pics.length > 0) {
      htmlStr += '<li onclick="shareAction(this);"  desc="'+data['desc']+'" imgUrl="'+shareImg+'" topicId="'+data['topic_id']+'" share_url="'+data['share_url']+'" class="border-right"><span class="icon-box"><i class="icon-m icon-share"></i></span><span name="font">分享</span></li>'
    }else{//没有图片
      htmlStr += '<li onclick="shareAction(this);"  desc="'+data['desc']+'" topicId="'+data['topic_id']+'" share_url="'+data['share_url']+'" class="border-right"><span class="icon-box"><i class="icon-m icon-share"></i></span><span name="font">分享</span></li>'
    }
    
    htmlStr +='<li rank="'+data['pond_rank']+'" onclick="reportAction(this);" ><span class="icon-box"><i class="icon-m icon-report"></i></span>举报</li>'
    +'    </ul>'
    +'  </div>'
    +'<div con="zan">'
    if(data['zans'] && data['zans'].length > 0) {
      htmlStr += '  <div class="appreciate-list">'
              +'    <div class="count" name="zan_total">'
              +'      <i class="icon-m icon-appreciate"></i><span class="num" name="num">'+data['zans'].length+'</span>'
              +'    </div>'
              +'    <ul>'
              for(var j=0; j<data['zans'].length; j++) {
                var avatarImg = data['zans'][j]['avatar'];
                if(avatarImg) {
                  avatarImg = getPicUrl(avatarImg, 40, 40);
                }
                htmlStr += '<li uid="'+data['zans'][j]['uid']+'"><div class="avatar-box" onclick="enterProfileFeed(this);"  uid="'+data['zans'][j]['uid']+'" url="'+avatarImg+'" style="border-radius:50%;"><i class="icon-m icon-user"></i></li>'
              }
              htmlStr += '</ul>'
              +'  </div>'
    }
    htmlStr += '</div>'


    



    htmlStr += '<div con="comments">'
    if(allCommentNum > 0) {
      htmlStr += '  <div class="comment-list">'
      +'    <div class="count" name="commentTotal">'
      +'      <i class="icon-m icon-comment"></i><span class="num" name="num">'+allCommentNum+'</span>'
      +'    </div>'
      +'    <ul>'
      
      var len = allCommentNum > 3 ? 3 :allCommentNum;
      for(var j=0; j<len; j++) {
        if(!data['comments'][j]) continue;
        var avatarImg = data['comments'][j]['u_avatar'];
        if(avatarImg){
          avatarImg = getPicUrl(avatarImg, 40, 40);
        }
        htmlStr += '<li  class="border-bottom" >'
          +'        <div class="avatar-box" uid="'+data['comments'][j]['uid']+'" url="'+avatarImg+'" onclick="enterProfileFeed(this);"  style="border-radius:50%;"  ><i class="icon-m icon-user"></i></div>'
          +'        <div feedId="'+data['id']+'" class="dialogue" curuid="'+data['comments'][j]['uid']+'" curname="'+data['comments'][j]['u_name']+'">'
          if(data['comments'][j]['atu_name']) { //回复
            htmlStr += '<span class="name"   uid="'+data['comments'][j]['uid']+'">'+data['comments'][j]['u_name']+'</span>回复<span class="name"   uid="'+data['comments'][j]['atuid']+'">'+data['comments'][j]['atu_name']+'</span>:<span cmid="cmid_'+data['comments'][j]['id']+'" curname="'+data['comments'][j]['u_name']+'" curuid="'+data['comments'][j]['uid']+'"  onclick="replyAction(this);" class="c">'+analysisFaceToDom(data['comments'][j]['comment'])+'</span>'
          }else{
            htmlStr += '<span class="name"  uid="'+data['comments'][j]['uid']+'">'+data['comments'][j]['u_name']+'</span>:<span cmid="cmid_'+data['comments'][j]['id']+'" curname="'+data['comments'][j]['u_name']+'" curuid="'+data['comments'][j]['uid']+'"  onclick="replyAction(this);" class="c">'+analysisFaceToDom(data['comments'][j]['comment'])+'</span>'
          }
          htmlStr += '</div>'
          +'</li>'
      }
      htmlStr += '    </ul>'
              +'<div onclick="seeMoreComment(this);"  name="seeMoreComment">'
      if(allCommentNum > 3) {
        htmlStr += '    <div class="view-all">查看所有'+allCommentNum+'条评论</div>'
      }
      htmlStr += '  </div></div>'
    }
    htmlStr += '  </div>'
                +  '</div>'

  return htmlStr;
}


function getInnerContent(fishExtra) {
  var htmlStr = '';
  for(var i=0; i<fishExtra.length; i++) {
    if(fishExtra[i]['img']) {
      htmlStr += '<div class="c-wrap">'
      +'  <img src="'+fishExtra[i]['img']+'">'
      +'</div>'
    }else if(fishExtra[i]['text']) {
      htmlStr += '<div class="c-wrap">'
      +'  <p>'+fishExtra[i]['text']+'</p>'
      +'</div>'
    }
  }

  return htmlStr;
}


/*
 * 个人主页 onclick="enterProfileFeed(this);" 
 */
function enterProfileFeed(el) {
  event.stopPropagation();
  el = $(el);
  
  var uid = el.attr('uid');
  api.openWin({
    'name' : 'profile',
    'url' : 'profile.html',
    'bounces' : true,
    'bgColor' : '#507be7',
    'pageParam' : {'uid' : uid}
  });

}


/*
 * 更多评论  onclick="seeMoreComment(this);" 
 */
function seeMoreComment(el) {
  event.stopPropagation();
  el = $(el);
  var feedId = el.parents('div[name=feedMode]').attr('id');
  api.openWin({
    'name' : 'comment-list-new',
    'url' : 'comment-list-new.html',
    'pageParam' : {'feedId' : feedId}
  });
}




/*
 * 举报  onclick="reportAction(this);" 
 */
function reportAction(el) {
  event.stopPropagation();
  el = $(el);
  var feedId = el.parents('div[name=feedMode]').attr('id');
  var rank = el.attr('rank');

  var userInner = $api.getStorage('user');
  if($.isEmptyObject(userInner)) {
    showLoginConfirm('../index.html');  
    return;
  }

  reportPop(function(index) {
    if(index === 6) return;
    sendAjax(URLConfig('report'), {'type' : index, 'feed_id': feedId}, function(data, code, msg) {
      if(code === 0) {
        api.toast({msg: '举报成功，感谢您的及时反馈！', duration:2000,location: 'middle'});
      }else{
        api.toast({msg: msg || '请求失败，稍后再试', duration:2000,location: 'middle'});
      }
    });
  }, rank); 
}

/*
 * 评论  onclick="commentAction(this);" 
 */
var curFeedId = '', atuid = '', curname = '';
function commentAction(el) {
  event.stopPropagation();
  el = $(el);
  var userInner = $api.getStorage('user');
  if($.isEmptyObject(userInner)) {
    showLoginConfirm('../index.html');  
    return;
  }

  atuid = ''; //置空回复uid
  curFeedId = el.parents('div[name=feedMode]').attr('id');

  chatBox = api.require('UIChatBox');
  chatBox.open({
      placeholder: '称赞下这篇渔获吧...',
      autoFocus : true,
      maxRows: 4,
      emotionPath: 'widget://images/emotion',
      styles: {
          inputBar: {
              borderColor: '#d9d9d9',
              bgColor: '#f2f2f2'
          },
          inputBox: {
              borderColor: '#B3B3B3',
              bgColor: '#FFFFFF'
          },
          emotionBtn: {
              normalImg: 'widget://images/emotion/face1.png'
          },
          keyboardBtn: {
              normalImg: 'widget://images/emotion/key1.png'
          }
      }
    }, function(ret,e){
        //点击发送按钮
        if(ret.eventType == 'send'){
            sendCommentAjax(ret.msg);
            chatBox.closeKeyboard();
            chatBox.close();
            chatBoxOpend = false; 
        }
    });
    
  
}


//监听关闭输入框
$('body').on('touchstart',  function() {
  if(chatBox) {
    chatBox.closeKeyboard();
    chatBox.close();
  }
});

/*
 * 赞  onclick="zanAction(this);" 
 */
function zanAction(el) {
  event.stopPropagation();
  el = $(el);
  var zan = el.attr('zan');
  
  var feed_id = el.parents('div[name=feedMode]').attr('id');
  var conZan = $('#'+feed_id).find('div[con=zan]');
    var userInner = $api.getStorage('user');
    if($.isEmptyObject(userInner)) {
      showLoginConfirm('../index.html');  
      return;
    }

    if(zan === 'no') { //赞
      el.addClass('active');
      el.find('span[name=font]').text('已赞');
      el.attr('zan', 'yes');
      changeZanDoms('add',conZan, feed_id);
      if(feed_id && feed_id != 'undefined') { //自己发的渔获也可以赞
        sendAjax(URLConfig('zan'), {'feed_id' : feed_id}, function(data, code, msg) {
          if(code === 0){
            
          }else{
            api.toast({msg: msg || '请求失败，稍后再试', duration:2000,location: 'middle'});
          }
        });
      }
      
    }else{ //取消赞
      $('#'+feed_id).find('span[name=addone]').html('');
      el.removeClass('active');
      el.find('span[name=font]').text('赞')
      el.attr('zan', 'no');
      changeZanDoms(null, conZan, feed_id);
      if(feed_id && feed_id != 'undefined') { //自己发的渔获也可以赞
        sendAjax(URLConfig('cancelZan'), {'feed_id' : feed_id}, function(data, code, msg) {
          if(code === 0) {
          }else{
            api.toast({msg: msg || '请求失败，稍后再试', duration:2000,location: 'middle'});
          }
        });
      }
    }
}

/*
 * 分享  onclick="shareAction(this);" 
 */
function shareAction(el) {
   event.stopPropagation();
   el = $(el);
   // api.toast({msg: '暂未开放，下个版本可以使用',duration:2000,location:'middle'});
   var datas = {};
   var share_url = el.attr('share_url');
   var topicId = el.attr('topicId');
   var desc = el.attr('desc');
   var title = '分享一篇精彩的渔获';
   var imgUrl = 'http://img1.shanggou.la/default/logo.jpg';
   if(el.attr('imgUrl')) {
    imgUrl = el.attr('imgUrl');
   }

   if(topicId != 0){
      title = getShareTitle(topicId);
   }

   if(!title) {
     title = '分享一篇精彩的渔获';
   }
   if(!desc && topicId == 15) {
    desc = '赶紧参加吧';
   }
   datas['info'] = {
    'title' : title,
    'description' : desc,
    'content_url' : share_url,
    'imageUrl' : imgUrl
   };

   sharePop(title, datas);
}

function getShareTitle(id){
  var shareTitleObj = {
    3 : '分享一篇钓鱼奇闻囧事',
    4 : '分享一篇女钓手的英姿',
    6 : '分享一条奇鱼等你鉴定',
    9 : '分享一篇麒麟臂',
    10 : '分享一篇钓鱼空军记',
    13 : '分享一篇钓鱼沿途美景',
    15 : '分享鱼多多火爆活动'
  }

  return shareTitleObj[id];
}


/*
 * 关注   onclick="followAction(this);" 
 */
function followAction(el) {
  event.stopPropagation();
  el = $(el);
  var uid = el.attr('uid'), follow = el.attr('follow');

  var userInner = $api.getStorage('user');
  if($.isEmptyObject(userInner)) {
    showLoginConfirm('../index.html');  
    return;
  }

  if(follow === 'no'){
    //关注
    el.removeClass('color-green').text('已关注').attr('follow', 'yes');
    sendAjax(URLConfig('follow'), {'uid' : uid}, function(data, code, msg) {
      if(code != 0) {
        el.addClass('color-green').text('关注').attr('follow', 'no');
        api.toast({msg: msg || '请求失败，稍后再试',duration:2000,location:'middle'});
      }
    });
  }else{
    //取消关注
    el.addClass('color-green').text('关注').attr('follow', 'no');
    sendAjax(URLConfig('cancelFollow'), {'uid' : uid}, function(data, code, msg) {
      if(code != 0) {
        el.removeClass('color-green').text('已关注').attr('follow', 'yes');
        api.toast({msg: msg || '请求失败，稍后再试', duration:2000,location: 'middle'});
      }
    });
  }
}


/*
 * 删除   onclick="selfAction(this);" 
 */
function selfAction(el) {
  event.stopPropagation();
  el = $(el);
  var feedId = el.parents('div[name=feedMode]').attr('id');
  var isAdmin = el.attr('isAdmin');
  authInfo(function(data, code, msg) {
    if(code === 2) {
      showLoginConfirm('../index.html');  
    }else if(code === 0){

      if(isAdmin) {  //隐藏帖子
        actionPop(['隐藏'], function(index) {
          if(index === 1) {
            //删除帖子
            sendAjax(URLConfig('feedDel'), {'feed_id' : feedId}, function(data, code, msg) {
              if(code == 0) {
                $('#'+feedId).hide(function() {
                   $('#'+feedId).remove();
                });
              }else{
                api.toast({msg: msg || '请求失败，稍后再试', duration:2000,location: 'middle'});
              }
            });
          }else if(index === 2){
            //隐藏帖子
            sendAjax(URLConfig('hideFeed'), {'feed_id' : feedId}, function(data, code, msg) {
              if(code == 0) {
                $('#'+feedId).hide(function() {
                   $('#'+feedId).remove();
                });
              }else{
                api.toast({msg: msg || '请求失败，稍后再试', duration:2000,location: 'middle'});
              }
            });
          }
        });
      }else{
        actionPop([], function(index) {
          if(index === 1) {
            //删除评论
            delComments(cmid, curFeedId);
          }
        });
      }
      
    }
  });
}

/*
 * 回复   onclick="replyAction(this);"   未登录和自己 不能回复
 */
function replyAction(el) {
  event.stopPropagation();
  el = $(el);
  
  curFeedId = el.parents('div[name=feedMode]').attr('id');
  curname = el.attr('curname');
  atuid = el.attr('curuid');

  var userInner = $api.getStorage('user');
  if($.isEmptyObject(userInner)) {
    showLoginConfirm('../index.html');  
    return;
  }

  if(atuid == userInner['id']) return;
  if(!chatBox) {
    chatBox = api.require('UIChatBox');
  }
  chatBox.open({
    placeholder: '回复 '+curname,
    autoFocus : true,
    maxRows: 4,
    emotionPath: 'widget://images/emotion',
    styles: {
        inputBar: {
            borderColor: '#d9d9d9',
            bgColor: '#f2f2f2'
        },
        inputBox: {
            borderColor: '#B3B3B3',
            bgColor: '#FFFFFF'
        },
        emotionBtn: {
            normalImg: 'widget://images/emotion/face1.png'
        },
        keyboardBtn: {
            normalImg: 'widget://images/emotion/key1.png'
        }
    }
  }, function(ret){
      //点击发送按钮
      if(ret.eventType == 'send'){
          sendCommentAjax(ret.msg);
          chatBox.closeKeyboard();
          chatBox.close();
          chatBoxOpend = false; 
      }
  });

}


function sendCommentAjax(text) {
  var params = { 'feed_id' : curFeedId,'uid' : user['id'],'comment' : text};
  if(atuid) {
    params['at_uid'] = atuid;
  }

  if(curFeedId && curFeedId != 'undefined') { //自己发的渔获可以评论
    sendAjax(URLConfig('comment'), params, function(data, code, msg) {
      if(code === 0) {
        changeCommentDoms(text, data);
      }else{
        api.toast({msg: msg || '请求失败，稍后再试', duration:2000,location: 'middle'});
      }
    });
  }else{
    changeCommentDoms(text)
  }
  
}


//改变评论系列数据
function changeCommentDoms( comment, cmid) {
  var el = $('#'+curFeedId).find('div[con=comments]');
  var curEl = $('#'+curFeedId).find('li[name=comments]')
  var oldLen = Number(curEl.attr('allCommentNum'));
  var c = Number(el.find('div[name=commentTotal]').find('span[name=num]').text());
  var htmlStr = '';
  
  if(!cmid) {  //自己发的渔获
    oldLen = 0;
    el = $('div[name=feedMode]').first().find('div[con=comments]');
  }

  if(oldLen === 0) {
    //添加评论
    htmlStr += '  <div class="comment-list">'
      +'    <div class="count" name="commentTotal">'
      +'      <i class="icon-m icon-comment"></i><span name="num">1</span>'
      +'    </div>'
      +'    <ul>'
      +'      <li  cmid="cmid_'+cmid+'" class="border-bottom">'
      +'        <div class="avatar-box" url="'+user['avatar']+'" uid="'+user['id']+'"  onclick="enterProfileFeed(this);" ><img style="border-radius:50%;" src="'+user['avatar']+'" ></div>'
       +'      <div class="dialogue" feedId="'+curFeedId+'" curname="'+user['nickname']+'" curuid="'+user['id']+'">'
      if(atuid) {
        htmlStr += '          <span class="name"  onclick="enterProfileFeed(this);" >'+user['nickname']+'</span>回复:<span class="name"  onclick="enterProfileFeed(this);" >'+curname+'</span><span class="c">'+analysisFaceToDom(comment)+'</span>'
      }else{
        htmlStr += '          <span class="name"  onclick="enterProfileFeed(this);" >'+user['nickname']+'</span>:<span class="c">'+analysisFaceToDom(comment)+'</span>'
      }
      htmlStr += '        </div>'
      +'      </li>'
      htmlStr += '    </ul>'
      +'<div onclick="seeMoreComment(this);"  name="seeMoreComment">'
      +'</div></div>'
      
      curEl.attr('allCommentNum', 1);
      el.html(htmlStr);
  }else if(oldLen > 0 && oldLen < 3) {
    htmlStr += '      <li  cmid="cmid_'+cmid+'" class="border-bottom">'
            +'        <div class="avatar-box" url="'+user['avatar']+'" uid="'+user['id']+'"  onclick="enterProfileFeed(this);" ><img style="border-radius:50%;" src="'+user['avatar']+'" ></div>'
            +'        <div class="dialogue" feedId="'+curFeedId+'" curname="'+user['nickname']+'" curuid="'+user['id']+'">'
            if(atuid) {
              htmlStr += '          <span class="name"  onclick="enterProfileFeed(this);" >'+user['nickname']+'</span>回复:<span class="name"  onclick="enterProfileFeed(this);" >'+curname+'</span><span class="c">'+analysisFaceToDom(comment)+'</span>'
            }else{
              htmlStr += '          <span class="name"  onclick="enterProfileFeed(this);" >'+user['nickname']+'</span>:<span class="c">'+analysisFaceToDom(comment)+'</span>'
            }
            +'        </div>'
            +'      </li>'
    el.find('ul').find('li').first().before($(htmlStr));
    el.find('div[name=commentTotal]').find('span[name=num]').text(++c);
    curEl.attr('allCommentNum', c);
  }else if(oldLen === 3){
    htmlStr += '      <li cmid="cmid_'+cmid+'" class="border-bottom">'
            +'        <div class="avatar-box" url="'+user['avatar']+'" uid="'+user['id']+'"  onclick="enterProfileFeed(this);" ><img style="border-radius:50%;" src="'+user['avatar']+'" ></div>'
            +'        <div class="dialogue" feedId="'+curFeedId+'" curname="'+user['nickname']+'" curuid="'+user['id']+'">'
            if(atuid) {
              htmlStr += '          <span class="name">'+user['nickname']+'</span>回复:<span class="name">'+curname+'</span><span class="c">'+analysisFaceToDom(comment)+'</span>'
            }else{
              htmlStr += '          <span class="name">'+user['nickname']+'</span>:<span class="c">'+analysisFaceToDom(comment)+'</span>'
            }
            htmlStr += '        </div>'
            +'      </li>'
    el.find('ul').find('li').first().before($(htmlStr));
    el.find('ul').find('li').last().remove();
    el.find('div[name=commentTotal]').find('span[name=num]').text(++c);
    el.find('div[name=seeMoreComment]').html('<div class="view-all">查看所有4条评论</div>');
    curEl.attr('allCommentNum', 4);
  }else{
    htmlStr += '      <li cmid="cmid_'+cmid+'" class="border-bottom">'
            +'        <div class="avatar-box" url="'+user['avatar']+'" uid="'+user['id']+'"  onclick="enterProfileFeed(this);" ><img style="border-radius:50%;" src="'+user['avatar']+'" ></div>'
            +'        <div class="dialogue" feedId="'+curFeedId+'" curname="'+user['nickname']+'" curuid="'+user['id']+'">'
            if(atuid) {
              htmlStr += '          <span class="name">'+user['nickname']+'</span>回复:<span class="name">'+curname+'</span><span class="c">'+analysisFaceToDom(comment)+'</span>'
            }else{
              htmlStr += '          <span class="name">'+user['nickname']+'</span>:<span class="c">'+analysisFaceToDom(comment)+'</span>'
            }
            htmlStr += '        </div>'
            +'      </li>'
    el.find('div[name=commentTotal]').find('span[name=num]').text(++c);
    el.find('ul').find('li').first().before($(htmlStr));
    el.find('ul').find('li').last().remove();
    el.find('div[name=seeMoreComment]').find('div.view-all').html('查看所有'+c+'条评论');
    curEl.attr('allCommentNum', c);
  }
}



//改变赞系列数据
function changeZanDoms(type, el, feed_id) {
  var oldCount = 0;
  if(el.find('div[name=zan_total]')[0]) {
    oldCount = Number(el.find('div[name=zan_total]').find('span[name=num]').text());
  }
  if(type === 'add') { //加
    // 填充 icon-appreciate-fill
    if(oldCount === 0) {
      var htmlStr = '';
      htmlStr += '  <div class="appreciate-list">'
              +'    <div class="count" name="zan_total">'
              +'      <i class="icon-m icon-appreciate"></i><span class="num" name="num">1</span>'
              +'    </div>'
              +'    <ul>'
              +'<li uid="'+user['id']+'"><div class="avatar-box" uid="'+user['id']+'"  onclick="enterProfileFeed(this);" ><img style="border-radius:50%;" src="'+user['avatar']+'"></div></li>'
              +' </ul></div>'
      el.html(htmlStr);
    }else{
      el.find('div[name=zan_total]').find('span[name=num]').text(++oldCount);
      //插入头像
      el.find('ul').find('li').first().before('<li uid="'+user['id']+'"><div class="avatar-box" uid="'+user['uid']+'"  onclick="enterProfileFeed(this);" ><img style="border-radius:50%;" src="'+user['avatar']+'"></div></li>')
    }

    // var avatarBox = el.find('ul li').first().find('.avatar-box');
    // var img = new Image();
    // img.src = avatarBox.attr('url');
    // img.onload =  function() {
    //   avatarBox.html('');
    // }

  }else{ //减
    // 不填充 icon-appreciate
    if(oldCount === 1) {
      el.html('');
    }else{
      el.find('div[name=zan_total]').find('span[name=num]').text(--oldCount);
      //移除头像
      el.find('ul').find('li[uid="'+user['id']+'"]').remove();
    }
  }
}


//删除评论（长按）
$(document).on('longTap', '.dialogue',  function() {
  var self = this;
  authInfo(function(data, code, msg) {
    if(code === 2) {
      showLoginConfirm('../index.html');
    }else if(code === 0){
      curFeedId = $(self).attr('feedId');
      var curuid = $(self).attr('curuid');
      var cmid = $(self).parents('li').attr('cmid').split('_')[1];

      if(user['id'] == curuid || user['role'] === 'admin'){//自己删除自己   或者是管理员  评论人
        // openPop({}, 44, api.winHeight - 44 - 50);
        actionPop([], function(index) {
          if(index === 1) {
            //删除评论
            delComments(cmid, curFeedId);
          }
        });
      }
    }
  });
});


function delComments(cmid, curFeedId) {
  authInfo(function(data, code, msg) {
    if(code === 2) {
      showLoginConfirm('../index.html');  
    }else if(code === 0){
      sendAjax(URLConfig('deleteComment'), {'comment_id' : cmid}, function(data, code, msg) {
        if(code === 0) {
          delCommentDoms(cmid, curFeedId);
        }else{
          api.toast({msg: msg || '请求失败，稍后再试',duration:2000,location:'middle'});
        }
      });
    }
  });
}

//删除评论改变节点
function delCommentDoms(cmid, curFeedId) {
  var curFeedMode = $('#'+curFeedId);
  var commentTotalEL = curFeedMode.find('div[name=commentTotal]');
  var oldCommentLen = Number(commentTotalEL.find('span[name=num]').text());
  
  if(curFeedMode[0]){
    curFeedMode.find('li[cmid=cmid_'+cmid+']').remove();
    
    if(oldCommentLen === 1) {
      curFeedMode.find('div[con=comments]').html('');
      curFeedMode.find('li[name=comments]').attr('allCommentNum', 0);
    }else if(oldCommentLen <= 3 && oldCommentLen > 1 ) {
      curFeedMode.find('li[name=comments]').attr('allCommentNum', --oldCommentLen);
      curFeedMode.find('span[name=num]').text(oldCommentLen);
      if(curFeedMode.find('div[name=seeMoreComment]').find('.view-all')[0]){
        curFeedMode.find('div[name=seeMoreComment]').html('<div class="view-all">查看所有'+oldCommentLen+'条评论</div>');
      }
    }else if(oldCommentLen === 4) {
      curFeedMode.find('div[name=seeMoreComment]').html('<div class="view-all">查看所有3条评论</div>');
      curFeedMode.find('li[name=comments]').attr('allCommentNum', --oldCommentLen);
      curFeedMode.find('span[name=num]').text(oldCommentLen);
    }else if(oldCommentLen > 4) {
      curFeedMode.find('div[name=seeMoreComment]').html('<div class="view-all">查看所有'+(--oldCommentLen)+'条评论</div>');
      curFeedMode.find('li[name=comments]').attr('allCommentNum', oldCommentLen);
      curFeedMode.find('span[name=num]').text(oldCommentLen);
    }
  }else{
    api.toast({msg:'DOM节点不存在',duration:2000,location:'middle'});
  }
  
  
}





// var topValue = 0,// 上次滚动条到顶部的距离
//   interval = null;// 定时器
// document.onscroll = function() {
//   isClick = false;
//   if(!interval){// 未发起时，启动定时器，1秒1执行
//     interval = setInterval(function() {
//         // 判断此刻到顶部的距离是否和1秒前的距离相等
//         if(document.body.scrollTop == topValue) {
//           isClick = true;
//           clearInterval(interval);
//           interval = null;
//         }
//     },1000);
//   }
//   topValue = document.body.scrollTop;
// }


