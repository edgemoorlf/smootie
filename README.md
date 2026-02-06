# Smootie - 声控动作视频播放器

基于浏览器语音识别的视频切换应用，支持语音确认反馈。

A web-based voice-controlled video player with audio acknowledgement that switches videos based on voice commands using browser speech recognition.

## ✨ 新功能 v2.1.0 (New in v2.1.0)

🎉 **新增功能 (New Features)**:

- 🎬 **立即切换视频** - 收到命令后立即切换，不等待当前视频播放完毕（可配置）
- 🔄 **特殊动作支持** - 支持播放后返回上一个视频的特殊动作（如"唱歌"）
- 📱 **响应式布局** - 大屏幕上视频和控制面板并排显示，小屏幕自动堆叠
- 🎤 **语音识别自动恢复** - 识别中断后自动重启，更稳定的连续识别体验
- 🔊 **视频音频支持** - 用户交互后自动取消静音，支持视频内音频播放

## 项目概述 (Project Overview)

Smootie 是一个基于浏览器语音识别的声控视频播放器，可以通过语音指令无缝切换视频。支持多视频集配置，每个视频集有独立的语音命令映射。采用双视频层技术实现完全无缝的视频切换，支持idle/anchor视频循环和动作视频单次播放。

Smootie is a voice-controlled video player using browser speech recognition for seamless video switching. It supports multiple configurable video sets with independent voice command mappings. Uses dual video layer technology for completely seamless transitions, with idle/anchor video looping and action videos playing once.

## 核心功能 (Core Features)

### 1. 语音识别 (Voice Recognition)
- ✅ 浏览器 Web Speech API 集成
- ✅ 默认中文识别，支持模糊匹配
- ✅ 同音字智能匹配（如：停/听/挺/庭，抖/斗/豆/读，扭/纽/牛）
- ✅ 短语变体支持（如："抖起来"、"读起来"都能触发"抖"命令）
- ✅ 多候选结果检查（最多10个）
- ✅ 字符级精确匹配
- ✅ 词汇限制到配置的命令
- ✅ 视觉反馈（✓/✗ 显示匹配状态）
- ✅ 移动端优化

### 2. 视频播放 (Video Playback)
- ✅ 双视频层技术（完全无缝切换）
- ✅ 500ms 淡入淡出效果（硬件加速）
- ✅ 智能视频预加载
- ✅ Idle/Anchor 视频循环播放
- ✅ 动作视频单次播放后返回idle
- ✅ 队列系统（最新指令覆盖）
- ✅ 完全无黑屏切换
- ✅ **立即切换模式** - 可配置是否立即切换或等待当前视频结束 🆕
- ✅ **特殊动作支持** - 支持播放后返回上一个视频（如"唱歌"） 🆕
- ✅ **视频音频播放** - 用户交互后自动取消静音 🆕

### 3. 多视频集支持 (Multiple Video Sets)
- ✅ 可配置的视频集系统
- ✅ 每个视频集独立的命令映射
- ✅ 每个视频集独立的按钮配置
- ✅ 动态UI更新
- ✅ 下拉选择器切换视频集
- ✅ 当前支持：tiktok/set1, tiktok/set2, tiktok/set3, default

### 4. 语音确认 (Voice Acknowledgement) 🆕
- ✅ 命令成功时播放确认音
- ✅ 命令失败时播放错误提示音
- ✅ 命令特定音频（如"停"、"抖"、"扭"）
- ✅ 通用确认音（随机选择）
- ✅ 音频预加载（无延迟播放）
- ✅ 音量控制和静音功能
- ✅ 不干扰视频播放和语音识别

### 5. 用户界面 (User Interface)
- ✅ 手动控制按钮（移动端友好）
- ✅ 音频控制面板（音量、静音、开关）
- ✅ 实时状态显示
- ✅ 视频集选择器
- ✅ 动作列表显示
- ✅ 响应式设计
- ✅ 触摸优化
- ✅ **并排布局** - 大屏幕上视频和控制面板并排显示 🆕
- ✅ **"命令她/不要她"按钮** - 更直观的交互体验 🆕

### 6. 移动端支持 (Mobile Support)
- ✅ 防止全屏模式
- ✅ 触摸友好按钮
- ✅ 优化识别设置
- ✅ 手动控制备选方案
- ✅ 音频播放支持

## 当前视频集配置 (Current Video Set Configuration)

### tiktok/set3 (默认 Default)
| 命令 | 相似音/短语 | 视频 | 说明 |
|------|-------------|------|------|
| 停 (stop) | 听/挺/庭 | 7.mp4 | Idle/Anchor 视频（循环） |
| 抖 (shake) | 斗/豆/读/读起来/抖起来/都 | 8.mp4 | 动作视频（单次播放） |
| 扭 (twist) | 纽/牛 | 9.mp4 | 动作视频（单次播放） |

### tiktok/set1
| 命令 | 相似音 | 视频 | 说明 |
|------|--------|------|------|
| 扭 (twist) | 停/读/多/留/有/牛 | 1.mp4 | Idle/Anchor 视频（循环） |
| 抖 (shake) | 斗/豆/读/读起来/抖起来/都/肚/多 | 2.mp4 | 动作视频（单次播放） |
| 颠 (bounce) | 点/电/垫 | 3.mp4 | 动作视频（单次播放） |
| 唱歌 (sing) | 唱/歌/跳舞/舞 | dance.mp4 | **特殊动作** - 播放后返回上一个视频 🆕 |

### tiktok/set2
| 命令 | 相似音 | 视频 | 说明 |
|------|--------|------|------|
| 跳 (jump) | 条/调 | 4.mp4 | 动作视频（单次播放） |
| 转 (circle) | 赚/传/专 | 5.mp4 | 动作视频（单次播放） |
| 停 (stop) | 听/挺/庭 | 6.mp4 | Idle/Anchor 视频（循环） |

### 视频播放逻辑 (Video Playback Logic)

### Idle/Anchor 视频系统
- **Idle视频**: 每个视频集有一个指定的idle/anchor视频
- **循环播放**: Idle视频会持续循环播放
- **动作视频**: 其他视频播放一次后自动返回idle视频
- **特殊动作**: 标记为`returnToPrevious`的视频播放后返回上一个视频（而非idle） 🆕
- **自然流程**: 角色保持idle状态 → 执行动作 → 返回idle状态

### 立即切换模式 🆕
- **立即切换（默认）**: 收到命令后立即切换到新视频，不等待当前视频播放完毕
- **等待模式**: 可在设置中关闭立即切换，等待当前视频播放完毕后再切换
- **设置持久化**: 用户偏好保存在localStorage中

### 工作流程
1. 应用启动时播放idle视频（如set1的1.mp4）
2. 用户点击"命令她"按钮启动语音识别
3. 用户说出命令或点击按钮
4. 立即切换到目标视频（或等待当前视频结束，取决于设置）
5. 如果是动作视频，播放完毕后自动返回idle视频
6. 如果是特殊动作（如"唱歌"），播放完毕后返回上一个视频
7. 如果是idle视频，持续循环播放

## 技术架构 (Technical Architecture)

### 前端 (Frontend)
- **HTML5** - 结构和视频元素
- **CSS3** - 样式和动画（硬件加速的淡入淡出）
- **JavaScript (ES6)** - 核心逻辑
  - Web Speech API 集成
  - 双视频层管理
  - 命令处理和匹配
  - 队列系统
  - 多视频集配置系统

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
├── config/                         # 配置文件 (NEW in v2.0)
│   ├── videosets.json             # 视频集配置
│   └── README.md                   # 配置文档
│
├── templates/
│   └── index.html                  # 主页面
│
├── static/
│   ├── config-loader.js            # 配置加载器 (NEW in v2.0)
│   ├── app.js                      # 前端逻辑（核心）
│   └── style.css                   # 样式
│
├── audio/                          # 音频文件 (NEW in v2.0) ✅
│   ├── common/                     # 通用确认音
│   │   ├── acknowledged_zh.mp3    # "好的"
│   │   ├── received_zh.mp3        # "收到"
│   │   ├── understood_zh.mp3      # "明白"
│   │   ├── ok_zh.mp3              # "嗯"
│   │   ├── acknowledged_en.mp3    # "OK"
│   │   ├── received_en.mp3        # "Got it"
│   │   └── error_zh.mp3           # "没听清"
│   ├── tiktok/
│   │   ├── set1/                  # Set 1 音频
│   │   │   ├── jump_zh.mp3
│   │   │   ├── circle_zh.mp3
│   │   │   └── stop_zh.mp3
│   │   ├── set2/                  # Set 2 音频
│   │   │   ├── jump_zh.mp3
│   │   │   ├── circle_zh.mp3
│   │   │   └── stop_zh.mp3
│   │   └── set3/                  # Set 3 音频
│   │       ├── stop_zh.mp3
│   │       ├── shake_zh.mp3
│   │       └── twist_zh.mp3
│   ├── README.md                   # 音频规格说明
│   └── generate_audio.sh           # 音频生成脚本 ✅
│
├── videos/
│   ├── tiktok/
│   │   ├── set1/                   # 视频集1
│   │   │   ├── 1.mp4
│   │   │   ├── 2.mp4
│   │   │   └── 3.mp4
│   │   ├── set2/                   # 视频集2
│   │   │   ├── 4.mp4
│   │   │   ├── 5.mp4
│   │   │   └── 6.mp4
│   │   └── set3/                   # 视频集3
│   │       ├── 7.mp4
│   │       ├── 8.mp4
│   │       └── 9.mp4
│   ├── default/
│   │   ├── idle.mov
│   │   ├── jump.mov
│   │   └── circle.mov
│   └── README.md                   # 视频目录说明
│
├── search_videos.py                # 视频搜索下载工具
├── video_search.sh                 # 交互式搜索脚本
│
├── README.md                       # 本文档
├── VOICE_ACK.md                    # 语音确认功能计划
├── VOICE_ACK_IMPLEMENTATION.md     # 实现总结 ✅
├── TODO_VOICE_ACK.md               # 任务追踪
├── QUICK_REFERENCE.md              # 快速参考
├── LICENSE                         # MIT 许可证
└── .gitignore                      # Git 忽略规则
```

## 配置系统 (Configuration System) 🆕

### 外部配置文件 (External Configuration)

从 v2.0 开始，所有视频集配置已移至外部 JSON 文件，便于维护和扩展。

Starting from v2.0, all video set configurations have been moved to external JSON files for easier maintenance and extensibility.

**配置文件位置**: `config/videosets.json`

### 配置结构 (Configuration Structure)

```json
{
  "version": "2.0.0",
  "defaultSet": "tiktok/set1",
  "sets": {
    "set-id": {
      "id": "string",
      "name": "Display Name",
      "description": "Description",
      "videos": [
        {
          "id": "video-id",
          "path": "/videos/path/to/video.mp4",
          "name": "Video Name",
          "description": "Video description",
          "duration": 5.2,
          "isIdle": true,
          "isSpecial": false,
          "returnToPrevious": false,
          "tags": ["tag1", "tag2"]
        }
      ],
      "defaultVideo": "video-id",
      "idleVideo": "video-id",
      "commands": {
        "command-id": {
          "video": "video-id",
          "keywords": ["keyword1", "keyword2"],
          "description": "Command description",
          "primaryKeyword": "keyword1",
          "returnToPrevious": false
        }
      },
      "buttons": [
        {
          "label": "Button Label",
          "video": "video-id",
          "class": "css-class",
          "tooltip": "Tooltip text"
        }
      ],
      "audioAck": {
        "enabled": true,
        "volume": 0.7,
        "generic": ["/audio/common/acknowledged_zh.mp3"],
        "specific": {
          "命令": "/audio/path/command_zh.mp3"
        },
        "error": "/audio/common/error_zh.mp3"
      }
    }
  }
}
```

### 特殊动作配置 (Special Action Configuration) 🆕

要创建播放后返回上一个视频的特殊动作（如"唱歌"），需要在视频和命令配置中添加 `returnToPrevious: true`：

```json
{
  "videos": [
    {
      "id": "dance.mp4",
      "name": "唱歌 (Sing/Dance)",
      "isSpecial": true,
      "returnToPrevious": true
    }
  ],
  "commands": {
    "dance": {
      "video": "dance.mp4",
      "keywords": ["唱歌", "唱", "歌", "跳舞"],
      "primaryKeyword": "唱歌",
      "returnToPrevious": true
    }
  }
}
```

### 添加新视频集 (Adding New Video Sets)

1. **准备视频文件**
   ```bash
   mkdir -p videos/my-set
   # 将视频文件复制到 videos/my-set/
   ```

2. **编辑配置文件**

   打开 `config/videosets.json` 并添加新的视频集配置：

   ```json
   {
     "sets": {
       "my-set": {
         "id": "my-set",
         "name": "My Custom Set",
         "description": "My custom video set",
         "videos": [
           {
             "id": "video1.mp4",
             "path": "/videos/my-set/video1.mp4",
             "name": "Video 1",
             "description": "First video",
             "duration": 5.0,
             "isIdle": true,
             "tags": ["idle"]
           }
         ],
         "defaultVideo": "video1.mp4",
         "idleVideo": "video1.mp4",
         "commands": {
           "action1": {
             "video": "video1.mp4",
             "keywords": ["action1", "动作1"],
             "description": "First action",
             "primaryKeyword": "action1"
           }
         },
         "buttons": [
           {
             "label": "动作1",
             "video": "video1.mp4",
             "class": "action-btn",
             "tooltip": "Action 1"
           }
         ]
       }
     }
   }
   ```

3. **刷新浏览器**

   新视频集将自动出现在下拉选择器中。

**详细文档**: 查看 `config/README.md` 了解完整的配置指南。

## 安装和运行 (Installation & Running)

### 环境要求 (Prerequisites)
- Python 3.8+
- 现代浏览器（Chrome/Edge，支持 Web Speech API）
- 麦克风权限

### 快速开始 (Quick Start)

```bash
# 1. 克隆仓库
git clone <repository-url>
cd smootie

# 2. 安装 Python 依赖
pip install -r requirements.txt

# 3. 生成音频文件（可选，已包含示例音频）
chmod +x generate_audio.sh
./generate_audio.sh

# 4. 运行服务器
python app.py

# 5. 打开浏览器
# 访问 http://localhost:5001

# 6. 开始使用
# 点击"命令她"按钮启动语音识别
# 说出指令（如"抖"、"扭"、"唱歌"）
# 点击"不要她"停止语音识别
```

## 关键技术实现 (Key Technical Implementations)

### 1. 双视频层切换 (Dual Video Layer Switching)

**问题**: 传统方法改变 `src` 会导致黑屏

**解决方案**:
- 使用两个视频元素层叠
- 一个显示（active），一个隐藏（inactive）
- 新视频在后台加载
- CSS 淡入淡出过渡（500ms，硬件加速）
- 加载完成后交换角色

**代码实现**:
```javascript
// 使用预加载的视频
const preloadedVideo = this.preloadedVideos[videoToPlay];
this.inactivePlayer.src = preloadedVideo.src;
this.inactivePlayer.load();

// 等待加载完成
this.inactivePlayer.addEventListener('canplay', () => {
    // 开始播放新视频
    this.inactivePlayer.play();

    // CSS 淡入淡出（硬件加速）
    this.inactivePlayer.classList.add('active');
    this.activePlayer.classList.remove('active');

    // 500ms 后交换引用
    setTimeout(() => {
        this.activePlayer.pause();
        [this.activePlayer, this.inactivePlayer] =
            [this.inactivePlayer, this.activePlayer];
    }, 500);
});
```

### 2. 相似音匹配 (Similar Sound Matching)

**问题**: 中文语音识别常出现同音字错误

**解决方案**:
- 建立相似音映射表
- 检查多个候选结果（最多10个）
- 三层匹配策略：精确字符 → 精确词 → 子串

**代码实现**:
```javascript
// 每个视频集的命令配置
commands: {
    '停': '7.mp4',
    '听': '7.mp4',  // 相似音
    '挺': '7.mp4',  // 相似音
    '庭': '7.mp4',  // 相似音
    '抖': '8.mp4',
    '斗': '8.mp4',  // 相似音
    '豆': '8.mp4',  // 相似音
}

// 三层匹配策略
tryProcessCommand(text) {
    // 1. 精确字符匹配
    for (const char of chars) {
        if (validCommands.includes(char)) return true;
    }
    // 2. 精确词匹配
    for (const word of words) {
        if (validCommands.includes(word)) return true;
    }
    // 3. 子串匹配
    for (const command of validCommands) {
        if (text.includes(command)) return true;
    }
}
```

### 3. Idle/Anchor 视频系统 (Idle/Anchor Video System)

**问题**: 需要区分循环视频和单次播放视频

**解决方案**:
- 每个视频集配置 `idleVideo` 属性
- 视频结束时检查是否为idle视频
- 非idle视频自动返回idle视频

**代码实现**:
```javascript
onVideoEnded() {
    if (this.queuedVideo) {
        // 有队列视频，切换
        this.switchVideo();
    } else if (this.currentVideo === this.idleVideo) {
        // 当前是idle视频，循环播放
        this.activePlayer.currentTime = 0;
        this.activePlayer.play();
    } else {
        // 非idle视频结束，返回idle
        this.queuedVideo = this.idleVideo;
        this.switchVideo();
    }
}
```

### 4. 多视频集配置系统 (Multiple Video Sets Configuration)

**问题**: 需要支持多个视频集，每个有不同的命令

**解决方案**:
- 集中式配置对象 `videoSets`
- 动态加载视频集配置
- 自动更新UI（按钮、命令列表）

**代码实现**:
```javascript
videoSets: {
    'tiktok/set3': {
        videos: ['7.mp4', '8.mp4', '9.mp4'],
        defaultVideo: '7.mp4',
        idleVideo: '7.mp4',
        commands: { /* ... */ },
        buttons: [ /* ... */ ]
    },
    // 更多视频集...
}

// 切换视频集
switchVideoSet(setName) {
    this.loadVideoSet(setName);
    this.updateManualControls();
    this.updateCommandList();
    this.preloadVideos();
}
```

### 5. 智能视频预加载 (Smart Video Preloading)

**问题**: 需要即时切换，但不能一次加载所有视频

**解决方案**:
- 页面加载时预加载当前视频集
- 队列视频时立即预加载
- 视频接近结束时确保队列视频已加载

**代码实现**:
```javascript
// 队列时预加载
queueVideoSwitch(videoFile) {
    if (!this.preloadedVideos[videoFile]) {
        const video = document.createElement('video');
        video.src = `/videos/${this.currentSet}/${videoFile}`;
        video.load();
        this.preloadedVideos[videoFile] = video;
    }
}

// 接近结束时确保加载
player.addEventListener('timeupdate', () => {
    const remaining = player.duration - player.currentTime;
    if (remaining < 2 && this.queuedVideo) {
        // 确保队列视频已加载
    }
});
```

### 6. 移动端全屏防止 (Mobile Fullscreen Prevention)

**问题**: 移动端点击按钮会触发视频全屏，导致语音识别失效

**解决方案**:
- HTML 属性: `playsinline`, `webkit-playsinline`
- CSS: `pointer-events: none` 在视频上
- JavaScript: 监听并阻止全屏事件

**代码实现**:
```html
<video playsinline webkit-playsinline
       disablePictureInPicture
       controlsList="nodownload nofullscreen noremoteplayback">
```

```css
.video-layer {
    pointer-events: none;
    /* 硬件加速 */
    transform: translateZ(0);
    backface-visibility: hidden;
    will-change: opacity;
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
- 页面加载时预加载当前视频集
- 队列时立即预加载目标视频
- 视频接近结束时确保队列视频已加载

### 2. 硬件加速 (Hardware Acceleration)
- CSS `transform: translateZ(0)` 强制GPU渲染
- `backface-visibility: hidden` 优化3D变换
- `will-change: opacity` 提示浏览器优化

### 3. 文件大小优化 (File Size Optimization)
- 推荐 720p 分辨率
- H.264 编码
- CRF 22-28 质量
- 移除音频轨道
- 目标: <5MB 每个视频

### 4. 移动端优化 (Mobile Optimization)
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

## 添加新视频集 (Adding New Video Sets)

### 方法1: 修改配置文件

编辑 `static/app.js` 中的 `videoSets` 对象:

```javascript
'your-set-name': {
    videos: ['video1.mp4', 'video2.mp4', 'video3.mp4'],
    defaultVideo: 'video1.mp4',
    idleVideo: 'video1.mp4',  // 指定idle/anchor视频
    commands: {
        'command1': 'video1.mp4',
        '命令1': 'video1.mp4',
        '相似音1': 'video1.mp4',
        // 更多命令...
    },
    buttons: [
        { label: '按钮1', video: 'video1.mp4', class: 'stop-btn' },
        { label: '按钮2', video: 'video2.mp4', class: 'circle-btn' },
        { label: '按钮3', video: 'video3.mp4', class: 'jump-btn' }
    ]
}
```

### 方法2: 使用视频搜索工具

```bash
# 1. 安装依赖
pip install -r requirements-video-search.txt
brew install ffmpeg  # macOS, or: apt install ffmpeg

# 2. 查看所有可用动作类型
python search_videos.py --list-actions

# 3. 搜索特定动作的视频
python search_videos.py --action walking --preview-only

# 4. 下载视频
python search_videos.py --action walking --download --url "VIDEO_URL"

# 5. 或使用交互式菜单
./video_search.sh
```

### 视频要求 (Video Requirements)

#### 必须满足 (Must Have):
- ✅ 真人拍摄（非动画/CGI）
- ✅ 时长：2-30秒
- ✅ 分辨率：720p 或更高
- ✅ Idle视频：可循环播放（开始和结束位置相似）
- ✅ 背景简洁
- ✅ 摄像机稳定

#### 避免 (Avoid):
- ❌ 摄像机抖动
- ❌ 复杂背景
- ❌ 低分辨率
- ❌ 水印

### 视频处理技巧 (Video Processing Tips)

```bash
# 制作无缝循环
ffmpeg -i input.mp4 -ss 00:00:02 -to 00:00:08 -c copy output.mp4

# 创建乒乓循环（正放+倒放）
ffmpeg -i input.mp4 -filter_complex "[0:v]reverse[r];[0:v][r]concat=n=2:v=1[v]" -map "[v]" output.mp4

# 优化网页播放
ffmpeg -i input.mp4 -vf scale=1280:720 -c:v libx264 -crf 23 -preset slow -an output.mp4

# 格式转换
ffmpeg -i input.mov -c:v libx264 -c:a aac output.mp4
```

## 调试技巧 (Debugging)

1. 打开浏览器控制台（F12 或 Cmd+Option+I）
2. 查看识别日志：
   - `Starting recognition with language: zh-CN` - 识别已启动
   - `Valid commands: ...` - 当前有效命令
   - `Alternative 0: "text" (confidence: 0.9)` - 候选结果
   - `Exact character match: 停 -> 7.mp4` - 匹配成功
   - `✓ text` - 命令匹配成功
   - `✗ text` - 识别但未匹配

## 常见问题 (FAQ)

### Q: 为什么语音识别不工作？
**A**:
- 确保使用 Chrome 或 Edge 浏览器
- 检查麦克风权限
- 查看浏览器控制台错误信息
- 尝试使用手动按钮

### Q: 为什么说"停"识别成"听"？
**A**: 这是正常的，系统已经处理了相似音。"听"、"挺"、"庭"都会被识别为"停"指令。

### Q: 为什么说"抖起来"识别成"读起来"？
**A**: 这也是正常的！系统已经添加了同音字支持。"读起来"、"读"、"都"等相似发音都会被识别为"抖"指令。这是中文语音识别的常见现象，系统通过添加同音字关键词来解决。

### Q: 如何添加新的同音字？
**A**:
1. 打开 `config/videosets.json`
2. 找到对应命令的 `keywords` 数组
3. 添加新的同音字或短语
4. 保存并刷新浏览器

示例：
```json
"shake": {
  "keywords": ["shake", "抖", "斗", "豆", "读", "读起来", "抖起来", "都"]
}
```

### Q: 中文音频没有声音？
**A**:
- 检查音频文件是否存在：`ls audio/common/`
- 重新生成音频：`./generate_audio.sh`
- 确保使用了正确的中文语音（Tingting）
- 检查音量设置和静音状态

### Q: 移动端识别不准确怎么办？
**A**:
- 使用手动按钮控制（更可靠）
- 确保在安静环境中使用
- 说话清晰，语速适中

### Q: 视频切换有黑屏？
**A**: 不应该有黑屏。如果出现：
- 检查浏览器控制台错误
- 确保视频已预加载
- 刷新页面重试
- 检查视频文件是否损坏

### Q: 如何添加新的视频动作？
**A**:
1. 准备视频文件并放入 `videos/` 目录
2. 编辑 `config/videosets.json` 添加视频配置
3. 添加命令关键词（包括同音字）
4. 刷新浏览器测试

### Q: 视频文件太大怎么办？
**A**:
```bash
# 压缩视频
ffmpeg -i input.mp4 -vf scale=1280:720 -c:v libx264 -crf 28 output.mp4
```

### Q: 动作视频播放后不返回idle？
**A**:
- 检查 `idleVideo` 配置是否正确
- 确保idle视频不在命令映射中（或映射到自己）
- 查看控制台日志确认视频结束逻辑

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
- [x] 多视频集配置系统
- [x] Idle/Anchor 视频系统
- [x] 硬件加速优化
- [x] 词汇限制和视觉反馈
- [x] **语音确认功能**
- [x] **外部配置系统**
- [x] **音频预加载和播放**
- [x] **音量控制UI**
- [x] **立即切换视频模式** 🆕
- [x] **特殊动作（返回上一视频）** 🆕
- [x] **响应式并排布局** 🆕
- [x] **语音识别自动恢复** 🆕
- [x] **视频音频播放支持** 🆕
- [x] 完整文档

### 可能的未来改进 (Possible Future Improvements)
- [ ] 更多视频动作
- [ ] 视频效果（滤镜、特效）
- [ ] 多语言支持（日语、韩语等）
- [ ] 离线语音识别
- [ ] 视频编辑器集成
- [ ] 云端视频库
- [ ] 用户配置保存
- [ ] 统计和分析
- [ ] PWA 支持
- [ ] 用户自定义音频上传
- [ ] 情感化语音反馈
- [ ] 音频可视化效果

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

## 更新日志 (Changelog)

### Version 2.1.0 (2026-02-06)
- ✅ **立即切换视频** - 收到命令后立即切换，可在设置中配置 🆕
- ✅ **特殊动作支持** - 支持播放后返回上一个视频的动作（如"唱歌"） 🆕
- ✅ **响应式并排布局** - 大屏幕上视频和控制面板并排显示 🆕
- ✅ **语音识别自动恢复** - 识别中断或返回空结果时自动重启 🆕
- ✅ **视频音频支持** - 用户点击"命令她"后自动取消视频静音 🆕
- ✅ **改进的按钮文案** - "命令她"/"不要她"更直观的交互体验 🆕
- ✅ **错误处理增强** - 更好的网络错误和麦克风错误恢复机制 🆕

### Version 2.0.0 (2026-01-29)
- ✅ **语音确认功能** - 命令识别时播放音频反馈
- ✅ **外部配置系统** - JSON配置文件，易于维护
- ✅ **音频预加载** - 无延迟音频播放
- ✅ **音量控制UI** - 音量滑块、静音按钮、开关
- ✅ **同音字智能匹配** - 支持"读起来"→"抖"等同音词识别
- ✅ **音频生成脚本** - 自动生成中文语音文件
- ✅ 多视频集配置系统
- ✅ Idle/Anchor 视频循环系统
- ✅ 动作视频单次播放
- ✅ 硬件加速优化（500ms过渡）
- ✅ 智能视频预加载
- ✅ 词汇限制到配置命令
- ✅ 视觉反馈（✓/✗）
- ✅ 默认中文识别
- ✅ 三个TikTok视频集

### 重要修复 (Important Fixes)
- 🔧 修复中文音频文件无声问题（Tingting语音）
- 🔧 添加同音字支持解决"抖起来"→"读起来"识别问题
- 🔧 优化配置加载和验证机制

### Version 1.0.0 (2026-01-26)
- ✅ 初始版本发布
- ✅ 基础语音识别功能
- ✅ 视频播放和切换
- ✅ 移动端支持
- ✅ 视频搜索工具
- ✅ 完整文档

---

**最后更新**: 2026-02-06
**版本**: 2.1.0
**状态**: ✅ 生产就绪 (Production Ready)
