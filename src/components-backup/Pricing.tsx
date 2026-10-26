import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

interface PricingProps {
  title: string;
  popular: boolean;
  price: string;
  description: string;
  buttonText: string;
  benefitList: string[];
}

const pricingList: PricingProps[] = [
  {
    title: "Free",
    popular: false,
    price: "₹0",
    description: "A strong starting point for students beginning their preparation journey.",
    buttonText: "Get Started",
    benefitList: [
      "Access to sample practice sets",
      "Basic chapter progress tracking",
      "Limited mock test access",
      "Revision notes and summaries",
    ],
  },
  {
    title: "Premium",
    popular: true,
    price: "Custom",
    description: "A complete preparation ecosystem for focused IMUCET and DNS preparation.",
    buttonText: "Talk to Sales",
    benefitList: [
      "Full mock test library",
      "Chapter-wise performance insights",
      "Smart revision planning",
      "Priority support and guidance",
    ],
  },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="container py-20 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Pricing</p>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          Simple plans for serious preparation.
        </h2>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {pricingList.map((pricing: PricingProps) => (
          <Card
            key={pricing.title}
            className={pricing.popular ? "border-slate-900 shadow-[0_20px_50px_rgba(15,23,42,0.08)]" : "border-slate-200 bg-white shadow-sm"}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-slate-900">{pricing.title}</CardTitle>
                {pricing.popular ? (
                  <Badge variant="secondary" className="bg-slate-900 text-white hover:bg-slate-900">
                    Most popular
                  </Badge>
                ) : null}
              </div>

              <div className="mt-4">
                <span className="text-4xl font-bold text-slate-900">{pricing.price}</span>
                {pricing.price !== "Custom" && <span className="ml-2 text-slate-500">for lifetime access</span>}
              </div>

              <CardDescription className="mt-3 text-base text-slate-600">{pricing.description}</CardDescription>
            </CardHeader>

            <CardContent>
              <Button className="w-full rounded-full bg-slate-900 text-white hover:bg-slate-800">
                {pricing.buttonText}
              </Button>
            </CardContent>

            <hr className="mx-auto w-4/5 border-slate-200" />

            <CardFooter className="flex">
              <div className="w-full space-y-4">
                {pricing.benefitList.map((benefit: string) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 text-slate-900" />
                    <span className="text-slate-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};
