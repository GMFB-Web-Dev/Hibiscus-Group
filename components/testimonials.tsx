"use client";

import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { useState } from "react";

const testimonialPages = [
  [
    { quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.", name: "John Doe" },
    { quote: "The whole booking process was straightforward, and the team kept us informed from start to finish.", name: "Local customer" },
    { quote: "Friendly local service, delivered when promised and completed with genuine care.", name: "Local customer" },
  ],
  [
    { quote: "Fast, practical service and clear communication. Everything arrived exactly when we needed it.", name: "Local customer" },
    { quote: "A reliable team who made the job simple and left everything clean and tidy afterwards.", name: "Local customer" },
    { quote: "It was easy to choose what we needed, book it and get the job underway without any hassle.", name: "Local customer" },
  ],
  [
    { quote: "Helpful advice, fair pricing and great follow-through from a genuinely local business.", name: "Local customer" },
    { quote: "The service was prompt and professional, with excellent communication at every step.", name: "Local customer" },
    { quote: "We would happily use Hibiscus Group again and recommend the team to other locals.", name: "Local customer" },
  ],
] as const;

export function Testimonials() {
  const [page, setPage] = useState(0);

  const showPage = (nextPage: number) => {
    setPage((nextPage + testimonialPages.length) % testimonialPages.length);
  };

  return (
    <>
      <div className="home-testimonials__grid" aria-live="polite" key={page}>
        {testimonialPages[page].map((testimonial, index) => (
          <blockquote key={`${page}-${index}`}>
            <div className="home-stars" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }, (_, star) => <Star key={star} fill="currentColor" aria-hidden="true" />)}
            </div>
            <p>{testimonial.quote}</p>
            <cite>{testimonial.name}</cite>
          </blockquote>
        ))}
      </div>
      <div className="home-testimonials__controls">
        <div className="home-dots" aria-label="Testimonial pages">
          {testimonialPages.map((_, index) => (
            <button
              type="button"
              className={index === page ? "is-active" : ""}
              key={index}
              onClick={() => showPage(index)}
              aria-label={`Show testimonial page ${index + 1}`}
              aria-current={index === page ? "true" : undefined}
            />
          ))}
        </div>
        <div className="home-arrows">
          <button type="button" aria-label="Previous testimonials" onClick={() => showPage(page - 1)}><ArrowLeft /></button>
          <button type="button" aria-label="Next testimonials" onClick={() => showPage(page + 1)}><ArrowRight /></button>
        </div>
      </div>
    </>
  );
}
