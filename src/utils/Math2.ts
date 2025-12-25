/**
 * Math2 - 数学工具函数
 * 原始代码来自 nebulon.js 中的 com/fido/utils/Math2
 */
export const Math2 = {
  /**
   * 生成指定范围内的随机数
   * @param min - 最小值（默认 0）
   * @param max - 最大值（默认 1）
   * @returns 介于 min 和 max 之间的随机数
   */
  random(min: number = 0, max: number = 1): number {
    return min + Math.random() * (max - min);
  },

  /**
   * 生成指定范围内的随机整数
   * @param min - 最小值
   * @param max - 最大值
   * @returns 介于 min 和 max 之间的随机整数
   */
  randomInt(min: number, max: number): number {
    return (min + Math.random() * (max - min)) | 0;
  },

  /**
   * 基于种子生成可重复的随机数
   * @param min - 最小值
   * @param max - 最大值
   * @param seed - 随机种子（默认 1）
   * @returns 基于种子生成的随机数
   */
  randomSeed(min: number, max: number, seed: number = 1): number {
    seed = (9301 * seed + 49297) % 233280;
    const rnd = seed / 233280;
    return min + rnd * (max - min);
  },

  /**
   * 基于阈值的随机概率判断
   * @param threshold - 阈值（0-1）
   * @param seed - 随机种子
   * @returns 是否超过阈值
   */
  randomChance(threshold: number, seed: number): boolean {
    return Math2.randomSeed(0, 1, seed) > threshold;
  },

  /**
   * 将值限制在指定范围内
   * @param value - 要限制的值
   * @param min - 最小值
   * @param max - 最大值
   * @returns 限制后的值
   */
  clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  },

  /**
   * 线性插值
   * @param start - 起始值
   * @param end - 结束值
   * @param t - 插值因子（0-1）
   * @returns 插值结果
   */
  lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  },
};
