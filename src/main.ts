import { NebulonApp } from "./NebulonApp";

/**
 * 主入口文件 - PixiJS 首页动画
 * 原始代码来自 nebulon.js
 */
async function main(): Promise<void> {
  // 创建应用实例
  const app = new NebulonApp();

  // 获取容器元素
  const container = document.getElementById("container");
  if (!container) {
    console.error("未找到容器元素");
    return;
  }

  // 首先初始化应用（创建 canvas）
  await app.init();

  // 现在可以访问 view 了
  app.view.style.position = "absolute";
  app.view.style.top = "0";
  app.view.style.left = "0";
  container.appendChild(app.view);

  // 处理窗口大小调整
  function handleResize(): void {
    app.resize(window.innerWidth, window.innerHeight);
  }

  // 初始调整大小
  handleResize();

  // 监听窗口大小变化
  window.addEventListener("resize", () => {
    setTimeout(handleResize, 100);
    setTimeout(handleResize, 200);
  });

  // 将 app 暴露到 window 用于调试
  (window as unknown as { app: NebulonApp }).app = app;
}

// 当 DOM 准备好时启动应用
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
