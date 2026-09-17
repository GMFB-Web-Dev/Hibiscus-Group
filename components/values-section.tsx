import Image from "next/image";
import Link from "next/link";

const values = [
  { title: "Going the extra mile", copy: "We put in the extra effort to make sure customers are properly looked after and the job is done right." },
  { title: "Local family service", copy: "As a local, family-operated business, we offer personal service, clear communication and genuine care." },
  { title: "Attention to detail", copy: "We do not believe in “near enough is good enough”. Every job should be completed to a high standard." },
  { title: "Reliable after-sales service", copy: "If something is not right, we want customers to let us know so we can help fix it properly." },
] as const;

export function ValuesSection() {
  return (
    <section className="home-values figma-values">
      <div className="home-shell home-values__grid">
        <div className="home-values__heading">
          <p className="home-eyebrow">Our values</p>
          <h2>Why locals choose Hibiscus Group</h2>
          <span className="home-rule" />
        </div>
        <div className="home-values__items">
          {values.map(({ title, copy }) => (
            <article key={title}>
              <Image className="home-values__icon" src="/images/value-cube.svg" alt="" width={48} height={48} />
              <div><h3>{title}</h3><p>{copy}</p></div>
            </article>
          ))}
          <Link className="home-button home-button--pink" href="/contact">Contact us <Image src="/images/value-arrow.svg" alt="" width={22} height={22} /></Link>
        </div>
      </div>
    </section>
  );
}
