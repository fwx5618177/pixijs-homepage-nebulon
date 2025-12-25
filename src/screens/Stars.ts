import * as PIXI from "pixi.js";
import { Mini3d, Sprite3D } from "@/utils/Mini3d";
import { Math2 } from "@/utils/Math2";
import { Cloud } from "./Cloud";

/**
 * Stars - 带有星云效果的太空图层
 * 创建一个具有旋转星云云朵和背景的宇宙场景
 *
 * 原始代码来自 nebulon.js 中的 com/nebulon/app/screens/Stars
 */
export class Stars extends PIXI.Container {
  /** 背景精灵 */
  private bg: PIXI.Sprite | null = null;

  /** 太阳精灵 */
  private sun: PIXI.Sprite | null = null;

  /** 3D 渲染系统 */
  private mini3d: Mini3d;

  /** 3D 云朵数组 */
  private clouds: Sprite3D[] = [];

  /** 云朵移动速度 */
  private speed: number = -5;

  /** Z 轴范围 */
  private range: number = 2000;

  /** 动画计数器 */
  private count: number = 0;

  /** 云朵纹理图片名称 */
  private images: string[] = [
    "spaceCloud1.png",
    "spaceCloud2.png",
    "spaceCloud3.png",
  ];

  constructor() {
    super();

    this.mini3d = new Mini3d();
    this.addChild(this.mini3d.view);
  }

  /**
   * 使用加载的纹理初始化星空场景
   * @param assetUrl - 资源基础路径
   */
  public async init(assetUrl: string): Promise<void> {
    // 创建背景
    const bgTexture = await PIXI.Assets.load(assetUrl + "img/spaceBG.jpg");
    this.bg = new PIXI.Sprite(bgTexture);
    this.bg.anchor.set(0.5);
    this.bg.x = 950;
    this.bg.y = 600;
    this.bg.scale.set(1.185);
    this.addChildAt(this.bg, 0);

    // 加载太阳纹理
    const sunTexture = await PIXI.Assets.load(assetUrl + "img/sun_add.png");
    this.sun = new PIXI.Sprite(sunTexture);

    // 加载云朵纹理
    const cloudTextures: PIXI.Texture[] = [];
    for (const imageName of this.images) {
      const texture = await PIXI.Assets.load(assetUrl + "img/" + imageName);
      cloudTextures.push(texture);
    }

    // 创建 30 个太空云朵
    for (let i = 0; i < 30; i++) {
      const texture = cloudTextures[i % cloudTextures.length];
      const cloud = new Cloud(texture) as Sprite3D;

      // 屏幕混合模式产生发光效果
      cloud.blendMode = "screen";
      cloud.rotSpeed = 4;

      this.mini3d.addChild(cloud);
      this.clouds.push(cloud);

      // 沿 Z 轴分布云朵
      cloud.position3d.z = -(this.range / 30) * i;
    }

    // 将太阳添加到顶层
    this.addChild(this.sun);
  }

  /**
   * 当场景变为可见时调用
   */
  public onShow(): void {
    // 初始化位置
  }

  /**
   * 显示动画完成后调用
   */
  public onShown(): void {
    // 显示后的额外设置
  }

  /**
   * 更新动画帧
   * @param deltaTime - 帧间隔时间
   */
  public update(deltaTime: number): void {
    for (let i = 0; i < this.clouds.length; i++) {
      const cloud = this.clouds[i];

      // 向前移动云朵
      cloud.position3d.z += this.speed * deltaTime;

      // 根据 Z 位置淡入/淡出
      if (cloud.position3d.z < 300) {
        cloud.alpha = cloud.position3d.z / 300;
      } else {
        cloud.alpha += 0.01 * (1 - cloud.alpha);
      }

      // 旋转云朵
      if (cloud.rotSpeed !== undefined) {
        cloud.rotation += cloud.rotSpeed;
      }

      // 当云朵经过相机时回收
      if (cloud.position3d.z < 0) {
        cloud.scaleRatio = 5;
        cloud.rotSpeed = Math2.random(-0.0005, 0.0005);
        cloud.position3d.z += this.range;
        cloud.position3d.x = Math2.random(-4950, 4950);
        cloud.position3d.y = Math2.random(-4950, 4950);
        cloud.alpha = 0;
        cloud.rotation = 0;
        cloud.scaleOffset.x = Math2.random(1, 1.2);
        cloud.scaleOffset.y = Math2.random(1, 1.2);

        // 随机水平翻转
        if (Math.random() < 0.5) {
          cloud.scaleOffset.x *= -1;
        }
      }
    }

    // 更新 3D 投影
    this.mini3d.update();

    // 动画相机（比云层场景更慢）
    this.count += 0.25;

    // 缓慢旋转背景
    if (this.bg) {
      this.bg.rotation += 0.0002;
    }

    this.mini3d.view.rotation = 0.08 * Math.cos(0.02 * this.count);
    this.mini3d.position3d.y = 200 * Math.sin(0.03 * this.count);
    this.mini3d.position3d.y -= 50;
    this.mini3d.rotation3d.y = 0.2 * Math.sin(0.02 * this.count * 0.5);
  }

  /**
   * 处理窗口大小调整
   * @param width - 新宽度
   * @param height - 新高度
   */
  public resize(width: number, height: number): void {
    this.mini3d.view.x = width / 2;
    this.mini3d.view.y = height / 2;
  }

  /**
   * 销毁并清理资源
   */
  public destroy(): void {
    this.clouds = [];
    super.destroy({ children: true });
  }
}
