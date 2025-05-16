import "../../styles/svg.css";
import "../../styles/styles.css"
//import { useEffect } from "react";
import Image from 'next/image'

export default function Shop() {
  return (
    <div>
      <section className="shop fixed">
        <div className="flex">
          <div className="box">
            <picture>
              <source srcSet="/44blox.webp" type="image/webp" />
              <Image
                src="/44blox.png"
                alt=""
                width={500}
                height={443}
              />
            </picture>
          </div>
          <div className="box">
            <picture>
              <source srcSet="/jah-god.webp" type="image/webp" />
              <Image
                src="/jah-god.png"
                alt=""
                width={500}
                height={443}
              />
            </picture>
          </div>
        </div>
        <div className="position">
          <a href="https://shop.lb-2.com/" target="_blank">
            <picture>
              <source srcSet="/lb-online.webp" type="image/webp" />
              <Image
                src="/lb-online.jpg"
                alt=""
                width={2000}
                height={337}
              />
            </picture>
          </a>
        </div>
      </section>
    </div>
  );
}
