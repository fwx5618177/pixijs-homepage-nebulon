# PixiJS Homepage Animation

A recreation of the classic PixiJS homepage animation effect, featuring a stunning cosmic scene with liquid blob mask transitions between sky clouds and space nebulae.

English | [日本語](README.ja.md) | [中文](./README.md)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![PixiJS](https://img.shields.io/badge/PixiJS-v8-ff69b4.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)

## 🌌 Overview

pixijs-homepage-animation faithfully recreates the iconic animation from the PixiJS homepage. It showcases:

- **Sky Layer**: A 3D parallax cloud flight effect through a bright sky
- **Space Layer**: A cosmic nebula scene with rotating star clouds
- **Liquid Mask Transition**: An organic blob-based mask that reveals the space layer through the sky layer
- **Interactive Mouse Tracking**: The liquid blob follows mouse movement for an engaging experience

## 🏗️ Architecture

### Project Structure

```
pixijs-homepage-animation/
├── src/
│   ├── core/
│   │   └── Ticker.ts          # Animation loop manager with deltaTime
│   ├── filters/
│   │   └── SuperFilter.ts     # Custom mask-based reveal filter (WebGL2)
│   ├── screens/
│   │   ├── MainScreen.ts      # Main scene compositor
│   │   ├── Clouds.ts          # Sky cloud layer with 3D projection
│   │   ├── Stars.ts           # Space nebula layer
│   │   ├── Cloud.ts           # Individual cloud sprite with 3D properties
│   │   └── MaskyMask.ts       # Liquid blob mask renderer
│   ├── utils/
│   │   ├── Mini3d.ts          # Pseudo-3D rendering system
│   │   ├── Math2.ts           # Math utility functions
│   │   └── DoubleSpring.ts    # 2D spring physics simulation
│   ├── PixiHomepageApp.ts     # Main application class
│   ├── main.ts                # Entry point
│   └── index.ts               # Module exports
├── public/
│   └── assets/img/            # Image assets (clouds, nebulae, blob)
├── samples/                   # Original nebulon.js demo
└── package.json
```

### Design Philosophy

#### Layer Composition
The visual effect is achieved through three main layers:

1. **Clouds (Bottom)**: A bright sky with parallax cloud sprites flying toward the camera
2. **Stars (Middle)**: A dark space scene with rotating nebula clouds, filtered through SuperFilter
3. **MaskyMask (Mask Source)**: 50 animated blobs rendered to a RenderTexture, used as a mask source

#### The SuperFilter Magic
The key to the liquid reveal effect lies in `SuperFilter.ts`:
- Samples from the MaskyMask's RenderTexture
- Calculates mask strength from red channel × alpha × 5.0
- Applies subtle distortion offset based on inverse strength
- Multiplies final color by strength for smooth fade transitions

#### Spring Physics
The `DoubleSpring` class provides smooth, organic motion for:
- Blob animations responding to position changes
- Mouse follower with natural easing
- Springy transitions between auto and manual modes

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd nebulon

# Install dependencies
pnpm install
```

### Development

```bash
# Start development server
pnpm dev
```

Open http://localhost:5173 in your browser.

### Build for Production

```bash
# Build optimized bundle
pnpm build

# Preview production build
pnpm preview
```

### Run Original Sample

```bash
# Run the original nebulon.js sample using live-server
pnpm sample
```

## 🎮 Interaction

- **Mouse Move**: The liquid blob follows your cursor
- **Click**: Toggles the mask open/close state
- **Auto Mode**: After 60 frames of inactivity, the blob enters a gentle automatic animation

## 🛠️ Technical Details

### PixiJS v8 Compatibility
This project has been updated for PixiJS v8 with:
- Modern `Filter` API with `GlProgram.from()`
- `TextureMatrix` for proper UV coordinate mapping
- `FilterSystem.calculateSpriteMatrix()` for matrix calculations
- GLSL 300 es shaders (WebGL2)

### Performance Considerations
- 50 blob sprites with spring physics
- 50 sky clouds + 30 space clouds with 3D projection
- RenderTexture for efficient mask composition
- Depth sorting for proper 3D layering

## 📄 License

MIT License - feel free to use this code for your own projects!

## 🙏 Credits

- Original PixiJS homepage animation by [PixiJS Team](https://pixijs.com)
- Recreation and TypeScript port for educational purposes
