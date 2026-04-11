import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Clock,
  MessageCircle,
  Users,
  TrendingUp,
  BarChart3,
  Shield,
  BookOpen,
  Zap,
  Star,
  ChevronRight,
  ArrowRight,
  GraduationCap,
  Target,
  Award,
  CheckCircle,
  Play,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/* ───────────────── data ───────────────── */

interface FeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const features: FeatureProps[] = [
  {
    title: "Expert Instructors",
    description:
      "Learn from professional traders with 10+ years of live market experience.",
    icon: <Users className="size-5" />,
  },
  {
    title: "Flexible Learning",
    description: "Study at your own pace, anytime, anywhere — even on mobile.",
    icon: <Clock className="size-5" />,
  },
  {
    title: "Real-Time Charts",
    description:
      "Practice on live market data with our integrated charting tools.",
    icon: <BarChart3 className="size-5" />,
  },
  {
    title: "Community Support",
    description:
      "Join 2,000+ traders in our private community for signals and guidance.",
    icon: <MessageCircle className="size-5" />,
  },
  {
    title: "Risk Management",
    description:
      "Master position sizing, stop-losses, and capital preservation.",
    icon: <Shield className="size-5" />,
  },
  {
    title: "Lifetime Access",
    description:
      "All courses and future updates included — no recurring fees.",
    icon: <Zap className="size-5" />,
  },
];

const stats = [
  { value: "2,500+", label: "Students Enrolled" },
  { value: "97%", label: "Completion Rate" },
  { value: "30+", label: "Course Hours" },
  { value: "4.9★", label: "Avg. Rating" },
];

interface CoursePreview {
  title: string;
  level: string;
  lessons: number;
  duration: string;
  description: string;
  icon: React.ReactNode;
}

const coursesPreviews: CoursePreview[] = [
  {
    title: "Forex Fundamentals",
    level: "Beginner",
    lessons: 12,
    duration: "4h 30m",
    description:
      "Currency pairs, pips, lots, leverage — everything you need to start trading.",
    icon: <BookOpen className="size-5" />,
  },
  {
    title: "Technical Analysis Mastery",
    level: "Intermediate",
    lessons: 18,
    duration: "8h 15m",
    description:
      "Candlestick patterns, support & resistance, indicators, and chart reading.",
    icon: <TrendingUp className="size-5" />,
  },
  {
    title: "Advanced Trading Strategies",
    level: "Advanced",
    lessons: 24,
    duration: "12h 00m",
    description:
      "ICT concepts, order flow, liquidity grabs, and institutional strategies.",
    icon: <Target className="size-5" />,
  },
];

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  avatar: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: "Ahmed R.",
    role: "Full-time Trader",
    quote:
      "After completing Salma's course, I finally understood market structure. I went from losing money to consistent monthly profits within 3 months.",
    avatar: "AR",
    rating: 5,
  },
  {
    name: "Sarah M.",
    role: "Part-time Trader",
    quote:
      "The risk management module alone was worth it. I learned how to protect my capital and trade with confidence, not emotions.",
    avatar: "SM",
    rating: 5,
  },
  {
    name: "Yousef K.",
    role: "Student",
    quote:
      "The community is amazing. Getting real-time feedback on my chart analysis accelerated my learning like nothing else could.",
    avatar: "YK",
    rating: 5,
  },
];

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "Do I need any prior trading experience?",
    answer:
      "Not at all! Our Forex Fundamentals course starts from zero and builds your knowledge step by step. We've designed the curriculum so that complete beginners can follow along with ease.",
  },
  {
    question: "How long do I have access to the courses?",
    answer:
      "You get lifetime access. Once you enrol, the course — along with all future updates — is yours forever. No monthly payments, no hidden fees.",
  },
  {
    question: "Do you provide trading signals?",
    answer:
      "Our community channel shares market analysis and signal ideas daily. However, our main goal is to teach you how to find your own setups so you never have to depend on anyone.",
  },
  {
    question: "Can I access the courses on mobile?",
    answer:
      "Yes! Our platform is fully responsive. Watch lessons, take notes, and participate in the community from any device — phone, tablet, or desktop.",
  },
  {
    question: "What if I'm not satisfied with the course?",
    answer:
      "We offer a 14-day money-back guarantee. If the course isn't right for you, just reach out and we'll process a full refund — no questions asked.",
  },
];

/* ───────────────── page ───────────────── */

export default function Home() {
  return (
    <>
      {/* ── HERO ─────────────────────────────── */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Decorative gradient blobs */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute top-20 -right-60 w-[500px] h-[500px] rounded-full bg-primary/8 blur-3xl" />

        <div className="relative flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          <Badge
            variant="outline"
            className="gap-1.5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest border-primary/30 text-primary animate-in fade-in slide-in-from-bottom-3 duration-700"
          >
            <TrendingUp className="size-3" />
            The Future of Forex Education
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Master the Forex Market{" "}
            <span className="bg-linear-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              With Confidence
            </span>
          </h1>

          <p className="text-muted-foreground max-w-[650px] text-lg md:text-xl leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            Learn proven trading strategies, technical analysis, and risk
            management from professional traders. Join 2,500+ students who
            turned their trading around.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Link
              href="/courses"
              className={buttonVariants({
                size: "lg",
                className:
                  "gap-2 text-base px-8 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow",
              })}
            >
              <Play className="size-4" />
              Start Learning Free
            </Link>
            <Link
              href="/courses"
              className={buttonVariants({
                size: "lg",
                variant: "outline",
                className: "gap-2 text-base px-8",
              })}
            >
              Browse Courses
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS TICKER ─────────────────────── */}
      <section className="py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-sm"
            >
              <span className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary">
                {stat.value}
              </span>
              <span className="text-sm text-muted-foreground mt-1 font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────── */}
      <section className="py-24">
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          <Badge
            variant="secondary"
            className="px-4 py-1 rounded-full uppercase tracking-widest text-[10px] font-bold"
          >
            Features
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Why choose our platform?
          </h2>
          <p className="text-muted-foreground max-w-[600px] text-lg leading-relaxed">
            We provide all the tools you need to master the markets and build a
            successful career in trading.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      {/* ── COURSE PREVIEWS ──────────────────── */}
      <section className="py-24">
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          <Badge
            variant="secondary"
            className="px-4 py-1 rounded-full uppercase tracking-widest text-[10px] font-bold"
          >
            <GraduationCap className="size-3 mr-1" />
            Our Courses
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Your path from beginner to pro
          </h2>
          <p className="text-muted-foreground max-w-[600px] text-lg leading-relaxed">
            Structured courses designed to take you from zero knowledge to
            confidently placing trades in the live market.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {coursesPreviews.map((course, i) => (
            <CoursePreviewCard key={course.title} course={course} index={i} />
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Link
            href="/courses"
            className={buttonVariants({
              size: "lg",
              variant: "outline",
              className: "gap-2 text-base",
            })}
          >
            View All Courses
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────── */}
      <section className="py-24">
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          <Badge
            variant="secondary"
            className="px-4 py-1 rounded-full uppercase tracking-widest text-[10px] font-bold"
          >
            <Star className="size-3 mr-1" />
            Testimonials
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Hear from our students
          </h2>
          <p className="text-muted-foreground max-w-[600px] text-lg leading-relaxed">
            Real stories from real traders who transformed their results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <TestimonialCard key={t.name} testimonial={t} />
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────── */}
      <section className="py-24">
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          <Badge
            variant="secondary"
            className="px-4 py-1 rounded-full uppercase tracking-widest text-[10px] font-bold"
          >
            How It Works
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Start trading in 3 simple steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              step: "01",
              title: "Choose Your Course",
              description:
                "Pick a course that matches your level — Beginner, Intermediate, or Advanced.",
              icon: <BookOpen className="size-6" />,
            },
            {
              step: "02",
              title: "Learn at Your Pace",
              description:
                "Watch video lessons, complete quizzes, and practice with real chart examples.",
              icon: <Play className="size-6" />,
            },
            {
              step: "03",
              title: "Trade with Confidence",
              description:
                "Apply your knowledge to the live market with a solid strategy and risk plan.",
              icon: <Award className="size-6" />,
            },
          ].map((step, i) => (
            <div key={step.step} className="relative group">
              {/* Connector line for desktop */}
              {i < 2 && (
                <div className="hidden md:block absolute top-12 left-[calc(50%+60px)] w-[calc(100%-120px)] h-px bg-border" />
              )}
              <div className="flex flex-col items-center text-center space-y-4 p-8">
                <div className="relative">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 group-hover:ring-primary/40">
                    {step.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold tracking-tight">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────── */}
      <section className="py-24">
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          <Badge
            variant="secondary"
            className="px-4 py-1 rounded-full uppercase tracking-widest text-[10px] font-bold"
          >
            FAQ
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground max-w-[600px] text-lg leading-relaxed">
            Everything you need to know before you begin.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqItems.map((item, i) => (
            <FAQCard key={i} item={item} />
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────── */}
      <section className="py-24 mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-12 md:p-20 text-center">
          {/* Decorative blob */}
          <div className="pointer-events-none absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full bg-primary/8 blur-3xl" />

          <div className="relative flex flex-col items-center space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Ready to transform your trading?
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Join thousands of students who have mastered forex trading with our
              proven courses. Start your journey today — your future self will
              thank you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link
                href="/courses"
                className={buttonVariants({
                  size: "lg",
                  className:
                    "gap-2 text-base px-10 shadow-lg shadow-primary/25",
                })}
              >
                Get Started Now
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <p className="text-xs text-muted-foreground/60">
              14-day money-back guarantee · No credit card required to browse
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────── */}
      <footer className="border-t py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-lg font-bold tracking-tight">
              Forex
              <span className="text-foreground">With</span>
              <span className="mx-[2px] text-primary">.</span>
              <span className="bg-linear-to-tr from-primary to-primary/60 bg-clip-text font-extrabold text-transparent">
                Salma
              </span>
            </span>
            <p className="text-sm text-muted-foreground">
              Master the markets. Trade with confidence.
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/courses" className="hover:text-primary transition-colors">
              Courses
            </Link>
            <Link href="/dashboard" className="hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/login" className="hover:text-primary transition-colors">
              Sign In
            </Link>
          </div>
          <p className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} ForexWith.Salma. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}

/* ───────────────── components ───────────────── */

function FeatureCard({ title, description, icon }: FeatureProps) {
  return (
    <Card className="group relative flex flex-col p-8 rounded-3xl border-border/50 bg-card/30 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />

      <CardContent className="relative z-10 p-0">
        <div className="mb-6 inline-flex p-3 rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 tracking-tight">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function CoursePreviewCard({
  course,
  index,
}: {
  course: CoursePreview;
  index: number;
}) {
  const levelColors: Record<string, string> = {
    Beginner: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    Intermediate: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    Advanced: "text-rose-500 bg-rose-500/10 border-rose-500/20",
  };

  return (
    <Card className="group relative flex flex-col rounded-3xl border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2">
      {/* Progress-style top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

      <CardContent className="flex flex-col flex-1 p-8 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110">
            {course.icon}
          </div>
          <Badge
            variant="outline"
            className={`text-xs font-semibold ${levelColors[course.level] || ""}`}
          >
            {course.level}
          </Badge>
        </div>

        <div className="space-y-2 flex-1">
          <h3 className="text-xl font-bold tracking-tight">{course.title}</h3>
          <p className="text-muted-foreground leading-relaxed text-sm">
            {course.description}
          </p>
        </div>

        <Separator className="opacity-50" />

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BookOpen className="size-3.5" />
            {course.lessons} lessons
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {course.duration}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="group relative flex flex-col p-8 rounded-3xl border-border/50 bg-card/30 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5">
      <CardContent className="relative z-10 p-0 flex flex-col flex-1 space-y-6">
        {/* Stars */}
        <div className="flex gap-0.5">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star
              key={i}
              className="size-4 fill-amber-400 text-amber-400"
            />
          ))}
        </div>

        {/* Quote */}
        <p className="text-muted-foreground leading-relaxed flex-1 italic">
          &ldquo;{testimonial.quote}&rdquo;
        </p>

        <Separator className="opacity-50" />

        {/* Author */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
            {testimonial.avatar}
          </div>
          <div>
            <p className="text-sm font-semibold">{testimonial.name}</p>
            <p className="text-xs text-muted-foreground">
              {testimonial.role}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FAQCard({ item }: { item: FAQItem }) {
  return (
    <details className="group rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl transition-all  open:shadow-lg open:shadow-primary/5">
      <summary className="flex cursor-pointer items-center justify-between p-6 text-left font-semibold transition-colors hover:text-primary [&::-webkit-details-marker]:hidden list-none">
        <span>{item.question}</span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-90" />
      </summary>
      <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
        {item.answer}
      </div>
    </details>
  );
}
