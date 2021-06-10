console.log('--00---', process.env.VUE_APP_baseUrl)
module.exports = {

  title: '比赛管理后台',
  baseUrl: process.env.VUE_APP_baseUrl,

  /**
   * @type {boolean} true | false
   * @description Whether fix the header
   */
  fixedHeader: false,

  /**
   * @type {boolean} true | false
   * @description Whether show the logo in sidebar
   */
  sidebarLogo: false
}
