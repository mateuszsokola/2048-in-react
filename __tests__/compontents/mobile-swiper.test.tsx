import React from "react";
import { render, fireEvent } from "@testing-library/react";
import MobileSwiper, { SwipeInput } from "@/components/mobile-swiper";

describe("MobileSwiper", () => {
  it("should trigger onSwipe with correct input on touch end", () => {
    const onSwipeMock = jest.fn();
    const { container } = render(
      <MobileSwiper onSwipe={onSwipeMock}>
        <div data-testid="swipe-target">Swipe me!</div>
      </MobileSwiper>,
    );

    const swipeTarget = container.querySelector(
      "[data-testid='swipe-target']",
    ) as HTMLElement;

    fireEvent.touchStart(swipeTarget, {
      touches: [{ clientX: 0, clientY: 0 }],
    });
    fireEvent.touchEnd(swipeTarget, {
      changedTouches: [{ clientX: 50, clientY: 0 }],
    });

    expect(onSwipeMock).toHaveBeenCalledWith({ deltaX: 50, deltaY: 0 });
  });

  it("should not trigger onSwipe if touch is outside the component", () => {
    const onSwipeMock = jest.fn();
    const { container } = render(
      <MobileSwiper onSwipe={onSwipeMock}>
        <div data-testid="swipe-target">Swipe me!</div>
      </MobileSwiper>,
    );

    const swipeTarget = container.querySelector(
      "[data-testid='swipe-target']",
    ) as HTMLElement;

    fireEvent.touchStart(swipeTarget, {
      touches: [{ clientX: 0, clientY: 0 }],
    });
    fireEvent.touchEnd(document.body, {
      changedTouches: [{ clientX: 50, clientY: 0 }],
    });

    expect(onSwipeMock).not.toHaveBeenCalled();
  });
});
