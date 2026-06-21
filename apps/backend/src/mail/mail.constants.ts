/** Time window (ms) for the test-send endpoint's dedicated rate limit. */
export const TEST_SEND_THROTTLE_TTL = 60_000;

/** Max test-send requests allowed per {@link TEST_SEND_THROTTLE_TTL} window. */
export const TEST_SEND_THROTTLE_LIMIT = 5;
