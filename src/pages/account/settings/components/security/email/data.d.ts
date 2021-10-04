export interface EmailType {
    // 是否显示窗口
    emailModal: boolean
    // 点击取消按钮时触发
    onCancel: () => void
}