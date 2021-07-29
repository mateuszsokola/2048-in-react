let seqId = 1;

/**
 * Returns next sequential number.
 *
 * @returns {number}
 */
export const useIds = () => {
  const nextId = () => {
    return seqId++;
  };

  return [nextId];
};
