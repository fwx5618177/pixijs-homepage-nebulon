import * as PIXI from "pixi.js";
import { Mini3d, Sprite3D } from "@/utils/Mini3d";
import { Math2 } from "@/utils/Math2";
import { Cloud } from "./Cloud";

/**
 * Clouds - 带有视差云朵效果的天空图层
 * 使用伪 3D 投影创建类 3D 的云朵飞行效果
 *
 * 原始代码来自 nebulon.js 中的 com/nebulon/app/screens/Clouds
 */
export class Clouds extends PIXI.Container {
  /** 背景精灵 */
  private bg: PIXI.Sprite | null = null;

  /** 3D 渲染系统 */
  private mini3d: Mini3d;

  /** 3D 云朵数组 */
  private clouds: Sprite3D[] = [];

  /** 云朵移动速度 */
  private speed: number = -15;

  /** Z 轴范围 */
  private range: number = 3000;

  /** 动画计数器 */
  private count: number = 0;

  /** 云朵纹理图片名称 */
  private images: string[] = ["skyCloud1.png", "skyCloud2.png"];

  constructor() {
    super();

    this.mini3d = new Mini3d();
    this.addChild(this.mini3d.view);
  }

  /**
   * 使用加载的纹理初始化云朵场景
   * @param assetUrl - 资源基础路径
   */
  public async init(assetUrl: string): Promise<void> {
    // 创建背景
    const bgTexture = await PIXI.Assets.load(assetUrl + "img/skyBG.jpg");
    this.bg = new PIXI.Sprite(bgTexture);
    this.addChildAt(this.bg, 0);

    // 加载云朵纹理
    const cloudTextures: PIXI.Texture[] = [];
    for (const imageName of this.images) {
      const texture = await PIXI.Assets.load(assetUrl + "img/" + imageName);
      cloudTextures.push(texture);
    }

    // 创建 50 个云朵
    for (let i = 0; i < 50; i++) {
      const texture = cloudTextures[i % cloudTextures.length];
      const cloud = new Cloud(texture);

      this.mini3d.addChild(cloud);
      this.clouds.push(cloud as Sprite3D);

      // 沿 Z 轴分布云朵
      cloud.position3d.z = -(this.range / 50) * i;
    }
  }

  /**
   * 当场景变为可见时调用
   */
  public onShow(): void {
    // 初始化云朵位置
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

      // 当云朵经过相机时回收
      if (cloud.position3d.z < 0) {
        cloud.scaleRatio = 5;
        cloud.position3d.z += this.range;
        cloud.position3d.x = Math2.random(-4500, 4500);
        cloud.position3d.y =
          1200 - Math.abs(0.2 * cloud.position3d.x) + Math2.random(0, 200);
        cloud.rotation = cloud.position3d.x * -0.0002;
        cloud.alpha = 0;
        cloud.scaleOffset.x = Math2.random(0.6, 1.4);
        cloud.scaleOffset.y = Math2.random(0.9, 1.1);

        // 随机水平翻转
        if (Math.random() < 0.5) {
          cloud.scaleOffset.x *= -1;
        }
      }
    }

    // 更新 3D 投影
    this.mini3d.update();

    // 动画相机
    this.count += deltaTime;
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
