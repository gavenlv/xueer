/**
 * 英语模拟卷详情：结构说明 + 一键进入**整卷计时考试**。
 *
 * 与历史那份试卷详情同一套思路，差别在于英语把**听说 30 分**单独说明——
 * 本应用没有音频文件，听说材料以脚本形式由浏览器语音朗读（见 `lib/entrySpeech.ts`），
 * 页面上要写清楚这一点，免得学生以为漏了听力文件。
 */

import { Link } from 'react-router-dom';
import type { EnglishPaperEntry } from '../../types';
import { Tag } from '../../components/common';
import { RichText } from '../../components/RichText';
import { DetailShell, Section } from './DetailShell';

export function EnglishPaperDetail({
  entry,
  moduleName,
}: {
  entry: EnglishPaperEntry;
  moduleName: string;
}) {
  const p = entry.data;
  const scoreSum = p.sections.reduce((n, s) => n + s.score, 0);
  const countSum = p.sections.reduce((n, s) => n + s.count, 0);

  return (
    <DetailShell
      entry={entry}
      subjectId="english"
      moduleName={moduleName}
      backTo="/s/english/eng-exam"
      subtitle={<span>{p.basis}</span>}
      tags={['模拟卷', '整卷计时', `笔试 ${p.totalScore} 分`, p.speakingScore ? `听说 ${p.speakingScore} 分` : '不含听说']}
    >
      <section className="card card--pad">
        <div className="row row--wrap" style={{ alignItems: 'center', gap: 10 }}>
          <Tag tone="gold">📝 整卷模拟</Tag>
          <span className="small muted">
            笔试 {p.totalScore} 分 · {p.duration} 分钟 · {countSum} 小题
            {p.speakingScore ? ` · 听说 ${p.speakingScore} 分` : ''}
          </span>
          <span className="spacer" />
          <Link className="btn btn--primary" to={`/exam-run/${p.id}`}>
            ▶ 开始整卷考试
          </Link>
        </div>
        <div className="small muted" style={{ marginTop: 10, lineHeight: 1.8 }}>
          考试模式下**做完全卷才批改**：中途不给答案，可以随时返回修改；交卷后逐题给出正误、解析与得分，
          选择题自动判分、填空题按拼写比对、书面表达给出参考范文后自评，错题照常进入错题本。
        </div>
      </section>

      <Section title="试卷结构" icon="📋" extra={<Tag tone="jade">按 2027—2029 广州中考英语结构</Tag>}>
        <div className="table-wrap">
          <table className="table history-table">
            <thead>
              <tr>
                <th>部分</th>
                <th>题量</th>
                <th>分值</th>
              </tr>
            </thead>
            <tbody>
              {p.sections.map((s) => (
                <tr key={s.name}>
                  <td className="history-table__item">{s.name}</td>
                  <td>{s.count} 小题</td>
                  <td>{s.score} 分</td>
                </tr>
              ))}
              <tr>
                <td className="history-table__item">笔试合计</td>
                <td>{countSum} 小题</td>
                <td>{scoreSum} 分</td>
              </tr>
              {p.speakingScore ? (
                <tr>
                  <td className="history-table__item">听说考试（另考）</td>
                  <td>14 小题</td>
                  <td>{p.speakingScore} 分</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="small muted" style={{ marginTop: 10, lineHeight: 1.85 }}>
          依据：{p.basis}
          {p.speakingScore
            ? ' 听说部分（模仿朗读 8 分 + 信息获取 13 分 + 角色扮演 9 分）为另场考试，本卷只给出对应材料与训练说明。'
            : ''}
        </div>
      </Section>

      {p.listening?.length ? (
        <Section
          title={`听说材料（${p.listening.length} 段）`}
          icon="🎧"
          extra={<Tag tone="jade">本应用不提供音频文件</Tag>}
        >
          <div className="small muted" style={{ marginBottom: 10, lineHeight: 1.85 }}>
            说明：应用不附带音频，听说材料以脚本呈现，**用页面顶部朗读条的浏览器语音读出来当听力音频**
            （点每段标题旁的 🔊 只读该段）；模仿朗读另给重音与连读提示，可跟着朗读条跟读。
          </div>
          <div className="stack stack--lg">
            {p.listening.map((s, i) => (
              <div key={i}>
                <div style={{ fontWeight: 700 }}>{s.title}</div>
                <div className="en-passage" style={{ marginTop: 6 }}>
                  {s.text
                    .split(/\n+/)
                    .filter((x) => x.trim())
                    .map((x, k) => (
                      <p key={k}>{x}</p>
                    ))}
                </div>
                {s.cues?.length ? (
                  <ul style={{ marginTop: 6 }}>
                    {s.cues.map((c, k) => (
                      <li key={k} className="small muted">
                        {c}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {p.writing ? (
        <Section title="书面表达（20 分）" icon="✍️">
          <div className="explain" style={{ marginTop: 0 }}>
            <div className="explain__title">📌 题目要求</div>
            <div style={{ lineHeight: 1.9, whiteSpace: 'pre-line' }}>
              <RichText text={p.writing.topic} />
            </div>
          </div>
          {p.writing.requirements?.length ? (
            <div className="stack stack--sm" style={{ marginTop: 10 }}>
              {p.writing.requirements.map((r, i) => (
                <div className="note" key={i} style={{ display: 'block' }}>
                  <span className="note__word">{i + 1}</span>
                  <span className="note__text">{r}</span>
                </div>
              ))}
            </div>
          ) : null}
          <div className="row row--wrap" style={{ marginTop: 14 }}>
            <Link className="btn btn--primary" to={`/exam-run/${p.id}`}>
              ▶ 开始整卷考试（含书面表达）
            </Link>
            <Link className="btn" to={`/practice/${entry.moduleId}/${entry.id}`}>
              ✍️ 只做单题练习
            </Link>
          </div>
        </Section>
      ) : null}
    </DetailShell>
  );
}
