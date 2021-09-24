export const setHookState = newState =>
  jest.fn().mockImplementation(() => [newState, () => {}]);
