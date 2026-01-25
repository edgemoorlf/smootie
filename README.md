# Smootie - 声控动作视频播放器

基于语音识别的视频切换应用。支持浏览器语音识别和阿里云 Dashscope API。

A web-based voice-controlled video player that switches videos based on voice commands. Supports both browser-based speech recognition and Dashscope API integration.

## 功能特性 (Features)

- 语音控制视频切换 (Voice-controlled video switching)
- 双模式识别：浏览器识别 + Dashscope API (Dual recognition modes)
- 支持中英文指令 (Supports Chinese and English commands)
- 手动按钮控制 (Manual button controls for mobile)
- 视频预加载，无缝切换 (Preloaded videos for smooth transitions)
- 队列系统：随时接受指令，视频结束时切换 (Queue system with latest command override)

## 语音指令 (Voice Commands)

### 基础指令 (Basic Commands)

| 指令 | 英文 | 相似音 | 动作 |
|------|------|--------|------|
| 跳 | jump | 条/调 | 切换到 jump.mov |
| 转 | circle | 赚/传/专 | 切换到 circle.mov |
| 停 | stop | 听/挺/庭 | 切换到 idle.mov |

### 识别逻辑 (Recognition Logic)

为了提高识别准确率，系统采用以下策略：

1. **相似音字符匹配**：由于中文同音字较多，系统会识别相似发音的字符
   - 例如："停" 可能被识别为 "听"、"挺"、"庭"，系统都会正确处理

2. **多候选结果检查**：检查语音识别返回的多个候选结果（最多5个）
   - 提高命中率，即使第一候选不匹配也能找到正确指令

3. **字符级匹配**：不仅匹配完整词语，还会检查单个字符
   - 即使识别结果包含其他词语，只要包含指令字符就能匹配

4. **移动端优化**：
   - 使用非连续模式（一次识别一个短语）
   - 增加识别延迟以适应移动设备性能
   - 提供手动按钮作为备选方案

## 安装配置 (Setup)

### 环境要求 (Prerequisites)

- Python 3.8+
- 现代浏览器（推荐 Chrome/Edge）
- 麦克风权限

### 安装步骤 (Installation)

1. 克隆仓库：
```bash
git clone <repository-url>
cd smootie
```

2. 安装 Python 依赖：
```bash
pip install -r requirements.txt
```

3. 配置 Dashscope API（可选）：
   - 复制 `.env.example` 到 `.env`
   - 在 `.env` 中添加你的 Dashscope API Key

### 运行应用 (Running)

1. 启动 Flask 服务器：
```bash
python app.py
```

2. 打开浏览器访问：
```
http://localhost:5001
```

3. 点击"开始监听"并授予麦克风权限

4. 说出指令或点击手动按钮控制视频

## 项目结构 (Project Structure)

```
smootie/
├── app.py                 # Flask 后端服务器
├── requirements.txt       # Python 依赖
├── .env                   # 环境变量（包含 API Key）
├── templates/
│   └── index.html        # 主页面
├── static/
│   ├── app.js            # 前端逻辑
│   └── style.css         # 样式
└── videos/
    ├── idle.mov          # 默认/停止视频
    ├── jump.mov          # 跳跃动作视频
    └── circle.mov        # 转圈动作视频
```

## 工作原理 (How It Works)

### 视频切换逻辑

1. **初始状态**：应用启动时播放 `idle.mov`
2. **视频预加载**：页面加载时预加载所有视频到内存
3. **语音识别**：持续监听语音输入
4. **指令队列**：
   - 识别到指令后，将目标视频加入队列
   - 新指令会覆盖之前的队列
   - 当前视频播放完毕后切换到队列中的视频
5. **无缝切换**：使用预加载的视频实现即时切换

### 识别流程

```
用户说话 → 语音识别 → 获取多个候选结果 → 逐个匹配指令
    ↓
匹配成功 → 加入队列 → 等待当前视频结束 → 切换视频
    ↓
匹配失败 → 继续监听
```

### 移动端支持

- **手动控制**：提供大按钮用于手动切换
- **优化识别**：使用非连续模式，更适合移动设备
- **触摸友好**：按钮大小和间距适配触摸操作

## 浏览器兼容性 (Browser Compatibility)

| 浏览器 | 语音识别 | 手动控制 | 推荐度 |
|--------|----------|----------|--------|
| Chrome (Desktop) | ✅ 完美支持 | ✅ | ⭐⭐⭐⭐⭐ |
| Edge (Desktop) | ✅ 完美支持 | ✅ | ⭐⭐⭐⭐⭐ |
| Chrome (Mobile) | ⚠️ 部分支持 | ✅ | ⭐⭐⭐⭐ |
| Safari | ❌ 不支持 | ✅ | ⭐⭐⭐ |
| Firefox | ❌ 不支持 | ✅ | ⭐⭐⭐ |

**注意**：移动端建议使用手动按钮控制，语音识别可能不稳定。

## 调试技巧 (Debugging)

1. 打开浏览器控制台（F12 或 Cmd+Option+I）
2. 查看识别日志：
   - `Recognition started` - 识别已启动
   - `Recognized (interim): ...` - 临时识别结果
   - `Recognized (final): ...` - 最终识别结果
   - `Alternative 0/1/2...` - 候选结果
   - `Command matched: ...` - 指令匹配成功

## 常见问题 (FAQ)

**Q: 为什么语音识别不工作？**
- 确保使用 Chrome 或 Edge 浏览器
- 检查麦克风权限是否授予
- 查看控制台是否有错误信息
- 尝试使用手动按钮控制

**Q: 为什么说"停"识别成"听"？**
- 这是正常的，系统已经处理了这种情况
- "听"、"挺"、"庭"都会被识别为"停"指令

**Q: 移动端识别不准确怎么办？**
- 使用手动按钮控制
- 或者切换到 Dashscope API 模式（需要配置 API Key）

**Q: 移动端点击"开始监听"后视频进入全屏模式？**
- 已添加防止全屏的代码
- 视频设置了 `playsinline` 属性防止自动全屏
- 如果仍然进入全屏，系统会自动退出
- 建议使用手动按钮控制，更稳定可靠

**Q: 移动端全屏模式下语音识别不工作？**
- 大多数移动浏览器在全屏模式下限制语音识别 API
- 系统会自动防止和退出全屏模式
- 如果遇到此问题，刷新页面或使用手动按钮

**Q: 视频切换有延迟？**
- 系统会等待当前视频播放完毕才切换
- 这是设计行为，确保视频完整播放

## 许可证 (License)

MIT License - See LICENSE file for details
