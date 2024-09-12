import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

interface IAccordion {
  items: { label: React.ReactNode; children: React.ReactNode; value: string }[];
  type?: "single" | "multiple";
}

function Accordion({ items, ...rest }: IAccordion) {
  return (
    <AccordionPrimitive.Root type="multiple" {...rest}>
      {items.map((item, index) => (
        <AccordionPrimitive.Item
          className="bg-slate-100 rounded-lg"
          key={`${item.value}_${index}`}
          value={item.value}
        >
          <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger className="flex flex-1 items-center justify-between p-2 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180">
              {item.label}
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="border-t bg-slate-50 overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="p-4">{item.children}</div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}

export { Accordion };
