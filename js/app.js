let ports = []
let rules = JSON.parse(localStorage.getItem('portsignal-rules') || '[]')

async function load() {
  ports = await (await fetch('data/ports.json')).json()
  renderPorts()
  renderRules()
}

function renderPorts(q = '') {
  const query = q.toLowerCase()
  const filtered = ports.filter((p) =>
    !query || String(p.port).includes(query) ||
    p.service.toLowerCase().includes(query) ||
    p.risk.includes(query) || p.note.toLowerCase().includes(query)
  )
  document.getElementById('port-table').innerHTML = filtered.map((p) => `
    <tr style="cursor:pointer" data-port="${p.port}">
      <td><strong>${p.port}</strong></td>
      <td>${p.proto}</td>
      <td>${p.service}</td>
      <td class="risk-${p.risk}">${p.risk}</td>
      <td>${p.note}</td>
    </tr>`).join('')
  document.querySelectorAll('[data-port]').forEach((row) => {
    row.addEventListener('click', () => {
      document.getElementById('rule-port').value = row.dataset.port
    })
  })
}

function renderRules() {
  document.getElementById('rule-list').innerHTML = rules.map((r, i) => `
    <li style="padding:.4rem 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between">
      <span>${r.action} ${r.src} → ${r.dst}:${r.port} <em>${r.name}</em></span>
      <button data-rm="${i}" style="background:none;border:none;color:var(--muted);cursor:pointer">×</button>
    </li>`).join('') || '<li style="color:var(--muted)">No rules yet</li>'
  document.querySelectorAll('[data-rm]').forEach((btn) => {
    btn.addEventListener('click', () => {
      rules.splice(Number(btn.dataset.rm), 1)
      localStorage.setItem('portsignal-rules', JSON.stringify(rules))
      renderRules()
    })
  })
}

document.getElementById('search').addEventListener('input', (e) => renderPorts(e.target.value))

document.getElementById('btn-add-rule').addEventListener('click', () => {
  const name = document.getElementById('rule-name').value.trim()
  const port = document.getElementById('rule-port').value
  if (!port) return
  rules.push({
    name: name || 'Unnamed rule',
    src: document.getElementById('rule-src').value || 'any',
    dst: document.getElementById('rule-dst').value || 'any',
    port,
    action: document.getElementById('rule-action').value,
  })
  localStorage.setItem('portsignal-rules', JSON.stringify(rules))
  renderRules()
})

document.getElementById('btn-export-rules').addEventListener('click', () => {
  const lines = rules.map((r, i) =>
    `# Rule ${i + 1}: ${r.name}\n${r.action.toUpperCase()} ${r.src} -> ${r.dst} PORT ${r.port}\n`
  )
  document.getElementById('rule-export').value = lines.join('\n') || 'No rules to export.'
})

load()
