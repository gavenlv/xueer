/**
 * 物理解图渲染器：把数据描述的图元画成**内联 SVG**。
 *
 * 为什么不用图片：① 离线可用、不需要任何素材文件，也不进发布包；
 * ② 可随主题换色、在手机上不糊；③ 图能被朗读与检索（`PhysicsFigure.alt`）；
 * ④ 作者写的是「一条入射光线、一个凸透镜」这种**语义**，不是坐标微调——
 * 电路符号这类「画错就没分」的东西由这里统一保证画法正确。
 *
 * 坐标约定：所有图元坐标都是 **0—100 的画布单位**（左上角原点、y 向下），
 * 由 `viewBox` 缩放，因此同一份数据在手机与桌面上比例一致。
 */

import type { FigurePrim, FigureTone, PhysicsFigure } from '../types';

const VIEW: Record<NonNullable<PhysicsFigure['view']>, [number, number]> = {
  wide: [100, 62.5],
  square: [100, 100],
  tall: [100, 140],
};

/** 语义色调 → CSS 变量。数据里不写颜色，换主题时全站一起变 */
const TONE: Record<FigureTone, string> = {
  main: 'var(--c-ink)',
  accent: 'var(--c-primary)',
  muted: '#9aa3ad',
  danger: 'var(--c-red)',
  ok: 'var(--c-jade)',
};

const toneOf = (t?: FigureTone) => TONE[t ?? 'main'];
const FONT = 4.2;

/** 角度 → 弧度（图元里的角一律用「度、逆时针为正、0 = 正右」，画布 y 向下故取负） */
const rad = (deg: number) => (-deg * Math.PI) / 180;

/** 极坐标取点（画布坐标） */
function polar(x: number, y: number, r: number, deg: number): [number, number] {
  return [x + r * Math.cos(rad(deg)), y + r * Math.sin(rad(deg))];
}

/** 箭头头部的三角形点集 */
function head(x1: number, y1: number, x2: number, y2: number, size = 2.6): string {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const [p1x, p1y] = [x2 - size * Math.cos(a - 0.42), y2 - size * Math.sin(a - 0.42)];
  const [p2x, p2y] = [x2 - size * Math.cos(a + 0.42), y2 - size * Math.sin(a + 0.42)];
  return `${x2},${y2} ${p1x},${p1y} ${p2x},${p2y}`;
}

/** 带标签的文字（统一字号与颜色，避免作者逐张调） */
function Label(props: { x: number; y: number; text: string; anchor?: 'start' | 'middle' | 'end'; tone?: FigureTone; size?: number }) {
  const { x, y, text, anchor = 'middle', tone, size } = props;
  return (
    <text
      x={x}
      y={y}
      fontSize={size ?? FONT}
      fill={toneOf(tone)}
      textAnchor={anchor}
      dominantBaseline="middle"
    >
      {text}
    </text>
  );
}

/* ------------------------------------------------------------------ */
/* 单个图元                                                            */
/* ------------------------------------------------------------------ */

function renderPrim(p: FigurePrim, key: number) {
  const stroke = (t?: FigureTone) => toneOf(t);
  switch (p.t) {
    case 'line':
      return (
        <line
          key={key}
          x1={p.x1}
          y1={p.y1}
          x2={p.x2}
          y2={p.y2}
          stroke={stroke(p.tone)}
          strokeWidth={p.width ?? 0.5}
          strokeDasharray={p.dashed ? '1.6 1.4' : undefined}
        />
      );

    case 'arrow': {
      const w = p.width ?? 0.55;
      return (
        <g key={key}>
          <line
            x1={p.x1}
            y1={p.y1}
            x2={p.x2}
            y2={p.y2}
            stroke={stroke(p.tone)}
            strokeWidth={w}
            strokeDasharray={p.dashed ? '1.6 1.4' : undefined}
          />
          <polygon points={head(p.x1, p.y1, p.x2, p.y2)} fill={stroke(p.tone)} />
          {p.both ? <polygon points={head(p.x2, p.y2, p.x1, p.y1)} fill={stroke(p.tone)} /> : null}
          {p.label ? (
            <Label
              x={(p.x1 + p.x2) / 2 + (p.labelDx ?? 0)}
              y={(p.y1 + p.y2) / 2 - 2 + (p.labelDy ?? 0)}
              text={p.label}
              tone={p.tone}
            />
          ) : null}
        </g>
      );
    }

    case 'rect':
      return (
        <g key={key}>
          <rect
            x={p.x}
            y={p.y}
            width={p.w}
            height={p.h}
            rx={p.rx}
            fill={p.fill ? stroke(p.tone) : 'none'}
            fillOpacity={p.fill ? 0.14 : undefined}
            stroke={stroke(p.tone)}
            strokeWidth={0.5}
            strokeDasharray={p.dashed ? '1.6 1.4' : undefined}
          />
          {p.label ? <Label x={p.x + p.w / 2} y={p.y + p.h / 2} text={p.label} tone={p.tone} /> : null}
        </g>
      );

    case 'circle':
      return (
        <g key={key}>
          <circle
            cx={p.cx}
            cy={p.cy}
            r={p.r}
            fill={p.fill ? stroke(p.tone) : 'none'}
            fillOpacity={p.fill ? 0.14 : undefined}
            stroke={stroke(p.tone)}
            strokeWidth={0.5}
            strokeDasharray={p.dashed ? '1.6 1.4' : undefined}
          />
          {p.label ? (
            <Label x={p.cx + (p.labelDx ?? 0)} y={p.cy + (p.labelDy ?? -p.r - 1.6)} text={p.label} tone={p.tone} />
          ) : null}
        </g>
      );

    case 'poly': {
      const pts = p.points.map(([x, y]) => `${x},${y}`).join(' ');
      return p.closed ? (
        <polygon
          key={key}
          points={pts}
          fill={p.fill ? stroke(p.tone) : 'none'}
          fillOpacity={p.fill ? 0.14 : undefined}
          stroke={stroke(p.tone)}
          strokeWidth={0.5}
          strokeDasharray={p.dashed ? '1.6 1.4' : undefined}
        />
      ) : (
        <polyline
          key={key}
          points={pts}
          fill="none"
          stroke={stroke(p.tone)}
          strokeWidth={0.5}
          strokeDasharray={p.dashed ? '1.6 1.4' : undefined}
        />
      );
    }

    case 'arc': {
      /**
       * 弧的方向约定（**修过一次的真实 bug**）：
       *
       * `polar(deg)` 用 `rad(deg) = -deg·π/180`，也就是「deg 增大 = 屏幕上逆时针」。
       * 而 SVG 的 `sweep-flag = 1` 表示沿角度增大的方向走——在 y 向下的坐标系里
       * 那是**顺时针**。所以要走到 `to`（to > from，逆时针）必须用 sweep = 0。
       *
       * 最初的实现写的是 `const a1 = -p.from; const a2 = -p.to;` 再拿**度数**去和
       * `Math.PI` 比，结果是跨度超过约 3° 的弧全被标成 large-arc、方向也反了；
       * 两位内容作者都因此绕开 `arc` 改用 `curve` 显式给点。现在：
       *   - large-arc 用**度数**跨度判断（> 180）；
       *   - sweep 与 `angle` 图元保持同一套约定（to > from 用 0）。
       * `smoke` 里有一条断言专门盯这两个 flag。
       */
      const span = Math.abs(p.to - p.from);
      const large = span > 180 ? 1 : 0;
      const sweep = p.to >= p.from ? 0 : 1;
      const [sx, sy] = polar(p.cx, p.cy, p.r, p.from);
      const [ex, ey] = polar(p.cx, p.cy, p.r, p.to);
      return (
        <path
          key={key}
          d={`M ${sx} ${sy} A ${p.r} ${p.r} 0 ${large} ${sweep} ${ex} ${ey}`}
          fill="none"
          stroke={stroke(p.tone)}
          strokeWidth={0.5}
          strokeDasharray={p.dashed ? '1.6 1.4' : undefined}
          markerEnd={p.arrow ? 'url(#fig-arrow)' : undefined}
        />
      );
    }

    case 'text':
      return <Label key={key} x={p.x} y={p.y} text={p.text} anchor={p.anchor} tone={p.tone} size={p.size} />;

    case 'angle': {
      const r = p.r ?? 6;
      if (p.right) {
        // 直角用方框标记：沿两条边各取一小段
        const [ax, ay] = polar(p.x, p.y, r * 0.62, p.from);
        const [bx, by] = polar(p.x, p.y, r * 0.62, p.to);
        const [cx2, cy2] = polar(ax, ay, r * 0.62, p.to);
        return (
          <polyline
            key={key}
            points={`${ax},${ay} ${cx2},${cy2} ${bx},${by}`}
            fill="none"
            stroke={stroke(p.tone ?? 'muted')}
            strokeWidth={0.4}
          />
        );
      }
      const [sx, sy] = polar(p.x, p.y, r, p.from);
      const [ex, ey] = polar(p.x, p.y, r, p.to);
      // 与 `arc` 图元同一套方向约定：to > from（逆时针）用 sweep = 0
      const sweep = p.to >= p.from ? 0 : 1;
      const large = Math.abs(p.to - p.from) > 180 ? 1 : 0;
      const mid = (p.from + p.to) / 2;
      const [lx, ly] = polar(p.x, p.y, r + 3.4, mid);
      return (
        <g key={key}>
          <path
            d={`M ${sx} ${sy} A ${r} ${r} 0 ${large} ${sweep} ${ex} ${ey}`}
            fill="none"
            stroke={stroke(p.tone ?? 'muted')}
            strokeWidth={0.4}
          />
          {p.label ? <Label x={lx} y={ly} text={p.label} tone={p.tone ?? 'muted'} size={3.6} /> : null}
        </g>
      );
    }

    case 'axis': {
      const x0 = p.x;
      const y0 = p.y;
      const xe = p.x + p.w;
      const ye = p.y - p.h;
      return (
        <g key={key}>
          {p.grid
            ? (p.xTicks ?? []).map((t, i) => (
                <line
                  key={`gx${i}`}
                  x1={x0 + p.w * t.at}
                  y1={y0}
                  x2={x0 + p.w * t.at}
                  y2={ye}
                  stroke="var(--c-line)"
                  strokeWidth={0.3}
                />
              ))
            : null}
          {p.grid
            ? (p.yTicks ?? []).map((t, i) => (
                <line
                  key={`gy${i}`}
                  x1={x0}
                  y1={y0 - p.h * t.at}
                  x2={xe}
                  y2={y0 - p.h * t.at}
                  stroke="var(--c-line)"
                  strokeWidth={0.3}
                />
              ))
            : null}
          <line x1={x0} y1={y0} x2={xe} y2={y0} stroke={toneOf('main')} strokeWidth={0.5} />
          <polygon points={head(x0, y0, xe, y0)} fill={toneOf('main')} />
          <line x1={x0} y1={y0} x2={x0} y2={ye} stroke={toneOf('main')} strokeWidth={0.5} />
          <polygon points={head(x0, y0, x0, ye)} fill={toneOf('main')} />
          {(p.xTicks ?? []).map((t, i) => (
            <g key={`tx${i}`}>
              <line x1={x0 + p.w * t.at} y1={y0} x2={x0 + p.w * t.at} y2={y0 + 1.4} stroke={toneOf('main')} strokeWidth={0.4} />
              <Label x={x0 + p.w * t.at} y={y0 + 4.4} text={t.label} size={3.6} />
            </g>
          ))}
          {(p.yTicks ?? []).map((t, i) => (
            <g key={`ty${i}`}>
              <line x1={x0 - 1.4} y1={y0 - p.h * t.at} x2={x0} y2={y0 - p.h * t.at} stroke={toneOf('main')} strokeWidth={0.4} />
              <Label x={x0 - 2.6} y={y0 - p.h * t.at} text={t.label} size={3.6} anchor="end" />
            </g>
          ))}
          {p.origin ? <Label x={x0 - 2.6} y={y0 + 4.4} text="O" size={3.6} anchor="end" /> : null}
          <Label x={xe + 1} y={y0 + 4.4} text={p.xLabel} anchor="start" size={4} />
          <Label x={x0 - 1} y={ye - 3.4} text={p.yLabel} anchor="end" size={4} />
        </g>
      );
    }

    case 'curve': {
      const pts = p.points.map(([x, y]) => `${x},${y}`).join(' ');
      const last = p.points[p.points.length - 1];
      const prev = p.points[p.points.length - 2];
      return (
        <g key={key}>
          <polyline
            points={pts}
            fill="none"
            stroke={stroke(p.tone ?? 'accent')}
            strokeWidth={p.width ?? 0.6}
            strokeLinejoin="round"
            strokeDasharray={p.dashed ? '1.6 1.4' : undefined}
          />
          {p.arrow && prev && last ? <polygon points={head(prev[0], prev[1], last[0], last[1])} fill={stroke(p.tone ?? 'accent')} /> : null}
        </g>
      );
    }

    case 'hatch': {
      const gap = p.gap ?? 2.4;
      const lines: JSX.Element[] = [];
      for (let d = 0; d < p.w + p.h; d += gap) {
        const x1 = p.x + Math.max(0, d - p.h);
        const y1 = p.y + Math.min(d, p.h);
        const x2 = p.x + Math.min(d, p.w);
        const y2 = p.y + Math.max(0, d - p.w);
        lines.push(
          <line key={`h${d}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke(p.tone ?? 'muted')} strokeWidth={0.3} />,
        );
      }
      return <g key={key}>{lines}</g>;
    }

    /* ------------------------- 电学符号 ------------------------- */

    case 'battery': {
      const cells = p.cells ?? 1;
      const long = 7;
      const short = 4;
      const step = 3;
      return (
        <g key={key}>
          {Array.from({ length: cells }).map((_, i) => {
            const off = i * step;
            return p.vertical ? (
              <g key={i}>
                <line x1={p.x - long / 2} y1={p.y + off} x2={p.x + long / 2} y2={p.y + off} stroke={toneOf('main')} strokeWidth={0.7} />
                <line x1={p.x - short / 2} y1={p.y + off + step} x2={p.x + short / 2} y2={p.y + off + step} stroke={toneOf('main')} strokeWidth={1.4} />
              </g>
            ) : (
              <g key={i}>
                <line x1={p.x + off} y1={p.y - long / 2} x2={p.x + off} y2={p.y + long / 2} stroke={toneOf('main')} strokeWidth={0.7} />
                <line x1={p.x + off + step} y1={p.y - short / 2} x2={p.x + off + step} y2={p.y + short / 2} stroke={toneOf('main')} strokeWidth={1.4} />
              </g>
            );
          })}
          {/* 引线：让电源能直接串在导线上 */}
          {p.vertical ? (
            <>
              <line x1={p.x} y1={p.y - 4} x2={p.x} y2={p.y} stroke={toneOf('main')} strokeWidth={0.5} />
              <line x1={p.x} y1={p.y + (cells - 1) * step + step} x2={p.x} y2={p.y + (cells - 1) * step + step + 4} stroke={toneOf('main')} strokeWidth={0.5} />
            </>
          ) : (
            <>
              <line x1={p.x - 4} y1={p.y} x2={p.x} y2={p.y} stroke={toneOf('main')} strokeWidth={0.5} />
              <line x1={p.x + (cells - 1) * step + step} y1={p.y} x2={p.x + (cells - 1) * step + step + 4} y2={p.y} stroke={toneOf('main')} strokeWidth={0.5} />
            </>
          )}
          {p.label ? <Label x={p.x} y={p.y + (p.vertical ? -8 : -6)} text={p.label} /> : null}
        </g>
      );
    }

    case 'switch': {
      const half = 6;
      return (
        <g key={key}>
          {p.vertical ? (
            <>
              <line x1={p.x} y1={p.y - half} x2={p.x} y2={p.y - 1.6} stroke={toneOf('main')} strokeWidth={0.5} />
              <circle cx={p.x} cy={p.y - 1.6} r={0.8} fill={toneOf('main')} />
              <circle cx={p.x} cy={p.y + 1.6} r={0.8} fill={toneOf('main')} />
              <line
                x1={p.x}
                y1={p.y + 1.6}
                x2={p.closed ? p.x : p.x + 3.4}
                y2={p.closed ? p.y - 1.6 : p.y - 4.2}
                stroke={toneOf('main')}
                strokeWidth={0.6}
              />
              <line x1={p.x} y1={p.y + 1.6} x2={p.x} y2={p.y + half} stroke={toneOf('main')} strokeWidth={0.5} />
            </>
          ) : (
            <>
              <line x1={p.x - half} y1={p.y} x2={p.x - 1.6} y2={p.y} stroke={toneOf('main')} strokeWidth={0.5} />
              <circle cx={p.x - 1.6} cy={p.y} r={0.8} fill={toneOf('main')} />
              <circle cx={p.x + 1.6} cy={p.y} r={0.8} fill={toneOf('main')} />
              <line
                x1={p.x - 1.6}
                y1={p.y}
                x2={p.closed ? p.x + 1.6 : p.x + 4.2}
                y2={p.closed ? p.y : p.y - 3.4}
                stroke={toneOf('main')}
                strokeWidth={0.6}
              />
              <line x1={p.x + 1.6} y1={p.y} x2={p.x + half} y2={p.y} stroke={toneOf('main')} strokeWidth={0.5} />
            </>
          )}
          {p.label ? <Label x={p.x} y={p.y - 6} text={p.label} /> : null}
        </g>
      );
    }

    case 'bulb': {
      const r = 4.6;
      return (
        <g key={key}>
          <circle cx={p.x} cy={p.y} r={r} fill="none" stroke={toneOf('main')} strokeWidth={0.5} />
          <line x1={p.x - r * 0.7} y1={p.y - r * 0.7} x2={p.x + r * 0.7} y2={p.y + r * 0.7} stroke={toneOf('main')} strokeWidth={0.5} />
          <line x1={p.x - r * 0.7} y1={p.y + r * 0.7} x2={p.x + r * 0.7} y2={p.y - r * 0.7} stroke={toneOf('main')} strokeWidth={0.5} />
          <line x1={p.x - r - 4} y1={p.y} x2={p.x - r} y2={p.y} stroke={toneOf('main')} strokeWidth={0.5} />
          <line x1={p.x + r} y1={p.y} x2={p.x + r + 4} y2={p.y} stroke={toneOf('main')} strokeWidth={0.5} />
          {p.label ? <Label x={p.x} y={p.y - r - 3} text={p.label} /> : null}
        </g>
      );
    }

    case 'resistor': {
      const w = p.w ?? 14;
      const h = p.h ?? 6;
      return (
        <g key={key}>
          {p.vertical ? (
            <>
              <rect x={p.x - h / 2} y={p.y - w / 2} width={h} height={w} fill="none" stroke={toneOf('main')} strokeWidth={0.5} />
              <line x1={p.x} y1={p.y - w / 2 - 4} x2={p.x} y2={p.y - w / 2} stroke={toneOf('main')} strokeWidth={0.5} />
              <line x1={p.x} y1={p.y + w / 2} x2={p.x} y2={p.y + w / 2 + 4} stroke={toneOf('main')} strokeWidth={0.5} />
            </>
          ) : (
            <>
              <rect x={p.x - w / 2} y={p.y - h / 2} width={w} height={h} fill="none" stroke={toneOf('main')} strokeWidth={0.5} />
              <line x1={p.x - w / 2 - 4} y1={p.y} x2={p.x - w / 2} y2={p.y} stroke={toneOf('main')} strokeWidth={0.5} />
              <line x1={p.x + w / 2} y1={p.y} x2={p.x + w / 2 + 4} y2={p.y} stroke={toneOf('main')} strokeWidth={0.5} />
            </>
          )}
          {p.label ? <Label x={p.x} y={p.y - (p.vertical ? w / 2 + 3 : h / 2 + 3.4)} text={p.label} /> : null}
        </g>
      );
    }

    case 'rheostat': {
      const w = 16;
      const h = 6;
      return (
        <g key={key}>
          <rect x={p.x - w / 2} y={p.y - h / 2} width={w} height={h} fill="none" stroke={toneOf('main')} strokeWidth={0.5} />
          <line x1={p.x - w / 2 - 4} y1={p.y} x2={p.x - w / 2} y2={p.y} stroke={toneOf('main')} strokeWidth={0.5} />
          <line x1={p.x + w / 2} y1={p.y} x2={p.x + w / 2 + 4} y2={p.y} stroke={toneOf('main')} strokeWidth={0.5} />
          {/* 滑片：箭头压在电阻体上 */}
          {p.vertical ? (
            <>
              <line x1={p.x + 8} y1={p.y} x2={p.x + 2.6} y2={p.y} stroke={toneOf('main')} strokeWidth={0.5} />
              <polygon points={`${p.x + 2.6},${p.y} ${p.x + 5},${p.y - 1.5} ${p.x + 5},${p.y + 1.5}`} fill={toneOf('main')} />
              <line x1={p.x + 8} y1={p.y} x2={p.x + 8} y2={p.y - 8} stroke={toneOf('main')} strokeWidth={0.5} />
            </>
          ) : (
            <>
              <line x1={p.x} y1={p.y - 8} x2={p.x} y2={p.y - 2.6} stroke={toneOf('main')} strokeWidth={0.5} />
              <polygon points={`${p.x},${p.y - 2.6} ${p.x - 1.5},${p.y - 5} ${p.x + 1.5},${p.y - 5}`} fill={toneOf('main')} />
              <line x1={p.x - 8} y1={p.y - 8} x2={p.x + 8} y2={p.y - 8} stroke={toneOf('main')} strokeWidth={0.5} />
              <line x1={p.x + 8} y1={p.y - 8} x2={p.x + 8} y2={p.y} stroke={toneOf('main')} strokeWidth={0.5} />
            </>
          )}
          {p.label ? <Label x={p.x} y={p.y + 5.6} text={p.label} /> : null}
        </g>
      );
    }

    case 'meter': {
      const r = 4.6;
      return (
        <g key={key}>
          <circle cx={p.x} cy={p.y} r={r} fill="none" stroke={toneOf('main')} strokeWidth={0.5} />
          <Label x={p.x} y={p.y + 0.4} text={p.kind} size={4.6} />
          <line x1={p.x - r - 4} y1={p.y} x2={p.x - r} y2={p.y} stroke={toneOf('main')} strokeWidth={0.5} />
          <line x1={p.x + r} y1={p.y} x2={p.x + r + 4} y2={p.y} stroke={toneOf('main')} strokeWidth={0.5} />
          {p.label ? <Label x={p.x} y={p.y - r - 3} text={p.label} size={3.6} /> : null}
        </g>
      );
    }

    case 'junction':
      return <circle key={key} cx={p.x} cy={p.y} r={1.3} fill={toneOf('main')} />;

    /* ------------------------- 光学元件 ------------------------- */

    case 'lens': {
      const h = p.h ?? 26;
      const b = p.kind === 'convex' ? 4.4 : 4.4;
      const y1 = p.y - h / 2;
      const y2 = p.y + h / 2;
      // 凸透镜：两段外凸的弧；凹透镜：两侧向内凹再加两条竖边
      const d =
        p.kind === 'convex'
          ? `M ${p.x} ${y1} Q ${p.x + b} ${p.y} ${p.x} ${y2} Q ${p.x - b} ${p.y} ${p.x} ${y1} Z`
          : `M ${p.x - 1.6} ${y1} L ${p.x + 1.6} ${y1} Q ${p.x - b + 3} ${p.y} ${p.x + 1.6} ${y2} L ${p.x - 1.6} ${y2} Q ${p.x + b - 3} ${p.y} ${p.x - 1.6} ${y1} Z`;
      return (
        <g key={key}>
          <path d={d} fill="var(--c-primary-soft)" fillOpacity={0.5} stroke={toneOf('main')} strokeWidth={0.5} />
          {p.label ? <Label x={p.x} y={y1 - 3} text={p.label} /> : null}
        </g>
      );
    }

    case 'mirror': {
      const len = p.len ?? 30;
      const a = rad(p.angle ?? 0);
      const dx = (Math.cos(a) * len) / 2;
      const dy = (Math.sin(a) * len) / 2;
      return (
        <g key={key}>
          <line x1={p.x - dx} y1={p.y - dy} x2={p.x + dx} y2={p.y + dy} stroke={toneOf('main')} strokeWidth={0.8} />
          {/* 背面斜线 */}
          {Array.from({ length: 8 }).map((_, i) => {
            const t = (i + 0.5) / 8;
            const bx = p.x - dx + 2 * dx * t;
            const by = p.y - dy + 2 * dy * t;
            const nx = Math.sin(a) * 2.4;
            const ny = -Math.cos(a) * 2.4;
            return <line key={i} x1={bx} y1={by} x2={bx + nx} y2={by + ny} stroke={toneOf('muted')} strokeWidth={0.35} />;
          })}
          {p.label ? <Label x={p.x} y={p.y + 5} text={p.label} /> : null}
        </g>
      );
    }

    case 'surface':
      return (
        <g key={key}>
          <line
            x1={p.x1}
            y1={p.y1}
            x2={p.x2}
            y2={p.y2}
            stroke={toneOf('accent')}
            strokeWidth={0.6}
            strokeDasharray={p.kind === 'water' ? '3 1.6' : undefined}
          />
          <Label x={(p.x1 + p.x2) / 2} y={p.y1 + 4.6} text={p.label ?? (p.kind === 'water' ? '水面' : '玻璃')} tone="accent" size={3.6} />
        </g>
      );

    /* ------------------------- 力学元件 ------------------------- */

    case 'pulley': {
      const r = p.r ?? 6;
      return (
        <g key={key}>
          <circle cx={p.x} cy={p.y} r={r} fill="none" stroke={toneOf('main')} strokeWidth={0.6} />
          <circle cx={p.x} cy={p.y} r={1.1} fill={toneOf('main')} />
          {p.kind === 'moving' ? null : (
            <>
              <line x1={p.x} y1={p.y - r} x2={p.x} y2={p.y - r - 4} stroke={toneOf('main')} strokeWidth={0.6} />
              <line x1={p.x - 4} y1={p.y - r - 4} x2={p.x + 4} y2={p.y - r - 4} stroke={toneOf('main')} strokeWidth={0.6} />
            </>
          )}
          {p.label ? <Label x={p.x + r + 3} y={p.y} text={p.label} anchor="start" /> : null}
        </g>
      );
    }

    case 'lever': {
      const px = p.x1 + (p.x2 - p.x1) * p.pivot;
      const py = p.y1 + (p.y2 - p.y1) * p.pivot;
      return (
        <g key={key}>
          <line x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke={toneOf('main')} strokeWidth={1.1} />
          <polygon points={`${px},${py} ${px - 2.4},${py + 4} ${px + 2.4},${py + 4}`} fill={toneOf('accent')} />
          {p.label ? <Label x={px} y={py + 8} text={p.label} tone="accent" /> : null}
        </g>
      );
    }

    case 'incline': {
      const h = (p.w * Math.tan((p.deg * Math.PI) / 180)) / 1;
      const topX = p.x + p.w;
      const topY = p.y - h;
      return (
        <g key={key}>
          <polygon
            points={`${p.x},${p.y} ${topX},${p.y} ${topX},${topY}`}
            fill="var(--c-line)"
            fillOpacity={0.5}
            stroke={toneOf('main')}
            strokeWidth={0.5}
          />
          <Label x={p.x + 6} y={p.y - 2.6} text={`${p.deg}°`} size={3.6} />
          {p.label ? <Label x={p.x + p.w * 0.35} y={p.y - h * 0.5 - 3} text={p.label} /> : null}
        </g>
      );
    }

    case 'spring': {
      const coils = p.coils ?? 6;
      const dx = p.x2 - p.x1;
      const dy = p.y2 - p.y1;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const nx = -uy;
      const ny = ux;
      const pts: string[] = [`${p.x1},${p.y1}`];
      for (let i = 0; i < coils * 2; i++) {
        const t = (i + 0.5) / (coils * 2);
        const amp = i % 2 === 0 ? 1.8 : -1.8;
        pts.push(`${p.x1 + ux * len * t + nx * amp},${p.y1 + uy * len * t + ny * amp}`);
      }
      pts.push(`${p.x2},${p.y2}`);
      return (
        <g key={key}>
          <polyline points={pts.join(' ')} fill="none" stroke={toneOf('main')} strokeWidth={0.5} />
          {p.label ? <Label x={(p.x1 + p.x2) / 2} y={(p.y1 + p.y2) / 2 - 4} text={p.label} /> : null}
        </g>
      );
    }

    case 'beaker': {
      const fill = p.fill ?? 0;
      return (
        <g key={key}>
          <path
            d={`M ${p.x} ${p.y} L ${p.x} ${p.y + p.h} L ${p.x + p.w} ${p.y + p.h} L ${p.x + p.w} ${p.y}`}
            fill="none"
            stroke={toneOf('main')}
            strokeWidth={0.5}
          />
          {fill > 0 ? (
            <rect
              x={p.x}
              y={p.y + p.h * (1 - fill)}
              width={p.w}
              height={p.h * fill}
              fill="var(--c-primary)"
              fillOpacity={0.16}
            />
          ) : null}
          {p.label ? <Label x={p.x + p.w / 2} y={p.y + p.h + 4.6} text={p.label} /> : null}
        </g>
      );
    }

    /* ------------------------- 热学与磁 ------------------------- */

    case 'thermometer': {
      const value = Math.max(0, Math.min(1, p.value ?? 0.5));
      const w = 3;
      const bulbR = 2.6;
      const top = p.y;
      const bottom = p.y + p.h;
      return (
        <g key={key}>
          <rect x={p.x - w / 2} y={top} width={w} height={p.h - bulbR} rx={w / 2} fill="none" stroke={toneOf('main')} strokeWidth={0.5} />
          <circle cx={p.x} cy={bottom} r={bulbR} fill="var(--c-red)" fillOpacity={0.35} stroke={toneOf('main')} strokeWidth={0.5} />
          <rect
            x={p.x - w / 4}
            y={bottom - (p.h - bulbR * 2) * value}
            width={w / 2}
            height={(p.h - bulbR * 2) * value}
            fill="var(--c-red)"
            fillOpacity={0.55}
          />
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
            <line
              key={i}
              x1={p.x + w / 2}
              y1={bottom - (p.h - bulbR * 2) * t - bulbR}
              x2={p.x + w / 2 + 2}
              y2={bottom - (p.h - bulbR * 2) * t - bulbR}
              stroke={toneOf('muted')}
              strokeWidth={0.35}
            />
          ))}
          {p.label ? <Label x={p.x + 4} y={top - 3} text={p.label} anchor="start" size={3.6} /> : null}
        </g>
      );
    }

    case 'magnet': {
      const w = p.w ?? 24;
      const h = p.h ?? 8;
      const x = p.x - w / 2;
      const y = p.y - h / 2;
      return (
        <g key={key}>
          <rect x={x} y={y} width={w / 2} height={h} fill="var(--c-red)" fillOpacity={0.18} stroke={toneOf('main')} strokeWidth={0.5} />
          <rect x={x + w / 2} y={y} width={w / 2} height={h} fill="var(--c-primary)" fillOpacity={0.18} stroke={toneOf('main')} strokeWidth={0.5} />
          <Label x={x + w / 4} y={p.y} text="N" />
          <Label x={x + (w * 3) / 4} y={p.y} text="S" />
          {p.label ? <Label x={p.x} y={y - 3} text={p.label} /> : null}
        </g>
      );
    }

    case 'coil': {
      const turns = p.turns ?? 5;
      const w = p.w ?? 26;
      const r = 4;
      const x0 = p.x - w / 2;
      /**
       * N/S 由**正面电流方向**决定，不由作者手填——写错极性就是教错。
       *
       * 用安培定则（右手螺旋）算一遍：正面电流向上（+y，观察者在 +z）时，
       * 磁矩 m = ½∫ r × J dV，在正面 r=(0,0,z>0)、J=(0,J>0,0) 处 r × J 的 x 分量
       * 为 −zJ < 0，即 m 指向 −x。磁矩由 S 指向 N，所以 **N 在左**。
       * 正面电流向下则整体反向，N 在右。
       */
      const frontUp = (p.frontCurrent ?? 'up') === 'up';
      const left = frontUp ? 'N' : 'S';
      const right = frontUp ? 'S' : 'N';
      return (
        <g key={key}>
          {Array.from({ length: turns }).map((_, i) => {
            const cx = x0 + (w / turns) * (i + 0.5);
            return <ellipse key={i} cx={cx} cy={p.y} rx={w / turns / 2} ry={r} fill="none" stroke={toneOf('main')} strokeWidth={0.5} />;
          })}
          <line x1={x0} y1={p.y + r} x2={p.x + w / 2} y2={p.y + r} stroke={toneOf('main')} strokeWidth={0.6} />
          {/* 正面电流方向箭头：与 N/S 出自同一份判断，学生一眼能对上安培定则 */}
          <polygon
            points={
              frontUp
                ? `${p.x},${p.y + r - 4} ${p.x - 1.6},${p.y + r - 1} ${p.x + 1.6},${p.y + r - 1}`
                : `${p.x},${p.y + r + 4} ${p.x - 1.6},${p.y + r + 1} ${p.x + 1.6},${p.y + r + 1}`
            }
            fill={toneOf('accent')}
          />
          <Label x={x0 - 4} y={p.y + r} text={left} size={4.4} />
          <Label x={p.x + w / 2 + 4} y={p.y + r} text={right} size={4.4} />
          {p.label ? <Label x={p.x} y={p.y - r - 4} text={p.label} /> : null}
        </g>
      );
    }

    case 'compass': {
      const deg = p.deg ?? 0;
      const r = 4;
      const [tx, ty] = polar(p.x, p.y, r * 0.9, deg);
      const [bx, by] = polar(p.x, p.y, r * 0.9, deg + 180);
      return (
        <g key={key}>
          <circle cx={p.x} cy={p.y} r={r} fill="none" stroke={toneOf('main')} strokeWidth={0.5} />
          <polygon points={`${tx},${ty} ${bx + (by - p.y) * 0.18},${by - (bx - p.x) * 0.18} ${bx - (by - p.y) * 0.18},${by + (bx - p.x) * 0.18}`} fill="var(--c-red)" fillOpacity={0.7} />
          {p.label ? <Label x={p.x} y={p.y - r - 3} text={p.label} size={3.6} /> : null}
        </g>
      );
    }

    default:
      return null;
  }
}

/**
 * 一张图。
 * `role="img"` + `aria-label` 让屏幕阅读器与朗读都能拿到 `alt` 的文字，
 * 这也是「图要能被读出来」的落地方式。
 */
export function PhysicsFigureView({ figure, className }: { figure: PhysicsFigure; className?: string }) {
  const [vw, vh] = VIEW[figure.view ?? 'wide'];
  return (
    <figure className={`fig ${className ?? ''}`.trim()}>
      <svg
        className="fig__svg"
        viewBox={`0 0 ${vw} ${vh}`}
        role="img"
        aria-label={figure.alt}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* arc 图元的箭头（photo 图里少用，但留着以免作者踩空） */}
          <marker id="fig-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--c-ink)" />
          </marker>
        </defs>
        {figure.prims.map((p, i) => renderPrim(p, i))}
      </svg>
      <figcaption className="fig__cap">
        <span className="fig__title">{figure.title}</span>
        {figure.caption ? <span className="fig__desc">{figure.caption}</span> : null}
      </figcaption>
    </figure>
  );
}

/** 整页朗读用：把一张图读成一句话 */
export function figureSpeech(figure: PhysicsFigure): string {
  return `${figure.title}。${figure.alt}`;
}
