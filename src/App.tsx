import React, { useState } from "react";
import { Board } from "./components/Board";
import { Button } from "./components/Button";
import "./App.less";

/* eslint-disable react/jsx-no-target-blank */
export const App = () => {
  const [date, setDate] = useState<Date>(new Date());

  const handleRestart = () => {
    setDate(new Date());
  };

  return (
    <div className="App">
      <div className="header">
        <div>
          <h1>Play 2048</h1>
        </div>
        <div>
          <Button onClick={handleRestart}>Restart</Button>
        </div>
      </div>
      <Board key={date.toISOString()} />
      <div>
        <p>
          <b>Wondering how was that built?</b> You can find a video tutorial and
          code here:
        </p>
        <ul>
          <li>
            <a
              href="https://www.youtube.com/channel/UCJV16_5c4A0amyBZSI4yP6A"
              target="_blank"
            >
              Tutorial (YouTube)
            </a>
          </li>
          <li>
            <a
              href="https://github.com/mateuszsokola/2048-in-react/"
              target="_blank"
            >
              Source code (Github)
            </a>
          </li>
          <li>
            <a
              href="https://mateuszsokola.github.io/2048-animation-examples/"
              target="_blank"
            >
              Animation Examples (Github Pages)
            </a>
          </li>
        </ul>
        <p>
          This game (2048) was built using <b>React</b> and <b>TypeScript</b>.
          The unique part of this example is animations. The animations in React
          aren't that straightforward, so I hope you can learn something new
          from it.
        </p>
      </div>
      <div className="footer">
        Made with ❤️ by{" "}
        <a
          href="https://www.youtube.com/channel/UCJV16_5c4A0amyBZSI4yP6A"
          target="_blank"
        >
          Matt Sokola
        </a>
      </div>
    </div>
  );
};
/* eslint-enable react/jsx-no-target-blank */
