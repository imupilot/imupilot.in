import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TestimonialProps {
  image: string;
  name: string;
  role: string;
  comment: string;
}

const testimonials: TestimonialProps[] = [
  {
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    name: "Student Feedback Placeholder",
    role: "IMUCET Aspirant",
    comment: "Sample testimonial text for replacement with verified feedback once available.",
  },
  {
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    name: "Candidate Feedback Placeholder",
    role: "Mock Test User",
    comment: "Sample feedback text that highlights structured revision and measurable progress.",
  },
  {
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    name: "Student Review Placeholder",
    role: "Preparation Plan User",
    comment: "This area should be replaced with authentic student quotes and success stories before launch.",
  },
  {
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
    name: "Aspirant Feedback Placeholder",
    role: "DNS Preparation Track",
    comment: "Sample feedback text for product messaging; replace with real user experiences when available.",
  },
];

export const Testimonials = () => {
  return (
    <section id="testimonials" className="container py-20 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Social proof</p>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          Student feedback is essential — and should be verified before publishing.
        </h2>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {testimonials.map(({ image, name, role, comment }: TestimonialProps) => (
          <Card key={name} className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <Avatar>
                <AvatarImage alt={name} src={image} />
                <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold text-slate-900">{name}</CardTitle>
                <CardDescription>{role}</CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-sm leading-6 text-slate-600">{comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
