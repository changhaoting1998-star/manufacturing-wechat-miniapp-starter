Page({
  data: { equipment: "", note: "", status: "" },
  equipmentInput(event) { this.setData({ equipment: event.detail.value }); },
  noteInput(event) { this.setData({ note: event.detail.value }); },
  async submit() {
    try {
      const data = await getApp().api.submitForm({ templateId: "form-safety-demo", values: { equipment: this.data.equipment, note: this.data.note } });
      this.setData({ status: `表单已提交：${data.id}`, equipment: "", note: "" });
    } catch (error) { this.setData({ status: error.message }); }
  }
});
