"use client";

import { useState } from "react";
import Accordion from "@/components/ui/Accordion";
import { FAQItem } from "@/data/faqData";

interface FAQAccordionProps {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Open first by default

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4 w-full max-w-3xl mx-auto">
      {items.map((item, index) => (
        <Accordion
          key={index}
          title={item.question}
          isOpen={openIndex === index}
          onToggle={() => handleToggle(index)}
        >
          <p className="text-text-secondary leading-relaxed">
            {item.answer}
          </p>
        </Accordion>
      ))}
    </div>
  );
}
