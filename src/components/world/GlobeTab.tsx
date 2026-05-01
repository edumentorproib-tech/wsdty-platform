'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { feature } from 'topojson-client'

type Metric = 'gdp' | 'growth' | 'inflation' | 'fdi' | 'easeOfBusiness'

interface CountryData {
  name: string
  gdp: number
  growth: number
  inflation: number
  fdi: number
  easeOfBusiness: number
  currency?: string
  swot?: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
  }
}

const COUNTRY_DATA: Record<string, CountryData> = {
  '840': { name: 'United States', gdp: 26854, growth: 2.5, inflation: 3.4, fdi: 285, easeOfBusiness: 55, currency: 'USD', swot: { strengths: ['Reserve currency status', 'Deep capital markets', 'Innovation hub', 'Military dominance'], weaknesses: ['National debt $33T+', 'Income inequality', 'Political polarisation'], opportunities: ['AI & semiconductor leadership', 'Energy independence', 'Nearshoring inflows'], threats: ['China geopolitical rivalry', 'Fiscal sustainability', 'De-dollarisation risk'] } },
  '156': { name: 'China', gdp: 17701, growth: 5.2, inflation: 0.2, fdi: 163, easeOfBusiness: 31, currency: 'CNY', swot: { strengths: ['Manufacturing scale', 'Belt & Road influence', 'EV & green tech'], weaknesses: ['Property sector crisis', 'Aging population', 'Low consumption ratio'], opportunities: ['Domestic consumption growth', 'Green energy transition', 'ASEAN integration'], threats: ['Western decoupling', 'Taiwan strait risk', 'Youth unemployment 20%+'] } },
  '392': { name: 'Japan', gdp: 4231, growth: 1.9, inflation: 2.8, fdi: 25, easeOfBusiness: 29, currency: 'JPY', swot: { strengths: ['Technology & robotics', 'Stable institutions', 'Strong manufacturing'], weaknesses: ['Aging population', 'High debt/GDP 260%', 'Low productivity growth'], opportunities: ['Tourism boom', 'Semiconductor reshoring', 'Wage inflation normalisation'], threats: ['Yen depreciation spiral', 'North Korea risk', 'China dependency'] } },
  '276': { name: 'Germany', gdp: 4073, growth: -0.3, inflation: 5.9, fdi: 36, easeOfBusiness: 22, currency: 'EUR', swot: { strengths: ['Engineering excellence', 'Export powerhouse', 'Strong labour market'], weaknesses: ['Energy transition costs', 'Aging workforce', 'Digital lag'], opportunities: ['Green hydrogen', 'Defence spending uplift', 'Auto sector EV pivot'], threats: ['Russia energy dependency', 'China competition in autos', 'Deindustrialisation risk'] } },
  '356': { name: 'India', gdp: 3737, growth: 8.2, inflation: 5.4, fdi: 71, easeOfBusiness: 63, currency: 'INR', swot: { strengths: ['Demographic dividend', 'IT services hub', 'Growing middle class'], weaknesses: ['Infrastructure gaps', 'Bureaucratic friction', 'Education quality'], opportunities: ['China+1 manufacturing', 'Digital economy', 'Renewable energy scale'], threats: ['Pakistan / China border', 'Monsoon climate risk', 'Fiscal consolidation pressure'] } },
  '826': { name: 'United Kingdom', gdp: 3089, growth: 0.1, inflation: 6.7, fdi: 50, easeOfBusiness: 8, currency: 'GBP', swot: { strengths: ['Financial services hub', 'English language', 'Top universities'], weaknesses: ['Post-Brexit trade friction', 'NHS crisis', 'Low productivity'], opportunities: ['Fintech & green finance', 'CPTPP membership', 'AI regulation leadership'], threats: ['Stagflation risk', 'Scotland independence', 'UK-EU relations'] } },
  '250': { name: 'France', gdp: 2924, growth: 0.9, inflation: 5.7, fdi: 35, easeOfBusiness: 32, currency: 'EUR', swot: { strengths: ['Nuclear energy independence', 'Luxury & tourism', 'Strong state capacity'], weaknesses: ['Labour market rigidity', 'High debt', 'Social tensions'], opportunities: ['AI & tech investment', 'Green industry', 'EU leadership'], threats: ['Political instability', 'Pension reform backlash', 'North Africa migration'] } },
  '076': { name: 'Brazil', gdp: 2082, growth: 2.9, inflation: 4.6, fdi: 86, easeOfBusiness: 124, currency: 'BRL', swot: { strengths: ['Commodity superpower', 'Agri-tech scale', 'Diversified economy'], weaknesses: ['Corruption risk', 'Infrastructure deficit', 'Inequality'], opportunities: ['Green energy exports', 'EV battery materials', 'BRICS leadership'], threats: ['Fiscal loosening', 'Amazon deforestation pressure', 'Political uncertainty'] } },
  '380': { name: 'Italy', gdp: 2170, growth: 0.7, inflation: 6.0, fdi: 21, easeOfBusiness: 58, currency: 'EUR', swot: { strengths: ['Manufacturing SMEs', 'Tourism', 'Food & fashion exports'], weaknesses: ['High public debt 140% GDP', 'Slow judiciary', 'Brain drain'], opportunities: ['PNRR EU recovery funds', 'Green transition', 'Tourism growth'], threats: ['Debt sustainability', 'Political fragmentation', 'Banking sector fragility'] } },
  '124': { name: 'Canada', gdp: 2140, growth: 1.5, inflation: 3.9, fdi: 45, easeOfBusiness: 23, currency: 'CAD', swot: { strengths: ['Commodities & energy', 'Immigration talent pipeline', 'US proximity'], weaknesses: ['Housing affordability crisis', 'Productivity gap', 'US dependency'], opportunities: ['Critical minerals', 'Tech immigration', 'Clean energy exports'], threats: ['Housing bubble', 'Rate sensitivity', 'US trade policy'] } },
  '410': { name: 'South Korea', gdp: 1709, growth: 1.4, inflation: 3.7, fdi: 12, easeOfBusiness: 5, currency: 'KRW', swot: { strengths: ['Semiconductors & electronics', 'K-culture soft power', 'High R&D spend'], weaknesses: ['North Korea risk', 'Aging rapidly', 'Chaebol concentration'], opportunities: ['AI chips demand', 'Defence exports', 'EV batteries'], threats: ['China tech competition', 'North Korea escalation', 'Geopolitical caught between US-China'] } },
  '643': { name: 'Russia', gdp: 1863, growth: 3.6, inflation: 7.4, fdi: -5, easeOfBusiness: 28, currency: 'RUB', swot: { strengths: ['Energy & commodity wealth', 'Nuclear arsenal', 'Self-sufficiency'], weaknesses: ['Western sanctions', 'Brain drain', 'Technology access cut off'], opportunities: ['Asia pivot (China/India)', 'Commodity prices', 'Arctic resources'], threats: ['Ukraine war escalation', 'Sanctions deepening', 'Long-term demographic decline'] } },
  '036': { name: 'Australia', gdp: 1708, growth: 2.0, inflation: 4.1, fdi: 58, easeOfBusiness: 14, currency: 'AUD', swot: { strengths: ['Commodity exports', 'Stable democracy', 'Asia proximity'], weaknesses: ['China trade dependency', 'Housing bubble', 'Skills shortage'], opportunities: ['Critical minerals boom', 'Green hydrogen', 'AUKUS defence'], threats: ['China relationship tension', 'Housing affordability', 'Climate risk'] } },
  '484': { name: 'Mexico', gdp: 1323, growth: 3.2, inflation: 5.5, fdi: 36, easeOfBusiness: 60, currency: 'MXN', swot: { strengths: ['Nearshoring beneficiary', 'USMCA access', 'Young population'], weaknesses: ['Organised crime', 'Corruption', 'Energy policy uncertainty'], opportunities: ['Manufacturing relocation from China', 'Remittance base', 'Tourism'], threats: ['Cartel influence', 'Water scarcity', 'US immigration policy'] } },
  '724': { name: 'Spain', gdp: 1582, growth: 2.5, inflation: 3.5, fdi: 22, easeOfBusiness: 30, currency: 'EUR', swot: { strengths: ['Tourism leader', 'Renewable energy', 'Latin America ties'], weaknesses: ['Youth unemployment 28%', 'Regional separatism', 'Housing'], opportunities: ['Green hydrogen', 'Nearshoring data centres', 'EU funds'], threats: ['Catalonia risk', 'Political fragmentation', 'Water scarcity'] } },
  '360': { name: 'Indonesia', gdp: 1319, growth: 5.0, inflation: 3.7, fdi: 22, easeOfBusiness: 73, currency: 'IDR', swot: { strengths: ['Nickel & battery minerals', 'Large domestic market', 'Strategic location'], weaknesses: ['Infrastructure gaps', 'Corruption', 'Digital divide'], opportunities: ['EV battery supply chain', 'Digital economy', 'ASEAN leadership'], threats: ['Commodity price volatility', 'China competition', 'Climate vulnerability'] } },
  '528': { name: 'Netherlands', gdp: 1092, growth: 0.1, inflation: 4.1, fdi: 84, easeOfBusiness: 42, currency: 'EUR', swot: { strengths: ['ASML semiconductor monopoly', 'Logistics hub', 'Trade openness'], weaknesses: ['Housing shortage', 'Nitrogen policy', 'Small market'], opportunities: ['Data centre hub', 'Semiconductor equipment exports', 'Port tech'], threats: ['ASML export controls', 'EU regulation', 'Farmer protests'] } },
  '682': { name: 'Saudi Arabia', gdp: 1062, growth: -0.9, inflation: 2.3, fdi: 18, easeOfBusiness: 62, currency: 'SAR', swot: { strengths: ['Oil reserves', 'Vision 2030 reform', 'Strategic location'], weaknesses: ['Oil dependency', 'Youth employment', 'Human rights scrutiny'], opportunities: ['Tourism (NEOM)', 'Renewables', 'Tech investment'], threats: ['Oil price volatility', 'Iran rivalry', 'Post-oil transition risk'] } },
  '756': { name: 'Switzerland', gdp: 869, growth: 0.7, inflation: 2.2, fdi: 18, easeOfBusiness: 36, currency: 'CHF', swot: { strengths: ['Safe haven currency', 'Banking & pharma', 'Political neutrality'], weaknesses: ['Strong CHF hurts exports', 'Banking reputation risk', 'Small market'], opportunities: ['AI research hub', 'Health tech', 'Luxury exports'], threats: ['Banking secrecy erosion', 'EU bilateral deal', 'CHF appreciation'] } },
  '792': { name: 'Turkey', gdp: 1154, growth: 4.5, inflation: 65.0, fdi: 9, easeOfBusiness: 33, currency: 'TRY', swot: { strengths: ['Strategic NATO location', 'Manufacturing base', 'Young population'], weaknesses: ['Hyperinflation', 'Currency crisis', 'Institutional erosion'], opportunities: ['EU normalisation', 'Defence exports', 'Regional hub'], threats: ['Lira collapse risk', 'Geopolitical exposure', 'Erdogan policy unpredictability'] } },
  '702': { name: 'Singapore', gdp: 497, growth: 1.1, inflation: 4.8, fdi: 141, easeOfBusiness: 2, currency: 'SGD', swot: { strengths: ['Global FDI hub', 'Rule of law', 'Strategic Asia location'], weaknesses: ['No natural resources', 'Housing costs', 'Small market'], opportunities: ['Wealth management', 'Data centre hub', 'AI governance'], threats: ['US-China caught between', 'Water dependency on Malaysia', 'Talent competition'] } },
  '784': { name: 'UAE', gdp: 498, growth: 3.4, inflation: 4.8, fdi: 23, easeOfBusiness: 16, currency: 'AED', swot: { strengths: ['Trade hub', 'Tax-free regime', 'Energy wealth'], weaknesses: ['Oil dependency', 'Expat-dominated economy', 'Climate risk'], opportunities: ['Crypto & fintech hub', 'Tourism', 'AI investment (G42)'], threats: ['Iran tensions', 'Oil transition', 'Regional instability'] } },
  '710': { name: 'South Africa', gdp: 378, growth: 0.6, inflation: 6.0, fdi: 9, easeOfBusiness: 84, currency: 'ZAR', swot: { strengths: ['Mineral resources', 'Financial hub for Africa', 'Biodiversity & tourism'], weaknesses: ['Power outages (loadshedding)', 'Unemployment 32%', 'Crime'], opportunities: ['Critical minerals', 'Renewable energy', 'African gateway'], threats: ['Electricity crisis', 'Governance & corruption', 'Social unrest'] } },
  '566': { name: 'Nigeria', gdp: 477, growth: 2.9, inflation: 28.9, fdi: 4, easeOfBusiness: 131, currency: 'NGN', swot: { strengths: ['Largest African economy', 'Young population', 'Oil & gas reserves'], weaknesses: ['Currency instability', 'Power grid failure', 'Corruption'], opportunities: ['Tech ecosystem (Lagos)', 'Oil reform', 'Diaspora remittances'], threats: ['Naira devaluation', 'Insecurity', 'Oil theft'] } },
  '818': { name: 'Egypt', gdp: 396, growth: 3.8, inflation: 33.9, fdi: 7, easeOfBusiness: 114, currency: 'EGP', swot: { strengths: ['Suez Canal revenues', 'Strategic location', 'Large population'], weaknesses: ['FX crisis', 'Import dependency', 'High debt'], opportunities: ['Suez expansion', 'Renewables (solar)', 'Tourism'], threats: ['IMF programme pressure', 'Regional instability', 'Food security'] } },
  '764': { name: 'Thailand', gdp: 544, growth: 1.9, inflation: 1.2, fdi: 8, easeOfBusiness: 21, currency: 'THB', swot: { strengths: ['Tourism hub', 'Auto manufacturing', 'Agricultural exports'], weaknesses: ['Political instability', 'Aging fast', 'Middle-income trap'], opportunities: ['EV production hub', 'Digital economy', 'Regional tech hub'], threats: ['Political coups', 'China competition', 'Climate flooding risk'] } },
  '458': { name: 'Malaysia', gdp: 399, growth: 3.6, inflation: 2.5, fdi: 12, easeOfBusiness: 12, currency: 'MYR', swot: { strengths: ['Semiconductor supply chain', 'Palm oil & LNG', 'Stable multicultural governance'], weaknesses: ['Brain drain', 'MYR weakness', 'Race-based policy'], opportunities: ['Data centre inflows', 'Chip packaging', 'ASEAN hub'], threats: ['US chip controls', 'China dependency', 'Commodities volatility'] } },
  '170': { name: 'Colombia', gdp: 363, growth: 1.3, inflation: 9.3, fdi: 14, easeOfBusiness: 67, currency: 'COP', swot: { strengths: ['Coffee & flowers', 'Energy transition minerals', 'Peace dividend'], weaknesses: ['Inequality', 'Coca crop dependency', 'Regional conflict'], opportunities: ['Green hydrogen', 'Copper & lithium', 'Tech outsourcing'], threats: ['Left-wing policy risk', 'Neighbour instability (Venezuela)', 'Drug violence'] } },
  '032': { name: 'Argentina', gdp: 641, growth: -2.5, inflation: 211.0, fdi: 7, easeOfBusiness: 126, currency: 'ARS', swot: { strengths: ['Agricultural superpower', 'Lithium triangle', 'Tech talent'], weaknesses: ['Hyperinflation', 'Chronic fiscal crises', 'Debt default history'], opportunities: ['Milei reform programme', 'Lithium export surge', 'Vaca Muerta shale'], threats: ['Social unrest', 'Peso collapse', 'Dollarisation risks'] } },
  '704': { name: 'Vietnam', gdp: 430, growth: 5.1, inflation: 3.3, fdi: 18, easeOfBusiness: 70, currency: 'VND', swot: { strengths: ['Manufacturing FDI magnet', 'Young workforce', 'US-China+1 beneficiary'], weaknesses: ['State-owned enterprise drag', 'Infrastructure bottlenecks', 'Property bubble'], opportunities: ['Semiconductor assembly', 'Chip packaging', 'Renewables'], threats: ['Geopolitical exposure (SCS)', 'Property sector stress', 'Governance transparency'] } },
  '586': { name: 'Pakistan', gdp: 338, growth: 2.4, inflation: 28.3, fdi: 2, easeOfBusiness: 108, currency: 'PKR', swot: { strengths: ['Young population', 'CPEC connectivity', 'Tech diaspora'], weaknesses: ['IMF dependency', 'Political instability', 'Energy crisis'], opportunities: ['IT services export', 'Agricultural productivity', 'China-Pakistan corridor'], threats: ['Debt default risk', 'India-Pakistan tension', 'Climate floods'] } },
  '050': { name: 'Bangladesh', gdp: 446, growth: 5.8, inflation: 9.9, fdi: 3, easeOfBusiness: 168, currency: 'BDT', swot: { strengths: ['RMG export powerhouse', 'Demographic dividend', 'Resilient growth'], weaknesses: ['Political upheaval', 'Climate vulnerability', 'Low wages'], opportunities: ['Garment diversification', 'IT-ITES sector', 'Blue economy'], threats: ['Political instability post-2024', 'Flooding & cyclones', 'RMG competition from Vietnam'] } },
  '404': { name: 'Kenya', gdp: 118, growth: 5.6, inflation: 7.7, fdi: 4, easeOfBusiness: 56, currency: 'KES', swot: { strengths: ['East Africa hub', 'M-Pesa fintech', 'Nairobi tech scene'], weaknesses: ['External debt burden', 'Youth unemployment', 'Drought'], opportunities: ['Green bond market', 'Geothermal energy', 'Tech startup hub'], threats: ['Debt distress', 'Climate drought', 'Regional insecurity'] } },
  '578': { name: 'Norway', gdp: 546, growth: 1.1, inflation: 5.5, fdi: 7, easeOfBusiness: 9, currency: 'NOK', swot: { strengths: ['Sovereign wealth fund $1.7T', 'Oil & gas', 'Renewable energy'], weaknesses: ['Oil dependency long-term', 'High cost base', 'Small market'], opportunities: ['CCS technology', 'Offshore wind', 'Fund rebalancing'], threats: ['Oil price decline', 'Post-oil transition', 'NOK volatility'] } },
  '752': { name: 'Sweden', gdp: 597, growth: -0.2, inflation: 8.5, fdi: 12, easeOfBusiness: 10, currency: 'SEK', swot: { strengths: ['Innovation & startups (Stockholm)', 'Green steel', 'Social stability'], weaknesses: ['Gang crime crisis', 'Housing market', 'Immigration integration'], opportunities: ['EV battery (Northvolt)', 'NATO membership', 'Green steel exports'], threats: ['Housing correction', 'Gang violence social cost', 'SEK weakness'] } },
  '616': { name: 'Poland', gdp: 842, growth: 0.2, inflation: 11.4, fdi: 18, easeOfBusiness: 40, currency: 'PLN', swot: { strengths: ['EU funds beneficiary', 'Manufacturing hub', 'Skilled workforce'], weaknesses: ['Russia exposure', 'Judicial reforms controversy', 'Energy mix'], opportunities: ['Defence spending boom', 'EU recovery funds', 'Reshoring hub'], threats: ['Russia-Ukraine war proximity', 'EU rule of law disputes', 'Demographic decline'] } },
  '372': { name: 'Ireland', gdp: 533, growth: -3.2, inflation: 5.2, fdi: 98, easeOfBusiness: 24, currency: 'EUR', swot: { strengths: ['Tech FDI hub (Apple, Google, Meta)', 'Low corporate tax', 'English language EU access'], weaknesses: ['Tech concentration risk', 'Housing crisis acute', 'US tax reform risk'], opportunities: ['AI data centres', 'Pharma & medtech', 'Green energy'], threats: ['OECD minimum tax', 'Tech sector layoffs', 'US-EU trade tensions'] } },
}

const METRIC_LABELS: Record<Metric, { label: string; unit: string; format: (v: number) => string }> = {
  gdp: { label: 'GDP', unit: 'B USD', format: (v) => `$${v.toLocaleString()}B` },
  growth: { label: 'GDP Growth', unit: '%', format: (v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` },
  inflation: { label: 'Inflation', unit: '%', format: (v) => `${v.toFixed(1)}%` },
  fdi: { label: 'FDI Inflows', unit: 'B USD', format: (v) => `$${v.toFixed(0)}B` },
  easeOfBusiness: { label: 'Ease of Business', unit: 'rank', format: (v) => `#${v}` },
}

export default function GlobeTab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [metric, setMetric] = useState<Metric>('gdp')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedData, setSelectedData] = useState<CountryData | null>(null)
  const [worldData, setWorldData] = useState<unknown>(null)
  const [swotTab, setSwotTab] = useState<'S' | 'W' | 'O' | 'T'>('S')

  const rotationRef = useRef<[number, number, number]>([20, -25, 0])
  const draggingRef = useRef(false)
  const dragStartRef = useRef<[number, number]>([0, 0])
  const dragRotRef = useRef<[number, number, number]>([20, -25, 0])
  const pausedRef = useRef(false)
  const selectedIdRef = useRef<string | null>(null)
  const metricRef = useRef<Metric>('gdp')
  const rafRef = useRef<number>()
  const worldRef = useRef<unknown>(null)

  useEffect(() => {
    metricRef.current = metric
  }, [metric])

  useEffect(() => {
    selectedIdRef.current = selectedId
  }, [selectedId])

  // Load world atlas
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((r) => r.json())
      .then((data) => {
        worldRef.current = data
        setWorldData(data)
      })
  }, [])

  const buildColorScale = useCallback((m: Metric) => {
    const vals = Object.values(COUNTRY_DATA).map((d) => d[m])
    const min = Math.min(...vals)
    const max = Math.max(...vals)

    if (m === 'inflation' || m === 'easeOfBusiness') {
      // Lower is better — invert
      return (v: number | undefined) => {
        if (v === undefined) return '#1a2840'
        const t = 1 - Math.max(0, Math.min(1, (v - min) / (max - min)))
        return d3.interpolateRdYlGn(t * 0.8 + 0.1)
      }
    }
    return (v: number | undefined) => {
      if (v === undefined) return '#1a2840'
      const t = Math.max(0, Math.min(1, (v - min) / (max - min)))
      return d3.interpolateBlues(t * 0.75 + 0.2)
    }
  }, [])

  // Main render loop
  useEffect(() => {
    if (!worldData || !canvasRef.current || !containerRef.current) return

    const canvas = canvasRef.current
    const container = containerRef.current
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const topo = worldData as any
    const countries = (feature(topo, topo.objects.countries) as { features: unknown[] }).features

    const getProjection = () =>
      d3
        .geoOrthographic()
        .scale(canvas.height / 2.1)
        .translate([canvas.width / 2, canvas.height / 2])
        .clipAngle(90)
        .rotate(rotationRef.current)

    const graticule = d3.geoGraticule()()

    const render = () => {
      const proj = getProjection()
      const path = d3.geoPath().projection(proj).context(ctx)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Ocean
      ctx.beginPath()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      path({ type: 'Sphere' } as any)
      ctx.fillStyle = '#071120'
      ctx.fill()

      // Graticule
      ctx.beginPath()
      path(graticule)
      ctx.strokeStyle = 'rgba(255,255,255,0.04)'
      ctx.lineWidth = 0.5
      ctx.stroke()

      // Countries
      const colorScale = buildColorScale(metricRef.current)
      for (const country of countries as { id?: string | number; [k: string]: unknown }[]) {
        const id = String(country.id ?? '')
        // pad to 3 digits
        const paddedId = id.padStart(3, '0')
        const data = COUNTRY_DATA[paddedId] ?? COUNTRY_DATA[id]
        ctx.beginPath()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        path(country as any)
        ctx.fillStyle = data ? colorScale(data[metricRef.current]) : '#1a2840'
        ctx.fill()
        ctx.strokeStyle = '#071120'
        ctx.lineWidth = 0.4
        ctx.stroke()
      }

      // Highlight selected country
      const sid = selectedIdRef.current
      if (sid) {
        const sel = (countries as { id?: string | number; [k: string]: unknown }[]).find(
          (c) => String(c.id ?? '').padStart(3, '0') === sid || String(c.id) === sid
        )
        if (sel) {
          ctx.beginPath()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          path(sel as any)
          ctx.strokeStyle = '#C9A961'
          ctx.lineWidth = 2
          ctx.stroke()
          ctx.fillStyle = 'rgba(201,169,97,0.15)'
          ctx.fill()
        }
      }

      // Sphere border
      ctx.beginPath()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      path({ type: 'Sphere' } as any)
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.lineWidth = 1
      ctx.stroke()

      if (!pausedRef.current && !draggingRef.current) {
        rotationRef.current = [
          rotationRef.current[0] + 0.12,
          rotationRef.current[1],
          rotationRef.current[2],
        ]
      }
      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)

    // Drag
    const onMouseDown = (e: MouseEvent) => {
      draggingRef.current = true
      pausedRef.current = true
      dragStartRef.current = [e.clientX, e.clientY]
      dragRotRef.current = [...rotationRef.current]
    }
    const onMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return
      const dx = e.clientX - dragStartRef.current[0]
      const dy = e.clientY - dragStartRef.current[1]
      rotationRef.current = [
        dragRotRef.current[0] + dx * 0.35,
        dragRotRef.current[1] - dy * 0.35,
        dragRotRef.current[2],
      ]
    }
    const onMouseUp = () => { draggingRef.current = false }

    // Touch
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      draggingRef.current = true
      pausedRef.current = true
      dragStartRef.current = [e.touches[0].clientX, e.touches[0].clientY]
      dragRotRef.current = [...rotationRef.current]
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!draggingRef.current || e.touches.length !== 1) return
      const dx = e.touches[0].clientX - dragStartRef.current[0]
      const dy = e.touches[0].clientY - dragStartRef.current[1]
      rotationRef.current = [
        dragRotRef.current[0] + dx * 0.35,
        dragRotRef.current[1] - dy * 0.35,
        dragRotRef.current[2],
      ]
    }
    const onTouchEnd = () => { draggingRef.current = false }

    // Click
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const sx = canvas.width / rect.width
      const sy = canvas.height / rect.height
      const px = (e.clientX - rect.left) * sx
      const py = (e.clientY - rect.top) * sy

      const proj = d3
        .geoOrthographic()
        .scale(canvas.height / 2.1)
        .translate([canvas.width / 2, canvas.height / 2])
        .clipAngle(90)
        .rotate(rotationRef.current)

      const lonlat = proj.invert?.([px, py])
      if (!lonlat) return

      // Check visible hemisphere
      const lambda = (lonlat[0] * Math.PI) / 180
      const phi = (lonlat[1] * Math.PI) / 180
      const rLambda = (rotationRef.current[0] * Math.PI) / 180
      const rPhi = (rotationRef.current[1] * Math.PI) / 180
      const dotProduct =
        Math.cos(phi) * Math.cos(rPhi) * Math.cos(lambda - rLambda) +
        Math.sin(phi) * Math.sin(rPhi)
      if (dotProduct < 0) return

      for (const country of countries as { id?: string | number; [k: string]: unknown }[]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (d3.geoContains(country as any, lonlat)) {
          const id = String(country.id ?? '').padStart(3, '0')
          const data = COUNTRY_DATA[id] ?? COUNTRY_DATA[String(country.id)]
          setSelectedId(id)
          setSelectedData(data ?? null)
          setSwotTab('S')
          break
        }
      }
    }

    canvas.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    canvas.addEventListener('touchstart', onTouchStart, { passive: true })
    canvas.addEventListener('touchmove', onTouchMove, { passive: true })
    canvas.addEventListener('touchend', onTouchEnd)
    canvas.addEventListener('click', onClick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      canvas.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
      canvas.removeEventListener('click', onClick)
    }
  }, [worldData, buildColorScale])

  const swotColors = { S: 'text-green-400', W: 'text-red-400', O: 'text-blue-400', T: 'text-yellow-400' }
  const swotFull = { S: 'Strengths', W: 'Weaknesses', O: 'Opportunities', T: 'Threats' }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Globe canvas */}
      <div className="flex-1 flex flex-col gap-3">
        {/* Controls */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-500 uppercase tracking-wider">Metric</label>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as Metric)}
            className="input-base text-sm w-auto"
          >
            {(Object.keys(METRIC_LABELS) as Metric[]).map((m) => (
              <option key={m} value={m}>
                {METRIC_LABELS[m].label}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-600 hidden sm:block">
            Click a country to view data
          </span>
          {pausedRef.current && (
            <button
              onClick={() => { pausedRef.current = false }}
              className="text-xs text-gold/70 hover:text-gold transition-colors ml-auto"
            >
              Resume rotation
            </button>
          )}
        </div>

        {/* Canvas */}
        <div
          ref={containerRef}
          className="flex-1 min-h-[340px] lg:min-h-0 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
          style={{ background: '#050d18' }}
        >
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Low</span>
          <div className="h-2 flex-1 rounded-full" style={{
            background: metric === 'inflation' || metric === 'easeOfBusiness'
              ? 'linear-gradient(to right, #22c55e, #eab308, #ef4444)'
              : 'linear-gradient(to right, #1e3a5f, #1e40af, #3b82f6, #93c5fd)',
          }} />
          <span className="text-xs text-gray-600">High</span>
          <span className="text-xs text-gray-500 ml-2">
            {METRIC_LABELS[metric].label} ({METRIC_LABELS[metric].unit})
          </span>
        </div>
      </div>

      {/* Info panel */}
      <div className="w-full lg:w-80 flex flex-col gap-3">
        {selectedData ? (
          <>
            <div className="card p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{selectedData.name}</h3>
                  {selectedData.currency && (
                    <p className="text-xs text-gray-500 mt-0.5">{selectedData.currency}</p>
                  )}
                </div>
                <button
                  onClick={() => { setSelectedId(null); setSelectedData(null) }}
                  className="text-gray-600 hover:text-gray-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(METRIC_LABELS) as Metric[]).map((m) => (
                  <div
                    key={m}
                    className={`p-2 rounded-md ${metric === m ? 'bg-navy border border-gold/30' : 'bg-surface-2'}`}
                  >
                    <p className="text-xs text-gray-500">{METRIC_LABELS[m].label}</p>
                    <p className="text-sm font-semibold mt-0.5">
                      {METRIC_LABELS[m].format(selectedData[m])}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* SWOT */}
            {selectedData.swot && (
              <div className="card p-4 flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                  Investment SWOT
                </p>
                <div className="flex gap-1 mb-3">
                  {(['S', 'W', 'O', 'T'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setSwotTab(t)}
                      className={`flex-1 py-1 text-xs font-bold rounded transition-colors ${
                        swotTab === t
                          ? 'bg-navy text-white border border-gold/20'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <p className={`text-xs font-semibold mb-2 ${swotColors[swotTab]}`}>
                  {swotFull[swotTab]}
                </p>
                <ul className="space-y-1.5">
                  {selectedData.swot[
                    swotTab === 'S'
                      ? 'strengths'
                      : swotTab === 'W'
                      ? 'weaknesses'
                      : swotTab === 'O'
                      ? 'opportunities'
                      : 'threats'
                  ].map((item, i) => (
                    <li key={i} className="text-xs text-gray-300 flex gap-2">
                      <span className={`${swotColors[swotTab]} flex-shrink-0`}>—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="card p-6 flex flex-col items-center justify-center text-center flex-1 min-h-[200px]">
            <div className="w-10 h-10 rounded-full bg-navy/40 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-gold/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Select a country on the globe to view economic data and investment SWOT analysis</p>
          </div>
        )}
      </div>
    </div>
  )
}
