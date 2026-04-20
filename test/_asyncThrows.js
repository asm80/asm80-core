export const asyncThrows = (assert, fn, matcher) => {
  let done = assert.async();
  return new Promise((resolve) => {
    fn().then(() => {
      assert.ok(false, "expected throw, but resolved");
      done(); resolve();
    }).catch(e => {
      if (matcher) {
        assert.ok(matcher(e), `error matched: ${JSON.stringify(e)}`);
      } else {
        assert.ok(true);
      }
      done(); resolve();
    });
  });
};
