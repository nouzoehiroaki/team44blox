'use client';
import "../../styles/svg.css";
import "../../styles/styles.css"
import { Carousel, CarouselSlide } from "@/components/ui/Carousel";
import Image from 'next/image'

export default function Shop() {
  return (
    <div>
      <section className="shop fixed sesame">
        <Carousel ariaLabel="Shop items" options={{ arrows: true, gap: '1.5rem' }}>
          <CarouselSlide>
            <div className="box">
              <picture>
                <source srcSet="/sesame01.webp" type="image/webp" />
                <Image src="/sesame01.jpg" className="sesame" alt="Jah God" width={500} height={443} />
              </picture>
            </div>
          </CarouselSlide>
          <CarouselSlide>
            <div className="box">
              <picture>
                <source srcSet="/sesame02.webp" type="image/webp" />
                <Image src="/sesame02.jpg" className="sesame" alt="Mad Skill" width={400} height={400} />
              </picture>
            </div>
          </CarouselSlide>
        </Carousel>
        <h2>WHERE YOU AT !!!</h2>
      </section>
    </div>
  );
}
