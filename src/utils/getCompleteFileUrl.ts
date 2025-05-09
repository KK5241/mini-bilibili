export const getCompleteFileUrl = (filePath: string): string => {
    console.log('filePath', filePath)

    // 如果是空值则返回空字符串
    if (!filePath) {
        return ''
    }

    // 如果已经是完整URL，则直接返回
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return filePath
    }

    // 获取环境变量中的服务器地址，默认为本地开发环境
    const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

    // 如果以uploads开头，意味着是上传路径
    if (filePath.startsWith('/uploads/') || filePath.startsWith('uploads/')) {
        // 规范化路径
        const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`
        return `${API_BASE_URL}${normalizedPath}`
    }

    // 其他情况，确保添加uploads前缀
    const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`
    return `${API_BASE_URL}/uploads${normalizedPath}`
}