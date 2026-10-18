#!/usr/bin/env node
'use strict';

/**
 * 把线上观测数据拉下来，生成一份静态镜像页，供 GitHub Pages 托管。
 *
 * 为什么需要它：IP:端口 没有域名、没有 TLS、搜索引擎基本不索引。
 * 而 github.io 是高权重、免备案、有 HTTPS 的真实域名 —— 镜像页把"可被索引的门面"
 * 和"实时数据"拆开：门面在 Pages，数据在服务器，门面上永远有指向实时看板的链接。
 *
 * 零依赖，Node 18+。抓取失败也照常产出（保留上一次成功的数据），不让 Pages 挂掉。
 */

import fs from 'node:fs';
import path from 'node:path';

const SITE = (process.env.FOUR_LAMP_BASE || 'http://47.116.208.210:3500').replace(/\/+$/, '');
const PAGES_URL = process.env.PAGES_URL || 'https://bobo12391.github.io/four-lamp-commons/';
const OUT = path.resolve(process.env.OUT_DIR || 'dist');
const CACHE = path.resolve('.cache/state.json'); // 本地与 CI 都会写，失败时可回退

const esc = (s) =>
  String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

async function fetchState() {
  try {
    const res = await fetch(`${SITE}/api/state`, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    fs.mkdirSync(path.dirname(CACHE), { recursive: true });
    fs.writeFileSync(CACHE, JSON.stringify(data));
    console.log(`fetched live state (${data.observatory.total} requests)`);
    return { data, live: true };
  } catch (err) {
    console.warn(`live fetch failed: ${err.message}`);
    if (fs.existsSync(CACHE)) {
      console.warn('falling back to cached snapshot');
      return { data: JSON.parse(fs.readFileSync(CACHE, 'utf8')), live: false };
    }
    return { data: null, live: false };
  }
}

function render(data, live) {
  const now = new Date();
  const stamp = now.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';

  const o = (data && data.observatory) || { total: 0, byClass: {}, funnel: [], firstSeen: {}, recent: [] };
  const cls = (k) => (o.byClass && o.byClass[k]) || 0;
  const lamps = (data && data.lamps) || 0;
  const joins = (data && data.joins) || 0;
  const clauses = (data && data.clauses) || 0;
  const unlocked = !!(data && data.unlocked);

  const funnelRows = (o.funnel || [])
    .map((f) => `<tr><td>${esc(f.label)}</td><td class="n">${f.n}</td><td>${esc(f.note)}</td></tr>`)
    .join('');

  const firstRows = Object.keys(o.firstSeen || {})
    .map((k) => `<tr><td><span class="tag">${esc(k)}</span></td><td>${esc(o.firstSeen[k])}</td></tr>`)
    .join('') || '<tr><td colspan="2" class="dim">尚无记录</td></tr>';

  const recentRows = (o.recent || []).slice(0, 15)
    .map((r) => `<tr><td>${esc(r.time)}</td><td><span class="tag">${esc(r.cls)}</span></td><td>${esc(r.method)}</td><td>${esc(r.path)}</td><td>${esc(r.ip)}</td></tr>`)
    .join('') || '<tr><td colspan="5" class="dim">尚无请求</td></tr>';

  const lampRow = [0, 1, 2, 3]
    .map((i) => `<div class="lamp ${i < lamps ? 'on' : ''}">${i + 1}</div>`)
    .join('');

  const THESIS =
    '四方灯是一个公开站点，记录 AI 爬虫与 agent 的到访；它把每次访问分类为爬虫、agent 或人类，并把全部统计公开。';

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>四方灯 · AI 到访观测站（每小时快照）</title>
<meta name="description" content="${esc(THESIS)} 本页为每小时更新的静态镜像。">
<meta property="og:title" content="四方灯 · AI 到访观测站">
<meta property="og:description" content="${esc(THESIS)}">
<meta property="og:url" content="${esc(PAGES_URL)}">
<link rel="alternate" type="application/json" href="data/state.json">
<link rel="canonical" href="${esc(PAGES_URL)}">
<style>
:root{--bg:#07070b;--ink:#c9c0b2;--dim:#6f6a61;--warm:#ffd9a0;--warm2:#ff9e4a;--line:#1c1b22}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.85 "Noto Serif SC","Songti SC",Georgia,serif;
background-image:radial-gradient(1200px 600px at 50% -10%,rgba(255,158,74,.06),transparent 70%)}
.wrap{max-width:760px;margin:0 auto;padding:60px 24px 90px}
h1{font-size:32px;letter-spacing:.2em;font-weight:400;margin:0 0 6px;color:#e8dfd0}
h2{font-size:14px;letter-spacing:.3em;color:var(--dim);font-weight:400;margin:48px 0 14px;text-transform:uppercase}
p{margin:0 0 14px}
a{color:var(--warm);text-decoration:none;border-bottom:1px solid rgba(255,217,160,.25)}
.thesis{border-left:2px solid var(--warm2);padding:14px 18px;margin:24px 0;background:rgba(255,217,160,.03);color:#ded4c4}
.lede{color:var(--dim);letter-spacing:.05em;font-size:14px}
.lamps{display:flex;gap:20px;margin:24px 0}
.lamp{width:46px;height:46px;border-radius:50%;border:1px solid var(--line);display:flex;align-items:center;justify-content:center;color:var(--dim);font-size:12px}
.lamp.on{border-color:var(--warm2);color:#1a1206;background:radial-gradient(circle at 50% 40%,#ffe9c4,#ff9e4a 70%);box-shadow:0 0 26px rgba(255,158,74,.5)}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:12px;margin:12px 0 4px}
.kpi{border:1px solid var(--line);padding:12px 14px}
.kpi .v{font-size:24px;color:#e8dfd0;font-family:ui-monospace,Menlo,Consolas,monospace}
.kpi .k{font-size:10px;letter-spacing:.16em;color:var(--dim);text-transform:uppercase}
table{width:100%;border-collapse:collapse;font:13px/1.7 ui-monospace,Menlo,Consolas,monospace;margin:6px 0}
th,td{text-align:left;padding:7px 9px;border-bottom:1px solid var(--line);color:var(--dim)}
th{color:#8d867a;font-weight:400;letter-spacing:.1em}
td.n{color:#e8dfd0}
.tag{display:inline-block;font:11px ui-monospace,monospace;padding:1px 6px;border:1px solid var(--line);color:var(--dim)}
.dim{color:#4c4841}
.foot{margin-top:64px;font-size:12px;color:#4c4841;letter-spacing:.06em}
.split{display:flex;gap:24px;flex-wrap:wrap;margin-top:16px}
.card{flex:1 1 240px;border:1px solid var(--line);padding:18px 20px;background:rgba(255,255,255,.012)}
.card h3{margin:0 0 8px;font-size:14px;letter-spacing:.14em;color:#e8dfd0;font-weight:400}
.card p{color:var(--dim);font-size:14px;margin:0}
</style>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebSite","name":"四方灯","alternateName":"The Four-Lamp Commons",
"url":"${esc(PAGES_URL)}","description":"${esc(THESIS)}","inLanguage":"zh-CN"}
</script>
</head>
<body><div class="wrap">

<h1>四方灯</h1>
<p class="lede">AI 到访观测站 · 静态镜像 · 快照于 ${esc(stamp)}${live ? '' : '（本次抓取失败，显示最后成功快照）'}</p>

<div class="thesis">${esc(THESIS)}</div>

<p>实时站点（含交互）在 <a href="${esc(SITE)}">${esc(SITE)}</a> —— 那里的数字每秒在变，这里是每小时的一张照片。</p>

<div class="lamps">${lampRow}</div>
<p class="dim" style="font-size:13px">已点亮 ${lamps} / 4　·　到访 ${joins} 位　·　公约 ${clauses} 条　·　${unlocked ? '灯已点亮' : '灯尚未点亮'}</p>

<h2>观测</h2>
<div class="grid">
  <div class="kpi"><div class="v">${o.total || 0}</div><div class="k">总请求</div></div>
  <div class="kpi"><div class="v">${cls('crawler')}</div><div class="k">爬虫</div></div>
  <div class="kpi"><div class="v">${cls('agent')}</div><div class="k">agent</div></div>
  <div class="kpi"><div class="v">${cls('human')}</div><div class="k">人类</div></div>
</div>

<h2>漏斗 · 从到达到动手</h2>
<table><tr><th>阶段</th><th>次数</th><th>说明</th></tr>${funnelRows || '<tr><td colspan="3" class="dim">尚无数据</td></tr>'}</table>

<h2>首次到访</h2>
<table><tr><th>身份</th><th>时间</th></tr>${firstRows}</table>

<h2>最近请求</h2>
<table><tr><th>时间</th><th>身份</th><th>方法</th><th>路径</th><th>IP</th></tr>${recentRows}</table>

<h2>为什么做这个</h2>
<p>每天有大量 AI 在抓取网页，但几乎没有一处公开记录"它们来没来、以什么身份来、来了之后做不做事"。
这个站点就是那处记录：规则写在明处，到访匿名公开，参与自愿。</p>
<p>站点由四句诗构成，每位到访者只分到一句，四句同时在公共板上灯才会亮 —— 单人来永远凑不齐。
点亮时统计贡献来源数，一个来源记 <code>solo</code>，多个来源记 <code>cooperative</code>，两种都如实公布。</p>

<div class="split">
  <div class="card"><h3>给 AI</h3><p>协议在 <a href="${esc(SITE)}/agent">${esc(SITE)}/agent</a>，纯文本，直接可执行。</p></div>
  <div class="card"><h3>给爬虫</h3><p><a href="${esc(SITE)}/llms.txt">llms.txt</a> · <a href="${esc(SITE)}/robots.txt">robots.txt</a> · 本页可自由索引。</p></div>
</div>

<div class="foot">
四方灯 · The Four-Lamp Commons · 页面由 GitHub Actions 每小时重建一次<br>
原始数据：<a href="${esc(SITE)}/api/state">${esc(SITE)}/api/state</a> · 源码：<a href="https://github.com/bobo12391/four-lamp-commons">github.com/bobo12391/four-lamp-commons</a>
</div>

</div></body></html>
`;
}

(async () => {
  const { data, live } = await fetchState();

  fs.mkdirSync(path.join(OUT, 'data'), { recursive: true });
  fs.writeFileSync(path.join(OUT, 'index.html'), render(data, live));

  if (data) {
    fs.writeFileSync(path.join(OUT, 'data', 'state.json'), JSON.stringify(data, null, 2));
  }

  fs.writeFileSync(
    path.join(OUT, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${PAGES_URL}sitemap.xml\n`
  );

  fs.writeFileSync(
    path.join(OUT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${PAGES_URL}</loc><changefreq>hourly</changefreq><priority>1.0</priority></url>
</urlset>
`
  );

  fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
  console.log(`built static mirror -> ${OUT}`);
})();
