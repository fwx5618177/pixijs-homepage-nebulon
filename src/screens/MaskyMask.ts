import * as PIXI from "pixi.js";
import { Math2 } from "@/utils/Math2";
import { DoubleSpring } from "@/utils/DoubleSpring";

/**
 * Blob - 带弹簧物理的单个 blob 精灵
 * 扩展 PIXI.Sprite，添加动画所需的额外属性
 */
interface Blob extends PIXI.Sprite {
  target: PIXI.Point;
  spring: DoubleSpring;
  rotationSpeed: number;
  count: number;
}

/**
 * MaskyMask - 创建用于场景过渡的动态 blob 遮罩
 * 将动画 blob 渲染到 RenderTexture，供 SuperFilter 作为遮罩/滤镜输入使用
 *
 * 这是对原始 nebulon.js 中 MaskyMask 的忠实移植
 * blob 被渲染到 RenderTexture，然后由 SuperFilter 使用
 * 在 Stars 图层上创建液体揭示效果
 *
 * 原始代码的关键行为：
 * - 50 个 blob，随机分布在 target 周围
 * - blob 使用正弦缩放（可以为负值产生翻转效果）
 * - blob 被渲染到 1900x1200 的 RenderTexture，container 偏移 (950, 600) 到中心
 * - MaskyMask 精灵本身不会被渲染（MainScreen 中 renderable = false）
 * - 只有它的纹理（RenderTexture）被 SuperFilter 采样
 */
export class MaskyMask extends PIXI.Sprite {
  /** 容纳所有 blob 的容器 */
  private container: PIXI.Container;

  /** blob 精灵数组 */
  private blobs: Blob[] = [];

  /** 遮罩是否处于打开状态 */
  public isOpen: boolean = false;

  /** 内部计数器 */
  private count: number = 0;

  /** blob 跟随的目标位置（由 MainScreen 控制） */
  public target: PIXI.Point;

  /** 用于渲染的 RenderTexture */
  private renderTexture: PIXI.RenderTexture | null = null;

  /** 渲染器引用 */
  private renderer: PIXI.Renderer | null = null;

  constructor() {
    super();

    // 创建容纳所有 blob 的容器
    this.container = new PIXI.Container();

    // 设置容器位置到 1900x1200 纹理的中心
    // 原始代码：this.m = new r.Matrix(); this.m.translate(950, 600)
    // 这里直接设置容器位置来达到同样的偏移效果
    this.container.x = 950;
    this.container.y = 600;

    // blob 跟随的目标位置（由 MainScreen 控制）
    this.target = new PIXI.Point(0, 0);

    // 锚点设在中心，用于正确定位
    // 原始代码：this.anchor.set(0.5)
    this.anchor.set(0.5);
  }

  /**
   * 使用渲染器初始化并加载 blob 纹理
   * 原始代码：创建 RenderTexture(renderer, 1900, 1200) 和 50 个 blob
   */
  public async init(renderer: PIXI.Renderer, assetUrl: string): Promise<void> {
    this.renderer = renderer;

    // 创建与原始尺寸匹配的 RenderTexture
    // 原始代码：var t = new r.RenderTexture(window.renderer, 1900, 1200)
    this.renderTexture = PIXI.RenderTexture.create({
      width: 1900,
      height: 1200,
    });

    // 将此精灵的纹理设置为 RenderTexture
    // 原始代码：r.Sprite.call(this, t)
    this.texture = this.renderTexture;

    // 加载 blob 纹理
    // 原始代码：blob = new r.Sprite.fromImage(ASSET_URL + "img/blob.png")
    const blobTexture = await PIXI.Assets.load(assetUrl + "img/blob.png");

    // 创建 50 个 blob
    // 原始代码：for (var e = 0; 50 > e; e++)
    for (let i = 0; i < 50; i++) {
      const blob = new PIXI.Sprite(blobTexture) as Blob;

      // 初始化 blob 属性，匹配原始代码
      // 原始代码：blob.target = new r.Point(n.random(-950, 950), n.random(-600, 600))
      blob.target = new PIXI.Point(
        Math2.random(-950, 950),
        Math2.random(-600, 600),
      );

      // 原始代码：blob.spring = new o()
      blob.spring = new DoubleSpring();

      // 原始代码：blob.rotationSpeed = n.random(-0.1, 0.1)
      blob.rotationSpeed = Math2.random(-0.1, 0.1);

      // 原始代码：blob.anchor.set(0.5)
      blob.anchor.set(0.5);

      // 原始代码：blob.count = Math.random() * Math.PI * 2
      blob.count = Math.random() * Math.PI * 2;

      // 注意：原始代码没有显式设置初始 x/y 位置
      // 它们从容器的 (0, 0) 开始，通过 spring/target 定位

      this.blobs.push(blob);
      this.container.addChild(blob);
    }
  }

  /**
   * 更新动画帧
   * 原始代码：s.prototype.update 函数
   */
  public update(deltaTime: number): void {
    if (!this.renderer || !this.renderTexture) return;

    // 原始代码：this.count += 0.01
    this.count += 0.01;

    for (let i = 0; i < this.blobs.length; i++) {
      const blob = this.blobs[i];

      // 原始代码：e.count += 0.1 * deltaTime
      blob.count += 0.1 * deltaTime;

      // 正弦缩放 - 可以为负值，这会翻转 blob
      // 原始代码：var i = Math.sin(0.5 * e.count); e.scale.set(i)
      const scale = Math.sin(0.5 * blob.count);

      // 更新弹簧物理
      // 原始代码：e.spring.update()
      blob.spring.update();

      // 应用缩放（原始代码允许负数缩放产生翻转效果）
      // 原始代码：e.scale.set(i)
      blob.scale.set(scale);

      // 旋转 blob
      // 原始代码：e.rotation += 0.1 * e.rotationSpeed
      blob.rotation += 0.1 * blob.rotationSpeed;

      // 半透明
      // 原始代码：e.alpha = 0.9
      blob.alpha = 0.9;

      // 当 blob 完成一个完整周期时重置
      // 原始代码：if (e.count > 2 * Math.PI)
      if (blob.count > Math.PI * 2) {
        blob.count -= Math.PI * 2;

        // 在 target 周围的随机位置生成 blob
        // 原始代码：
        // var r = Math.random() * Math.PI * 2, o = n.random(100, 200);
        // e.x = this.target.x + Math.sin(r) * o
        // e.y = this.target.y + Math.cos(r) * o
        const angle = Math.random() * Math.PI * 2;
        const radius = Math2.random(100, 200);

        blob.x = this.target.x + Math.sin(angle) * radius;
        blob.y = this.target.y + Math.cos(angle) * radius;

        // 原始代码：e.rotation = Math.random() * Math.PI * 2
        blob.rotation = Math.random() * Math.PI * 2;
      }
    }

    // 将容器渲染到纹理
    // 原始代码：this.texture.render(this.container, this.m, !0, !0)
    // 原始的 matrix 偏移现在通过 container.x/y 实现
    this.renderer.render({
      container: this.container,
      target: this.renderTexture,
      clear: true,
    });
  }

  /**
   * 打开遮罩（展开 blob）
   * 原始代码：s.prototype.open - 只设置 isOpen 标志
   * 原始代码实际上没有对 blob 做任何移动操作
   */
  public open(): void {
    this.isOpen = true;
    // 原始代码遍历 blob 但没有做任何事：
    // for (var t = 0; t < this.blobs.length; t++) { this.blobs[t]; }
  }

  /**
   * 关闭遮罩（收缩 blob）
   * 原始代码：s.prototype.close - 只设置 isOpen 标志
   */
  public close(): void {
    this.isOpen = false;
    // 原始代码遍历 blob 但没有做任何事：
    // for (var t = 0; t < this.blobs.length; t++) { this.blobs[t]; }
  }

  /**
   * 处理窗口大小调整
   * 原始代码：this.x = t / 2, this.y = e / 2
   */
  public resize(width: number, height: number): void {
    this.x = width / 2;
    this.y = height / 2;
  }

  /**
   * 销毁并清理资源
   */
  public destroy(): void {
    if (this.renderTexture) {
      this.renderTexture.destroy(true);
      this.renderTexture = null;
    }
    this.blobs = [];
    this.container.destroy({ children: true });
    super.destroy({ children: true });
  }
}
