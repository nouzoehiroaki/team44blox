"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  const handleClose = () => setMenuOpen(false);

  // YouTubeコンテンツの配列
  const youtubeContents = [
    {
      url: "https://www.youtube.com/watch?v=g8le8JTvcN0",
      title: "TEAM44BLOX - UNITY Prod. DJ WATARAI",
    },
    {
      url: "https://www.youtube.com/watch?v=vr26W2tA8aM",
      title: "JBM The Kong - One Way feat. TAD'S A.C.",
    },
    {
      url: "https://www.youtube.com/watch?v=UewoyOVOYq4",
      title: "MIKRIS - Malaysia Prod By. MASS-HOLE",
    },
    {
      url: "https://www.youtube.com/watch?v=XvA-oVoj1ww",
      title: "MARS MANIE - STAND UP!(2005)",
    },
    {
      url: "https://www.youtube.com/watch?v=C2C4FY2QMNY",
      title: "KGE THE SHADOWMEN - TRANCE 注意報 feat. 鎮座DOPENESS prod. grooveman Spot",
    },
    {
      url: "https://www.youtube.com/watch?v=ueXC3qVt7sw",
      title: "大蛇 - 群青 Scratch by DJ CGE",
    },
    {
      url: "https://www.youtube.com/watch?v=B0c6NnEILr4",
      title: "DABONGZ - B.O.B feat. MARS MANIE,KGE,G-SPICE,JBM,GOCCI",
    },
    {
      url: "https://www.youtube.com/watch?v=duR6mG_JArY",
      title: "NITRO MICROPHONE UNDERGROUND - SHUTTA",
    },
    {
      url: "https://www.youtube.com/watch?v=OgbB0cl-xHw",
      title: "Team 44 Blox - Right Here",
    },
    {
      url: "https://www.youtube.com/watch?v=UFpI_NGgZB4",
      title: "JHETT a.k.a YAKKO - JUST GO feat. Kumi Koda",
    },
    {
      url: "https://www.youtube.com/watch?v=MuQIStPVXA4",
      title: "SMITH-CN - ROLLIN' 〜 TAKE IT 2 THE TOP",
    },
    {
      url: "https://www.youtube.com/watch?v=5dL5xYJzhx4",
      title: "Jean Flexx ASN Remix feat. SNIPE",
    },
    {
      url: "https://www.youtube.com/watch?v=2hZtPIp8KnM",
      title: "T.MANGKANG - The Voice",
    },
    {
      url: "https://www.youtube.com/watch?v=5AHLpUG4ack",
      title: "GOCCI prod. by DJ VIBLAM - Red Bull 64 Bars",
    }
  ];

  // Splideのオプション
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

  useEffect(() => {
    // YouTubeのコードを生成
    const getYouTubeVideoCode = (url: string): string => {
      const param = new URL(url).searchParams.get("v");
      return param ?? "";
    };

    // 現在のアクティブな動画を一時停止する関数
    const pauseOtherVideos = (splideInstance: any) => {
      const currentIndex = splideInstance.index;
      const allSlides = splideInstance.Components.Slides.get(); // 全スライドを取得

      allSlides.forEach((slide: any, index: number) => {
        // 現在のスライド以外の場合
        if (index !== currentIndex) {
          const iframe = slide.slide.querySelector('iframe');
          if (iframe && iframe.contentWindow) {
            // YouTube IFrame Player APIのpostMessageを使って一時停止
            iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
          }
        }
      });
    };

    // スライダー付きモーダルを作って表示
    const printYouTubeModal = () => {
      const modal = document.createElement("div");
      modal.id = "modalYouTube";
      modal.classList.add("ed-modal");

      // React コンポーネントとして処理するため、ここでは基本構造のみ作成
      modal.innerHTML = `
        <div id="modalOverlay" class="ed-overlay">
          <div class="modalContent youtube-slider-modal">
            <button id="closeModal" class="ed-closeModal">✕</button>
            <div id="youtube-slider-container"></div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Splideコンテナに動的にスライダーを挿入
      const container = modal.querySelector("#youtube-slider-container");
      if (container) {
        // スライダー構造を作成
        const splideElement = document.createElement("div");
        splideElement.className = "splide";
        splideElement.innerHTML = `
          <div class="splide__track">
            <ul class="splide__list">
              ${youtubeContents.map((content, index) => `
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
                    <div class="video-info">
                      <h3>${content.title}</h3>
                    </div>
                  </div>
                </li>
              `).join('')}
            </ul>
          </div>
        `;

        container.appendChild(splideElement);

        // Splide初期化（動的インポート）
        import('@splidejs/splide').then(({ Splide }) => {
          const splideInstance = new Splide(splideElement, splideOptions);

          // arrow ボタンがクリックされた時の処理
          splideInstance.on('moved', (newIndex: number) => {
            pauseOtherVideos(splideInstance);
          });

          // または move イベント（移動開始時）を使用
          // splideInstance.on('move', (newIndex: number, oldIndex: number) => {
          //   pauseOtherVideos(splideInstance);
          // });

          splideInstance.mount();
        });
      }

      // モーダル内要素を取得
      const overlay = modal.querySelector<HTMLElement>("#modalOverlay");
      const closeBtn = modal.querySelector<HTMLElement>("#closeModal");

      const removeModal = () => modal.remove();

      // ボタン / オーバーレイで閉じる
      closeBtn?.addEventListener("click", removeModal);

      overlay?.addEventListener("click", (e) => {
        if (!(e.target instanceof HTMLElement)) return;
        if (e.target.id === "modalOverlay") removeModal();
      });

      // Esc キーで閉じる
      window.addEventListener(
        "keyup",
        (e) => { if (e.key === "Escape") removeModal(); },
        { once: true }
      );
    };

    // 指定セレクタのリンクをクリックでモーダルオープンに紐付け
    const openYouTubeModal = (selector: string) => {
      const links = Array.from(
        document.querySelectorAll<HTMLAnchorElement>(selector)
      );
      links.forEach((el) => {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          printYouTubeModal();
        });
      });
    };

    openYouTubeModal('.modal-youtube');
  }, []);

  return (
    <div>
      <header>
        <button
          id="btn03"
          className={`${"btnTrigger"} ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="メニューを開閉"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
        <nav className={`${menuOpen ? "show" : ""}`}>
          <ul>
            <li>
              <Link href="/" onClick={handleClose}>
                TOP
              </Link>
            </li>
            <li><a href="#" className="modal-youtube">MUSIC</a></li>
            <li>
              <Link href="/about" onClick={handleClose}>
                ABOUT
              </Link>
            </li>
            <li>
              <Link href="/shop" onClick={handleClose}>
                SHOP
              </Link>
            </li>
            <li>
              <Link href="/supportedby" onClick={handleClose}>
                SUPPORTED BY
              </Link>
            </li>
            <li>
              <Link href="/news" onClick={handleClose}>
                NEWS
              </Link>
            </li>
            <li>
              <Link href="/schedule" onClick={handleClose}>
                SCHEDULE
              </Link>
            </li>
          </ul>
        </nav>
      </header>
    </div>
  );
}