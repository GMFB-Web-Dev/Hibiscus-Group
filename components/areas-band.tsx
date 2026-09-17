import Image from "next/image";

import { serviceAreas } from "@/lib/services";

type AreasBandProps = {
  dark?: boolean;
  greaterAuckland?: boolean;
};

const greaterAucklandAreas = [
  "Dairy Flat", "Hibiscus Coast", "Orewa", "Whangaparaoa", "Stanmore Bay", "Army Bay", "Gulf Harbour",
  "Puhoi", "West Auckland", "Omaha", "Snells Beach", "East Auckland", "Helensville", "Kumeu",
  "Glenfield", "Birkdale", "Devonport", "Long Bay", "North Shore", "Rodney", "Albany",
  "Auckland City", "Birkenhead", "Silverdale", "Kaukapakapa", "All The Bays", "South Auckland",
];

export function AreasBand({ dark = false, greaterAuckland = false }: AreasBandProps) {
  const areas = greaterAuckland ? greaterAucklandAreas : serviceAreas;
  return (
    <section className={`figma-areas${dark ? " figma-areas--dark" : ""}`}>
      <div className="figma-areas__inner">
        <div className="figma-areas__list">
          {areas.map((area) => <span key={area}><Image src="/images/value-cube.svg" alt="" width={30} height={30} />{area}</span>)}
        </div>
        <div className="figma-areas__copy">
          <h2>{greaterAuckland ? "Servicing Greater Auckland" : "Servicing North Shore and Rodney"}</h2>
          <span className="figma-rule" />
          <p>Based in Dairy Flat, we {greaterAuckland ? "deliver water" : "service a wide area"} across {greaterAuckland ? "Greater Auckland and surrounding areas with a reliable service" : "Rodney, Hibiscus Coast, North Shore and nearby locations"}.</p>
        </div>
      </div>
    </section>
  );
}
