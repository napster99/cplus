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
function getCurDoms(data, flag, expand) {
  var htmlStr = '', isAdmin = false;
  user = $api.getStorage('user');
  if(!$.isEmptyObject(user)) {
    var img = new Image();
    img.src = user['avatar'];
    if(user['role'] === 'admin') {
      isAdmin = true;
    }
  }
  
  switch(Number(data['type'])) {
    case 1:
      if(!data['uname']) return '';
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
      
      if(data['topic_id'] == 17) {
        htmlStr += '  <div id="'+data['id']+'" topicId="'+data['topic_id']+'" dj_title="'+data['desc']+'" name="feedMode" class="feed diaoji border-top border-bottom mt10">'
      }else{
        htmlStr += '  <div id="'+data['id']+'" name="feedMode" class="feed border-top border-bottom mt10">'
      }

        htmlStr += '  <div class="user-info" uid="'+data['uid']+'" >'
        if((!$.isEmptyObject(user) && user['id'] == data['uid']) || isAdmin) {
          htmlStr += '<i onclick="selfAction(this);"  isAdmin="'+isAdmin+'" name="feedMore" class="icon-m icon-more"></i>';
        }else{
          if(data['following'] == 0) {
            htmlStr += '<button onclick="followAction(this);"  name="follow-btn" uid="'+data['uid']+'" follow="no" class="btn-line color-green">关注</button>'
          }else{
            htmlStr += '<button onclick="followAction(this);"  name="follow-btn" uid="'+data['uid']+'" follow="yes" class="btn-line">已关注</button>'
          }
        }
        var avatarImg = getPicUrl(data['avatar'], 40, 40);
        
        htmlStr += '<div class="avatar-box" url="'+avatarImg+'" uid="'+data['uid']+'" onclick="enterProfileFeed(this);" style="border-radius:50%;" >'
        +'      <i class="icon-m icon-user"></i>'
        +'    </div>'
        +'    <div class="info" >'
        +'      <div class="name" onclick="enterProfileFeed(this);"  uid="'+data['uid']+'">'+data['uname']

        if(data['gender'] == 2) {
          htmlStr += '<i class="icon-m icon-female"></i>'
        }else{
          htmlStr += '<i class="icon-m icon-male"></i>'
        }
        htmlStr+='</div>'

        htmlStr += '<div class="other">'
        +'  <span class="time" uid="'+data['uid']+'"><i class="icon-m icon-time"></i>'+data['pretty_time']+'</span>'
        if(data['u_title'] == 2) {
          htmlStr += '  <span class="text-badge bg-orange">铁杆粉</span>'
        }
        htmlStr += '</div>'

        htmlStr+='</div>'
        +'  </div>'

        //排名
        if(data['pond_rank'] > 0 && data['topic_id'] != 17) {
          htmlStr += '<div class="rank-info" onclick="enterPondDetail(this);" pondRank="yes" pondId="'+data['pond_id']+'">'
          +'  <div class="trophys">'
          if(data['pond_rank'] == 1) {
            htmlStr += '    <i class="icon-m icon-trophy trophy-the-first small-one"></i>'
          }else if(data['pond_rank'] == 2) {
            htmlStr += '    <i class="icon-m icon-trophy trophy-the-second small-one"></i>'
          }else if(data['pond_rank'] == 3) {
            htmlStr += '    <i class="icon-m icon-trophy trophy-the-third small-one"></i>'
          }
          htmlStr += '  </div>'
          if(fish_extra['species']) {
            htmlStr += '  <span class="fish">'+fish_extra['species']+'</span>'
          }
          if(fish_extra['weight']) {
            htmlStr += '  <span class="r">'+fish_extra['weight']+'斤</span>'
          }
          htmlStr += '</div>'
        }

        
        var fillPicsObj = {};
        if(pics && pics.length > 0) {
          if(pics[0]){
            var picUrl = pics[0];
            var picUrl = getPicUrl(picUrl, api.winWidth - 20, api.winWidth);
            
            if(expand) { //自己离线插入
              picUrl = pics[0]
            }
            if(picUrl.indexOf('isgif=1') > -1) {  //gif图
              htmlStr += '<div class="slider">'
              +'<div url="'+picUrl+'" originalUrl="'+pics[0]+'" onclick="showImgView(this);" class="img-box" style="width:'+(api.winWidth - 20)+'px; height:'+api.winWidth+'px; ">'
              if(flag) {
                htmlStr += '<i class="icon-m icon-logo"></i>'
              }else{
                htmlStr +='<img src="../images/default-img.png" data-echo="'+picUrl+'">'
              }
              
              htmlStr += '</div><div class="control" thumbImg="'+picUrl+'" onclick="showImgView(this);" ><i class="icon-m icon-play"></i></div>'
              htmlStr += '</div>'

              fillPicsObj[picUrl] = { 'url' :  picUrl};
              getImageSize(fillPicsObj);
            }else if(fish_extra['type'] == 101) {  //视频
              htmlStr += '<div class="slider" style="padding:0; margin:0; height:200px;">'
              +'  <div class="video-box" poster="'+pics[0]+'" src="'+fish_extra['video_url']+'">'
              +'    <video controls poster="'+pics[0]+'" src="'+fish_extra['video_url']+'" preload="none">您的手机不支持本站视频播放</video>'
              +'  </div>'
              htmlStr += '</div>'
            }else{  //图片
              if(data['topic_id'] == 17) {
                var picUrl = getPicUrl(pics[0], api.winWidth - 20, api.winWidth);
                htmlStr += '<div class="slider">'
                if(flag) {
                  htmlStr += '<div url="'+picUrl+'" class="img-box" onclick="enterDiaojiDetail(this);"><img src="'+picUrl+'" /></div>'
                }else{
                  htmlStr += '<div name="imgBox" url="'+picUrl+'" class="img-box" onclick="enterDiaojiDetail(this);"><i class="icon-m icon-logo"></i></div>'
                }

                htmlStr += '</div>'
                +'<h3 onclick="enterFeedDetail(this);">'+data['desc']+'</h3>'
                +'<div class="clearfix">'
                +'      <div class="topic">话题“<span>钓记</span>”</div>'
                +'</div>'
              }
            }
            // htmlStr += '</div>'

            if(flag) {
              fillPicsObj[picUrl] = { 'url' :  picUrl};
              getImageSize(fillPicsObj);
            }


            if(!window.picMap) {
              window.picMap = {};
            }
            window.picMap[data['id']] = [];
            for(var i=0; i<pics.length; i++) {
              window.picMap[data['id']].push(pics[i]);
            }

            //钓记存储装备值
            if(data['topic_id'] == 17) {
              if(!window.deviceObj) {
                window.deviceObj = {};
              }
              window.deviceObj[data['id']] = fish_extra;
            }


            
          }
        }
        
        var picUrl = pics[0];
        var picUrl = getPicUrl(picUrl, api.winWidth - 20, api.winWidth);

        if(data['topic_id'] != 17 && picUrl.indexOf('isgif=1') < 0 && fish_extra['type'] != 101) {

          if(data['desc'] || data['topic_name']) {
            htmlStr += '  <div class="content">'
            if(data['desc'].length > 120) {
              htmlStr += '<div class="c" name="alltext">'+data['desc'].substring(0, 120)+'</div>';
            }else{
              htmlStr += '<div class="c">'+data['desc']+'</div>';
            }
            htmlStr += '<div class="b">'
            if(data['desc'].length > 120) {
              htmlStr += '  <div mode="shot" class="view-all" alltext="'+data['desc']+'" onclick="showAll(this);" >全文</div>'
            }
            
            if(data['topic_name']){
              htmlStr += '<div class="topic" topicName="'+data['topic_name']+'" topicId="'+data['topic_id']+'" onclick="enterTopicDetail(this);" >来自话题“<span>'+data['topic_name']+'</span>”</div>'
            }
            htmlStr += '</div>'
                    + '  </div>'
          }
              
          if(pics && pics.length > 0) {
              var wholeW = (api.winWidth*window.devicePixelRatio*0.96 - 20)/3;
              var size = 9;
              if(pics.length == 4) {
                size = 4;
              }else{
                size = pics.length;
              }
              if(size > 9) {
                size = 9;
              }
              htmlStr += '<div class="slider">'
              +'  <ul class="imgs-group" size="'+size+'">'
              var len = pics.length >= 9 ? 9 : pics.length;
              for(var i=0; i<len; i++) {
                var picUrl = getPicUrl(pics[i], wholeW, wholeW);
                if(pics.length === 1) {
                  picUrl = pics[0];
                }
                if(expand) {
                  if(pics.length === 1){
                    htmlStr += '<li><div onclick="showImgView(this);" originalUrl="'+pics[i]+'" class="img-box" ><img src="'+pics[i]+'"/></div></li>'
                  }else{
                    htmlStr += '<li><div onclick="showImgView(this);" originalUrl="'+pics[i]+'" class="img-box" ><img src="'+pics[i]+'" style="width:'+wholeW+'px; height:'+wholeW+'px;"/></div></li>'
                  }
                }else{
                  if(api.systemType === 'android') {
                    if(flag) {
                      htmlStr += '<li><div url="'+picUrl+'" originalUrl="'+pics[i]+'" onclick="showImgView(this);" class="img-box"><img src="'+picUrl+'" ></div></li>'  
                    }else{
                      htmlStr += '<li><div url="'+picUrl+'" originalUrl="'+pics[i]+'" onclick="showImgView(this);" class="img-box"><img src="../images/default-img.png" data-echo="'+picUrl+'"></div></li>'  
                    }
                    
                  }else{
                    htmlStr += '<li><div url="'+picUrl+'" originalUrl="'+pics[i]+'" name="imgBox" onclick="showImgView(this);" class="img-box"><i class="icon-m icon-logo"></i></div></li>'  
                  }
                  
                }
              }
              htmlStr += '  </ul>'
              +'</div>'
          }
        }
        

        htmlStr += '<div class="text-list mt10">'
        +'  <ul class="border-top">'

        if(data['p_name']) {
          htmlStr += '<li class="border-bottom" pondId="'+data['pond_id']+'" onclick="enterPondDetail(this);">'
          if(data['location']) {
            htmlStr += '  <span class="r">'+data['location']+'，'+data['p_name']+'</span>'
          }else{
            htmlStr += '  <span class="r">'+data['p_name']+'</span>'
          }
          htmlStr += '  <i class="icon-m icon-position"></i>'
          +'  <span class="field">钓点</span>'
          +'</li>'
        }

        if(fish_extra['species']) {
          htmlStr += '    <li class="border-bottom">'
          +'      <span class="r">'+fish_extra['species']+'</span>'
          +'      <i class="icon-m icon-fish"></i>'
          +'      <span class="field">鱼类</span>'
          +'    </li>'
        }

        if(fish_extra['weight']){
          htmlStr += '    <li class="border-bottom">'
          +'      <span class="r">'+fish_extra['weight']+'斤</span>'
          +'      <i class="icon-m icon-weight"></i>'
          +'      <span class="field">重量</span>'
          +'    </li>'
        }
        if(data['topic_id'] != 17) {
          htmlStr += '    <li class="border-bottom" onclick="enterMore(this);">'
          +'      <span class="r"><span class="enter"><i class="icon-m icon-arrow-right"></i></span></span>'
          +'      <span class="field">更多</span>'
          +'    </li>'
        }else{
          //钓记增加装备

          if(fish_extra['ganchang'] || fish_extra['zhuxian']  || fish_extra['zixian'] || fish_extra['shuishen'] || fish_extra['yuer']  || fish_extra['woliao'] ) {
            htmlStr += '    <li class="border-bottom" onclick="enterDevice(this);">'
            +'      <span class="r"><span class="enter"><i class="icon-m icon-arrow-right"></i></span></span>'
            +'      <i class="icon-m icon-img-group"></i>'
            +'      <span class="field">装备</span>'
            +'    </li>'
          }


          
        }
        htmlStr += '  </ul>  '
        +'</div>'


        var allCommentNum = 0;
        if(data['comments']) {
          allCommentNum = data['comment_total'];
        }
        
        htmlStr +=  '<div class="action-group border-top border-bottom">'
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
        
        htmlStr +='<li rank="'+data['pond_rank']+'" onclick="reportAction(this);"><span class="icon-box"><i class="icon-m icon-report"></i></span>举报</li>'
        +'    </ul>'
        +'  </div>'
        +'<div con="zan">'
        if(data['zans'] && data['zans'].length > 0) {
          htmlStr += '  <div class="appreciate-list">'
                  +'    <div class="count" name="zan_total">'
                  +'      <i class="icon-m icon-appreciate"></i><span class="num" name="num">'+data['zans'].length+'</span>'
                  +'    </div>'
                  +'    <ul>'
                  // var fillZansPicsObj = {};
                  for(var j=0; j<data['zans'].length; j++) {
                    var avatarImg = data['zans'][j]['avatar'];
                    if(avatarImg) {
                      avatarImg = getPicUrl(avatarImg, 40, 40);
                      // avatarImg = getImageCache(avatarImg);
                    }
                    // fillZansPicsObj[avatarImg] = { 'url' :  avatarImg};
                    htmlStr += '<li uid="'+data['zans'][j]['uid']+'"><div class="avatar-box" onclick="enterProfileFeed(this);"  uid="'+data['zans'][j]['uid']+'" url="'+avatarImg+'" style="border-radius:50%;"><i class="icon-m icon-user"></i></li>'
                  }
                  htmlStr += '</ul>'
                  +'  </div>'
                  // getImageSize(fillZansPicsObj, false, true);
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
          // var fillComPicsObj = {};
          for(var j=0; j<len; j++) {
            if(!data['comments'][j]) continue;

            var avatarImg = data['comments'][j]['u_avatar'];
            if(avatarImg){
              avatarImg = getPicUrl(avatarImg, 40, 40);
              // avatarImg = getImageCache(avatarImg);
            }
            // fillComPicsObj[avatarImg] = { 'url' :  avatarImg};
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
          // getImageSize(fillComPicsObj, false, true);
          htmlStr += '    </ul>'
                  +'<div onclick="seeMoreComment(this);"  name="seeMoreComment">'
          if(allCommentNum > 3) {
            htmlStr += '    <div class="view-all">查看所有'+allCommentNum+'条评论</div>'
          }
          htmlStr += '  </div></div>'
        }
        htmlStr += '  </div>'
                +  '</div>'
      break;
    case 2:
      break;
      htmlStr += getDomsWithData(data, data['style']);
      break;
    case 3:
      htmlStr += '<div name="suvery" class="survey border-top border-bottom mt10">'
              +'  <h3>'+data['name']+'</h3>'
              +'   <ul class="options col2">'
              data['options'] = JSON.parse(data['options']);
              for(var i in data['options']) {
                htmlStr += '<li mid="'+data['id']+'" onclick="suveryClick(this);" cid="'+i+'"><label><input type="radio" name="test"><p>'+data['options'][i]+'</p></label></li>'
              }
      htmlStr += '    </ul>'
              +'</div>'
      break;
    case 4:
      var picUrl = getPicUrl(data['pic_url'], api.winWidth*window.devicePixelRatio, api.winWidth/2.5*window.devicePixelRatio);
      htmlStr += '<div class="ad big-one">'
              +'<div class="img-box" name="imgBox" title="'+data['title']+'" linkUrl="'+data['href']+'" onclick="addPicsClick(this);" url="'+picUrl+'"><i class="icon-m icon-logo"></i></div>'
              +'</div>'
      break;
    case 5:
      // htmlStr += '<div class="share-app border-top border-bottom mt10">'
      // +'  <h3>这么好用的<strong>钓鱼神器</strong>...</h3>'
      // +'  <h2>果断<strong>分</strong>享</h2>'
      // +'  <button onclick="shareAppClick(this);" url="'+data['link']+'"><i class="icon-m icon-share"></i>分享给好友</button>'
      // +'</div>'
      break;
    case 6:
      if(!data['users']) return '';
      htmlStr += '<div name="recoMode" class="user-sns-list border-top border-bottom mt10">'
              +'  <h2 class="border-bottom">推荐关注</h2>'
              +'  <ul>'
              var fillFollowPicsObj = {};
              for(var i=0; i<data['users'].length; i++) {
                var avatarImg = data['users'][i]['avatar'];
                var avatarImg = getPicUrl(avatarImg, 40, 40);

                fillFollowPicsObj[avatarImg] = { 'url' :  avatarImg};
                htmlStr += '    <li class="border-bottom">'
                  +'      <div class="avatar-box"  onclick="enterProfileFeed(this);"  url="'+avatarImg+'" uid="'+data['users'][i]['uid']+'"  onclick="enterProfileFeed(this);" style="border-radius:50%;" ><i class="icon-m icon-user"></i></div>'
                  +'      <div class="btn-box"><button onclick="followAction(this);"  name="follow-btn" follow="no" uid="'+data['users'][i]['uid']+'" class="btn-line color-green">关注</button></div>'
                  +'      <div class="infos">'
                  +'        <h3>'+data['users'][i]['nickname']+'</h3>'
                  +'        <div class="info">'
                  +'          <div><span>'+data['users'][i]['feeds']+'</span>篇渔获</div>'
                  +'          <div><span>'+data['users'][i]['fans']+'</span>人关注</div>'
                  +'        </div>'
                  +'      </div>'
                  +'    </li>'
              }
              htmlStr += '  </ul>'
                      +'</div>'
              getImageSize(fillFollowPicsObj, false, true);
      break;
    case 7:
      htmlStr += '<div class="share-app border-top border-bottom mt10">'
      +'  <h3>赶紧邀请好友也一块来玩吧</h3>'
      +'  <button onclick="openMailList(this);" class="mt10"><i class="icon-m icon-phone-book"></i>开启通讯录</button>'
      +'</div>'
      break;
    case 8:
      htmlStr += '<div mode="bindPhone" class="form-modal border-top border-bottom mt10">'
      +'  <h3>绑定手机立刻领取<strong>免费钓鱼券</strong></h3>'
      +'  <div class="input-text"><input id="telNum" type="tel" maxlength="11" style="height:20px;"></div>'
      +'  <div class="input-text endbtn">'
      +'    <input id="verNum" type="tel" maxlength="4" style="height:20px;">'
      +'    <button id="getVerCode" class="btn-fill btn-lg">获取验证码</button>'
      +'    <button type="button" id="sending" class="btn-fill btn-lg hidden"><span name="count">60</span>秒后重新发送</button>'
      +'  </div>'
      +'  <button id="sureBind" class="btn-fill btn-lg">确认绑定</button>'
      +'</div>'
      break;

    case 9:
        var ads = data['ads'];
        htmlStr += '<div class="sliders mt10" style="height:'+ api.winWidth/2.5 +'; margin:0;">'
        +'  <div class="swipe-wrap">'
        +'    <ul class="swipe-img-list">'
        for(var i=0; i<ads.length; i++){
          var picUrl = getPicUrl(ads[i]['pic_url'], api.winWidth*window.devicePixelRatio, api.winWidth/2.5*window.devicePixelRatio);
          var href = ads[i]['href'];
          var title = ads[i]['title'];
          var isApp = ads[i]['is_app'];
          var pageName = ads[i]['page_name'];
          htmlStr += '<li isApp="'+isApp+'" pageName="'+pageName+'" title="'+title+'" href="'+href+'"  onclick="addPics2Click(this);">'
          +'          <div class="img-box"><img src="'+picUrl+'" /></div>'
          +'      </li>'
        }
        htmlStr += '    </ul>'
        +'<div class="focus">'
        for(var i=0; i<ads.length; i++){
          if(i == 0) {
            htmlStr += ' <i class="active"></i>'
          }else{
            htmlStr += ' <i></i>'
          }
        }

        htmlStr += '</div>'
        +'  </div>'
        +'</div>'
      break;
  }
  
  return htmlStr;
}


/*
 * 渔获详情页 onclick="enterFeedDetail(this);" 
 */
function enterFeedDetail(el) {
  el = $(el);
  
  var feedId = el.parents('div[name=feedMode]').attr('id');
  var topicId = el.parents('div[name=feedMode]').attr('topicId');
  var dj_title = el.parents('div[name=feedMode]').attr('dj_title');
  
  if(feedId === 'undefined') {
    api.toast({msg: '后台正在发布，请稍后', duration:2000,location: 'middle'});
    return;
  }
  
  if(!feedId) return;
  if(topicId && topicId == 17) {
    api.openWin({
      'name' : 'diaoji_detail',
      'url' : './diaoji_detail.html',
      'pageParam' : {'id' : feedId, 'title' : dj_title},
      'bounces':true
    });
  }else{
    api.openWin({
      'name' : 'feedDetail',
      'url' : './feedDetail.html',
      'pageParam' : {'id' : feedId},
      'bounces':true
    });
  }
}

/*
 * 钓记详情页 onclick="enterDiaojiDetail(this);" 
 */
function enterDiaojiDetail(el) {
  el = $(el);
  var feedId = el.parents('div[name=feedMode]').attr('id');
  var dj_title = el.parents('div[name=feedMode]').attr('dj_title');
  
  api.openWin({
    'name' : 'diaoji_detail',
    'url' : './diaoji_detail.html',
    'pageParam' : {'id' : feedId, 'title' : dj_title},
    'bounces':true
  });
}



/*
 * 更多详情页 onclick="enterMore(this);" 
 */
function enterMore(el) {
  el = $(el);
  var feedId = el.parents('div[name=feedMode]').attr('id');
  if(feedId === 'undefined') {
    api.toast({msg: '后台正在发布，请稍后', duration:2000,location: 'middle'});
    return;
  }
  
  if(!feedId) return;
  api.openWin({
    'name' : 'feedMore',
    'url' : './feedMore.html',
    'pageParam' : {'id' : feedId},
    'bounces':true
  });
}


/*
 * 装备详情页 onclick="enterDevice(this);" 
 */
function enterDevice(el) {
  el = $(el);
  var feedId = el.parents('div[name=feedMode]').attr('id');
  var curObjArr = window.deviceObj[feedId], curObj = {};
  
  for(var i=0; i<curObjArr.length; i++) {
    $.each(curObjArr[i],  function(k, v) {
      curObj[k] = v;
    });
  }

  api.openWin({
    'name' : 'device',
    'url' : './fish/device.html',
    'pageParam' : {'which' : 'get', 'device' : curObj},
    'bounces':true
  });
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
 * 图片查看器  onclick="showImgView(this);" 
 */
function showImgView(el) {
  event.stopPropagation();
  el = $(el);
  var feedId = el.parents('div[name=feedMode]').attr('id');
  var picsAttr = window.picMap[feedId];
  var index = 0;

  if(el.parents('li')[0]) {
    index = el.parents('li').index();
  }

  var thumbImg = el.attr('url');
  if(!thumbImg) {
    thumbImg = el.attr('thumbImg');
  }
  api.openWin({
    'name' : 'img-view',
    'url' : 'img-view_frame.html',
    'bounces' : false,
    'pageParam' :  {'src' : picsAttr, 'thumbImg' : thumbImg, 'index' : index}
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
 * 全文 收起  onclick="showAll(this);" 
 */
function showAll(el) {
  event.stopPropagation();
  el = $(el);
  //全文
  var mode = el.attr('mode');
  var allDesc = el.attr('alltext');
  var preEl = el.parents('div[name=feedMode]').find('div[name=alltext]');
  if(mode === 'shot') { //展开
    preEl.html(allDesc).addClass('unfold');
    el.attr('mode', 'long').text('收起');
  }else{
    preEl.html(allDesc.substring(0,120)+'...').removeClass('unfold');
    el.attr('mode', 'shot').text('全文');
  }
}

/*
 * 钓点详情页  onclick="enterPondDetail(this);" 
 */
function enterPondDetail(el) {
  event.stopPropagation();
  el = $(el);
  var pondId = el.attr('pondId');
  var pondRank = el.attr('pondRank');
  if(!pondId) return;
  api.openWin({
    name: 'pond_detail',
    url: './pond-details.html',
    bounces : false,
    bgColor : '#fff',
    pageParam: {'pondId': pondId, 'pondRank' : pondRank}
  });
}

/*
 * 某个话题列表  onclick="enterTopicDetail(this);" 
 */
function enterTopicDetail(el) {
  event.stopPropagation();
  el = $(el);
  var topicId = el.attr('topicId');
  var topicName = el.attr('topicName');
  if(!topicId) return;
  api.openWin({
    'name' : 'topic_detail',
    'url' : 'topic_detail.html',
    'pageParam' : {'id' : topicId, 'name' : topicName}
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
    api.toast({msg: '举报成功，感谢您的及时反馈！', duration:2000,location: 'middle'});
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

/* 视频播放 */
// function playVideo(el) {
//   el = $(el);
//   var sourceURL = el.attr('src');
//   var videoURL = el.attr('videoUrl');
//   var logo = el.attr('logo');
//   if(el.find('video')[0]) return;
  
//   sendAjax(URLConfig('videoParse'), {'url' : videoURL}, function(data, code, msg) {
//     if(code === 0) {
//       var htmlStr = '<video src="'+data['url']+'" controls autoplay poster="'+logo+'" preload="none">您的手机不支持本站视频播放</video>';
//       el.html(htmlStr);
//     }else{
//       api.toast({
//         msg: msg || '视频获取失败，稍后再试',
//         duration:2000,
//         location: 'middle'
//       });
//     }
//   });
// }

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


//删除图片（长按）
$(document).on('longTap', 'img',  function() {
  var self = this;
  var userInner = $api.getStorage('user');
  var feedId = $(this).parents('div[name=feedMode]').attr('id');

  if($.isEmptyObject(userInner)) {
    showLoginConfirm('../index.html');  
    return;
  }
  var pic = $(this).parent().attr('originalUrl');
  if(!pic || userInner['role'] != 'admin') {
    return;
  }
  api.confirm({
    title: '提示框',
    msg: '是否删除这张图片？',
    buttons:['取消', '确定']
  },function(ret,err){
      if(ret.buttonIndex == 2){
        sendAjax(URLConfig('delPic'), {'feed_id' : feedId, 'pic' : pic}, function(data, code, msg) {
          if(code == 0) {
            $(self).remove();
            api.toast({msg: '删除成功',duration:2000,location:'middle'});
          }else{
            api.toast({msg: msg || '删除失败',duration:2000,location:'middle'});
          }
        });
      }
  });
  
});


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


