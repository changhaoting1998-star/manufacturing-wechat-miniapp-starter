Page({
  data: {
    entries: [
      { title: "申请使用", copy: "绑定由管理员审核", url: "/pages/access/access" },
      { title: "本人考勤", copy: "主动获取位置并打卡", url: "/pages/attendance/attendance" },
      { title: "工资确认", copy: "仅查看和确认本人记录", url: "/pages/payroll/payroll" },
      { title: "动态表单", copy: "安全、设备与质量填报", url: "/pages/forms/forms" }
    ]
  },
  open(event) { wx.navigateTo({ url: event.currentTarget.dataset.url }); }
});
