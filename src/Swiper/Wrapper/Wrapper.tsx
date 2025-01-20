import { __dev__tool__recordTime } from "@/__DEV__TOOLS__/__dev__tool__recordTime";
import {
  Fragment,
  ReactElement,
  RefObject,
  useEffect,
  useRef,
  useState,
  useReducer,
} from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import "./wrapper.module.css";
import { getRenderingChunks } from "./renderingForSlide/renderingForSlide";
import { Slide } from "./Slide/Slide";
import Store from "@/Store/Store";
import setSwiperStateAsync from "./helpersToAsync/setSwiperStateAsync";

const { atomToSwiper, atomToSlide, atomToLotteText, atomToImageMatrixer } =
  Store.getAtoms();
const PREFIX = "_swiperWrp-je-32";

//TODO duration is related to width of window. set valut to state.
const DURATION_MS = 0;

const DELAY_AFTER_WIDTH_RESIZE_MS = 3000;
const INDEX_TO_DUPLICATE_SLIDE = 0;
const INDEX_TO_START_SLIDE = 1;
const INDEX_TO_LAST_SLIDE = 2;
const SLIDES_SIZE = INDEX_TO_LAST_SLIDE + 1;

let TIMEOUT_IDS: NodeJS.Timeout[] = [];

export default function Wrapper() {
  const [stateToSwiper, setStateToSwiper] = useRecoilState(atomToSwiper);
  const [stateToSlide, setStateToSlide] = useRecoilState(atomToSlide);
  const [stateToLottieTex, setStateToLottieText] =
    useRecoilState(atomToLotteText);
  const [stateToImgMatrixer, setStateToImgMatrixer] =
    useRecoilState(atomToImageMatrixer);

  const [stateToClassName, setStateToClassName] = useState("swiper-wrapper");

  const [stateToWindowWidth, setStateToWindowInnerWidth] = useState(
    window.innerWidth
  );
  const [__dev__stateToStop, set__dev__stateStop] = useState(false);

  const testSlideChunks = getRenderingChunks({
    indexToDuplicateSlide: INDEX_TO_DUPLICATE_SLIDE,
    sizeToDuplicateSlides: 1,
    sizeToSlides: SLIDES_SIZE,
  }).map((chunk, index) => {
    const { content, isDuplicateSlide, key } = chunk;
    return (
      <Fragment key={key}>
        <Slide
          endIndex={INDEX_TO_LAST_SLIDE}
          isDuplicateSlide={isDuplicateSlide}
          rendering={{
            textContent: content.textContent,
            itemId: content.itemId,
            href: content.href,
          }}
          indexToDuplicateSlide={INDEX_TO_DUPLICATE_SLIDE}
          uidIndex={index}
          playPros={{
            durationToPlaySlide:
              chunk.playPros.durationToPlaySlide !== undefined
                ? chunk.playPros.durationToPlaySlide
                : 0,
          }}
          durationForSlider={DURATION_MS}
        ></Slide>
      </Fragment>
    );
  });

  const initPlayedUpSlide = () =>
    new Promise((resolve) => {
      resolve(
        setStateToLottieText({
          didPlayUp: "inactive",
          isPending: false,
        })
      );
      resolve(setStateToImgMatrixer({ didPlayUp: "inactive" }));
      resolve(
        setStateToSlide({
          didPlayUp: "inactive",
        })
      );
    });

  const initToPendingAfterPlayedUpDulicate = () =>
    new Promise((resolve) => {
      resolve(
        setStateToSlide({
          didPlayUp: "pending",
        })
      );
    });

  const changeToNextSlide = (state: typeof stateToSwiper) =>
    new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        resolve(
          setStateToSwiper({
            ...state,
          })
        );
      });

      TIMEOUT_IDS.push(timeoutId);
    });

  const SlideChanger = async () => {
    /**
     * Returns `true` when
     *  - the slide is the duplicate for which slide change last slide to the dulicate slide
     * before which first slide.
     */
    if (stateToSwiper.currentIndex > INDEX_TO_LAST_SLIDE) {
      await changeToNextSlide({
        currentIndex: INDEX_TO_DUPLICATE_SLIDE,
        motionState: "",
        transition: "",
      });
      return await initToPendingAfterPlayedUpDulicate();
    }
    await changeToNextSlide({
      motionState: "active",
      transition: "transform 500ms ease-in-out",
      currentIndex: stateToSwiper.currentIndex + 1,
    });

    return await initPlayedUpSlide();
  };

  const resumeSlideAfterResizeWidth = () => {
    const timeoutId = setTimeout(() => {
      setStateToSwiper({
        ...stateToSwiper,
        motionState: "active",
        transition: "transform 500ms ease-in-out",
      });
    }, DELAY_AFTER_WIDTH_RESIZE_MS);

    TIMEOUT_IDS.push(timeoutId);
  };

  const updateWindowSize = () => {
    const { innerWidth } = window;
    setStateToWindowInnerWidth(innerWidth);

    setStateToSwiper({
      ...stateToSwiper,
      motionState: "inactive",
      transition: "",
    });
    resumeSlideAfterResizeWidth();
  };

  const __dev__stop_SlideChanger = () => {
    set__dev__stateStop(true);
  };

  useEffect(
    function Initializer() {
      const durationToSlides = adjustDuration({
        durationToSlides: DURATION_MS,
        indexToDuplicateSlideForMask: INDEX_TO_DUPLICATE_SLIDE,
        currentIndex: stateToSwiper.currentIndex,
      });

      if (
        (stateToSlide.didPlayUp === "active" ||
          stateToSlide.didPlayUp === "pending") &&
        __dev__stateToStop === false
      ) {
        const timeoutId = setTimeout(SlideChanger, durationToSlides);
        TIMEOUT_IDS.push(timeoutId);
      }

      return () => {
        TIMEOUT_IDS.forEach((id) => {
          clearTimeout(id);
        });
        TIMEOUT_IDS = [];
      };
    },
    [stateToSlide.didPlayUp]
  );

  useEffect(
    function WidthResizer() {
      window.addEventListener("resize", updateWindowSize);

      return () => {
        window.removeEventListener("resize", updateWindowSize);
      };
    },
    [stateToWindowWidth]
  );

  useEffect(() => {
    if (stateToSwiper.motionState === "active") {
      setStateToClassName("swiper-wrapper loaded");
    } else {
      setStateToClassName("swiper-wrapper");
    }
  }, [stateToSwiper.motionState]);

  useEffect(() => {
    console.warn(stateToSwiper);
  }, [stateToSwiper.currentIndex]);

  return (
    <>
      <button
        style={{ position: "fixed", top: "10px", left: "0px", zIndex: "90000" }}
        onClick={__dev__stop_SlideChanger}
      >
        Stop
      </button>

      <div
        className={stateToClassName}
        style={{
          transform: `translate3D(${
            stateToSwiper.currentIndex * -stateToWindowWidth
          }px, 0, 0)`,
          transition: stateToSwiper.transition,
        }}
        prefix={PREFIX}
      >
        {testSlideChunks}
      </div>
    </>
  );
}

function adjustDuration({
  currentIndex,
  indexToDuplicateSlideForMask,
  durationToSlides,
}: {
  currentIndex: number;
  indexToDuplicateSlideForMask: number;
  durationToSlides: number;
}) {
  const durationWhenDuplicateSlideMask = 0;
  return currentIndex === indexToDuplicateSlideForMask
    ? durationWhenDuplicateSlideMask
    : durationToSlides;
}
