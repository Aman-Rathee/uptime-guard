import { Globe, Bell, BarChart3 } from "lucide-react"

const features = [
    {
        icon: <Globe className="h-8 w-8 text-blue-600" />,
        title: "Global Monitoring",
        desc: "Check uptime from multiple regions around the world.",
    },
    {
        icon: <Bell className="h-8 w-8 text-blue-600" />,
        title: "Instant Alerts",
        desc: "Get notified via email or Slack the moment downtime occurs.",
    },
    {
        icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
        title: "Detailed Analytics",
        desc: "View uptime reports, response times, and downtime history.",
    },
]

export default function Features() {
    return (
        <section id="features" className="py-24 bg-white">
            <div className="max-w-6xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-center mb-12">Powerful Monitoring Tools</h2>
                <div className="grid md:grid-cols-3 gap-10">
                    {features.map((f, i) => (
                        <div key={i} className="text-center p-6 border rounded-lg shadow-sm hover:shadow-md transition">
                            <div className="flex justify-center mb-4">{f.icon}</div>
                            <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                            <p className="text-gray-600 text-sm">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
