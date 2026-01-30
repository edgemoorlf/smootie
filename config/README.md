# Configuration Files Documentation

## 概述 (Overview)

本目录包含 Smootie 应用的所有配置文件。配置文件使用 JSON 格式，便于维护和扩展。

This directory contains all configuration files for the Smootie application. Configuration files use JSON format for easy maintenance and extension.

## 文件说明 (Files)

### videosets.json

主配置文件，包含所有视频集的配置信息。

Main configuration file containing all video set configurations.

**位置**: `config/videosets.json`

## 配置文件结构 (Configuration Structure)

### 顶层结构 (Top Level)

```json
{
  "version": "2.0.0",           // 配置文件版本
  "defaultSet": "tiktok/set3",  // 默认视频集
  "sets": {                     // 视频集配置对象
    "set-id": { /* ... */ }
  }
}
```

### 视频集配置 (Video Set Configuration)

每个视频集包含以下字段：

```json
{
  "id": "tiktok/set3",                    // 唯一标识符
  "name": "TikTok Set 3",                 // 显示名称
  "description": "Description here",       // 描述
  "videos": [ /* 视频列表 */ ],
  "defaultVideo": "7.mp4",                // 默认视频
  "idleVideo": "7.mp4",                   // Idle/Anchor 视频
  "commands": { /* 命令配置 */ },
  "buttons": [ /* 按钮配置 */ ],
  "audioAck": { /* 语音确认配置 */ }
}
```

### 视频对象 (Video Object)

```json
{
  "id": "7.mp4",                          // 视频文件名
  "path": "/videos/tiktok/set3/7.mp4",   // 完整路径
  "name": "停 (Stop)",                    // 显示名称
  "description": "Idle/anchor video",     // 描述
  "duration": 5.2,                        // 时长（秒）
  "isIdle": true,                         // 是否为 idle 视频
  "tags": ["idle", "anchor", "loop"]      // 标签
}
```

**字段说明**:
- `id`: 视频文件名，用于内部引用
- `path`: 视频文件的完整路径
- `name`: 用户友好的显示名称
- `description`: 视频描述
- `duration`: 视频时长（秒），用于预加载和进度显示
- `isIdle`: 是否为 idle/anchor 视频（循环播放）
- `tags`: 标签数组，用于分类和搜索

### 命令配置 (Command Configuration)

```json
{
  "stop": {
    "video": "7.mp4",                     // 关联的视频
    "keywords": ["stop", "停", "听"],     // 关键词列表
    "description": "Stop action",         // 描述
    "primaryKeyword": "停"                // 主关键词
  }
}
```

**字段说明**:
- `video`: 触发此命令时播放的视频
- `keywords`: 识别关键词数组（包括相似音）
- `description`: 命令描述
- `primaryKeyword`: 主关键词，用于显示和音频确认

### 按钮配置 (Button Configuration)

```json
{
  "label": "停",                          // 按钮文本
  "video": "7.mp4",                       // 关联的视频
  "class": "stop-btn",                    // CSS 类名
  "tooltip": "Stop / Idle"                // 提示文本
}
```

### 语音确认配置 (Audio Acknowledgement Configuration)

```json
{
  "enabled": true,                        // 是否启用
  "volume": 0.7,                          // 音量 (0.0-1.0)
  "generic": [                            // 通用确认音
    "/audio/common/acknowledged_zh.mp3",
    "/audio/common/received_zh.mp3"
  ],
  "specific": {                           // 命令特定音频
    "停": "/audio/tiktok/set3/stop_zh.mp3",
    "抖": "/audio/tiktok/set3/shake_zh.mp3"
  },
  "error": "/audio/common/error_zh.mp3"   // 错误提示音
}
```

## 添加新视频集 (Adding New Video Set)

### 步骤 (Steps)

1. **准备视频文件**
   - 将视频文件放入 `videos/` 目录
   - 建议创建新的子目录（如 `videos/my-set/`）

2. **编辑配置文件**
   - 打开 `config/videosets.json`
   - 在 `sets` 对象中添加新的视频集配置

3. **配置示例**

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
      ],
      "audioAck": {
        "enabled": true,
        "volume": 0.7,
        "generic": [
          "/audio/common/acknowledged_zh.mp3"
        ],
        "specific": {},
        "error": "/audio/common/error_zh.mp3"
      }
    }
  }
}
```

4. **测试**
   - 刷新浏览器
   - 在视频集选择器中选择新视频集
   - 测试所有功能

## 配置验证 (Configuration Validation)

### 必需字段 (Required Fields)

**视频集级别**:
- `id` (string)
- `name` (string)
- `videos` (array)
- `defaultVideo` (string)
- `idleVideo` (string)
- `commands` (object)
- `buttons` (array)

**视频对象**:
- `id` (string)
- `path` (string)
- `name` (string)
- `isIdle` (boolean)

**命令对象**:
- `video` (string)
- `keywords` (array)

**按钮对象**:
- `label` (string)
- `video` (string)
- `class` (string)

### 验证规则 (Validation Rules)

1. **视频引用一致性**
   - `defaultVideo` 必须存在于 `videos` 数组中
   - `idleVideo` 必须存在于 `videos` 数组中
   - 命令的 `video` 必须存在于 `videos` 数组中
   - 按钮的 `video` 必须存在于 `videos` 数组中

2. **Idle 视频**
   - 至少有一个视频的 `isIdle` 为 `true`
   - `idleVideo` 必须指向 `isIdle: true` 的视频

3. **关键词唯一性**
   - 同一视频集内，关键词不应重复
   - 不同命令的关键词可以重叠（用于相似音）

4. **文件路径**
   - 所有路径必须以 `/` 开头
   - 视频路径应指向实际存在的文件
   - 音频路径应指向实际存在的文件

## 配置最佳实践 (Best Practices)

### 1. 命名规范 (Naming Conventions)

- **视频集 ID**: 使用小写字母和连字符，如 `tiktok/set1`
- **视频 ID**: 使用原始文件名，如 `7.mp4`
- **命令 ID**: 使用小写英文，如 `stop`, `shake`
- **关键词**: 包含主关键词和相似音

### 2. 元数据完整性 (Metadata Completeness)

- 为所有视频添加描述性的 `name` 和 `description`
- 使用有意义的 `tags` 便于分类
- 准确填写 `duration`（可使用 ffprobe 获取）

### 3. 音频配置 (Audio Configuration)

- 至少配置 2-3 个通用确认音
- 为常用命令配置特定音频
- 确保音频文件存在

### 4. 向后兼容 (Backward Compatibility)

- 不要删除现有字段
- 添加新字段时提供默认值
- 保持配置文件版本号更新

## 故障排除 (Troubleshooting)

### 配置加载失败

**症状**: 应用无法启动或显示错误

**检查**:
1. JSON 格式是否正确（使用 JSON 验证器）
2. 所有必需字段是否存在
3. 文件路径是否正确
4. 浏览器控制台是否有错误信息

### 视频无法播放

**症状**: 选择视频集后视频不播放

**检查**:
1. 视频文件是否存在于指定路径
2. `defaultVideo` 和 `idleVideo` 是否正确
3. 视频文件格式是否支持（推荐 MP4）

### 命令无法识别

**症状**: 语音命令不触发视频切换

**检查**:
1. `keywords` 数组是否包含正确的关键词
2. 关键词是否包含相似音
3. 命令的 `video` 是否存在

### 按钮不显示

**症状**: 手动控制按钮不显示或显示错误

**检查**:
1. `buttons` 数组是否正确配置
2. 按钮的 `video` 是否存在
3. CSS `class` 是否正确

## 配置文件版本历史 (Version History)

### Version 2.0.0 (2026-01-29)
- 初始版本
- 配置外部化
- 添加扩展元数据支持
- 添加语音确认配置

## 工具和脚本 (Tools & Scripts)

### 验证配置文件

```bash
# 使用 jq 验证 JSON 格式
jq empty config/videosets.json

# 美化 JSON 格式
jq . config/videosets.json > config/videosets.formatted.json
```

### 获取视频时长

```bash
# 使用 ffprobe 获取视频时长
ffprobe -v error -show_entries format=duration \
  -of default=noprint_wrappers=1:nokey=1 \
  videos/tiktok/set3/7.mp4
```

### 批量更新配置

```python
# Python 脚本示例
import json

with open('config/videosets.json', 'r') as f:
    config = json.load(f)

# 修改配置
config['defaultSet'] = 'my-set'

with open('config/videosets.json', 'w') as f:
    json.dump(config, f, indent=2, ensure_ascii=False)
```

## 参考资料 (References)

- [JSON Schema](https://json-schema.org/)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [Smootie README](../README.md)
- [Voice Acknowledgement Plan](../VOICE_ACK.md)

---

**创建日期**: 2026-01-29
**最后更新**: 2026-01-29
**维护者**: Smootie Team
