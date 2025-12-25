import * as PIXI from "pixi.js";
import { MainScreen } from "./screens/MainScreen";
import { Ticker } from "./core/Ticker";

/**
 * NebulonApp - 主应用程序类
 * 初始化 PixiJS 应用并管理主场景
 *
 * 原始代码来自 nebulon.js 中的 APP_root
 */
export class NebulonApp {
  /** PixiJS 应用实例 */
  public app: PIXI.Application;

  /** 主场景实例 */
  public mainScreen: MainScreen | null = null;

  /** 当前宽度 */
  private width: number = 800;

  /** 当前高度 */
  private height: number = 600;

  /** 安全区域尺寸（内容始终可见的区域） */
  private safeSize = { width: 1900, height: 1200 };

  /** 最大渲染尺寸 */
  private maxSize = { width: 1900, height: 1200 };

  /** 资源 URL 基础路径 */
  public assetUrl: string = "./assets/";

  constructor() {
    this.app = new PIXI.Application();
  }

  /**
   * 获取 canvas 元素
   */
  public get view(): HTMLCanvasElement {
    return this.app.canvas as HTMLCanvasElement;
  }

  /**
   * 获取舞台
   */
  public get stage(): PIXI.Container {
    return this.app.stage;
  }

  /**
   * 获取渲染器
   */
  public get renderer(): PIXI.Renderer {
    return this.app.renderer as PIXI.Renderer;
  }

  /**
   * 初始化并启动应用程序
   */
  public async init(): Promise<void> {
    // 初始化 PIXI Application
    await this.app.init({
      width: this.width,
      height: this.height,
      backgroundColor: 0x000000,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // 创建主场景
    this.mainScreen = new MainScreen();
    this.stage.addChild(this.mainScreen);

    // 使用渲染器和资源路径初始化主场景
    await this.mainScreen.init(this.renderer, this.assetUrl);

    // 启动动画
    this.mainScreen.onShow();

    // 启动 Ticker
    Ticker.instance.add(this.render.bind(this));
    Ticker.instance.start();
  }

  /**
   * 渲染循环
   */
  private render(): void {
    this.app.render();
  }

  /**
   * 处理窗口大小调整
   * @param windowWidth - 窗口宽度
   * @param windowHeight - 窗口高度
   */
  public resize(windowWidth: number, windowHeight: number): void {
    this.width = windowWidth;
    this.height = windowHeight;

    // 计算缩放比例以适应安全区域
    const scaleX = windowWidth / this.safeSize.width;
    const scaleY = windowHeight / this.safeSize.height;
    const scale = Math.max(scaleX, scaleY);

    // 计算实际渲染尺寸（限制在最大尺寸内）
    const renderWidth = Math.min(this.maxSize.width * scale, windowWidth);
    const renderHeight = Math.min(this.maxSize.height * scale, windowHeight);

    // 获取设备像素比
    const pixelRatio = window.devicePixelRatio || 1;

    // 调整渲染器尺寸
    this.renderer.resize(renderWidth * pixelRatio, renderHeight * pixelRatio);

    // 更新 canvas CSS 尺寸
    this.view.style.width = renderWidth + "px";
    this.view.style.height = renderHeight + "px";

    // 居中 canvas
    this.view.style.left = windowWidth / 2 - renderWidth / 2 + "px";
    this.view.style.top = windowHeight / 2 - renderHeight / 2 + "px";

    // 调整主场景尺寸
    if (this.mainScreen) {
      this.mainScreen.resize(renderWidth / scale, renderHeight / scale);
      this.mainScreen.scale.set(scale * pixelRatio);
    }
  }

  /**
   * 销毁应用程序
   */
  public destroy(): void {
    Ticker.instance.stop();

    if (this.mainScreen) {
      this.mainScreen.destroy();
    }

    this.app.destroy(true);
  }
}
