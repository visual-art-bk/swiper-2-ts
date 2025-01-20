import lottie from "lottie-web";
import { useEffect, useRef } from "react";
import { useRecoilValue, useRecoilState } from "recoil";
import Store from "@/Store/Store";
let timeOutList: NodeJS.Timeout[] = [];

const { atomToLotteText, atomToSlide, atomToSwiper } = Store.getAtoms();
type tLottie = {
  uidIndex: number;
  pathToJson: string;
};
export default function Lottie(props: tLottie) {
  const [stateToLottieText, setStateToLottieText] =
    useRecoilState(atomToLotteText);
  const stateToSwiper = useRecoilValue(atomToSwiper);

  const { uidIndex, pathToJson } = props;
  const lottieRef = useRef(document.createElement("div"));
  const lottieName = `lottie_slide_text_${uidIndex}`;
  const lottiePath = `${window.location.origin}/${pathToJson}`;

  useEffect(() => {
    if (uidIndex !== stateToSwiper.currentIndex) {
      lottie.destroy(lottieName);
      return;
    }
    lottie
      .loadAnimation({
        container: lottieRef.current,
        renderer: "svg",
        loop: false,
        autoplay: true,
        path: lottiePath,
        // path: 'https://rchr-lab.store/wp-content/uploads/swiper-test/dist/json/lottie-slide.json',
        name: lottieName,
      })
      .addEventListener("complete", () => {
        const timeOutId = setTimeout(() => {
          if (stateToSwiper.currentIndex === 0) {
            setStateToLottieText({
              ...stateToLottieText,
              didPlayUp: "pending",
            });
            return;
          }
          setStateToLottieText({
            ...stateToLottieText,
            didPlayUp: "active",
          });
        }, 3000);
        timeOutList.push(timeOutId);
      });

    return () => {
      timeOutList.forEach((id) => {
        clearTimeout(id);
      });
      timeOutList = [];
    };
  }, [stateToSwiper.currentIndex]);
  // log for dev.
  useEffect(() => {
    if (uidIndex !== stateToSwiper.currentIndex) {
      return;
    }
    console.warn(
      `[ index: ${stateToSwiper.currentIndex} ][ C - Lottie Play Up!] stateToLottieText.didPlayUp: `,
      stateToLottieText.didPlayUp
    );
  }, [stateToLottieText.didPlayUp]);

  return <div id="lottie" ref={lottieRef}></div>;
}
