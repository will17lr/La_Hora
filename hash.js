const bcrypt = require("bcrypt");

(async () => {
  const pass = "MonMdp!2025";
  const hash = await bcrypt.hash(pass, 10);
  console.log("HASH GÉNÉRÉ PAR TON PROJET =", hash);
})();
