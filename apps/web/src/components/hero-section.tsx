import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "./ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { ArrowRight } from "lucide-react"

export default function HeroSection() {
    return (
        <section className="max-w-6xl mx-auto px-4 py-24 text-center">
            <Badge className="mb-4 bg-indigo-600/20 border-indigo-500 text-indigo-400">
                Monitor • Alert • Protect
            </Badge>

            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Keep your website online with <br />
                <span className="text-indigo-500">Uptime-Guard</span>
            </h2>

            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
                Real-time uptime monitoring, incident alerts, and beautiful status pages—
                all in a simple dashboard designed for speed and reliability.
            </p>
            <div className="flex justify-center items-center gap-2 max-w-md mx-auto">
                <Input placeholder="Enter your website URL" className="flex-1" />
                <Button variant="default">Start Monitoring</Button>
            </div>


            <div className="max-w-6xl mx-auto px-4 py-24">
                <h3 className="text-3xl font-bold text-center mb-16">
                    Everything you need to stay online
                </h3>
                <div className="grid md:grid-cols-3 gap-8">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle >Instant Alerts</CardTitle>
                        </CardHeader>
                        <CardContent className="text-slate-400">
                            SMS, Email, Slack, Discord and more. Get notified the moment your site goes down.
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle >1-Minute Checks</CardTitle>
                        </CardHeader>
                        <CardContent className="text-slate-400">
                            Monitor your services from global locations at lightning speed.
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle >Status Pages</CardTitle>
                        </CardHeader>
                        <CardContent className="text-slate-400">
                            Share beautiful public status pages with your customers automatically.
                        </CardContent>
                    </Card>
                </div>
            </div>


            <div className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-linear-to-br from-indigo-500/30 to-blue-500/20 rounded-2xl border border-indigo-500/40 p-12">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Start Monitoring Today</h2>
                        <p className="text-xl text-muted-foreground mb-8">Join thousands of companies keeping their services online</p>
                        <button className="bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-lg font-medium text-lg transition inline-flex items-center gap-2">
                            Start Free Trial <ArrowRight className="w-5 h-5" />
                        </button>
                        <p className="text-sm text-muted-foreground/70 mt-4">14-day free trial • No credit card required • Cancel anytime</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
