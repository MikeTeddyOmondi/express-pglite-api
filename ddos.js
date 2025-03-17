(async () => {
  for (;;) {
    const res = await fetch("http://localhost:3489");
    console.log({res})
  }
})();
