# Audio Files for Voice Acknowledgement

## 目录结构 (Directory Structure)

```
audio/
├── common/                    # 通用确认音
│   ├── acknowledged_zh.mp3    # "好的"
│   ├── received_zh.mp3        # "收到"
│   ├── understood_zh.mp3      # "明白"
│   ├── ok_zh.mp3              # "嗯"
│   ├── acknowledged_en.mp3    # "OK"
│   ├── received_en.mp3        # "Got it"
│   └── error_zh.mp3           # "没听清"
│
├── tiktok/
│   ├── set1/
│   │   ├── jump_zh.mp3        # "跳" 确认音
│   │   ├── circle_zh.mp3      # "转" 确认音
│   │   └── stop_zh.mp3        # "停" 确认音
│   │
│   ├── set2/
│   │   ├── jump_zh.mp3        # "跳" 确认音
│   │   ├── circle_zh.mp3      # "转" 确认音
│   │   └── stop_zh.mp3        # "停" 确认音
│   │
│   └── set3/
│       ├── stop_zh.mp3        # "停" 确认音
│       ├── shake_zh.mp3       # "抖" 确认音
│       └── twist_zh.mp3       # "扭" 确认音
│
└── README.md                  # 本文档
```

## 音频文件规格 (Audio File Specifications)

### 技术要求 (Technical Requirements)

| 参数 | 要求 | 说明 |
|------|------|------|
| 格式 | MP3 | 推荐使用 MP3 格式，兼容性好 |
| 采样率 | 44.1kHz 或 48kHz | 标准音频采样率 |
| 比特率 | 128kbps | 平衡质量和文件大小 |
| 声道 | 单声道 (Mono) | 减小文件大小 |
| 时长 | 0.5-2秒 | 简短确认音，不干扰体验 |
| 文件大小 | <50KB | 快速加载 |

### 音量要求 (Volume Requirements)

- **峰值音量**: -3dB 到 -6dB
- **平均音量**: -12dB 到 -18dB
- **动态范围**: 适中，避免过大或过小
- **标准化**: 使用 loudnorm 滤镜标准化

## 录制指南 (Recording Guidelines)

### 通用确认音 (Generic Acknowledgements)

#### 中文确认音
- **"好的"** (`acknowledged_zh.mp3`)
  - 语气：友好、肯定
  - 时长：0.5-0.8秒
  - 用途：通用确认

- **"收到"** (`received_zh.mp3`)
  - 语气：专业、确认
  - 时长：0.5-0.8秒
  - 用途：通用确认

- **"明白"** (`understood_zh.mp3`)
  - 语气：理解、确认
  - 时长：0.5-0.8秒
  - 用途：通用确认

- **"嗯"** (`ok_zh.mp3`)
  - 语气：简短、自然
  - 时长：0.3-0.5秒
  - 用途：快速确认

#### 英文确认音
- **"OK"** (`acknowledged_en.mp3`)
  - 语气：友好、肯定
  - 时长：0.3-0.5秒

- **"Got it"** (`received_en.mp3`)
  - 语气：理解、确认
  - 时长：0.5-0.7秒

#### 错误提示音
- **"没听清"** (`error_zh.mp3`)
  - 语气：礼貌、询问
  - 时长：0.8-1.2秒
  - 用途：识别失败时

### 命令特定音频 (Command-Specific Audio)

#### tiktok/set1
- **"跳"** (`jump_zh.mp3`) - 简短确认
- **"转"** (`circle_zh.mp3`) - 简短确认
- **"停"** (`stop_zh.mp3`) - 简短确认

#### tiktok/set2
- **"跳"** (`jump_zh.mp3`) - 简短确认
- **"转"** (`circle_zh.mp3`) - 简短确认
- **"停"** (`stop_zh.mp3`) - 简短确认

#### tiktok/set3
- **"停"** (`stop_zh.mp3`) - 简短确认
- **"抖"** (`shake_zh.mp3`) - 简短确认
- **"扭"** (`twist_zh.mp3`) - 简短确认

### 录制技巧 (Recording Tips)

1. **环境**
   - 安静的房间
   - 减少回声（使用吸音材料）
   - 避免背景噪音

2. **设备**
   - 使用质量好的麦克风
   - 保持适当距离（15-30cm）
   - 使用防喷罩

3. **语气**
   - 自然、友好
   - 不要过于生硬
   - 保持一致的音量和语速

4. **后期处理**
   - 裁剪静音部分
   - 标准化音量
   - 去除噪音
   - 淡入淡出效果

## 音频处理命令 (Audio Processing Commands)

### 基础转换 (Basic Conversion)

```bash
# WAV 转 MP3
ffmpeg -i input.wav -codec:a libmp3lame -b:a 128k output.mp3

# 转换为单声道
ffmpeg -i input.mp3 -ac 1 output.mp3

# 设置采样率
ffmpeg -i input.mp3 -ar 44100 output.mp3
```

### 音量处理 (Volume Processing)

```bash
# 标准化音量（推荐）
ffmpeg -i input.mp3 -filter:a loudnorm output.mp3

# 调整音量（增加）
ffmpeg -i input.mp3 -filter:a "volume=1.5" output.mp3

# 调整音量（减少）
ffmpeg -i input.mp3 -filter:a "volume=0.7" output.mp3
```

### 裁剪和编辑 (Trimming & Editing)

```bash
# 裁剪静音部分
ffmpeg -i input.mp3 -af silenceremove=1:0:-50dB output.mp3

# 裁剪到指定时长
ffmpeg -i input.mp3 -ss 0 -t 1.5 -c copy output.mp3

# 添加淡入淡出
ffmpeg -i input.mp3 -af "afade=t=in:st=0:d=0.1,afade=t=out:st=0.9:d=0.1" output.mp3
```

### 批量处理 (Batch Processing)

```bash
# 批量转换 WAV 到 MP3
for file in *.wav; do
    ffmpeg -i "$file" -codec:a libmp3lame -b:a 128k "${file%.wav}.mp3"
done

# 批量标准化音量
for file in *.mp3; do
    ffmpeg -i "$file" -filter:a loudnorm "normalized_${file}"
done
```

### 完整处理流程 (Complete Processing Pipeline)

```bash
# 一次性处理：转换格式 + 单声道 + 标准化音量 + 裁剪静音
ffmpeg -i input.wav \
    -ac 1 \
    -ar 44100 \
    -codec:a libmp3lame \
    -b:a 128k \
    -af "silenceremove=1:0:-50dB,loudnorm" \
    output.mp3
```

## 音频质量检查 (Quality Check)

### 检查音频信息

```bash
# 查看音频详细信息
ffmpeg -i audio.mp3

# 查看音频时长
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 audio.mp3

# 查看音频比特率
ffprobe -v error -select_streams a:0 -show_entries stream=bit_rate -of default=noprint_wrappers=1:nokey=1 audio.mp3
```

### 质量标准 (Quality Standards)

✅ **合格标准**:
- 文件大小 < 50KB
- 时长 0.5-2秒
- 无明显噪音
- 音量适中
- 清晰可辨

❌ **不合格**:
- 文件过大 (>100KB)
- 时长过长 (>3秒)
- 有明显噪音或失真
- 音量过大或过小
- 不清晰

## 使用示例 (Usage Examples)

### 在代码中配置 (Configuration in Code)

```javascript
audioAck: {
    enabled: true,
    volume: 0.7,

    // 通用确认音（随机选择）
    generic: [
        '/audio/common/acknowledged_zh.mp3',
        '/audio/common/received_zh.mp3',
        '/audio/common/ok_zh.mp3'
    ],

    // 命令特定音频
    specific: {
        '停': '/audio/tiktok/set3/stop_zh.mp3',
        '抖': '/audio/tiktok/set3/shake_zh.mp3',
        '扭': '/audio/tiktok/set3/twist_zh.mp3'
    },

    // 错误提示音
    error: '/audio/common/error_zh.mp3'
}
```

## 音频来源 (Audio Sources)

### 录制方式 (Recording Methods)

1. **自己录制**
   - 使用手机或电脑麦克风
   - 使用专业录音设备
   - 使用录音软件（Audacity, GarageBand等）

2. **在线TTS服务**
   - Google Text-to-Speech
   - Microsoft Azure TTS
   - Amazon Polly
   - 注意：检查使用许可

3. **音频素材网站**
   - Freesound.org
   - Zapsplat.com
   - 注意：检查许可证

### 许可证要求 (License Requirements)

- ✅ 自己录制的音频：完全拥有版权
- ✅ 公共领域音频：可自由使用
- ✅ CC0 许可：可自由使用
- ⚠️ CC-BY 许可：需要署名
- ❌ 版权保护音频：需要授权

## 测试音频 (Testing Audio)

### 浏览器测试

```javascript
// 测试音频播放
const audio = new Audio('/audio/common/acknowledged_zh.mp3');
audio.play();

// 测试音频加载
audio.addEventListener('canplaythrough', () => {
    console.log('Audio loaded successfully');
});

audio.addEventListener('error', (e) => {
    console.error('Error loading audio:', e);
});
```

### 命令行测试

```bash
# 播放音频（macOS）
afplay audio/common/acknowledged_zh.mp3

# 播放音频（Linux）
aplay audio/common/acknowledged_zh.mp3

# 播放音频（Windows）
start audio/common/acknowledged_zh.mp3
```

## 故障排除 (Troubleshooting)

### 问题：音频无法播放

**可能原因**:
- 文件路径错误
- 文件格式不支持
- 浏览器自动播放限制

**解决方案**:
- 检查文件路径
- 转换为 MP3 格式
- 在用户交互后播放

### 问题：音频音量太小/太大

**解决方案**:
```bash
# 标准化音量
ffmpeg -i input.mp3 -filter:a loudnorm output.mp3

# 手动调整
ffmpeg -i input.mp3 -filter:a "volume=1.5" output.mp3
```

### 问题：音频有噪音

**解决方案**:
```bash
# 降噪处理
ffmpeg -i input.mp3 -af "highpass=f=200,lowpass=f=3000" output.mp3
```

### 问题：文件太大

**解决方案**:
```bash
# 降低比特率
ffmpeg -i input.mp3 -b:a 96k output.mp3

# 转换为单声道
ffmpeg -i input.mp3 -ac 1 output.mp3
```

## 贡献指南 (Contributing Guidelines)

### 添加新音频

1. 录制或获取音频文件
2. 按照规格处理音频
3. 放置到正确的目录
4. 更新配置文件
5. 测试音频播放
6. 提交 Pull Request

### 命名规范 (Naming Convention)

- 使用小写字母
- 使用下划线分隔
- 包含语言后缀（`_zh`, `_en`）
- 描述性命名

**示例**:
- ✅ `acknowledged_zh.mp3`
- ✅ `stop_zh.mp3`
- ✅ `error_en.mp3`
- ❌ `audio1.mp3`
- ❌ `sound.mp3`

## 更新日志 (Changelog)

### 2026-01-29
- 📋 创建音频目录结构
- 📋 编写音频规格文档
- 📋 添加录制和处理指南

---

**创建日期**: 2026-01-29
**最后更新**: 2026-01-29
**维护者**: Smootie Team
