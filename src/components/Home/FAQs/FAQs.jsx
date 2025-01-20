import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

const faqsData = [
  {
    title: "What is MedFair?",
    content:
      "MedFair is a telemedicine platform that connects patients with qualified healthcare providers. It offers convenient access to medical care and services through an easy-to-use app.",
  },
  {
    title: "How does MedFair protect my medical information?",
    content:
      "MedFair employs advanced security measures to ensure the confidentiality and safety of your medical data, adhering to industry standards for data protection.",
  },
  {
    title: "What services are available on the MedFair platform?",
    content:
      "MedFair provides virtual consultations, appointment scheduling, and personalized healthcare resources, all designed to make medical care more accessible.",
  },
  {
    title: "Is MedFair available in my area?",
    content:
      "MedFair is continuously expanding its services to new regions. ",
  },
  {
    title: "How do I start using MedFair?",
    content:
      "Create an account, and follow the setup instructions to begin accessing services.",
  },
  {
    title: "What are the costs of using MedFair?",
    content:
      "MedFair offers both basic and premium services. Pricing details can be found within the web app or by contacting our support team.",
  },
  {
    title: "How do I contact MedFair support?",
    content:
      "You can reach MedFair's customer support via our social media page or through our official website.",
  },
  {
    title: "What sets MedFair apart from other telemedicine platforms?",
    content:
      "MedFair stands out for its user-friendly interface, affordable pricing, enhanced confidentiality measures, and a wide network of trusted healthcare providers.",
  },
];
const FAQs = () => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div className="w-full px-4 py-8 md:px-16 lg:px-32" data-aos="fade-up" data-aos-duration="1000" data-aos-easing="ease-in-sine">
      <p
        className="font-semibold text-[#020E7C] text-[32px] md:text-[36px] font-sans text-center"
        id="faqs"
      >
        Frequently asked questions
      </p>
      <p
        className="mt-4 text-center text-gray-950/60 text-18 font-normal"
        id="faqs-desc"
      >
        Everything you need to know about the Medfair and{" "}
        <span className="md:hidden">billing</span>
        <span className="hidden md:inline">more</span>.
      </p>

      <div className="w-full mt-10">
        {faqsData.map((faq, index) => (
          <Accordion
            key={index}
            elevation={0}
            expanded={expanded === `panel${index}`}
            onChange={handleChange(`panel${index}`)}
            sx={{
              borderTop: "1px solid #EAECF0",
              borderLeft: 0,
              borderRight: 0,
              borderBottom: 0,
            }}
          >
            <AccordionSummary
              expandIcon={
                expanded === `panel${index}` ? (
                  <RemoveCircleOutlineIcon sx={{ color: "#98A2B3" }} />
                ) : (
                  <AddCircleOutlineIcon sx={{ color: "#98A2B3" }} />
                )
              }
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
              sx={{
                paddingY: "8px",
              }}
            >
              <h2 className="text-18 font-medium" id="faq-title">
                {faq.title}
              </h2>
            </AccordionSummary>
            <AccordionDetails>
              <p>{faq.content}</p>
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
    </div>
  );
};

export default FAQs;
