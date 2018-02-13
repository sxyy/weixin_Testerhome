var util = require('../../utils/util.js');
var Api = require('../../utils/api.js');
var WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {
    title: '话题详情',
    detail: {},
    wemark: {},
    wemark2: {},
    hidden: false,
    replies: [],
    content_hidden: false,
    reply_hidden: true,
    flag_position: '0%',
    offset: 0,
    topicid: -1,
  },
  onLoad: function (options) {
    this.fetchData(options.id);
    this.fetchReplyData(options.id);
  },

  test() {
    console.log('ss')
  },

  onReady: function () {
    
    // for (let i = 0; i < this.data.replies.length; i++) {
    //   WxParse.wxParse('reply' + i, 'md', this.data.replies[i].body_html, this);
    //   if (i === this.data.replies.length - 1) {
    //     WxParse.wxParseTemArray("replies", 'reply', this.data.replies.length, this);
    //   }
    // }
  },

  fetchData: function (id) {
    var self = this;
    self.setData({
      hidden: false,
      topicid: id,
    });
    wx.request({
      url: Api.getTopicByID(id),
      success: function (res) {
        if(!res.data.error) {
          res.data.topic.body = res.data.topic.body.replace(/<[^>]+>/g, '').replace(/\n{3,}/g, '\n\n').replace(/\(\/uploads/g, '(https://testerhome.com/uploads');
          res.data.topic.created_at = util.getDateDiff(new Date(res.data.topic.created_at));
          if (res.data.topic.user.avatar_url.indexOf('testerhome') === -1) {
            res.data.topic.user.avatar_url = 'https://testerhome.com/' + res.data.topic.user.avatar_url;
          }
          
          
        }else {
          res.data.topic = {}
          res.data.topic.body = res.data.message;
        }
        WxParse.wxParse('topicBody', 'md', res.data.topic.body, self, 5);
        self.setData({
          detail: res.data.topic
        });
        setTimeout(function () {
          self.setData({
            hidden: true
          });
        }, 300);
      }
    });


  },

  fetchReplyData: function (id, data) {
    var self = this;
    if (!data) data = {};
    if (!data.offset) {
      data.offset = 0;
      self.setData({
        offset: 0
      });
    }

    if (data.offset === 0) {
      self.setData({
        replies: []
      });
    }
    wx.request({
      url: Api.getTopicReplies(id, data),
      success: function (res) {
        if(res.data.replies.length > 0) {
          var mReplies = self.data.replies.concat(res.data.replies.map(item => {
            item.created_at = util.getDateDiff(new Date(item.created_at));
            if (item.user.avatar_url.indexOf('testerhome') === -1) {
              item.user.avatar_url = 'https://testerhome.com/' + item.user.avatar_url;
            }
            if (item.action === "excellent") {
              item.body_html = '将本帖设为了精华贴';
            } else if (item.action === 'mention') {

              item.body_html = '在 <' + (typeof (item.mention_topic) === 'undefined' ? '帖子已被删除' : item.mention_topic.title) + '> 中提及此帖';
            } else if (item.action === 'close') {
              item.body_html = '关闭了讨论';
            } else {
              // item.body_html = item.body_html.replace(/<[^>]+>/g, '').replace(/\n{3,}/g, '\n\n');
            }
            item.body_html = item.body_html.replace(/src=\"\//g, 'src=\"https://testerhome.com/');
            item.body_html = item.body_html.replace(/<img.+? class=\"twemoji\">/g, "");
            return item;
          }))
          for (let i = 0; i < mReplies.length; i++) {
            WxParse.wxParse('reply' + i, 'md', mReplies[i].body_html, self);
            if (i === mReplies.length - 1) {
              WxParse.wxParseTemArray("repliesTemp", 'reply', mReplies.length, self)
            }
          }

          self.setData({
            replies: mReplies
          });
        }
        
      }
    });

  },

  onTapTag: function (e) {
    var self = this;
    var id = e.currentTarget.id;
    if (id === 'topic') {
      self.setData({
        content_hidden: false,
        reply_hidden: true,
        flag_position: '0%'
      });
    } else {
      self.setData({
        content_hidden: true,
        reply_hidden: false,
        flag_position: '50%'
      });
    }
  },

  lower: function (e) {

    console.log("加载跟多");
    var self = this;
    if (self.data.replies.length >= 20 && self.data.replies.length % 10 === 0) {
      self.setData({
        offset: self.data.offset + 20
      });
      self.fetchReplyData(self.data.topicid, { offset: self.data.offset });
    }

  },
  scrolls: function (e) {
  }
})