/* SQLCraft — cheat sheet renderer */

function renderCheatSheet() {
  const grid = document.getElementById('cheat-grid');
  if (!grid || grid.innerHTML.trim()) return;

  const cards = [
    {
      title: 'Query anatomy',
      icon: '🗂',
      color: 'var(--accent)',
      groups: [
        { label: 'Execution order (mental model)', tags: [
          {t:'FROM / JOIN', c:'hl'},{t:'WHERE', c:'hl'},{t:'GROUP BY', c:'hl'},
          {t:'HAVING', c:'hl'},{t:'SELECT', c:'hl'},{t:'ORDER BY', c:'hl'},{t:'LIMIT', c:'hl'}
        ]},
        { label: 'Filtering operators', tags: [
          {t:'='},{t:'!='},{t:'>'},{t:'<'},{t:'>='},{t:'<='},{t:'AND'},{t:'OR'},{t:'NOT'},
          {t:'IN (a,b,c)'},{t:'BETWEEN x AND y'},{t:'IS NULL'},{t:'IS NOT NULL'},{t:'LIKE'},{t:'ILIKE'}
        ]},
        { snippet: `<span class="kw">SELECT</span> name, salary
<span class="kw">FROM</span>   employees
<span class="kw">WHERE</span>  department = 'Sales'
  <span class="kw">AND</span>  salary <span class="kw">BETWEEN</span> 60000 <span class="kw">AND</span> 90000
<span class="kw">ORDER BY</span> salary <span class="kw">DESC</span>
<span class="kw">LIMIT</span>  10;` }
      ]
    },
    {
      title: 'Aggregate functions',
      icon: '∑',
      color: 'var(--green)',
      groups: [
        { label: 'Core aggregates', tags: [
          {t:'COUNT(*)',c:'green'},{t:'COUNT(col)',c:'green'},{t:'COUNT(DISTINCT col)',c:'green'},
          {t:'SUM(col)',c:'green'},{t:'AVG(col)',c:'green'},{t:'MIN(col)',c:'green'},{t:'MAX(col)',c:'green'}
        ]},
        { label: 'Used with', tags: [{t:'GROUP BY'},{t:'HAVING'},{t:'DISTINCT'},{t:'ROUND(n,2)'}]},
        { label: 'Key difference', tip: 'COUNT(*) counts all rows including NULLs. COUNT(col) skips NULLs. Always clarify which you mean.' },
        { snippet: `<span class="kw">SELECT</span> department,
  <span class="fn">COUNT</span>(*) <span class="kw">AS</span> headcount,
  <span class="fn">ROUND</span>(<span class="fn">AVG</span>(salary), 2) <span class="kw">AS</span> avg_sal,
  <span class="fn">MAX</span>(salary) <span class="kw">AS</span> top_sal
<span class="kw">FROM</span> employees
<span class="kw">GROUP BY</span> department
<span class="kw">HAVING</span> <span class="fn">COUNT</span>(*) > 2;` }
      ]
    },
    {
      title: 'String functions',
      icon: 'Aa',
      color: 'var(--amber)',
      groups: [
        { label: 'Manipulation', tags: [
          {t:'CONCAT(a,b)',c:'amber'},{t:'UPPER(s)'},{t:'LOWER(s)'},{t:'LENGTH(s)'},
          {t:'TRIM(s)'},{t:'LTRIM(s)'},{t:'RTRIM(s)'},{t:'REPLACE(s,old,new)'},
          {t:'SUBSTRING(s,pos,len)'},{t:'LEFT(s,n)'},{t:'RIGHT(s,n)'},{t:'REVERSE(s)'}
        ]},
        { label: 'Pattern matching', tags: [
          {t:"LIKE '%word%'"},{t:"LIKE 'a_c'"},{t:'ILIKE (case-insensitive)'},{t:'NOT LIKE'}
        ]},
        { snippet: `<span class="kw">SELECT</span>
  <span class="fn">CONCAT</span>(first_name,' ',last_name) <span class="kw">AS</span> full_name,
  <span class="fn">UPPER</span>(email),
  <span class="fn">LENGTH</span>(phone) <span class="kw">AS</span> phone_len
<span class="kw">FROM</span> customers
<span class="kw">WHERE</span> email <span class="kw">LIKE</span> '%@gmail.com';` }
      ]
    },
    {
      title: 'Date functions',
      icon: '📅',
      color: 'var(--red)',
      groups: [
        { label: 'Extract parts', tags: [
          {t:'YEAR(d)',c:'red'},{t:'MONTH(d)',c:'red'},{t:'DAY(d)',c:'red'},{t:'QUARTER(d)',c:'red'},
          {t:'WEEK(d)'},{t:'DAYOFWEEK(d)'},{t:"DATE_FORMAT(d,'%Y-%m')"}
        ]},
        { label: 'Calculate', tags: [
          {t:'DATEDIFF(a,b)'},{t:'DATE_ADD(d, INTERVAL n DAY)'},{t:'DATE_SUB(d, INTERVAL n MONTH)'},
          {t:'NOW()'},{t:'CURDATE()'},{t:'DATE_TRUNC(part,d)'}
        ]},
        { snippet: `<span class="kw">SELECT</span>
  <span class="fn">YEAR</span>(order_date) <span class="kw">AS</span> yr,
  <span class="fn">MONTH</span>(order_date) <span class="kw">AS</span> mo,
  <span class="fn">COUNT</span>(*) <span class="kw">AS</span> orders,
  <span class="fn">DATEDIFF</span>(<span class="fn">NOW</span>(), order_date) <span class="kw">AS</span> days_ago
<span class="kw">FROM</span> orders
<span class="kw">GROUP BY</span> yr, mo
<span class="kw">ORDER BY</span> yr <span class="kw">DESC</span>, mo <span class="kw">DESC</span>;` }
      ]
    },
    {
      title: 'JOINs',
      icon: '⟵⟶',
      color: 'var(--accent)',
      groups: [
        { label: 'Join types', tags: [
          {t:'INNER JOIN',c:'hl'},{t:'LEFT JOIN',c:'hl'},{t:'RIGHT JOIN'},{t:'FULL OUTER JOIN'},
          {t:'CROSS JOIN'},{t:'SELF JOIN'}
        ]},
        { label: 'Common patterns', tags: [
          {t:'ON a.id = b.a_id'},{t:'ON a.x = b.x AND a.y = b.y'},{t:'WHERE b.id IS NULL  ← anti-join'}
        ]},
        { label: 'Mental model', tip: 'LEFT JOIN = keep ALL left rows, fill right with NULL where no match. Use WHERE right.id IS NULL to find unmatched rows.' },
        { snippet: `<span class="cm">-- customers with no orders (anti-join)</span>
<span class="kw">SELECT</span> c.name
<span class="kw">FROM</span>   customers c
<span class="kw">LEFT JOIN</span> orders o <span class="kw">ON</span> c.id = o.customer_id
<span class="kw">WHERE</span>  o.id <span class="kw">IS NULL</span>;` }
      ]
    },
    {
      title: 'CASE WHEN',
      icon: 'if',
      color: 'var(--amber)',
      groups: [
        { label: 'Syntax', tags: [
          {t:'CASE WHEN ... THEN ...',c:'amber'},{t:'ELSE ...'},{t:'END'},{t:'END AS alias'}
        ]},
        { label: 'Use cases', tags: [
          {t:'Bucket values'},{t:'Conditional aggregate'},{t:'Flag rows'},{t:'Replace NULLs'}
        ]},
        { snippet: `<span class="kw">SELECT</span> name, salary,
  <span class="kw">CASE</span>
    <span class="kw">WHEN</span> salary < 70000 <span class="kw">THEN</span> 'Junior'
    <span class="kw">WHEN</span> salary < 95000 <span class="kw">THEN</span> 'Mid'
    <span class="kw">ELSE</span> 'Senior'
  <span class="kw">END</span> <span class="kw">AS</span> band,
  <span class="fn">SUM</span>(<span class="kw">CASE WHEN</span> status='won' <span class="kw">THEN</span> 1 <span class="kw">ELSE</span> 0 <span class="kw">END</span>) <span class="kw">AS</span> wins
<span class="kw">FROM</span> employees;` }
      ]
    },
    {
      title: 'Subqueries',
      icon: '{ }',
      color: 'var(--green)',
      groups: [
        { label: 'Where to nest', tags: [
          {t:'IN WHERE clause',c:'green'},{t:'IN FROM (inline view)'},{t:'IN SELECT (scalar)'}
        ]},
        { label: 'Correlated vs independent', tip: 'Independent: runs once. Correlated: re-runs for every row in the outer query — use with care on large tables.' },
        { snippet: `<span class="cm">-- correlated: sales above that region avg</span>
<span class="kw">SELECT</span> region, amount
<span class="kw">FROM</span>   sales s1
<span class="kw">WHERE</span>  amount > (
  <span class="kw">SELECT</span> <span class="fn">AVG</span>(amount)
  <span class="kw">FROM</span>   sales s2
  <span class="kw">WHERE</span>  s2.region = s1.region
);` }
      ]
    },
    {
      title: 'CTEs',
      icon: 'WITH',
      color: 'var(--accent)',
      groups: [
        { label: 'Why CTEs beat nested subqueries', tip: 'Named, readable, reusable in the same query. Debug one CTE at a time by running it in isolation.' },
        { label: 'Key patterns', tags: [
          {t:'WITH name AS (...)',c:'hl'},{t:'Chain multiple CTEs'},{t:'Reference CTE like a table'},{t:'Recursive CTE (hierarchies)'}
        ]},
        { snippet: `<span class="kw">WITH</span> monthly <span class="kw">AS</span> (
  <span class="kw">SELECT</span> <span class="fn">DATE_TRUNC</span>('month', sale_date) <span class="kw">AS</span> mo,
         <span class="fn">SUM</span>(amount) <span class="kw">AS</span> total
  <span class="kw">FROM</span>   sales
  <span class="kw">GROUP BY</span> mo
),
ranked <span class="kw">AS</span> (
  <span class="kw">SELECT</span> *, <span class="fn">RANK</span>() <span class="kw">OVER</span> (<span class="kw">ORDER BY</span> total <span class="kw">DESC</span>) <span class="kw">AS</span> rk
  <span class="kw">FROM</span>   monthly
)
<span class="kw">SELECT</span> * <span class="kw">FROM</span> ranked <span class="kw">WHERE</span> rk <= 3;` }
      ]
    },
    {
      title: 'Window functions',
      icon: '⊞',
      color: 'var(--red)',
      groups: [
        { label: 'Ranking', tags: [
          {t:'ROW_NUMBER()',c:'red'},{t:'RANK()'},{t:'DENSE_RANK()'},{t:'NTILE(n)'}
        ]},
        { label: 'Value access', tags: [
          {t:'LAG(col, n)'},{t:'LEAD(col, n)'},{t:'FIRST_VALUE(col)'},{t:'LAST_VALUE(col)'}
        ]},
        { label: 'Aggregates over window', tags: [
          {t:'SUM() OVER (...)'},{t:'AVG() OVER (...)'},{t:'COUNT() OVER (...)'}
        ]},
        { snippet: `<span class="cm">-- top sale per region + running total</span>
<span class="kw">SELECT</span> region, amount, sale_date,
  <span class="fn">RANK</span>() <span class="kw">OVER</span> (
    <span class="kw">PARTITION BY</span> region
    <span class="kw">ORDER BY</span> amount <span class="kw">DESC</span>
  ) <span class="kw">AS</span> rnk,
  <span class="fn">SUM</span>(amount) <span class="kw">OVER</span> (
    <span class="kw">ORDER BY</span> sale_date
  ) <span class="kw">AS</span> running_total
<span class="kw">FROM</span> sales;` }
      ]
    },
    {
      title: 'Cleaning & NULLs',
      icon: '✦',
      color: 'var(--green)',
      groups: [
        { label: 'NULL handling', tags: [
          {t:'COALESCE(a,b,c)',c:'green'},{t:'IFNULL(val,default)'},{t:'NULLIF(a,b)'},
          {t:'IS NULL'},{t:'IS NOT NULL'}
        ]},
        { label: 'Type casting', tags: [
          {t:'CAST(col AS INT)'},{t:'CAST(col AS DECIMAL(10,2))'},{t:'CAST(col AS VARCHAR)'}
        ]},
        { label: 'Set operations', tags: [
          {t:'UNION ALL'},{t:'UNION (deduped)'},{t:'INTERSECT'},{t:'EXCEPT / MINUS'}
        ]},
        { snippet: `<span class="cm">-- safe division, replace NULL with 0</span>
<span class="kw">SELECT</span>
  <span class="fn">COALESCE</span>(revenue, 0) <span class="kw">AS</span> revenue,
  <span class="fn">NULLIF</span>(target, 0) <span class="kw">AS</span> safe_target,
  revenue / <span class="fn">NULLIF</span>(target, 0) <span class="kw">AS</span> attainment
<span class="kw">FROM</span> performance;` }
      ]
    },
    {
      title: 'Performance tips',
      icon: '⚡',
      color: 'var(--amber)',
      groups: [
        { label: 'What slows queries down', tags: [
          {t:'SELECT * on large tables',c:'red'},{t:'No index on JOIN/WHERE cols',c:'red'},
          {t:'Correlated subquery on big table',c:'red'},{t:'Functions on indexed columns',c:'red'}
        ]},
        { label: 'What speeds them up', tags: [
          {t:'SELECT only needed cols',c:'green'},{t:'Filter early with WHERE',c:'green'},
          {t:'Index JOIN and WHERE columns',c:'green'},{t:'Use CTEs to cache results',c:'green'}
        ]},
        { label: 'Diagnose with', tags: [
          {t:'EXPLAIN'},{t:'EXPLAIN ANALYZE'},{t:'Query plan (Seq Scan vs Index Scan)'}
        ]}
      ]
    },
    {
      title: 'Advanced patterns',
      icon: '🧠',
      color: 'var(--accent)',
      groups: [
        { label: 'Must-know interview patterns', tags: [
          {t:'Top N per group',c:'hl'},{t:'Running total'},{t:'Month-over-month change'},
          {t:'Retention cohort'},{t:'Self join comparison'},{t:'Pivot with CASE WHEN'},
          {t:'Cumulative distribution'},{t:'Gap & island detection'}
        ]},
        { snippet: `<span class="cm">-- top N per group (classic interview Q)</span>
<span class="kw">WITH</span> ranked <span class="kw">AS</span> (
  <span class="kw">SELECT</span> *,
    <span class="fn">ROW_NUMBER</span>() <span class="kw">OVER</span> (
      <span class="kw">PARTITION BY</span> category
      <span class="kw">ORDER BY</span> revenue <span class="kw">DESC</span>
    ) <span class="kw">AS</span> rn
  <span class="kw">FROM</span> products
)
<span class="kw">SELECT</span> * <span class="kw">FROM</span> ranked <span class="kw">WHERE</span> rn <= 3;` }
      ]
    },
  ];

  grid.innerHTML = cards.map(card => {
    const bodyHtml = card.groups.map(g => {
      let html = '<div class="cheat-group">';
      if (g.label) html += `<div class="cheat-group-label">${g.label}</div>`;
      if (g.tags) {
        html += '<div class="cheat-items">';
        html += g.tags.map(t => `<span class="cheat-tag${t.c?' '+t.c:''}">${t.t}</span>`).join('');
        html += '</div>';
      }
      if (g.tip) html += `<div class="cheat-tip">${g.tip}</div>`;
      if (g.snippet) {
        const escaped = g.snippet;
        html += `<pre class="cheat-snippet">${escaped}</pre>`;
        html += `<button class="cheat-copy-btn" onclick="copySnippet(this)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          Copy
        </button>`;
      }
      html += '</div>';
      return html;
    }).join('');

    return `<div class="cheat-card">
      <div class="cheat-card-head">
        <div class="cheat-icon" style="background:rgba(255,255,255,0.05);color:${card.color};font-family:var(--mono);font-size:14px;font-weight:700">${card.icon}</div>
        <div class="cheat-card-title" style="color:${card.color}">${card.title}</div>
      </div>
      <div class="cheat-card-body">${bodyHtml}</div>
    </div>`;
  }).join('');
}

function copySnippet(btn) {
  const pre = btn.previousElementSibling;
  navigator.clipboard.writeText(pre.innerText).then(() => {
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy';
    }, 1500);
  });
}


// ── Drag-to-resize splitter ──────────────────────────────────────────────────