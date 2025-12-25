import * as PIXI from "pixi.js";

/**
 * 3D 空间中的位置
 */
export interface Position3D {
  x: number;
  y: number;
  z: number;
}

/**
 * 带有 3D 属性的扩展精灵
 */
export interface Sprite3D extends PIXI.Sprite {
  /** 3D 空间位置 */
  position3d: Position3D;
  /** 缩放比率 */
  scaleRatio: number;
  /** 缩放偏移量 */
  scaleOffset: PIXI.Point;
  /** 深度值（用于排序） */
  depth: number;
  /** 旋转速度（可选） */
  rotSpeed?: number;
}

/**
 * 深度排序函数
 * @param a - 精灵 A
 * @param b - 精灵 B
 * @returns 深度差值
 */
function sortByDepth(a: Sprite3D, b: Sprite3D): number {
  return a.depth - b.depth;
}

/**
 * Mini3d - 伪 3D 渲染系统
 * 使用透视投影将 3D 坐标投影到 2D
 *
 * 原始代码来自 nebulon.js 中的 com/fido/utils/Mini3d
 */
export class Mini3d {
  /** 视图容器 */
  public view: PIXI.Container;

  /** 3D 子元素数组 */
  public children: Sprite3D[] = [];

  /** 焦距（影响透视效果强度） */
  public focalLength: number = 400;

  /** 相机的 3D 位置 */
  public position3d: Position3D = { x: 0, y: 0, z: 0 };

  /** 相机的 3D 旋转（弧度） */
  public rotation3d: Position3D = { x: 0, y: 0, z: 0 };

  constructor() {
    this.view = new PIXI.Container();
  }

  /**
   * 向 3D 场景添加精灵
   * @param sprite - 要添加的精灵
   * @returns 带有 3D 属性的精灵
   */
  public addChild(sprite: PIXI.Sprite): Sprite3D {
    const sprite3d = sprite as Sprite3D;

    // 如果不存在则初始化 3D 属性
    if (!sprite3d.position3d) {
      sprite3d.position3d = { x: 0, y: 0, z: 0 };
    }
    if (!sprite3d.scaleRatio) {
      sprite3d.scaleRatio = 2;
    }
    if (!sprite3d.scaleOffset) {
      sprite3d.scaleOffset = new PIXI.Point(1, 1);
    }
    sprite3d.depth = 0;

    sprite3d.anchor.set(0.5);
    this.view.addChild(sprite3d);
    this.children.push(sprite3d);

    return sprite3d;
  }

  /**
   * 从 3D 场景移除精灵
   * @param sprite - 要移除的精灵
   */
  public removeChild(sprite: Sprite3D): void {
    const index = this.children.indexOf(sprite);
    if (index !== -1) {
      this.children.splice(index, 1);
      this.view.removeChild(sprite);
    }
  }

  /**
   * 更新所有子元素的 3D 投影
   * 执行 3D 到 2D 的透视投影变换
   */
  public update(): void {
    // 预计算旋转的三角函数值
    const sinX = Math.sin(this.rotation3d.x);
    const cosX = Math.cos(this.rotation3d.x);
    const sinY = Math.sin(this.rotation3d.y);
    const cosY = Math.cos(this.rotation3d.y);
    const sinZ = Math.sin(this.rotation3d.z);
    const cosZ = Math.cos(this.rotation3d.z);

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];

      // 获取相对于相机的位置
      let x = child.position3d.x - this.position3d.x;
      let y = child.position3d.y - this.position3d.y;
      let z = child.position3d.z - this.position3d.z;

      // 绕 X 轴旋转
      const y1 = cosX * y - sinX * z;
      const z1 = sinX * y + cosX * z;

      // 绕 Y 轴旋转
      const z2 = cosY * z1 - sinY * x;
      const x1 = sinY * z1 + cosY * x;

      // 绕 Z 轴旋转
      const x2 = cosZ * x1 - sinZ * y1;
      const y2 = sinZ * x1 + cosZ * y1;

      // 透视投影计算
      const scale = this.focalLength / (this.focalLength + z2);

      // 应用最终位置
      x = x2 * scale;
      y = y2 * scale;
      z = z2;

      // 更新精灵属性
      child.scale.x = child.scale.y = scale * child.scaleRatio;
      child.scale.x *= child.scaleOffset.x;
      child.scale.y *= child.scaleOffset.y;
      child.depth = -child.position3d.z;
      child.position.x = x;
      child.position.y = y;
    }

    // 按深度排序子元素（画家算法）
    this.view.children.sort((a, b) =>
      sortByDepth(a as Sprite3D, b as Sprite3D),
    );
  }

  /**
   * 设置视图容器的位置
   * @param x - X 坐标
   * @param y - Y 坐标
   */
  public setViewPosition(x: number, y: number): void {
    this.view.x = x;
    this.view.y = y;
  }
}
