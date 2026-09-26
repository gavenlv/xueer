/**
 * 朗读控制条：整页朗读、上一段/下一段、暂停/继续、停止、语速与音色。
 *
 * 用法：页面把「可朗读的段落」按顺序交给它即可（`<SpeechBar segments={...} />`）。
 * 引擎见 `src/lib/speech.ts`——默认用浏览器内置语音（免费、无需密钥、可离线）。
 */

import { useEffect, useState } from 'react';
import {
  RATE_STEPS,
  engine,
  getSpeechState,
  initSpeech,
  pauseSpeech,
  resumeSpeech,
  setRate,
  setVoice,
  speak,
  stopSpeech,
  subscribeSpeech,
  type SpeechSegment,
} from '../lib/speech';
import { cn } from '../lib/utils';
import { Tag } from './common';

/** 订阅朗读状态（组件用的最小 hook） */
function useSpeechState() {
  const [state, setState] = useState(getSpeechState);
  useEffect(() => subscribeSpeech(() => setState({ ...getSpeechState() })), []);
  useEffect(() => initSpeech(), []);
  return state;
}

export function SpeechBar({
  segments,
  title = '朗读本页',
}: {
  segments: SpeechSegment[];
  title?: string;
}) {
  const state = useSpeechState();
  const [open, setOpen] = useState(false);
  const [voices, setVoices] = useState(() => engine.voices());

  // 离开详情页时彻底停止朗读，别让声音跟着用户「跑」到别的页面
  useEffect(() => () => stopSpeech(), []);

  // 浏览器语音列表异步就绪，隔一段时间再取一次
  useEffect(() => {
    const t = window.setTimeout(() => setVoices(engine.voices()), 600);
    return () => window.clearTimeout(t);
  }, []);

  if (!segments.length) return null;

  if (!state.supported) {
    return (
      <section className="card card--pad">
        <div className="row row--wrap" style={{ gap: 8 }}>
          <Tag tone="gold">🔊 朗读</Tag>
          <span className="small muted">
            这个浏览器不支持语音合成。手机上推荐 Chrome / Safari / Edge；桌面端若没有中文语音，
            可在系统里安装中文语音包后重试。
          </span>
        </div>
      </section>
    );
  }

  const current = state.index >= 0 ? segments[state.index] : undefined;
  const mine = state.segments.length === segments.length && state.segments[0]?.id === segments[0]?.id;

  return (
    <section className="card card--pad speech">
      <div className="row row--wrap" style={{ alignItems: 'center', gap: 8 }}>
        <Tag tone="blue">🔊 朗读</Tag>

        {state.speaking && mine ? (
          <>
            <button className="btn btn--sm" onClick={state.paused ? resumeSpeech : pauseSpeech}>
              {state.paused ? '▶ 继续' : '⏸ 暂停'}
            </button>
            <button className="btn btn--sm" onClick={stopSpeech}>
              ⏹ 停止
            </button>
          </>
        ) : (
          <button className="btn btn--sm btn--primary" onClick={() => speak(segments)}>
            ▶ {title}（{segments.length} 段）
          </button>
        )}

        <span className="small muted" style={{ minWidth: 0 }}>
          {state.speaking && mine && current
            ? `正在读：${current.label ?? `${state.index + 1} / ${segments.length}`}`
            : '点任意句子前的 🔊 可以只读那一句'}
        </span>

        <span className="spacer" />
        <button className="btn btn--sm" onClick={() => setOpen((o) => !o)}>
          ⚙️ 语速 {state.rate.toFixed(1)}×
        </button>
      </div>

      {open ? (
        <div className="stack stack--sm" style={{ marginTop: 12 }}>
          <div className="row row--wrap" style={{ gap: 6, alignItems: 'center' }}>
            <span className="small muted">语速</span>
            {RATE_STEPS.map((r) => (
              <button
                key={r}
                className={cn('chip chip--sm', state.rate === r && 'is-active')}
                onClick={() => setRate(r)}
              >
                {r.toFixed(1)}×
              </button>
            ))}
            <span className="small muted">（0.6× 慢速跟读，1.8× 快速过一遍）</span>
          </div>

          {voices.length > 1 ? (
            <div className="row row--wrap" style={{ gap: 6, alignItems: 'center' }}>
              <span className="small muted">音色</span>
              <button
                className={cn('chip chip--sm', !state.voiceURI && 'is-active')}
                onClick={() => setVoice('')}
              >
                系统默认
              </button>
              {voices.slice(0, 8).map((v) => (
                <button
                  key={v.uri}
                  className={cn('chip chip--sm', state.voiceURI === v.uri && 'is-active')}
                  onClick={() => setVoice(v.uri)}
                >
                  {v.name.replace(/\s*\(.*?\)\s*/g, ' ').slice(0, 14)}
                </button>
              ))}
            </div>
          ) : null}

          <div className="small muted">
            朗读用的是浏览器/系统自带的中文语音，**免费、无需密钥、断网也能用**。
          </div>
        </div>
      ) : null}
    </section>
  );
}

/** 句子/段落旁的小喇叭：只读这一段 */
export function SpeakButton({
  text,
  label,
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const state = useSpeechState();
  if (!state.supported || !text.trim()) return null;
  return (
    <button
      type="button"
      className={cn('speak-btn', className)}
      title={label ? `朗读：${label}` : '朗读这一句'}
      aria-label={label ? `朗读${label}` : '朗读这一句'}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        speak([{ id: 'inline', text, label }]);
      }}
    >
      🔊
    </button>
  );
}
