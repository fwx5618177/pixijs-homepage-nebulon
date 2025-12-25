import * as PIXI from "pixi.js";
import { Position3D, Sprite3D } from "@/utils/Mini3d";
import { Ticker } from "@/core/Ticker";

/**
 * Cloud - 带有 3D 定位能力的精灵
 * 用于天空云朵和太空星云场景
 *
 * 原始代码来自 nebulon.js 中的云朵实现
 */
export class Cloud extends PIXI.Sprite implements Sprite3D {
  /** 3D 空间位置 */
  public position3d: Position3D;

  /** 缩放比率 */
  public scaleRatio: number;

  /** 缩放偏移量 */
  public scaleOffset: PIXI.Point;

  /** 深度值（用于排序） */
  public depth: number = 0;

  /** 旋转速度 */
  public rotSpeed: number = 0;

  /**
   * 创建云朵实例
   * @param texture - 云朵纹理
   */
  constructor(texture: PIXI.Texture) {
    super(texture);

    this.position3d = { x: 0, y: 0, z: 0 };
    this.scaleRatio = 2;
    this.scaleOffset = new PIXI.Point(1, 1);
  }

  /**
   * 当云朵变为可见时调用
   */
  public onShow(): void {
    Ticker.instance.add(this.update.bind(this));
  }

  /**
   * 显示动画完成后调用
   */
  public onShown(): void {
    // 如需自定义行为可在子类中覆写
  }

  /**
   * 更新循环 - 在子类中覆写以实现自定义行为
   * @param _deltaTime - 帧间隔时间
   */
  public update(_deltaTime: number): void {
    // 在子类中覆写
  }

  /**
   * 设置 3D 位置
   * @param x - X 坐标
   * @param y - Y 坐标
   * @param z - Z 坐标
   */
  public setPosition3D(x: number, y: number, z: number): void {
    this.position3d.x = x;
    this.position3d.y = y;
    this.position3d.z = z;
  }

  /**
   * 重置云朵属性以便回收利用
   */
  public reset(): void {
    this.position3d.x = 0;
    this.position3d.y = 0;
    this.position3d.z = 0;
    this.alpha = 0;
    this.rotation = 0;
    this.scaleOffset.set(1, 1);
  }
}
