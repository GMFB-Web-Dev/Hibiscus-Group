"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const quote = "“Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s”";

const slides = Array.from({ length: 5 }, (_, slideIndex) =>
  Array.from({ length: 3 }, (_, cardIndex) => ({
    id: `${slideIndex}-${cardIndex}`,
    quote,
    author: "John Doe",
  })),
);

export function TestimonialsCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setCurrent((value) => (value + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [paused]);

  function previous() {
    setCurrent((value) => (value - 1 + slides.length) % slides.length);
  }

  function next() {
    setCurrent((value) => (value + 1) % slides.length);
  }

  function finishSwipe(clientX: number) {
    if (touchStart.current === null) return;
    const distance = clientX - touchStart.current;
    if (Math.abs(distance) > 45) {
      if (distance > 0) previous();
      else next();
    }
    touchStart.current = null;
  }

  return (
    <section
      className="testimonials"
      aria-roledescription="carousel"
      aria-label="Customer testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <header className="testimonials-heading">
        <p>TESTIMONIALS</p>
        <h2>TRUSTED BY LOCAL CUSTOMERS</h2>
        <Image src="/images/figma/testimonial-underline.svg" alt="" width={233} height={8} />
      </header>

      <div
        className="testimonial-viewport"
        onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }}
        onTouchEnd={(event) => finishSwipe(event.changedTouches[0].clientX)}
      >
        <div className="testimonial-track" style={{ transform: `translate3d(-${current * 100}%, 0, 0)` }}>
          {slides.map((slide, slideIndex) => (
            <div
              className="testimonial-slide"
              key={slideIndex}
              aria-hidden={slideIndex !== current}
            >
              {slide.map((testimonial) => (
                <blockquote className="testimonial-card" key={testimonial.id}>
                  <Image src="/images/figma/testimonial-stars.svg" alt="5 out of 5 stars" width={116} height={19} />
                  <p>{testimonial.quote}</p>
                  <cite>{testimonial.author}</cite>
                </blockquote>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="testimonial-controls">
        <div className="testimonial-dots" aria-label="Choose testimonial slide">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to testimonial slide ${index + 1}`}
              aria-current={current === index ? "true" : undefined}
              className={current === index ? "active" : ""}
              onClick={() => setCurrent(index)}
            />
          ))}
        </div>
        <div className="testimonial-arrows">
          <button type="button" onClick={previous} aria-label="Previous testimonials">
            <Image src="/images/figma/testimonial-chevron-left.svg" alt="" width={26} height={26} />
          </button>
          <button type="button" onClick={next} aria-label="Next testimonials">
            <Image src="/images/figma/testimonial-chevron-right.svg" alt="" width={26} height={26} />
          </button>
        </div>
      </div>
    </section>
  );
}
