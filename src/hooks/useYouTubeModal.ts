"use client";
import { useEffect } from "react";
import type { YouTubeContent } from "@/data/youtubeContents";

const splideOptions = {
  type: 'fade',
  perPage: 1,
  arrows: true,
  pagination: false,
  speed: 800,
  gap: 0,
  autoplay: false,
  rewind: true,
};

function getYouTubeVideoCode(url: string): string {
  const param = new URL(url).searchParams.get("v");
  return param ?? "";
}

function pauseOtherVideos(splideInstance: any) {
  const currentIndex = splideInstance.index;
  splideInstance.Components.Slides.get().forEach((slide: any, index: number) => {
    if (index !== currentIndex) {
      const iframe = slide.slide.querySelector('iframe');
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      }
    }
  });
}

function buildYouTubeModal(contents: YouTubeContent[]): HTMLElement {
  const modal = document.createElement("div");
  modal.id = "modalYouTube";
  modal.classList.add("ed-modal");
  modal.innerHTML = `
    <div id="modalOverlay" class="ed-overlay">
      <div class="modalContent youtube-slider-modal">
        <button id="closeModal" class="ed-closeModal">✕</button>
        <div id="youtube-slider-container"></div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const container = modal.querySelector("#youtube-slider-container");
  if (container) {
    const splideElement = document.createElement("div");
    splideElement.className = "splide";
    splideElement.innerHTML = `
      <div class="splide__track">
        <ul class="splide__list">
          ${contents.map((content, index) => `
            <li class="splide__slide">
              <div class="youtube-slide-content">
                <div class="video-wrapper">
                  <iframe
                    src="https://www.youtube.com/embed/${getYouTubeVideoCode(content.url)}?enablejsapi=1${index === 0 ? '&autoplay=1' : ''}"
                    frameborder="0"
                    allowfullscreen
                    loading="${index === 0 ? 'eager' : 'lazy'}">
                  </iframe>
                </div>
                <div class="video-info"><h3>${content.title}</h3></div>
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
    container.appendChild(splideElement);

    import('@splidejs/splide').then(({ Splide }) => {
      const splideInstance = new Splide(splideElement, splideOptions);
      splideInstance.on('moved', () => pauseOtherVideos(splideInstance));
      splideInstance.mount();
    });
  }

  const removeModal = () => modal.remove();
  const overlay = modal.querySelector<HTMLElement>("#modalOverlay");
  const closeBtn = modal.querySelector<HTMLElement>("#closeModal");

  closeBtn?.addEventListener("click", removeModal);
  overlay?.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).id === "modalOverlay") removeModal();
  });
  window.addEventListener("keyup", (e) => { if (e.key === "Escape") removeModal(); }, { once: true });

  return modal;
}

export function useYouTubeModal(contents: YouTubeContent[]) {
  useEffect(() => {
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.modal-youtube'));
    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      buildYouTubeModal(contents);
    };
    links.forEach((el) => el.addEventListener("click", handleClick));
    return () => links.forEach((el) => el.removeEventListener("click", handleClick));
  }, []);
}
