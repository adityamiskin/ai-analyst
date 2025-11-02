"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  Shield,
  Brain,
  FileText,
  Users,
  BarChart3,
  ArrowRight,
  Eye,
  Zap,
  CheckCircle2,
} from "lucide-react";

export default function Page() {
  return (
    <main className="min-h-screen bg-linear-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            AI-Powered Startup Analysis Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Venture Vision
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            The intelligent platform that empowers VCs to make data-driven
            investment decisions and helps founders showcase their vision to the
            right investors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/founder" className="flex items-center gap-2">
                For Founders
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8"
            >
              <Link href="/vc" className="flex items-center gap-2">
                For VCs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* What is Venture Vision */}
        <div className="mb-20">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl flex items-center gap-3">
                <Eye className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                What is Venture Vision?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground text-lg">
              <p>
                <strong className="text-foreground">Venture Vision</strong> is
                an AI-powered platform that revolutionizes how venture capital
                firms evaluate startup opportunities. By combining advanced
                artificial intelligence with comprehensive data analysis, we
                provide VCs with deep insights into potential investments,
                enabling faster, more informed decision-making.
              </p>
              <p>
                For founders, Venture Vision offers a streamlined application
                process that ensures your startup's potential is clearly
                communicated to investors. Our platform helps you present your
                company, team, product, market opportunity, and traction in a
                structured format that makes it easy for VCs to understand your
                value proposition.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Key Features */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Powerful Features for Modern Investors
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Brain className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Multi-Agent AI Analysis</CardTitle>
                <CardDescription>
                  Specialized AI agents analyze finance, competition, market
                  positioning, and investment potential
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Document Intelligence</CardTitle>
                <CardDescription>
                  Automated parsing and analysis of pitch decks, financials, and
                  legal documents
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Real-Time News Tracking</CardTitle>
                <CardDescription>
                  Stay updated with the latest news, funding rounds, and market
                  developments
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Risk Assessment</CardTitle>
                <CardDescription>
                  Comprehensive risk analysis with automated flagging of
                  potential concerns
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Financial Modeling</CardTitle>
                <CardDescription>
                  Unit economics analysis, revenue projections, and valuation
                  estimates
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Team Evaluation</CardTitle>
                <CardDescription>
                  Founder background analysis and team composition assessment
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Value Propositions */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Zap className="h-6 w-6 text-primary" />
                For Venture Capitalists
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>
                    Comprehensive AI-powered analysis of every startup
                    application
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>Portfolio news aggregation and monitoring</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>
                    Multi-agent analysis covering finance, competition, and
                    market fit
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>Investment recommendations with confidence scores</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>
                    Interactive chat interface for deeper company insights
                  </span>
                </li>
              </ul>
              <Button asChild className="w-full mt-6" variant="default">
                <Link href="/vc">Access VC Dashboard</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                For Founders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>Streamlined application process with guided steps</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>
                    Upload pitch decks, financials, and supporting documents
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>
                    Present your team, product, and market opportunity
                    effectively
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>
                    Showcase traction metrics and key performance indicators
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>Get your startup in front of the right investors</span>
                </li>
              </ul>
              <Button asChild className="w-full mt-6" variant="outline">
                <Link href="/founder">Start Your Application</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-primary text-primary-foreground border-none">
          <CardContent className="pt-12 pb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Startup Investing?
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Join Venture Vision to leverage AI-powered insights and make
              smarter investment decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg">
                <Link href="/vc">Explore as VC</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-lg bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link href="/founder">Apply as Founder</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
