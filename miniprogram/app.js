const config = require("./config.example");
const { createApi } = require("./services/api");

App({
  onLaunch() {
    if (wx.cloud && !config.cloudEnv.startsWith("replace-")) {
      wx.cloud.init({ env: config.cloudEnv, traceUser: false });
    }
    this.api = createApi({
      callFunction: (request) => wx.cloud.callFunction(request),
      functionName: config.gatewayFunction,
    });
  },
  globalData: { profile: null },
});
