# Smootie Project Summary

## 项目概述 (Project Overview)

Smootie 是一个基于浏览器语音识别的声控视频播放器，可以通过语音指令无缝切换视频。

Smootie is a voice-controlled video player using browser speech recognition for seamless video switching.

## 核心功能 (Core Features)

### 1. 语音识别 (Voice Recognition)
- ✅ 浏览器 Web Speech API 集成
- ✅ 支持中英文指令
- ✅ 相似音字符匹配（如：停/听/挺/庭）
- ✅ 多候选结果检查（最多5个）
- ✅ 字符级匹配
- ✅ 移动端优化

### 2. 视频播放 (Video Playback)
- ✅ 双视频层技术（无缝切换）
- ✅ 300ms 淡入淡出效果
- ✅ 视频预加载
- ✅ 完全无黑屏切换
- ✅ 自动循环播放
- ✅ 队列系统（最新指令覆盖）

### 3. 用户界面 (User Interface)
- ✅ 手动控制按钮（移动端友好）
- ✅ 实时状态显示
- ✅ 语言选择（中文/英文）
- ✅ 响应式设计
- ✅ 触摸优化

### 4. 移动端支持 (Mobile Support)
- ✅ 防止全屏模式
- ✅ 触摸友好按钮
- ✅ 优化识别设置
- ✅ 手动控制备选方案

## 技术架构 (Technical Architecture)

### 前端 (Frontend)
- **HTML5** - 结构和视频元素
- **CSS3** - 样式和动画（淡入淡出）
- **JavaScript (ES6)** - 核心逻辑
  - Web Speech API 集成
  - 双视频层管理
  - 命令处理和匹配
  - 队列系统

### 后端 (Backend)
- **Flask** - Python web 框架
- **Flask-CORS** - 跨域支持
- 极简设计（仅提供静态文件和视频）

### 视频处理 (Video Processing)
- **ffmpeg** - 视频处理工具
- **yt-dlp** - 视频下载工具

## 项目结构 (Project Structure)

```
smootie/
├── app.py                          # Flask 后端服务器
├── requirements.txt                # Python 依赖
├── requirements-video-search.txt   # 视频搜索工具依赖
│
├── templates/
│   └── index.html                  # 主页面
│
├── static/
│   ├── app.js                      # 前端逻辑（核心）
│   └── style.css                   # 样式
│
├── videos/
│   ├── idle.mov                    # 默认/停止视频
│   ├── jump.mov                    # 跳跃视频
│   ├── circle.mov                  # 转圈视频
│   └── README.md                   # 视频目录说明
│
├── search_videos.py                # 视频搜索下载工具
├── video_search.sh                 # 交互式搜索脚本
│
├── README.md                       # 主文档
├── LICENSE                         # MIT 许可证
├── .gitignore                      # Git 忽略规则
│
└── Documentation/
    ├── VIDEO_SEARCH_INSTALLATION.md    # 安装确认
    ├── VIDEO_SEARCH_QUICKSTART.md      # 快速入门
    ├── VIDEO_SEARCH_GUIDE.md           # 完整指南
    ├── VIDEO_COMMANDS_REFERENCE.md     # 命令参考
    ├── VIDEO_EXAMPLES.md               # 示例和链接
    ├── VIDEO_CREDITS.md                # 许可证追踪
    └── SUMMARY.md                      # 本文档
```

## 当前视频指令 (Current Voice Commands)

### 基础指令 (Basic Commands)

| 中文 | 英文 | 相似音 | 视频文件 | 说明 |
|------|------|--------|----------|------|
| 跳 | jump | 条/调 | jump.mov | 跳跃动作 |
| 转 | circle | 赚/传/专 | circle.mov | 转圈动作 |
| 停 | stop | 听/挺/庭 | idle.mov | 停止/待机 |

### 工作原理 (How It Works)

1. **语音识别** → 持续监听用户语音
2. **命令匹配** → 检查多个候选结果和相似音
3. **加入队列** → 将目标视频加入队列
4. **等待完成** → 当前视频播放完毕
5. **平滑切换** → 淡入淡出切换到新视频
6. **继续监听** → 接受下一个指令

## 视频搜索工具 (Video Search Tool)

### 功能特性 (Features)
- ✅ 14+ 动作类别
- ✅ YouTube 自动搜索
- ✅ 时长和质量过滤
- ✅ 一键下载
- ✅ 批处理支持

### 支持的动作类型 (Supported Actions)

#### 静态动作 (Static/Idle) - 带自然呼吸
- `standing` - 站立待机
- `sitting` - 坐姿待机

#### 动态动作 (Dynamic) - 循环动作
- `walking` - 行走
- `running` - 跑步
- `jumping` - 跳跃
- `dancing` - 跳舞
- `waving` - 挥手

#### 过渡动作 (Transitions) - 状态切换
- `stand_to_sit` - 站→坐
- `sit_to_stand` - 坐→站
- `stand_to_walk` - 站→走
- `walk_to_stand` - 走→站

### 使用示例 (Usage Example)

```bash
# 列出所有动作
python search_videos.py --list-actions

# 搜索视频
python search_videos.py --action walking --preview-only

# 下载视频
python search_videos.py --action walking --download --url "VIDEO_URL"
```

## 关键技术实现 (Key Technical Implementations)

### 1. 双视频层切换 (Dual Video Layer Switching)

**问题**: 传统方法改变 `src` 会导致黑屏

**解决方案**: 
- 使用两个视频元素层叠
- 一个显示（active），一个隐藏（inactive）
- 新视频在后台加载
- CSS 淡入淡出过渡
- 加载完成后交换角色

**代码实现**:
```javascript
// 在后台层加载新视频
this.inactivePlayer.src = `/videos/${videoToPlay}`;
this.inactivePlayer.load();

// 等待加载完成
this.inactivePlayer.addEventListener('canplay', () => {
    // 开始播放新视频
    this.inactivePlayer.play();
    
    // CSS 淡入淡出
    this.inactivePlayer.classList.add('active');
    this.activePlayer.classList.remove('active');
    
    // 300ms 后交换引用
    setTimeout(() => {
        this.activePlayer.pause();
        [this.activePlayer, this.inactivePlayer] = 
            [this.inactivePlayer, this.activePlayer];
    }, 300);
});
```

### 2. 相似音匹配 (Similar Sound Matching)

**问题**: 中文语音识别常出现同音字错误

**解决方案**:
- 建立相似音映射表
- 检查多个候选结果（最多5个）
- 字符级和词级匹配

**代码实现**:
```javascript
this.commandMap = {
    '停': 'idle.mov',
    '听': 'idle.mov',  // 相似音
    '挺': 'idle.mov',  // 相似音
    '庭': 'idle.mov',  // 相似音
};

// 检查所有候选结果
for (let i = 0; i < result.length; i++) {
    const text = result[i].transcript;
    if (this.tryProcessCommand(text)) {
        matched = true;
        break;
    }
}
```

### 3. 队列系统 (Queue System)

**问题**: 需要等待当前视频完成，但随时接受新指令

**解决方案**:
- 单一队列变量（最新覆盖）
- 视频结束时检查队列
- 不立即切换，等待完成

**代码实现**:
```javascript
queueVideoSwitch(videoFile) {
    // 只加入队列，不立即切换
    this.queuedVideo = videoFile;
    // 切换将在 onVideoEnded() 中发生
}

onVideoEnded() {
    if (this.queuedVideo) {
        this.switchVideo();  // 现在切换
    } else {
        this.activePlayer.play();  // 循环当前视频
    }
}
```

### 4. 移动端全屏防止 (Mobile Fullscreen Prevention)

**问题**: 移动端点击按钮会触发视频全屏，导致语音识别失效

**解决方案**:
- HTML 属性: `playsinline`, `webkit-playsinline`
- CSS: `pointer-events: none` 在视频上
- JavaScript: 监听并阻止全屏事件
- 自动退出全屏

**代码实现**:
```html
<video playsinline webkit-playsinline 
       disablePictureInPicture 
       controlsList="nodownload nofullscreen noremoteplayback">
```

```css
.video-layer {
    pointer-events: none;
}
```

```javascript
player.addEventListener('webkitbeginfullscreen', (e) => {
    e.preventDefault();
    e.stopPropagation();
});
```

## 性能优化 (Performance Optimizations)

### 1. 视频预加载 (Video Preloading)
- 页面加载时预加载所有视频
- 存储在内存中的视频元素
- 即时切换，无需等待加载

### 2. 文件大小优化 (File Size Optimization)
- 推荐 720p 分辨率
- H.264 编码
- CRF 22-28 质量
- 移除音频轨道
- 目标: <5MB 每个视频

### 3. 移动端优化 (Mobile Optimization)
- 非连续识别模式（一次一个短语）
- 300ms 重启延迟
- 触摸友好按钮（大尺寸）
- 手动控制备选方案

## 浏览器兼容性 (Browser Compatibility)

| 浏览器 | 语音识别 | 视频播放 | 手动控制 | 推荐度 |
|--------|----------|----------|----------|--------|
| Chrome (Desktop) | ✅ 完美 | ✅ 完美 | ✅ | ⭐⭐⭐⭐⭐ |
| Edge (Desktop) | ✅ 完美 | ✅ 完美 | ✅ | ⭐⭐⭐⭐⭐ |
| Chrome (Mobile) | ⚠️ 部分 | ✅ 完美 | ✅ | ⭐⭐⭐⭐ |
| Safari | ❌ 不支持 | ✅ 完美 | ✅ | ⭐⭐⭐ |
| Firefox | ❌ 不支持 | ✅ 完美 | ✅ | ⭐⭐⭐ |

**注意**: 
- 语音识别需要 Web Speech API（Chrome/Edge）
- 所有浏览器都支持手动按钮控制
- 移动端建议使用手动控制

## 安装和运行 (Installation & Running)

### 快速开始 (Quick Start)

```bash
# 1. 克隆仓库
git clone <repository-url>
cd smootie

# 2. 安装 Python 依赖
pip install -r requirements.txt

# 3. 运行服务器
python app.py

# 4. 打开浏览器
# 访问 http://localhost:5001

# 5. 开始使用
# 点击"开始监听"并说出指令
```

### 添加新视频 (Adding New Videos)

```bash
# 1. 安装视频搜索工具依赖
pip install -r requirements-video-search.txt
brew install ffmpeg  # 或 apt install ffmpeg

# 2. 搜索视频
python search_videos.py --action walking --preview-only

# 3. 下载视频
python search_videos.py --action walking --download --url "VIDEO_URL"

# 4. 更新代码
# 编辑 static/app.js 和 templates/index.html

# 5. 测试
python app.py
```

## 文档索引 (Documentation Index)

### 主要文档 (Main Documentation)
1. **README.md** - 项目主文档
2. **SUMMARY.md** - 本文档（项目总结）
3. **LICENSE** - MIT 许可证

### 视频搜索文档 (Video Search Documentation)
1. **VIDEO_SEARCH_INSTALLATION.md** - 安装确认和快速开始
2. **VIDEO_SEARCH_QUICKSTART.md** - 快速入门指南
3. **VIDEO_SEARCH_GUIDE.md** - 完整详细指南
4. **VIDEO_COMMANDS_REFERENCE.md** - 命令映射和集成参考
5. **VIDEO_EXAMPLES.md** - 具体示例和链接
6. **VIDEO_CREDITS.md** - 视频来源和许可证追踪

### 目录说明 (Directory Documentation)
- **videos/README.md** - 视频目录说明

## 开发路线图 (Development Roadmap)

### 已完成 (Completed) ✅
- [x] 基础语音识别
- [x] 视频播放和切换
- [x] 相似音匹配
- [x] 双视频层无缝切换
- [x] 移动端支持
- [x] 手动控制按钮
- [x] 队列系统
- [x] 视频预加载
- [x] 防止全屏
- [x] 视频搜索工具
- [x] 完整文档

### 可能的未来改进 (Possible Future Improvements)
- [ ] 更多视频动作
- [ ] 自定义命令映射
- [ ] 视频效果（滤镜、特效）
- [ ] 多语言支持（日语、韩语等）
- [ ] 离线语音识别
- [ ] 视频编辑器集成
- [ ] 云端视频库
- [ ] 用户配置保存
- [ ] 统计和分析
- [ ] PWA 支持

## 常见问题 (FAQ)

### Q: 为什么语音识别不工作？
**A**: 
- 确保使用 Chrome 或 Edge 浏览器
- 检查麦克风权限
- 查看浏览器控制台错误信息
- 尝试使用手动按钮

### Q: 为什么说"停"识别成"听"？
**A**: 这是正常的，系统已经处理了相似音。"听"、"挺"、"庭"都会被识别为"停"指令。

### Q: 移动端识别不准确怎么办？
**A**: 
- 使用手动按钮控制（更可靠）
- 确保在安静环境中使用
- 说话清晰，语速适中
- 选择正确的语言（中文/英文）

### Q: 视频切换有黑屏？
**A**: 不应该有黑屏。如果出现：
- 检查浏览器控制台错误
- 确保视频已预加载
- 刷新页面重试
- 检查视频文件是否损坏

### Q: 如何添加新的视频动作？
**A**: 
1. 使用 `search_videos.py` 搜索和下载视频
2. 更新 `static/app.js` 中的 `videoFiles` 和 `commandMap`
3. 更新 `templates/index.html` 中的命令列表
4. 测试语音命令和手动按钮

### Q: 视频文件太大怎么办？
**A**: 
```bash
# 压缩视频
ffmpeg -i input.mp4 -vf scale=1280:720 -c:v libx264 -crf 28 output.mp4
```

### Q: 如何制作无缝循环视频？
**A**: 
```bash
# 方法1: 裁剪到循环点
ffmpeg -i input.mp4 -ss 00:00:02 -to 00:00:08 -c copy output.mp4

# 方法2: 乒乓循环
ffmpeg -i input.mp4 -filter_complex "[0:v]reverse[r];[0:v][r]concat=n=2:v=1[v]" -map "[v]" output.mp4
```

## 贡献指南 (Contributing Guidelines)

### 如何贡献 (How to Contribute)

1. **报告问题 (Report Issues)**
   - 使用 GitHub Issues
   - 提供详细描述和复现步骤
   - 包含浏览器和系统信息

2. **提交代码 (Submit Code)**
   - Fork 仓库
   - 创建功能分支
   - 遵循代码风格
   - 添加测试和文档
   - 提交 Pull Request

3. **改进文档 (Improve Documentation)**
   - 修正错误
   - 添加示例
   - 翻译内容
   - 更新过时信息

4. **分享视频 (Share Videos)**
   - 分享好的视频来源
   - 提供视频处理技巧
   - 更新 VIDEO_EXAMPLES.md

### 代码风格 (Code Style)

**JavaScript**:
- 使用 ES6+ 语法
- 驼峰命名法
- 详细注释
- 错误处理

**Python**:
- PEP 8 风格
- 类型提示
- 文档字符串
- 错误处理

**HTML/CSS**:
- 语义化标签
- BEM 命名（可选）
- 响应式设计
- 可访问性

## 许可证 (License)

MIT License - 详见 LICENSE 文件

## 致谢 (Acknowledgments)

### 技术栈 (Technology Stack)
- **Flask** - Python web 框架
- **Web Speech API** - 浏览器语音识别
- **ffmpeg** - 视频处理
- **yt-dlp** - 视频下载

### 视频来源 (Video Sources)
- **Pexels** - 免费视频素材
- **Mixkit** - 免费视频片段
- **Pixabay** - 免费素材库

### 灵感来源 (Inspiration)
- 类似项目: tapetiteamie
- 语音控制界面设计
- 视频循环播放技术

## 联系方式 (Contact)

- **项目仓库**: [GitHub Repository URL]
- **问题反馈**: [GitHub Issues URL]
- **文档**: 查看项目中的 Markdown 文件

## 更新日志 (Changelog)

### Version 1.0.0 (2026-01-26)
- ✅ 初始版本发布
- ✅ 基础语音识别功能
- ✅ 视频播放和切换
- ✅ 移动端支持
- ✅ 视频搜索工具
- ✅ 完整文档

---

**最后更新**: 2026-01-26
**版本**: 1.0.0
**状态**: ✅ 生产就绪 (Production Ready)
