"use client"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface CryptoData {
  id: string
  name: string
  symbol: string
  price: number
  change24h: number
  chartData: { time: string; price: number }[]
}

function openTradingView(symbol: string) {
  const tradingViewSymbol = `${symbol}USD`
  const url = `https://www.tradingview.com/chart/?symbol=${tradingViewSymbol}`
  window.open(url, "_blank", "noopener,noreferrer")
}

const initialCryptoData: CryptoData[] = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    price: 43250.0,
    change24h: 2.45,
    chartData: [],
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    price: 2580.5,
    change24h: -1.23,
    chartData: [],
  },
  {
    id: "cardano",
    name: "Cardano",
    symbol: "ADA",
    price: 0.485,
    change24h: 3.67,
    chartData: [],
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    price: 98.75,
    change24h: -0.89,
    chartData: [],
  },
  {
    id: "polygon",
    name: "Polygon",
    symbol: "MATIC",
    price: 0.825,
    change24h: 1.92,
    chartData: [],
  },
]

function generateInitialChartData(basePrice: number) {
  const data = []
  const now = new Date()

  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000)
    const variation = (Math.random() - 0.5) * 0.1
    const price = basePrice * (1 + variation)

    data.push({
      time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      price: Number(price.toFixed(basePrice < 1 ? 4 : 2)),
    })
  }

  return data
}

function CryptoCard({ crypto }: { crypto: CryptoData }) {
  const isPositive = crypto.change24h >= 0
  const chartConfig = {
    price: {
      label: "Price",
      color: isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)",
    },
  }

  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-background to-muted/20 border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle
                className="text-lg font-semibold tracking-tight cursor-pointer hover:text-primary transition-colors duration-200 hover:underline"
                onClick={() => openTradingView(crypto.symbol)}
              >
                {crypto.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground font-medium">{crypto.symbol}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold tracking-tight">
              $
              {crypto.price.toLocaleString(undefined, {
                minimumFractionDigits: crypto.price < 1 ? 4 : 2,
                maximumFractionDigits: crypto.price < 1 ? 4 : 2,
              })}
            </p>
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(crypto.change24h).toFixed(2)}%
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 relative z-10">
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={crypto.chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                domain={["dataMin - dataMin * 0.01", "dataMax + dataMax * 0.01"]}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={chartConfig.price.color}
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 6,
                  stroke: chartConfig.price.color,
                  strokeWidth: 2,
                  fill: "hsl(var(--background))",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default function CryptoDashboard() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([])
  const [lastUpdateTimeString, setLastUpdateTimeString] = useState<string>("")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {

    setIsClient(true)

    const updateAndSetTime = () => {
      setLastUpdateTimeString(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }))
    }
    updateAndSetTime() // Set initial time on client mount

    const initialData = initialCryptoData.map((crypto) => ({
      ...crypto,
      chartData: generateInitialChartData(crypto.price),
    }))
    setCryptoData(initialData)

    // Update data every 5 seconds
    const interval = setInterval(() => {
      setCryptoData((prevData) =>
        prevData.map((crypto) => {
          const priceVariation = (Math.random() - 0.5) * 0.02
          const newPrice = crypto.price * (1 + priceVariation)
          const changeVariation = (Math.random() - 0.5) * 0.5
          const newChange = crypto.change24h + changeVariation

          const newDataPoint = {
            time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            price: Number(newPrice.toFixed(crypto.price < 1 ? 4 : 2)),
          }

          const updatedChartData = [...crypto.chartData.slice(1), newDataPoint]

          return {
            ...crypto,
            price: Number(newPrice.toFixed(crypto.price < 1 ? 4 : 2)),
            change24h: Number(newChange.toFixed(2)),
            chartData: updatedChartData,
          }
        }),
      )
      updateAndSetTime()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="text-center mb-12 animate-in fade-in slide-in-from-top duration-1000">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
              <Activity className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent tracking-tight">
              CryptoLive
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Real-time cryptocurrency market data for the top 5 digital assets
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Last updated: {isClient ? lastUpdateTimeString : "Loading..."}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
          {cryptoData.map((crypto, index) => (
            <div
              key={crypto.id}
              className="animate-in fade-in slide-in-from-bottom duration-700"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CryptoCard crypto={crypto} />
            </div>
          ))}
        </div>

        <footer className="mt-16 text-center text-sm text-muted-foreground animate-in fade-in duration-1000 delay-1000">
          <p>Data updates every 5 seconds • Built with Material 3 design principles</p>
        </footer>
      </div>
    </div>
  )
}
