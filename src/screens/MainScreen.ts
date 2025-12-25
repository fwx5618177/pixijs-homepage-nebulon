import * as PIXI from "pixi.js";
import { Clouds } from "./Clouds";
import { Stars } from "./Stars";
import { MaskyMask } from "./MaskyMask";
import { SuperFilter } from "@/filters/SuperFilter";
import { Ticker } from "@/core/Ticker";

/**
 * MainScreen - 主场景，组合云层和星空层
 * 处理用户交互并协调所有视觉元素
 *
 * 这是对原始 nebulon.js 中 MainScreen 的忠实移植
 *
 * 原始结构：
 * - clouds 层（底层）
 * - stars 层（中层，应用 SuperFilter）
 * - maskyMask（添加但 renderable = false，只有它的纹理被 SuperFilter 使用）
 */
export class MainScreen extends PIXI.Container {
  /** 云层 */
  private clouds: Clouds;

  /** 星空层 */
  private stars: Stars;

  /** 液体遮罩效果 */
  private maskyMask: MaskyMask;

  /** 应用于星空层的滤镜 */
  private superFilter: SuperFilter | null = null;

  /** 自动模式下的位置 */
  private posy: PIXI.Point;

  /** 用户控制的位置 */
  private userposy: PIXI.Point;

  /** 内部计数器，用于自动动画 */
  private count: number = 0;

  /** 自动计数器，用于检测用户交互超时 */
  private autoCount: number = 100000;

  /** 自动模式和用户模式之间的插值比率 */
  private ratio: number = 0;

  constructor() {
    super();

    // 创建图层（原始顺序）
    // 原始代码：this.clouds = new o(), this.stars = new s()
    this.clouds = new Clouds();
    this.stars = new Stars();
    this.maskyMask = new MaskyMask();

    // 按原始顺序添加图层
    // 原始代码：this.addChild(this.clouds), this.addChild(this.stars), this.addChild(this.maskyMask)
    this.addChild(this.clouds);
    this.addChild(this.stars);
    this.addChild(this.maskyMask);

    // 重要：原始代码设置 maskyMask.renderable = false
    // MaskyMask 精灵不会直接显示 - 只有它的 RenderTexture
    // 被 SuperFilter 采样来在 stars 层上创建揭示效果
    // 原始代码：this.maskyMask.renderable = !1
    this.maskyMask.renderable = false;

    // 禁用子元素的交互
    // 原始代码：this.interactiveChildren = false
    this.interactiveChildren = false;

    // 设置交互区域
    // 原始代码：this.hitArea = new r.Rectangle(0, 0, 1900, 1200)
    this.hitArea = new PIXI.Rectangle(0, 0, 1900, 1200);

    // 启用交互
    // 原始代码：this.interactive = true
    this.eventMode = "static";

    // 绑定事件处理器
    // 原始代码：this.mousedown = this.touchstart = this.onDown.bind(this)
    // 原始代码：this.mousemove = this.touchmove = this.onMove.bind(this)
    this.on("pointerdown", this.onDown.bind(this));
    this.on("pointermove", this.onMove.bind(this));

    // 初始化位置跟踪器
    // 原始代码：this.posy = new r.Point(), this.userposy = new r.Point()
    this.posy = new PIXI.Point();
    this.userposy = new PIXI.Point();
  }

  /**
   * 初始化所有场景组件
   */
  public async init(renderer: PIXI.Renderer, assetUrl: string): Promise<void> {
    // 初始化所有图层
    await this.clouds.init(assetUrl);
    await this.stars.init(assetUrl);
    await this.maskyMask.init(renderer, assetUrl);

    // 创建 SuperFilter，使用 maskyMask 作为遮罩源
    // 原始代码：this.superFilter = new l(this.maskyMask)
    this.superFilter = new SuperFilter(this.maskyMask);

    // 将 SuperFilter 应用到 stars 层
    // 原始代码：this.stars.filters = n.instance.isMobile ? [this.superFilter] : [this.superFilter]
    // （原始代码中无论移动端还是桌面端都应用相同的滤镜）
    this.stars.filters = [this.superFilter];
  }

  /**
   * 处理指针按下事件
   * 原始代码：c.prototype.onDown
   */
  private onDown(): void {
    if (this.maskyMask.isOpen) {
      this.maskyMask.close();
    } else {
      this.maskyMask.open();
    }
  }

  /**
   * 处理指针移动事件
   * 原始代码：c.prototype.onMove
   */
  private onMove(event: PIXI.FederatedPointerEvent): void {
    const localPos = this.toLocal(event.global);

    // 原始代码：
    // var e = t.data.getLocalPosition(this);
    // this.autoMode = false (未在其他地方使用)
    // this.autoCount = 0
    // this.userposy.x = e.x - 950
    // this.userposy.y = e.y - 600
    this.autoCount = 0;
    this.userposy.x = localPos.x - 950;
    this.userposy.y = localPos.y - 600;
  }

  /**
   * 当场景变为可见时调用
   * 原始代码：c.prototype.onShow
   */
  public onShow(): void {
    // 原始代码：h.instance.add(this.update, this)
    Ticker.instance.add(this.update.bind(this));
  }

  /**
   * 显示动画完成后调用
   * 原始代码：c.prototype.onShown（空函数）
   */
  public onShown(): void {
    // 原始代码是空的
  }

  /**
   * 更新动画帧
   * 原始代码：c.prototype.update
   */
  public update(deltaTime: number): void {
    // 原始代码：this.autoCount++
    this.autoCount++;

    // 在自动模式和用户控制模式之间切换
    // 原始代码：
    // this.autoCount > 60
    //   ? (this.count += 0.01 * deltaTime,
    //      this.posy.x = 1900 * Math.sin(this.count) * 0.25,
    //      this.posy.y = 1200 * Math.cos(2 * this.count) * 0.05,
    //      this.ratio += 0.1 * (1 - this.ratio))
    //   : this.ratio += 0.1 * (0 - this.ratio)
    if (this.autoCount > 60) {
      // 自动模式 - 轻柔的摇摆动画
      this.count += 0.01 * deltaTime;
      this.posy.x = 1900 * Math.sin(this.count) * 0.25;
      this.posy.y = 1200 * Math.cos(2 * this.count) * 0.05;
      this.ratio += 0.1 * (1 - this.ratio);
    } else {
      // 用户模式 - 比率向 0 过渡
      this.ratio += 0.1 * (0 - this.ratio);
    }

    // 在用户位置和自动位置之间插值
    // 原始代码：
    // var t = this.userposy.x + (this.posy.x - this.userposy.x) * this.ratio,
    //     e = this.userposy.y + (this.posy.y - this.userposy.y) * this.ratio;
    const targetX =
      this.userposy.x + (this.posy.x - this.userposy.x) * this.ratio;
    const targetY =
      this.userposy.y + (this.posy.y - this.userposy.y) * this.ratio;

    // 更新遮罩目标
    // 原始代码：
    // this.maskyMask.target.x = t
    // this.maskyMask.target.y = e
    this.maskyMask.target.x = targetX;
    this.maskyMask.target.y = targetY;

    // 更新所有图层
    // 原始代码：
    // this.clouds.update(deltaTime)
    // this.stars.update(deltaTime)
    // this.maskyMask.update(deltaTime)
    this.clouds.update(deltaTime);
    this.stars.update(deltaTime);
    this.maskyMask.update(deltaTime);
  }

  /**
   * 处理窗口大小调整
   * 原始代码：c.prototype.resize
   */
  public resize(width: number, height: number): void {
    // 原始代码：
    // this.clouds.resize(t, e)
    // this.stars.resize(t, e)
    // this.maskyMask.resize(t, e)
    this.clouds.resize(width, height);
    this.stars.resize(width, height);
    this.maskyMask.resize(width, height);
  }

  /**
   * 销毁并清理资源
   */
  public destroy(): void {
    Ticker.instance.remove(this.update.bind(this));

    if (this.superFilter) {
      this.superFilter.destroy();
      this.superFilter = null;
    }

    this.clouds.destroy();
    this.stars.destroy();
    this.maskyMask.destroy();

    super.destroy({ children: true });
  }
}
