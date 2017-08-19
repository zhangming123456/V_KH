var appUtil = require('../../../utils/appUtil.js');
var dateUtil = require('../../../utils/util.js');
var app = getApp();
Page({
  data: {
    module: '',
    isFirst: true,
    isHide: false,
    orderList: [],
    shouye: true,
    dingdan: true,
    wo: false,
    hasMoreData:true,
    pageNum:1,
    pageSize:10
  },
  onLoad: function (options) {
    var that = this;
    that.loadData();
  },
  onShow: function () {
    var that = this;
    if (!that.data.isHide) return;
    that.loadData();
  },
  onHide: function () {
    var that = this;
    that.setData({ isHide: true });
  },
  /**
 * 页面相关事件处理函数--监听用户下拉动作
 */
  onPullDownRefresh: function () {
    wx.showToast({
      title: "正在下拉",
      duration: 2000
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    if(that.data.hasMoreData){
      that.setData({
        pageNum: that.data.pageNum + 1
      });
      that.loadData();
    }else{
      wx.showToast({
        title: "没有更多数据了...",
        duration: 2000
      });
    }
  },
  loadData: function () {
    var that = this;
    var url = app.globalData.serverAddress + "microcode/getOrderList";
    var data = { "openId": app.globalData.openId,"pageNum":that.data.pageNum,"pageSize":that.data.pageSize };
    console.log(that.data.pageNum + "----" + that.data.pageSize)
    appUtil.httpRequest(url, data, function (rsp) {
      // console.log(rsp);
      if (rsp.returnStatus) {
        if (rsp.value.length<that.data.pageSize){
          that.setData({hasMoreData:false})
        }else{
          that.setData({ hasMoreData: true })
        }
        var orderList = rsp.value;
        var consumerStatus;
        orderList.forEach(function (val, key) {
          val.amount = val.amount.toFixed(2);
          val.resLogo = app.globalData.serverAddressImg + val.resLogo;
        });
        if (that.data.pageNum==1){
          that.setData({ orderList: orderList });
        }else{
          that.setData({ orderList: that.data.orderList.concat(orderList) });
        }
        
        // console.log(orderList);
      } else {
        wx.showToast({
          title: "网络异常,请稍后重试",
          duration: 2000
        });
      }
    });
  },
  module: function (e) {
    // console.log(res);
    var that = this;
    var deleteOrder = e.currentTarget.dataset;
    that.setData({
      deleteOrder: deleteOrder,
      module: 'moduleActive'
    });
  },
  close: function (res) {//点击直接使用，跳转到点餐业
    var that = this;
    // console.log('关闭弹窗');
    that.loadData();
    that.setData({
      module: ''
    });
  },
  confirm: function (e) {
    var that = this;
    var url = app.globalData.serverAddress + "order/deleteOrder";
    var data = {
      resId: that.data.deleteOrder.resid,
      consumerId: that.data.deleteOrder.consumerid
    };
    appUtil.httpRequest(url, data, function (rsp) {
      // console.log(rsp);
      if (rsp.returnStatus) {
        that.setData({
          pageNum: 1
        });
        that.close();
      }
    });
  },
  pay: function (e) {//去支付
    // console.log(e.currentTarget.dataset);
    var pay = e.currentTarget.dataset;
    wx.navigateTo({
      url: "/pages/order/order-pay/order-pay?resId=" + pay.resid + "&consumerId=" + pay.consumerid,
    })
  },
  addDish: function (e) {//加菜
    // console.log(e.currentTarget.dataset);
    var pay = e.currentTarget.dataset;
    wx.navigateTo({
      url: "/pages/canteen/index/index?resId=" + pay.resid + "&consumerId=" + pay.consumerid + "&isaddDish=true" + "&tableCode=" + pay.tablecode + "&tableName=" + pay.tablename,
    })
  },
  tab: function (e) {
    // console.log('tab-order');
    var id = e.currentTarget.dataset.id;
    // console.log(id);
    if (id == "shouye") {
      wx.redirectTo({
        url: '/pages/init/init',
      })
    } else if (id == "wo") {
      wx.redirectTo({
        url: '/pages/vkahui/me/me',
      })
    }
  }
})