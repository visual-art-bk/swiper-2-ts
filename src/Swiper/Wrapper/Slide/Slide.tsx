import {
  ForwardedRef,
  forwardRef,
  MutableRefObject,
  RefObject,
  useEffect,
  useState,
} from "react";
import "./slide.module.css";
import Store from "@/Store/Store";
import Lottie from "./Lottie/Lottie";
import ImageMatrixer from "./ImageMatrixer/ImageMatrixer";
import { useRecoilState, useRecoilValue } from "recoil";

const { atomToSlide, atomToLotteText, atomToImageMatrixer, atomToSwiper } =
  Store.getAtoms();

const PREFIX = "_swpSlide-md-54";

const CLASSNAME_DEFAULT = "swiper-slide";
const CLASSNAME_DUPLICATE = "duplicate";
const CLASSNAME_ACTIVE = "swiper-slide-active";
const CLASSNAME_PREV = "swiper-slide-prev";
const CLASSNAME_NEXT = "swiper-slide-next";

let TIMEOUT_ID: NodeJS.Timeout;

type tIndexes = {
  isDuplicateSlide: boolean;
  indexToDuplicateSlide: number;
  endIndex: number;
  uidIndex: number;
  rendering: {
    textContent: string;
    itemId?: string;
    href?: string;
  };
  playPros: {
    durationToPlaySlide?: number;
  };
  durationForSlider: number;
};
export const Slide = forwardRef(function Slide(
  props: tIndexes,
  ref: ForwardedRef<HTMLDivElement>
) {
  const {
    endIndex,
    indexToDuplicateSlide,
    uidIndex,
    rendering,
    isDuplicateSlide,
    playPros,
    durationForSlider,
  } = props;

  const { textContent } = rendering;

  const [stateToSlide, setStateToSlide] = useRecoilState(atomToSlide);
  const [stateToLottieText, setStateToLottieText] =
    useRecoilState(atomToLotteText);
  const stateImgMatrixer = useRecoilValue(atomToImageMatrixer);
  const stateToSwiper = useRecoilValue(atomToSwiper);

  const [stateClassNamesToDuplicateSlide, setStateClassNamesToDuplicateSlide] =
    useState(CLASSNAME_DEFAULT);

  const [stateClassNameToSlide, setStateClassNameToSlide] =
    useState(CLASSNAME_DEFAULT);

  const [stateToWindowWidth, setStateToWindowInnerWidth] = useState(
    window.innerWidth
  );

  const updateClassNames = () => {
    const whenSlideIsActive = uidIndex === stateToSwiper.currentIndex;

    const whenSlideIsNext = uidIndex === stateToSwiper.currentIndex + 1;

    const whenSlideIsPrev = uidIndex === stateToSwiper.currentIndex - 1;
    const whenSlideIsPrevAndLastSlide =
      stateToSwiper.currentIndex === indexToDuplicateSlide &&
      uidIndex === endIndex;

    const whenSlideIsPrevAndFirstSlide =
      stateToSwiper.currentIndex === endIndex &&
      uidIndex === indexToDuplicateSlide;

    if (whenSlideIsActive) {
      setStateClassNameToSlide(
        getClassnames([CLASSNAME_DEFAULT, CLASSNAME_ACTIVE])
      );
    } else if (whenSlideIsPrev) {
      setStateClassNameToSlide(
        getClassnames([CLASSNAME_DEFAULT, CLASSNAME_PREV])
      );
    } else if (whenSlideIsNext) {
      setStateClassNameToSlide(
        getClassnames([CLASSNAME_DEFAULT, CLASSNAME_NEXT])
      );
    } else if (whenSlideIsPrevAndFirstSlide) {
      setStateClassNameToSlide(
        getClassnames([CLASSNAME_DEFAULT, CLASSNAME_NEXT])
      );
    } else if (whenSlideIsPrevAndLastSlide) {
      setStateClassNameToSlide(
        getClassnames([CLASSNAME_DEFAULT, CLASSNAME_PREV])
      );
    } else {
      setStateClassNameToSlide(CLASSNAME_DEFAULT);
    }
  };

  useEffect(() => {
    updateClassNames();
  }, [stateToSwiper.currentIndex]);

  useEffect(() => {
    if (isDuplicateSlide === true) {
      setStateClassNamesToDuplicateSlide(
        `${CLASSNAME_DEFAULT} ${CLASSNAME_DUPLICATE}`
      );
    }
  }, []);

  useEffect(() => {
    const updateWindowSize = (event: UIEvent) => {
      const { innerWidth } = window;

      setStateToWindowInnerWidth(innerWidth);
    };

    window.addEventListener("resize", updateWindowSize);

    return () => {
      window.removeEventListener("resize", updateWindowSize);
    };
  }, [stateToWindowWidth]);

  useEffect(() => {
    if (stateToSwiper.currentIndex !== uidIndex) {
      return;
    }

    if (
      stateToLottieText.didPlayUp === "active" &&
      stateImgMatrixer.didPlayUp === "active"
    ) {
      setStateToSlide({
        ...stateToSlide,
        didPlayUp: "active",
      });

      return;
    }

    if (
      stateToLottieText.didPlayUp === "pendig" &&
      stateImgMatrixer.didPlayUp === "pending"
    ) {
      setStateToSlide({
        ...stateToSlide,
        didPlayUp: "pending",
      });

      return;
    }
  }, [
    stateToSwiper.currentIndex,
    stateToLottieText.didPlayUp,
    stateImgMatrixer.didPlayUp,
  ]);

  useEffect(() => {
    if (stateToSwiper.currentIndex !== uidIndex) {
      return;
    }
    console.warn(
      `[ index: ${stateToSwiper.currentIndex} ][ B - Slide ] - stateToSlide.didPlayUp:`,
      stateToSlide.didPlayUp
    );
  }, [stateToSlide.didPlayUp]);

  return (
    <div
      className={
        isDuplicateSlide === true
          ? stateClassNamesToDuplicateSlide
          : stateClassNameToSlide
      }
      itemID={props.rendering.itemId}
      prefix={PREFIX}
      style={{ width: `${stateToWindowWidth}px` }}
      ref={ref}
    >
      <a href={props.rendering.href}>
        <Lottie
          uidIndex={uidIndex}
          pathToJson="dist/json/lottie-slide.json"
        ></Lottie>

        <ImageMatrixer
          uidIndex={uidIndex}
          endIndex={endIndex}
          indexToDuplicateSlide={indexToDuplicateSlide}
        ></ImageMatrixer>

        <div>{rendering.textContent}</div>
      </a>
    </div>
  );
});

function getClassnames(classnames: string[]) {
  return classnames.join(" ");
}
type tPropsToAdjustPlayTime = {
  durationForSlider: number;
  durationToPlaySlide: number | undefined;
  additionalPlayTime: number;
};
function adjustPlayTime(props: tPropsToAdjustPlayTime) {
  const { additionalPlayTime, durationForSlider, durationToPlaySlide } = props;
  return (
    durationForSlider +
    (durationToPlaySlide === undefined ? 0 : durationToPlaySlide) +
    additionalPlayTime
  );
}
