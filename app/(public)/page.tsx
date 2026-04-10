import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Clock, MessageCircle, Users } from "lucide-react";
import Link from "next/link";
import { LuWorkflow } from "react-icons/lu";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const features: FeatureProps[] = [
  {
    title: "Expert Instructors",
    description: "Learn from industry leaders with years of experience.",
    icon: <Users />,
  },
  {
    title: "Flexible Learning",
    description: "Study at your own pace, anytime, anywhere.",
    icon: <Clock />,
  },
  {
    title: "Real-World Results",
    description: "Gain practical skills that make a difference in your career.",
    icon: <LuWorkflow />,
  },
  {
    title: "Community Support",
    description:
      "Connect with peers and instructors for guidance and motivation.",
    icon: <MessageCircle />,
  },
];

export default function Home() {
  return (
    <>
      <section className="relative py-10">
        <div className="flex flex-col items-center text-center space-y-8">
          <Badge variant="outline">The Future of Online Education</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Elevate your Learning Experience
          </h1>
          <p className="text-muted-foreground max-w-[700px] md:text-xl">
            Discover a new way to learn with our modern, interactive learning
            management system. Access high-quality courses anytime, anywhere.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link
              href={"/courses"}
              className={buttonVariants({
                size: "lg",
              })}
            >
              Explore Courses
            </Link>
            <Link
              href={"/login"}
              className={buttonVariants({
                size: "lg",
                variant: "outline",
              })}
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <section className="container py-10 mx-auto px-4 mb-32">
        {/* <div className="flex flex-col items-center text-center space-y-4 mb-16">
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
        </div> */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>
    </>
  );
}

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
