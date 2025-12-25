/**
 * DoubleSpring - 2D 弹簧物理模拟
 * 用于平滑的弹簧式动画效果
 *
 * 原始代码来自 nebulon.js 中的 com/fido/physics/DoubleSpring
 */
export class DoubleSpring {
  /** X 轴当前位置 */
  public x: number = 0;
  /** X 轴加速度 */
  public ax: number = 0;
  /** X 轴速度（delta） */
  public dx: number = 0;
  /** X 轴目标位置 */
  public tx: number = 0;

  /** Y 轴当前位置 */
  public y: number = 0;
  /** Y 轴加速度 */
  public ay: number = 0;
  /** Y 轴速度（delta） */
  public dy: number = 0;
  /** Y 轴目标位置 */
  public ty: number = 0;

  /** 最大速度限制 */
  public max: number = 160;
  /** 阻尼系数（0-1，越小阻尼越大） */
  public damp: number = 0.7;
  /** 弹簧系数（0-1，越大弹性越强） */
  public springiness: number = 0.69;

  constructor() {
    // 默认值已在上面设置
  }

  /**
   * 更新弹簧物理状态
   * 每帧调用一次
   */
  public update(): void {
    // X 轴弹簧计算
    this.ax = (this.tx - this.x) * this.springiness;
    this.dx += this.ax;
    this.dx *= this.damp;

    // 限制最大速度
    if (this.dx < -this.max) {
      this.dx = -this.max;
    } else if (this.dx > this.max) {
      this.dx = this.max;
    }

    this.x += this.dx;

    // Y 轴弹簧计算
    this.ay = (this.ty - this.y) * this.springiness;
    this.dy += this.ay;
    this.dy *= this.damp;

    // 限制最大速度
    if (this.dy < -this.max) {
      this.dy = -this.max;
    } else if (this.dy > this.max) {
      this.dy = this.max;
    }

    this.y += this.dy;
  }

  /**
   * 重置所有状态到初始值
   */
  public reset(): void {
    this.x = 0;
    this.ax = 0;
    this.dx = 0;
    this.tx = 0;

    this.y = 0;
    this.ay = 0;
    this.dy = 0;
    this.ty = 0;
  }

  /**
   * 设置目标位置
   * @param x - X 轴目标位置
   * @param y - Y 轴目标位置
   */
  public setTarget(x: number, y: number): void {
    this.tx = x;
    this.ty = y;
  }

  /**
   * 立即设置当前位置（无弹簧效果）
   * @param x - X 轴位置
   * @param y - Y 轴位置
   */
  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.tx = x;
    this.ty = y;
    this.dx = 0;
    this.dy = 0;
  }
}
