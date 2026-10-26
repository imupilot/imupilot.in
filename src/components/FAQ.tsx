import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: "What is IMUPilot?",
    answer: "IMUPilot is an exam preparation platform designed for IMUCET aspirants and students preparing for DNS sponsorship pathways. It brings mock tests, chapter-wise practice, analytics and revision support into one system.",
    value: "item-1",
  },
  {
    question: "What is included in the free plan?",
    answer: "The free plan is designed for students to get started with sample practice, limited mock test access and a basic overview of performance tracking. Premium plans unlock the full test library and deeper analytics.",
    value: "item-2",
  },
  {
    question: "Are mock tests available?",
    answer: "Yes. IMUPilot includes timed mock tests, section-wise practice and question analysis so students can evaluate their readiness under exam-like conditions.",
    value: "item-3",
  },
  {
    question: "Does IMUPilot cover DNS sponsorship preparation?",
    answer: "Yes. IMUPilot supports DNS sponsorship preparation through aptitude, logical reasoning, English and interview-ready practice resources designed for broader preparation beyond IMUCET.",
    value: "item-4",
  },
  {
    question: "Can I practice chapter-wise?",
    answer: "Yes. The learning flow is built around subject, chapter, topic and revision so preparation stays structured and focused instead of random.",
    value: "item-5",
  },
  {
    question: "Can I track my performance?",
    answer: "Yes. IMUPilot includes analytics around accuracy, score trends, section performance and weak chapters so students know exactly what to improve next.",
    value: "item-6",
  },
];

export const FAQ = () => {
  return (
    <section id="faq" className="container py-20 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">FAQ</p>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          Questions students usually ask.
        </h2>
      </div>

      <Accordion type="single" collapsible className="mx-auto mt-10 max-w-4xl w-full">
        {FAQList.map(({ question, answer, value }: FAQProps) => (
          <AccordionItem key={value} value={value} className="mb-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
            <AccordionTrigger className="text-left text-base font-medium text-slate-900">
              {question}
            </AccordionTrigger>
            <AccordionContent className="pt-0 text-slate-600">{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};
