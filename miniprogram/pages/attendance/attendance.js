function today() { return new Date().toISOString().slice(0, 10); }

Page({
  data: { workDate: today(), locationLabel: "", consent: false, status: "" },
  dateChange(event) { this.setData({ workDate: event.detail.value }); },
  consentChange(event) { this.setData({ consent: event.detail.value.includes("location") }); },
  async locate() {
    try {
      const position = await wx.getLocation({ type: "gcj02" });
      this.setData({ locationLabel: `${position.latitude.toFixed(4)},${position.longitude.toFixed(4)}`, consent: true });
    } catch (error) { this.setData({ status: "未取得位置授权" }); }
  },
  async invoke(action) {
    try {
      const data = await getApp().api[action]({ workDate: this.data.workDate, locationLabel: this.data.locationLabel, consent: this.data.consent });
      this.setData({ status: `${action === "clockIn" ? "上班" : "下班"}记录已保存：${data.id}` });
    } catch (error) { this.setData({ status: error.message }); }
  },
  clockIn() { return this.invoke("clockIn"); },
  clockOut() { return this.invoke("clockOut"); }
});
