Page({
  data: { employeeCode: "", displayName: "", status: "" },
  codeInput(event) { this.setData({ employeeCode: event.detail.value.toUpperCase() }); },
  nameInput(event) { this.setData({ displayName: event.detail.value }); },
  async submit() {
    try {
      const data = await getApp().api.requestAccess({ employeeCode: this.data.employeeCode, displayName: this.data.displayName });
      this.setData({ status: `申请已提交：${data.id}` });
    } catch (error) { this.setData({ status: error.message }); }
  }
});
