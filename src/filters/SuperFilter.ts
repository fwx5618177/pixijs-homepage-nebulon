import * as PIXI from "pixi.js";

/**
 * SuperFilter - 基于遮罩的揭示效果滤镜
 *
 * 这是对原始 nebulon.js 中 SuperFilter 的忠实移植
 * 滤镜从遮罩纹理（渲染的 blob）中采样，用于：
 * 1. 控制底层内容的可见性/透明度
 * 2. 根据遮罩强度应用轻微的扭曲偏移
 *
 * 原始着色器逻辑：
 * - 从 mask 纹理采样获取 masky
 * - strength = masky.r * masky.a * 5.0，限制最大为 1.0
 * - 对原始纹理应用 (1.0 - strength) * 0.1 的偏移
 * - 最终颜色 = original * strength
 */

// 顶点着色器 (GLSL 300 es 用于 WebGL2)
const vertexSrc = `
in vec2 aPosition;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

out vec2 vTextureCoord;
out vec2 vMaskCoord;

uniform mat3 uFilterMatrix;

// 计算滤镜顶点位置
vec4 filterVertexPosition(void)
{
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
    return vec4(position, 0.0, 1.0);
}

// 计算滤镜纹理坐标
vec2 filterTextureCoord(void)
{
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

void main(void)
{
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
    // 使用滤镜矩阵变换纹理坐标到遮罩坐标
    vMaskCoord = (uFilterMatrix * vec3(vTextureCoord, 1.0)).xy;
}
`;

// 片段着色器 (GLSL 300 es 用于 WebGL2)
const fragmentSrc = `
precision mediump float;

in vec2 vTextureCoord;
in vec2 vMaskCoord;

out vec4 finalColor;

uniform sampler2D uTexture;
uniform sampler2D uMaskTexture;

void main(void)
{
    // 从遮罩纹理采样
    // 原始代码：vec4 masky = texture2D(mask, vMaskCoord)
    vec4 masky = texture(uMaskTexture, vMaskCoord);

    // 计算遮罩强度
    // 原始代码：float strength = (masky.r * masky.a) * 5.0; strength = min(1.0, strength)
    float strength = masky.r * masky.a;
    strength *= 5.0;
    strength = min(1.0, strength);

    // 根据反向强度应用扭曲偏移
    // 原始代码：vec4 original = texture2D(uSampler, vTextureCoord + (1.0-strength) * 0.1)
    vec2 offset = vec2((1.0 - strength) * 0.1);
    vec4 original = texture(uTexture, vTextureCoord + offset);

    // 用强度乘以颜色来淡出
    // 原始代码：original *= strength
    original *= strength;

    finalColor = original;
}
`;

/**
 * SuperFilter 类 - 应用基于遮罩的揭示效果
 * 基于原始 nebulon.js 的 SuperFilter，使用 PixiJS v8 MaskFilter 的实现方式
 */
export class SuperFilter extends PIXI.Filter {
  /** 遮罩精灵引用 */
  public sprite: PIXI.Sprite;

  /** 用于纹理坐标映射的 TextureMatrix */
  private _textureMatrix: PIXI.TextureMatrix;

  constructor(maskSprite: PIXI.Sprite) {
    // 创建 TextureMatrix 用于正确的纹理坐标映射
    const textureMatrix = new PIXI.TextureMatrix(maskSprite.texture);

    // 创建滤镜 uniform 组
    const filterUniforms = new PIXI.UniformGroup({
      uFilterMatrix: { value: new PIXI.Matrix(), type: "mat3x3<f32>" },
    });

    // 为 WebGL2 创建 GL 程序
    const glProgram = PIXI.GlProgram.from({
      vertex: vertexSrc,
      fragment: fragmentSrc,
      name: "super-filter",
    });

    super({
      glProgram,
      resources: {
        filterUniforms,
        uMaskTexture: maskSprite.texture.source,
      },
    });

    this.sprite = maskSprite;
    this._textureMatrix = textureMatrix;
  }

  /**
   * 应用滤镜
   * 使用 filterManager.calculateSpriteMatrix 计算正确的矩阵映射
   * 这是 PixiJS v8 MaskFilter 使用的标准方法
   */
  public override apply(
    filterManager: PIXI.FilterSystem,
    input: PIXI.Texture,
    output: PIXI.RenderTarget,
    clearMode: boolean,
  ): void {
    // 更新 TextureMatrix 的纹理引用
    this._textureMatrix.texture = this.sprite.texture;

    // 使用 filterManager.calculateSpriteMatrix 计算精灵矩阵
    // 这会正确处理精灵的世界变换和纹理坐标映射
    // 然后添加 TextureMatrix 的 mapCoord 来处理纹理帧偏移
    const filterMatrix = this.resources.filterUniforms.uniforms
      .uFilterMatrix as PIXI.Matrix;

    filterManager
      .calculateSpriteMatrix(filterMatrix, this.sprite)
      .prepend(this._textureMatrix.mapCoord);

    // 更新遮罩纹理资源
    this.resources.uMaskTexture = this.sprite.texture.source;

    // 应用滤镜
    filterManager.applyFilter(this, input, output, clearMode);
  }

  /**
   * 获取遮罩精灵
   */
  public get maskSprite(): PIXI.Sprite {
    return this.sprite;
  }

  /**
   * 设置遮罩精灵
   */
  public set maskSprite(value: PIXI.Sprite) {
    this.sprite = value;
    this._textureMatrix.texture = value.texture;
    if (value.texture?.source) {
      this.resources.uMaskTexture = value.texture.source;
    }
  }

  /**
   * 获取遮罩纹理
   * 原始代码：map getter
   */
  public get map(): PIXI.Texture {
    return this.sprite.texture;
  }

  /**
   * 直接设置遮罩纹理
   * 原始代码：map setter
   */
  public set map(value: PIXI.Texture) {
    this.sprite.texture = value;
    this._textureMatrix.texture = value;
    if (value?.source) {
      this.resources.uMaskTexture = value.source;
    }
  }

  /**
   * 销毁并清理资源
   */
  public override destroy(): void {
    super.destroy();
  }
}
