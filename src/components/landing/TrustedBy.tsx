import React from "react";
import { CompanyLogo1, CompanyLogo2, CompanyLogo3, CompanyLogo4, CompanyLogo5, CompanyLogo6 } from "./icons";

const logos = [
  <CompanyLogo1 key="1" />,
  <CompanyLogo2 key="2" />,
  <CompanyLogo3 key="3" />,
  <CompanyLogo4 key="4" />,
  <CompanyLogo5 key="5" />,
  <CompanyLogo6 key="6" />,
];

export const TrustedBy = () => {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm font-bold text-muted-foreground tracking-wider uppercase">
          Trusted by the world&apos;s most innovative companies
        </p>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-4">
          {logos.map((logo, i) => (
            <div key={i} className="flex justify-center items-center">
              {React.cloneElement(logo, { className: "h-8 w-auto text-muted-foreground/70" })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}; 