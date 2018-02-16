var util = require('../../utils/util.js')
var Api = require('../../utils/api.js')
Page({
  data:{
    // text:"这是一个页面"
    datas: [],
    logs:[],
    title: "话题列表",
    offset: 0,
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    wx.showLoading({
      title: '加载中',
    });
    this.fetchData({node_id: 19});
  },

  fetchData: function (data) {
    var self = this;
    if (!data) data = {};
    if (!data.offset) data.offset = 0;
    if (data.offset === 0) {
      self.setData({
        datas: []
      });
    }
    wx.request({
      url: Api.getTopics(data),
      success: function (res) {
        var topices = res.data.topics.map(function (item) {
          item.replies_count = parseInt(item.replies_count)
          item.created_at = util.getDateDiff(new Date(item.created_at));
          if (item.user.avatar_url.indexOf('https://testerhome') !== -1) {
          } else if (item.user.avatar_url.indexOf('testerhome') !== -1) {
            item.user.avatar_url = 'https:' + item.user.avatar_url;
          } else {
            item.user.avatar_url = 'https://testerhome.com/' + item.user.avatar_url;
          }
          return item;
        });
        topices = topices.filter(item => {
          return item.suggested_at === null;
        });
        self.setData({
          datas: self.data.datas.concat(topices)
        }, () => {
          wx.hideLoading();
        });
      }
    });
  },

  pullDownRefresh: function () {
    var self = this;
    this.fetchData({node_id: 19});
    console.log('下拉刷新', new Date());
  },
  
  didSelectCell: function (e) {
    console.log('我要看详情');
    var id = e.currentTarget.id,
        url = '../detail/detail?id=' + id;
    wx.navigateTo({
      url: url
    })
  },

  lower: function (e) {
    var self = this;
    self.setData({
      offset: self.data.offset + 20
    });
    wx.showLoading({
      title: '加载中',
    });
    this.fetchData({node_id: 19, offset: self.data.offset});
  },

  scrolls: function (e) {
  }


})