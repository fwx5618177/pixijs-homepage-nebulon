# Nebulon

一个复刻 PixiJS 官网首页动画效果的项目。使用 TypeScript + PixiJS v8 + Vite 构建。

[English](./README.md) | 中文

## 🌌 项目预览

Nebulon 复刻了 PixiJS 官方网站的标志性首页动画 —— 一个结合了天空云层场景和太空星云场景的视觉效果，通过液体 blob 遮罩实现两个场景之间的平滑过渡。

## ✨ 功能特性

- **双层场景**: 天空云层 (Clouds) 和太空星云 (Stars) 两个独立的 3D 视差场景
- **液体遮罩效果**: 使用动态 blob 精灵创建流体般的场景过渡效果
- **伪 3D 渲染**: 使用透视投影模拟 3D 空间中的云朵飞行
- **弹簧物理**: 使用双轴弹簧物理模拟实现平滑的跟随动画
- **交互式控制**: 鼠标/触摸移动控制遮罩位置，点击切换开启/关闭状态

## 📁 项目结构

```
nebulon/
├── src/
│   ├── core/
│   │   └── Ticker.ts          # 动画循环管理器
│   ├── filters/
│   │   └── SuperFilter.ts     # 基于遮罩的揭示效果滤镜
│   ├── screens/
│   │   ├── Cloud.ts           # 带有 3D 定位能力的精灵
│   │   ├── Clouds.ts          # 天空云层场景
│   │   ├── Stars.ts           # 太空星云场景
│   │   ├── MaskyMask.ts       # 液体 blob 遮罩
│   │   └── MainScreen.ts      # 主场景组合器
│   ├── utils/
│   │   ├── DoubleSpring.ts    # 2D 弹簧物理模拟
│   │   ├── Math2.ts           # 数学工具函数
│   │   └── Mini3d.ts          # 伪 3D 渲染系统
│   ├── index.ts               # 导出入口
│   ├── main.ts                # 应用入口
│   └── NebulonApp.ts          # 主应用程序类
├── public/
│   └── assets/img/            # 图片资源
├── samples/                   # 原始 JS 示例
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🏗️ 架构设计

### 核心模块

#### 1. Ticker (动画循环)
管理 `requestAnimationFrame` 循环和 `deltaTime` 计算，确保动画在不同帧率下保持一致。

#### 2. Mini3d (伪 3D 系统)
使用透视投影公式 `scale = focalLength / (focalLength + z)` 将 3D 坐标投影到 2D，支持相机旋转和移动。

#### 3. MaskyMask (液体遮罩)
- 创建 50 个 blob 精灵，使用弹簧物理跟随目标位置
- 渲染到 1900×1200 的 RenderTexture
- blob 使用正弦缩放（可为负值产生翻转效果）

#### 4. SuperFilter (揭示滤镜)
- 从遮罩纹理采样，计算强度 `strength = r * a * 5.0`
- 根据强度应用轻微位移偏移
- 控制底层内容的可见性

### 渲染层次

```
MainScreen
├── Clouds (底层 - 天空场景)
├── Stars (中层 - 太空场景，应用 SuperFilter)
└── MaskyMask (renderable=false, 仅提供纹理)
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- pnpm (推荐) 或 npm

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

访问 http://localhost:5173 查看效果。

### 构建生产版本

```bash
pnpm build
```

构建产物在 `dist/` 目录下。

### 预览构建结果

```bash
pnpm preview
```

### 运行原始示例

```bash
pnpm sample
```

在浏览器中打开 `samples/index.html` 查看原始 JavaScript 版本的效果。

## 🎮 交互说明

- **鼠标/触摸移动**: 控制液体遮罩的中心位置
- **点击/触摸**: 切换遮罩的开启/关闭状态
- **自动模式**: 60 帧无操作后自动进入轻柔摇摆动画

## 🔧 技术栈

- **PixiJS v8**: WebGL/WebGPU 2D 渲染引擎
- **TypeScript**: 类型安全的开发体验
- **Vite**: 快速的开发构建工具

## 📝 从原始代码移植

本项目是从 PixiJS 官网的 `nebulon.js` 忠实移植而来。主要改动包括：

1. **API 升级**: 从旧版 PIXI API 迁移到 v8 的新 API
2. **TypeScript 重写**: 添加完整的类型定义
3. **滤镜系统重写**: 使用 v8 的 `TextureMatrix` 和 `calculateSpriteMatrix`
4. **着色器升级**: 从 GLSL ES 1.0 升级到 GLSL ES 3.0

## 📄 许可证

MIT License

## 🙏 致谢

- [PixiJS](https://pixijs.com/) - 原始动画效果来源
- 原始代码由 PixiJS 团队创建