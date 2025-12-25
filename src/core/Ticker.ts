/**
 * Ticker - 动画循环管理器
 * 处理 requestAnimationFrame 和 deltaTime 计算
 *
 * 原始代码来自 nebulon.js 中的 com/fido/system/Ticker
 */
export class Ticker {
  /** 单例实例 */
  private static _instance: Ticker;

  /** 更新回调集合 */
  public onUpdate: Set<(deltaTime: number) => void> = new Set();

  /** 绑定的更新函数 */
  private updateBind: () => void;

  /** 是否激活 */
  public active: boolean = false;

  /** 帧间隔时间（经过缩放） */
  public deltaTime: number = 1;

  /** 已经过的总时间（毫秒） */
  public timeElapsed: number = 0;

  /** 上一帧的时间戳 */
  private lastTime: number = 0;

  /** 速度倍率 */
  public speed: number = 1;

  constructor() {
    this.updateBind = this.update.bind(this);
  }

  /**
   * 获取 Ticker 单例实例
   */
  public static get instance(): Ticker {
    if (!Ticker._instance) {
      Ticker._instance = new Ticker();
    }
    return Ticker._instance;
  }

  /**
   * 启动动画循环
   */
  public start(): void {
    if (!this.active) {
      this.active = true;
      this.lastTime = Date.now();
      requestAnimationFrame(this.updateBind);
    }
  }

  /**
   * 停止动画循环
   */
  public stop(): void {
    if (this.active) {
      this.active = false;
    }
  }

  /**
   * 内部更新函数
   * 每帧调用，计算 deltaTime 并通知所有监听器
   */
  private update(): void {
    if (this.active) {
      requestAnimationFrame(this.updateBind);

      const now = Date.now();
      let elapsed = now - this.lastTime;

      // 限制最大 deltaTime 以防止大幅跳跃
      if (elapsed > 100) {
        elapsed = 100;
      }

      // 计算缩放后的 deltaTime
      this.deltaTime = 0.06 * elapsed;
      this.deltaTime *= this.speed;
      this.timeElapsed += elapsed;

      // 分发给所有监听器
      this.onUpdate.forEach((callback) => {
        callback(this.deltaTime);
      });

      this.lastTime = now;
    }
  }

  /**
   * 添加更新回调
   * @param callback - 每帧调用的回调函数，参数为 deltaTime
   */
  public add(callback: (deltaTime: number) => void): void {
    this.onUpdate.add(callback);
  }

  /**
   * 移除更新回调
   * @param callback - 要移除的回调函数
   */
  public remove(callback: (deltaTime: number) => void): void {
    this.onUpdate.delete(callback);
  }
}
