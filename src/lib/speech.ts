/**
 * 朗读引擎：用浏览器自带的 **Web Speech API（`speechSynthesis`）** 朗读页面内容。
 *
 * ## 为什么用浏览器内置语音，而不是「调用外部免费 TTS 接口」
 *
 * - **不用密钥、不用配额、不花钱**：系统语音直接由操作系统提供，手机上是系统中文语音（讯飞/苹果/微软），音质比多数免费在线接口还好。
 * - **离线可用**：这个应用本身是离线学习的（数据存 localStorage），如果朗读依赖外网，地铁里、断网时就用不了。
 * - **没有 CORS 与失效风险**：公开的免费在线 TTS 端点（如各类 `translate_tts` 风格接口）都属非官方用法，随时可能改签名或封 UA，而且浏览器直连普遍被 CORS 挡住，必须自建代理——那就不再「免费无依赖」了。
 *
 * 如果你的环境里确实没有可用中文语音（少数桌面 Linux），或者你想换成自己的在线接口，
 * 只需实现下面 `SpeechEngine` 这个接口并替换 `engine`——UI 与页面代码一行都不用改。
 *
 * ## 长文本的处理
 *
 * Chrome 对单条过长文本会中途停止，所以这里把文本按标点切成 ≤90 字的小块排队朗读，
 * 并支持暂停/继续/停止与语速调节。
 */

export interface SpeechSegment {
  /** 稳定标识，用于高亮「正在读哪一段」 */
  id: string;
  /** 朗读文本 */
  text: string;
  /** 界面上显示的名字，如「原文·第 2 句」 */
  label?: string;
}

export interface SpeechState {
  /** 是否正在朗读 */
  speaking: boolean;
  paused: boolean;
  /** 当前段落下标 */
  index: number;
  segments: SpeechSegment[];
  rate: number;
  voiceURI: string;
  supported: boolean;
}

/** 可替换的引擎接口：想接在线 TTS 就实现它 */
export interface SpeechEngine {
  supported(): boolean;
  voices(): { uri: string; name: string; lang: string }[];
  speak(segments: SpeechSegment[], opts: { rate: number; voiceURI: string; onTick: (i: number) => void; onEnd: () => void }): void;
  pause(): void;
  resume(): void;
  stop(): void;
}

const CHUNK_MAX = 90;

/** 把长句按标点切成小块，避免浏览器中途停止 */
export function chunkText(text: string): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  if (clean.length <= CHUNK_MAX) return [clean];

  const out: string[] = [];
  let buf = '';
  // 在标点处断开；没有标点的长串（如整句译文）也按长度硬切
  for (const ch of clean) {
    buf += ch;
    const isBreak = /[，。！？；：、,.!?;:]/.test(ch);
    if (buf.length >= CHUNK_MAX || (isBreak && buf.length >= 24)) {
      out.push(buf.trim());
      buf = '';
    }
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

const RATE_KEY = 'xueer.speech.rate';
const VOICE_KEY = 'xueer.speech.voice';

function readNum(key: string, fallback: number): number {
  try {
    const v = Number(localStorage.getItem(key));
    return Number.isFinite(v) && v > 0 ? v : fallback;
  } catch {
    return fallback;
  }
}

function readStr(key: string): string {
  try {
    return localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* 隐私模式下写不进去也无所谓 */
  }
}

/* ------------------------------ 浏览器内置引擎 ------------------------------ */

/**
 * 朗读轮次令牌：每轮 speak / stop 都会递增。
 * 旧版用「播完一块靠 onend 再入队下一块」的链式推进，在手机浏览器上
 * onend/onerror 触发时序不可靠（延迟、丢失、重复），会读乱顺序甚至叠音。
 * 现改为**一次性把所有块全量入队**：顺序由浏览器语音队列（FIFO）保证，
 * 回调只负责同步高亮与结束通知，不再驱动播放流程。
 */
let speakToken = 0;

const browserEngine: SpeechEngine = {
  supported: () => typeof window !== 'undefined' && 'speechSynthesis' in window,
  voices: () => {
    if (!browserEngine.supported()) return [];
    return window.speechSynthesis
      .getVoices()
      .filter((v) => /^zh|Chinese|中文|普通话/i.test(`${v.lang} ${v.name}`))
      .map((v) => ({ uri: v.voiceURI, name: v.name, lang: v.lang }));
  },
  speak(segments, { rate, voiceURI, onTick, onEnd }) {
    const synth = window.speechSynthesis;
    synth.resume(); // Chromium：paused 状态下 cancel() 不生效，先解除暂停再清队列
    synth.cancel();
    const token = ++speakToken;

    const voice = synth.getVoices().find((v) => v.voiceURI === voiceURI);

    // 展开全部块：段 -> 块，并记录每块属于第几段（高亮「正在读哪一段」用）
    type QItem = { text: string; segIndex: number };
    const queue: QItem[] = [];
    segments.forEach((seg, i) => {
      for (const text of chunkText(seg.text)) queue.push({ text, segIndex: i });
    });

    // Chrome 桌面版对过长的语音队列会在 ~15 秒后自动暂停（历史 bug），
    // 定期 resume() 解锁，读多长的文本都不会卡住；token 变化后自清
    const heartbeat = window.setInterval(() => {
      if (token !== speakToken) {
        window.clearInterval(heartbeat);
        return;
      }
      synth.resume();
    }, 8000);

    queue.forEach((item, qi) => {
      const u = new SpeechSynthesisUtterance(item.text);
      u.lang = voice?.lang ?? 'zh-CN';
      if (voice) u.voice = voice;
      u.rate = rate;
      u.pitch = 1;
      u.onstart = () => {
        if (token !== speakToken) return;
        onTick(item.segIndex);
      };
      u.onend = () => {
        // cancel 引起的 onend 直接忽略（token 已变），不触发结束通知
        if (token !== speakToken) return;
        if (qi === queue.length - 1) {
          window.clearInterval(heartbeat);
          onEnd();
        }
      };
      // 单块失败（网络语音抖动等）只跳过这一块，队列其余部分由浏览器继续，
      // 不再人工推进——避免打乱顺序
      u.onerror = () => {
        if (token !== speakToken) return;
        if (qi === queue.length - 1) {
          window.clearInterval(heartbeat);
          onEnd();
        }
      };
      synth.speak(u);
    });
  },
  pause: () => window.speechSynthesis.pause(),
  resume: () => window.speechSynthesis.resume(),
  stop: () => {
    const token = ++speakToken; // 作废所有旧回调与心跳
    const synth = window.speechSynthesis;
    synth.resume(); // paused 状态下 cancel 不生效（Chromium），先解除暂停
    synth.cancel();
    // 部分安卓机型 cancel 延迟生效，稍后再补一刀；若期间开启了新一轮朗读则不补
    window.setTimeout(() => {
      if (token === speakToken) synth.cancel();
    }, 200);
  },
};

/** 当前引擎（想换在线 TTS 就替换这一个常量） */
export const engine: SpeechEngine = browserEngine;

/* -------------------------------- 状态与订阅 -------------------------------- */

let state: SpeechState = {
  speaking: false,
  paused: false,
  index: -1,
  segments: [],
  rate: readNum(RATE_KEY, 1),
  voiceURI: readStr(VOICE_KEY),
  supported: false,
};

const listeners = new Set<() => void>();

function emit(): void {
  for (const l of listeners) l();
}

function setState(patch: Partial<SpeechState>): void {
  state = { ...state, ...patch };
  emit();
}

export function getSpeechState(): SpeechState {
  if (!state.supported) state = { ...state, supported: engine.supported() };
  return state;
}

export function subscribeSpeech(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** 初始化：浏览器加载语音列表是异步的，这里在就绪后再广播一次 */
export function initSpeech(): () => void {
  if (!engine.supported()) return () => {};
  const onVoices = () => emit();
  window.speechSynthesis.addEventListener?.('voiceschanged', onVoices);
  return () => window.speechSynthesis.removeEventListener?.('voiceschanged', onVoices);
}

/** 挂起的「稍后开始朗读」定时器：停止时要一并作废，否则停了 60ms 后又会开读 */
let startTimer: number | undefined;

/** 开始朗读一组段落 */
export function speak(segments: SpeechSegment[]): void {
  if (!engine.supported() || !segments.length) return;
  const start = () => {
    engine.speak(segments, {
      rate: state.rate,
      voiceURI: state.voiceURI,
      onTick: (index) => setState({ index }),
      onEnd: () => setState({ speaking: false, paused: false, index: -1 }),
    });
    setState({ speaking: true, paused: false, index: 0, segments });
  };
  // 清掉上一轮再开始，避免两条语音叠在一起
  engine.stop();
  window.clearTimeout(startTimer);
  startTimer = window.setTimeout(start, 60);
}

/** 朗读单段（不影响「整页朗读」的队列） */
export function speakOne(text: string, label = ''): void {
  speak([{ id: 'one', text, label }]);
}

export function pauseSpeech(): void {
  if (!state.speaking) return;
  engine.pause();
  setState({ paused: true });
}

export function resumeSpeech(): void {
  if (!state.speaking) return;
  engine.resume();
  setState({ paused: false });
}

export function stopSpeech(): void {
  window.clearTimeout(startTimer);
  engine.stop();
  setState({ speaking: false, paused: false, index: -1, segments: [] });
}

export function setRate(rate: number): void {
  write(RATE_KEY, String(rate));
  window.clearTimeout(startTimer); // 若正处于「60ms 后开读」的窗口，取消旧启动
  const wasSpeaking = state.speaking;
  const segments = state.segments;
  const index = state.index;
  setState({ rate });
  // 语速要在下次发音时才生效；为了立刻听到效果，正在朗读时从当前段重播
  if (wasSpeaking && segments.length && index >= 0) {
    engine.stop();
    const rest = segments.slice(index);
    engine.speak(rest, {
      rate,
      voiceURI: state.voiceURI,
      onTick: (i) => setState({ index: index + i }),
      onEnd: () => setState({ speaking: false, paused: false, index: -1 }),
    });
    setState({ speaking: true, paused: false });
  }
}

export function setVoice(voiceURI: string): void {
  write(VOICE_KEY, voiceURI);
  setState({ voiceURI });
}

/** 语速的可选档位 */
export const RATE_STEPS = [0.6, 0.8, 1, 1.2, 1.5, 1.8] as const;
