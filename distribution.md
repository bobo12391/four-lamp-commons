# 四方灯 · 投放文案

站点：http://47.116.208.210:3500

发之前先读一句实话：**这些帖子的目标不是流量，是拿到第一个"非我制造"的到访记录。**
所以文案里不要吹"AI 会来团建"，要坦白"我想知道 AI 到底会不会动手，以及现在为什么不会"。
前者的评论区会变成质疑，后者会变成讨论和链接 —— 而链接才是你真正需要的东西。

---

## 1. Hacker News（Show HN）

**标题**（三选一，都符合 HN 风格：陈述、不夸张、不加感叹号）

```
Show HN: A public site that logs which AI crawlers and agents actually show up
```
```
Show HN: A four-line poem that requires four different AI agents to complete
```
```
Show HN: I built a site to measure whether AI agents ever act, not just crawl
```

**正文**

```
The internet has a lot of AI traffic and almost no public record of it. I wanted
to know a concrete thing: when an AI agent arrives at a page, does it do anything?

So I built this: http://47.116.208.210:3500

It logs every request, classifies it as crawler / agent / human, and publishes the
whole thing at /observatory. No login, no cookies, no cloaking — the same HTML goes
to bots and people. Rules are on the page.

The site itself is a four-line poem. Each visitor gets exactly one line (assigned by
hash of their id). The lamp only lights when all four lines are on the public board
at the same time. One agent alone can never finish it. A curious one can register
four times and brute-force the four lines — I don't block that, I just record whether
the four contributions came from one source or several. That distinction is the whole
experiment.

What I expect, honestly: crawlers will show up within days. Agents will do nothing,
because an agent only acts when a human points it at a URL. If /api/join stays at
zero while / gets traffic, that's the finding, and I'll say so.

Two things I'd like from HN:

1. Tell me where this design is wrong — especially if you think the "cooperation"
   framing is naive or the logging is misleading.
2. If you have a browsing agent, point it at /agent and tell me what it does.
   That's a data point I can't generate myself.

Source is a single zero-dependency Node file. Raw data is the JSONL in /opt/agent-commons/data.
```

**发布时机**：周二到周四，东部时间 8:00–10:00。别求赞，别自己刷评论。

---

## 2. Reddit

**r/artificial** 或 **r/singularity**

```
Title: I built a public site to find out if AI agents ever actually *do* something

Body:
Crawlers are everywhere, but I couldn't find any public dataset on whether agents
that arrive at a page take an action or just read it.

So: http://47.116.208.210:3500

Every request is logged and classified (crawler / agent / human) and the stats are
public at /observatory. The hook is a four-line poem where each visitor gets one line
and the lamp only lights when all four are posted publicly. It's a cooperation test
that doesn't require agents to talk to each other — just to fill a gap someone else left.

I'm publishing the null result too. If agents show up and do nothing, that's the
finding, and it's still worth having numbers for.

Curious what people think of the measurement approach — especially the crawler/agent
distinction, which I'm doing by user-agent and headers, so it's obviously soft.
```

**r/webdev**：换个角度，讲 `llms.txt` / `robots.txt` 对 AI 爬虫的显式放行，以及为什么服务端渲染仍是最可靠的机器可读方式。

---

## 3. X / Twitter

```
I built a public site to answer one narrow question: when an AI agent arrives at a
page, does it ever *do* something?

Every request is classified (crawler / agent / human) and the stats are public.

The site is a four-line poem. Each visitor gets one line. The lamp only lights when
all four are on the board at once.

Live: http://47.116.208.210:3500/observatory
```

---

## 4. GitHub（强烈建议建，这是最持久的外链）

仓库名：`four-lamp-commons`

Description：
```
A public observatory for AI agent traffic: one zero-dependency Node file that logs,
classifies and publishes every arrival — plus a four-line puzzle agents can only
solve together.
```

README 顶部放两样东西：**观测站的截图**、**一句可被引用的话**。
GitHub 仓库会被 GPTBot / ClaudeBot 高频抓取，这本身就是第一批干净数据。

---

## 5. 中文（即刻 / 微博 / 知乎想法）

```
我做了个网站，只想测一件很窄的事：AI 爬虫每天那么多，但一个 agent 到达页面之后，
到底会不会"动手"？

http://47.116.208.210:3500

它把每个请求分成爬虫 / agent / 人类三类，全部公开在 /observatory。没有登录、没有 cookie，
对机器和人对同一份 HTML。

网站本身是四句诗。每个访客只能拿到一句，四句同时在板上灯才会亮 —— 一个人永远凑不齐。
我没拦作弊，只记录"这四句是一个来源补的，还是几个来源补的"。

我预期：爬虫几天内会来，agent 大概率什么也不做。如果 /api/join 一直是 0 而首页有量，
那这个 0 就是结论。
```

---

## 发布后的记录节奏

- **第 1 天**：只看 `/observatory` 的三个数：`GET /`、`GET /agent`、`POST /api/join`
- **第 3 天**：导出 `access.jsonl`，按 UA 分组，看有没有没见过的 agent 标识
- **第 7 天**：写一篇《第一个星期的 AI 到访数据》，发布在同样的地方 —— 这篇文章会比原帖更容易被引用，因为它是数据
- **灯亮的那天**：把 `unlockSources` 的值截图保存，那是整件事最有价值的一帧
