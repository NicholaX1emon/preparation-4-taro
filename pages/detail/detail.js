// pages/detail/detail.js
// 初始化数据库
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    movieDetail: {},
    uploadedImgs: [],
    comment: '',
    rating: 5,
    movieId: -1,
    fileIds: []
  },

  uploadImg: function () {
    // 选择图片
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        console.log(tempFilePaths);
        this.setData({
          uploadedImgs: this.data.uploadedImgs.concat(tempFilePaths)
        });
      }
    })
  },

  submit: function () {
    wx.showLoading({
      title: '评论中',
    })
    console.log(this.data.comment, this.data.rating);

    // 上传图片到云存储
    let promiseArr = [];
    for (let i = 0; i < this.data.uploadedImgs.length; i++) {
      promiseArr.push(new Promise((reslove, reject) => {
        let item = this.data.uploadedImgs[i];
        console.log('uploadingImg --->',item)
        let suffix = /\.\w+$/.exec(item)[0]; // 正则表达式，返回文件扩展名
        wx.cloud.uploadFile({
          cloudPath: new Date().getTime() + suffix, // 上传至云端的路径
          filePath: item, // 小程序临时文件路径
          success: res => {
            // 返回文件 ID
            console.log(res.fileID)
            this.setData({
              fileIds: this.data.fileIds.concat(res.fileID)
            });
            reslove();
          },
          fail: console.error
        })
      }));
    }

    Promise.all(promiseArr).then(res => {
      // 插入数据
      db.collection('comment').add({
        data: {
          comment: this.data.comment,
          rating: this.data.rating,
          movieid: this.data.movieId,
          fileIds: this.data.fileIds
        }
      }).then(res => {
        wx.hideLoading();
        wx.showToast({
          title: '评价成功',
        })
      }).catch(err => {
        wx.hideLoading();
        wx.showToast({
          title: '评价失败',
        })
      })
    })
  },

  onCommentChange: function (event) {
    console.log('e --->', event)
    this.setData({
      comment: event.detail
    });
  },

  onRatingChange: function (event) {
    console.log('e --->', event)
    this.setData({
      rating: event.detail
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("options --->", options)
    let movieId = options.movieid
    wx.cloud.callFunction({
      name: 'getMovieDetail',
      data: {
        movieid: movieId
      }
    }).then(res => {
      console.log(res)
      this.setData({
        movieDetail: JSON.parse((res.result))
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})