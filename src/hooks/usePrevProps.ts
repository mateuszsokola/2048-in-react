import { useEffect, useRef } from "react";

/**
 * `usePrevProps` allows to store previous value of the tracked props.
 *
 * @link https://blog.logrocket.com/how-to-get-previous-props-state-with-react-hooks/
 * @param {K} value
 * @returns {K | undefined}
 */
export const usePrevProps = <K = any>(value: K) => {
  const ref = useRef<K>();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
};
