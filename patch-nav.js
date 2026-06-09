const fs = require('fs');

let c = fs.readFileSync('src/app/game/layout.tsx', 'utf8');

c = c.replace(
  'Building, GraduationCap}',
  'Building, GraduationCap, Landmark}'
);

c = c.replace(
  '{ name: "Transfers", href: "/game/transfers", icon: ArrowLeftRight },',
  '{ name: "Transfers", href: "/game/transfers", icon: ArrowLeftRight },\n      { name: "Finances", href: "/game/finances", icon: Landmark },'
);

fs.writeFileSync('src/app/game/layout.tsx', c);
console.log("Nav patched.");
