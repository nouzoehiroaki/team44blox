import "../../styles/svg.css";
import "../../styles/styles.css"
//import { useEffect } from "react";
import { TypingText } from "@/components/TypingText";

export default function About() {
  const profileText =
    `千葉、茨城の主要地域で発症したCREATIVE集団\n HIPHOPカルチャーをベースに、地域世代をこえ、現在もその母体を広げ続けている`;
  return (
    <div>
      <section id="member" className="member fixed">
        <TypingText
          text={profileText}
          speed={70} // お好みで早さを調整
          className="profile"
        />
      </section>
    </div>
  );
}
