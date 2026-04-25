import jwt from 'jsonwebtoken';

const SECRET = '97791d4db2aa5f689c3cc39356ce35762f0a73aa70923039d8ef72a2840a1b02';

const payload = {
  sub: 'trader_01',
  role: 'trader',
  name: 'Alex Mercer',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365) // 1 year expiry
};

const token = jwt.sign(payload, SECRET, { algorithm: 'HS256' });

console.log("\n--- TEST TOKEN FOR trader_01 ---");
console.log(token);
console.log("--------------------------------\n");
