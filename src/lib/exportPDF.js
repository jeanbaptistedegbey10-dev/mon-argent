import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const fmt = (n) => new Intl.NumberFormat('fr-FR').format(n)

export async function exportFinancialReport({ transactions, accounts, budgets, user, period }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageW = 210
  const pageH = 297
  const margin = 15
  const contentW = pageW - margin * 2
  let y = margin

  // ── Couleurs ──────────────────────────────────────────────
  const blue    = [37, 99, 235]
  const green   = [16, 185, 129]
  const red     = [239, 68, 68]
  const gray900 = [17, 24, 39]
  const gray600 = [75, 85, 99]
  const gray400 = [156, 163, 175]
  const gray100 = [243, 244, 246]
  const white   = [255, 255, 255]

  // ── Helpers ───────────────────────────────────────────────
  const setColor   = (rgb) => doc.setTextColor(...rgb)
  const setFill    = (rgb) => doc.setFillColor(...rgb)
  const setDraw    = (rgb) => doc.setDrawColor(...rgb)
  const setFont    = (size, style = 'normal') => {
    doc.setFontSize(size)
    doc.setFont('helvetica', style)
  }

  const drawRect = (x, yw, w, h, rgb, radius = 2) => {
    setFill(rgb)
    doc.roundedRect(x, yw, w, h, radius, radius, 'F')
  }

  const addText = (text, x, yw, options = {}) => {
    doc.text(text, x, yw, options)
  }

  const checkNewPage = (neededH = 20) => {
    if (y + neededH > pageH - margin) {
      doc.addPage()
      y = margin
      drawHeader()
    }
  }

  // ── Header de page ────────────────────────────────────────
  const drawHeader = () => {
    drawRect(0, 0, pageW, 18, blue)
    setFont(10, 'bold')
    setColor(white)
    addText('GÉRER MON ARGENT', margin, 11)
    setFont(8)
    addText('Rapport financier personnel', pageW - margin, 11, { align: 'right' })
  }

  // ── Page 1 : En-tête rapport ──────────────────────────────
  drawHeader()
  y = 28

  // Titre principal
  setFont(22, 'bold')
  setColor(gray900)
  addText('Rapport Financier', margin, y)
  y += 8

  setFont(10)
  setColor(gray400)
  const dateStr = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
  addText(`Généré le ${dateStr} · ${period}`, margin, y)
  y += 2

  // Ligne séparatrice
  setDraw(blue)
  doc.setLineWidth(0.5)
  doc.line(margin, y + 3, pageW - margin, y + 3)
  y += 10

  // ── KPI Cards ─────────────────────────────────────────────
  const totalIncome  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const savings      = totalIncome - totalExpense
  const savingsRate  = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : '0'
  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance), 0)

  const kpis = [
    { label: 'Solde total',    value: `${fmt(totalBalance)} F`,  color: blue },
    { label: 'Revenus',        value: `+${fmt(totalIncome)} F`,  color: green },
    { label: 'Dépenses',       value: `-${fmt(totalExpense)} F`, color: red },
    { label: "Taux d'epargne", value: `${savingsRate}%`,          color: blue },
  ]

  const cardW = (contentW - 9) / 4
  kpis.forEach((kpi, i) => {
    const x = margin + i * (cardW + 3)
    drawRect(x, y, cardW, 22, gray100, 3)
    setFont(7)
    setColor(gray600)
    addText(kpi.label, x + cardW / 2, y + 7, { align: 'center' })
    setFont(9, 'bold')
    setColor(kpi.color)
    addText(kpi.value, x + cardW / 2, y + 16, { align: 'center' })
  })
  y += 30

  // ── Section Comptes ───────────────────────────────────────
  checkNewPage(50)
  setFont(13, 'bold')
  setColor(gray900)
  addText('Mes comptes', margin, y)
  y += 8

  accounts.forEach(acc => {
    checkNewPage(14)
    drawRect(margin, y, contentW, 12, gray100, 2)

    setFont(9, 'bold')
    setColor(gray900)
    addText(acc.name, margin + 4, y + 8)

    setFont(8)
    setColor(gray400)
    addText(acc.type, margin + 55, y + 8)

    const bal = Number(acc.balance)
    setFont(9, 'bold')
    setColor(bal < 0 ? red : green)
    addText(`${fmt(Math.abs(bal))} FCFA`, pageW - margin - 4, y + 8, { align: 'right' })

    y += 14
  })
  y += 4

  // ── Section Budgets ───────────────────────────────────────
  if (budgets.length > 0) {
    checkNewPage(50)
    setFont(13, 'bold')
    setColor(gray900)
    addText('Budgets', margin, y)
    y += 8

    const spentByCat = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => { acc[t.cat] = (acc[t.cat] || 0) + Number(t.amount); return acc }, {})

    budgets.forEach(b => {
      checkNewPage(20)
      const spent  = spentByCat[b.name] || 0
      const pct    = b.limit > 0 ? Math.min(100, (spent / b.limit) * 100) : 0
      const over   = spent > b.limit
      const barColor = over ? red : pct >= 80 ? [245, 158, 11] : green

      setFont(9)
      setColor(gray900)
      addText(`${b.name}`, margin, y + 5)

      setFont(8)
      setColor(gray400)
      addText(`${fmt(spent)} / ${fmt(b.limit)} FCFA`, pageW - margin - 4, y + 5, { align: 'right' })

      // Barre de progression background
      drawRect(margin, y + 7, contentW, 4, gray100, 1)
      // Barre remplie
      if (pct > 0) drawRect(margin, y + 7, contentW * pct / 100, 4, barColor, 1)

      setFont(7)
      setColor(over ? red : gray400)
      addText(over ? `Dépassé de ${fmt(spent - b.limit)} FCFA` : `${Math.round(pct)}% utilisé`, margin, y + 16)

      y += 20
    })
    y += 4
  }

  // ── Section Transactions ──────────────────────────────────
  checkNewPage(30)
  setFont(13, 'bold')
  setColor(gray900)
  addText('Transactions récentes', margin, y)
  y += 8

  // En-tête tableau
  drawRect(margin, y, contentW, 8, blue, 2)
  setFont(8, 'bold')
  setColor(white)
  addText('Date',        margin + 4,           y + 5.5)
  addText('Libellé',     margin + 28,           y + 5.5)
  addText('Catégorie',   margin + 90,           y + 5.5)
  addText('Compte',      margin + 125,          y + 5.5)
  addText('Montant',     pageW - margin - 4,    y + 5.5, { align: 'right' })
  y += 10

  const recentTx = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 30)

  recentTx.forEach((tx, i) => {
    checkNewPage(10)
    if (i % 2 === 0) drawRect(margin, y, contentW, 8, [249, 250, 251], 1)

    const isIncome = tx.type === 'income'

    setFont(7.5)
    setColor(gray600)
    addText(new Date(tx.date + 'T00:00:00').toLocaleDateString('fr-FR'), margin + 4, y + 5.5)

    setColor(gray900)
    const name = tx.name.length > 28 ? tx.name.slice(0, 28) + '…' : tx.name
    addText(name, margin + 28, y + 5.5)

    setColor(gray400)
    addText(tx.cat, margin + 90, y + 5.5)
    addText(tx.account?.slice(0, 16) || '', margin + 125, y + 5.5)

    setFont(7.5, 'bold')
    setColor(isIncome ? green : red)
    addText(
      `${isIncome ? '+' : '-'}${fmt(tx.amount)} F`,
      pageW - margin - 4,
      y + 5.5,
      { align: 'right' }
    )
    y += 9
  })

  // ── Footer sur chaque page ────────────────────────────────
  const totalPages = doc.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    setDraw(gray100)
    doc.setLineWidth(0.3)
    doc.line(margin, pageH - 12, pageW - margin, pageH - 12)
    setFont(7)
    setColor(gray400)
    addText('Gérer mon argent — Rapport confidentiel', margin, pageH - 7)
    addText(`Page ${p} / ${totalPages}`, pageW - margin, pageH - 7, { align: 'right' })
    if (user?.name) addText(user.name, pageW / 2, pageH - 7, { align: 'center' })
  }

  // ── Sauvegarder ──────────────────────────────────────────
  const filename = `rapport-financier-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}