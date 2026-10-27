Page({
  data: { items: [], status: "" },
  async onShow() {
    try { this.setData({ items: await getApp().api.payroll() }); }
    catch (error) { this.setData({ status: error.message }); }
  },
  async acknowledge(event) {
    const item = this.data.items.find((candidate) => candidate.id === event.currentTarget.dataset.id);
    const signature = item.periodType === "month" ? "synthetic-signature-confirmed" : "";
    try {
      await getApp().api.acknowledgePayroll({ payrollId: item.id, confirmed: true, signature });
      this.setData({ status: "确认已保存" });
      await this.onShow();
    } catch (error) { this.setData({ status: error.message }); }
  }
});
