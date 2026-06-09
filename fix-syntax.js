const fs = require('fs');
const execSync = require('child_process').execSync;
const original = fs.readFileSync('src/app/game/transfers/page.tsx', 'utf8');

const combinations = [
  '}',
  '  }\n}',
  '}\n}',
  '    }\n  }\n}',
  '</div>\n}',
  '  </div>\n}',
  '    </div>\n  );\n}',
  '      </div>\n    </div>\n  );\n}',
  '    </div>\n  }\n}',
  '})',
  '})}'
];

let success = false;
for (const combo of combinations) {
  fs.writeFileSync('src/app/game/transfers/page.tsx', original + '\n' + combo);
  try {
    execSync('npx prettier --write src/app/game/transfers/page.tsx', {stdio: 'ignore'});
    console.log('Fixed with combination:', combo.replace(/\n/g, '\\n'));
    success = true;
    break;
  } catch (e) {
    // try next
  }
}

if (!success) {
  fs.writeFileSync('src/app/game/transfers/page.tsx', original);
  console.log('Failed to fix syntax automatically.');
}
