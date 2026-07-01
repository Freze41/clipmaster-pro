"use client"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts"

const weekly = [
  {name:"Sen", views: 82000, clips:3},
  {name:"Sel", views: 124000, clips:5},
  {name:"Rab", views: 98000, clips:4},
  {name:"Kam", views: 156000, clips:6},
  {name:"Jum", views: 201000, clips:7},
  {name:"Sab", views: 268000, clips:8},
  {name:"Min", views: 242000, clips:6},
]
const platforms = [
  {name:"TikTok", v: 58},
  {name:"Reels", v: 27},
  {name:"Shorts", v: 15},
]

export default function AnalyticsPage(){
  return (
    <div className="space-y-6">
      <h1 className="text-[26px] font-[750]">Analytics</h1>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card-soft p-5 lg:col-span-2">
          <div className="font-semibold mb-3">Views 7 hari</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee"/>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip/>
                <Line type="monotone" dataKey="views" stroke="#FF3B5C" strokeWidth={2}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card-soft p-5">
          <div className="font-semibold mb-3">Platform split</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platforms}>
                <XAxis dataKey="name"/><YAxis/><Tooltip/>
                <Bar dataKey="v" fill="#FF3B5C" radius={[8,8,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="card-soft p-5">
        <div className="font-semibold mb-2">Top performing clips (seed)</div>
        <div className="text-sm text-muted-foreground">Brando JUMPSCARE • 842rb views • 96.4 AI • TikTok</div>
        <div className="text-sm text-muted-foreground">“Jangan lah bang” • 1.2jt views • 94.7 AI • Reels</div>
        <div className="text-sm text-muted-foreground">Rahasia Mixue 8000 • 560rb views • 95.2 AI • Shorts</div>
      </div>
    </div>
  )
}
