"use client";
import Link from "next/link";
import { useEffect } from "react";
export default function Header() {
  useEffect(() => {
    // YouTubeのコードを生成
    const getYouTubeVideoCode = (url: string): string => {
      const param = new URL(url).searchParams.get("v");
      return param ?? "";
    };

    // モーダルを作って表示
    const printYouTubeModal = (videoCode: string) => {
      const modal = document.createElement("div");
      modal.id = "modalYouTube";
      modal.classList.add("ed-modal");
      modal.innerHTML = `
        <div id="modalOverlay" class="ed-overlay">
          <div class="modalContent">
            <button id="closeModal" class="ed-closeModal">✕</button>
            <div class="video">
              <iframe 
                src="https://www.youtube.com/embed/${videoCode}?autoplay=1" 
                frameborder="0" 
                allowfullscreen>
              </iframe>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

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

      // Esc キーで閉じる（１回だけ）
      window.addEventListener(
        "keyup",
        (e) => { if (e.key === "Escape") removeModal(); },
        { once: true }
      );
    }

    // 指定セレクタのリンクをクリックでモーダルオープンに紐付け
    const openYouTubeModal = (selector: string) => {
      const links = Array.from(
        document.querySelectorAll<HTMLAnchorElement>(selector)
      );
      links.forEach((el) => {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          const code = getYouTubeVideoCode(el.href);
          if (code) printYouTubeModal(code);
        });
      });
    };

    openYouTubeModal('.modal-youtube');
  }, []);
  return (
    <div>
      <header>
        <nav>
          <ul>
            <li>
              <Link href="/" >
                TOP
              </Link>
            </li>
            <li><a href="https://www.youtube.com/watch?v=g8le8JTvcN0" className="modal-youtube">MUSIC</a></li>
            <li>
              <Link href="/about" >
                ABOUT
              </Link>
            </li>
            <li><a href="#shop">SHOP</a></li>
            <li><a href="#supported">SUPPORTED BY</a></li>
            <li><a href="#blog">BLOG</a></li>
          </ul>
        </nav>
      </header>
    </div>
  );
}