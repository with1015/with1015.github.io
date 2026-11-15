#!/usr/bin/env node
// 청첩장 사진 암호화 스크립트
//
//   node _tools/encrypt-invite-images.js              # assets/invite/의 모든 사진
//   node _tools/encrypt-invite-images.js main.jpg     # 지정한 사진만
//
// - assets/invite/ 안의 원본 사진(.jpg/.jpeg/.png)을 웹용 크기(긴 변 1800px)로 줄인 뒤
//   AES-256-GCM으로 암호화해 같은 폴더에 .enc 로 저장합니다.
//     intro.jpg / main.jpg → intro.enc / main.enc
//     그 밖의 사진         → 갤러리 사진. 파일 이름 순서대로 gallery-01.enc, gallery-02.enc …
//   갤러리는 페이지가 gallery-*.enc 를 자동으로 찾아 번호 순서대로 보여 줍니다.
//   (사진을 추가·삭제하거나 순서를 바꾸면 번호가 달라지므로 인자 없이 전체를 다시 실행하세요)
// - 계좌 정보: assets/invite/accounts.json 이 있으면 같은 방식으로 accounts.enc 를 만듭니다.
//     node _tools/encrypt-invite-images.js accounts.json     # 계좌 정보만 다시 암호화
//   형식: { "groom": [{ "bank": "○○은행", "number": "000-0000-0000", "name": "홍길동" }], "bride": [ … ] }
//   (한쪽에 여러 계좌를 넣을 수 있고, accounts.json 은 .gitignore 에 들어 있어 git에 올라가지 않습니다)
// - 원본 사진은 .gitignore에 들어 있어 git에는 .enc 파일만 올라갑니다.
// - 키는 청첩장 주소("with1015.github.io/invite/")의 SHA-256 값입니다.
//   페이지도 자기 주소로 같은 키를 만들어 사진을 풉니다. (따로 보관할 키 파일 없음)
//   ※ 주소가 공개돼 있으므로 강한 보안은 아닙니다. GitHub에서 사진이 바로 보이거나
//     검색에 걸리는 것을 막는 용도입니다.
//   ※ 도메인이나 경로가 바뀌면 SITE_KEY_SOURCE 와 페이지 쪽 값을 함께 바꾸고 다시 실행하세요.
//
// .enc 파일 형식: [IV 12바이트][암호문 + GCM 태그 16바이트]

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'assets', 'invite');
const SITE_KEY_SOURCE = 'with1015.github.io/invite/';
const MAX_EDGE = 1800;

const key = crypto.createHash('sha256').update(SITE_KEY_SOURCE, 'utf8').digest();

// macOS 기본 도구 sips로 크기 축소 (원본은 건드리지 않음)
function resizeToTemp(src) {
  const out = path.join(os.tmpdir(), 'invite-' + process.pid + '-' + path.basename(src) + '.jpg');
  execFileSync('sips', ['-Z', String(MAX_EDGE), '-s', 'format', 'jpeg', '-s', 'formatOptions', '80', src, '--out', out], { stdio: 'ignore' });
  return out;
}

// intro / main 은 이름 그대로, 나머지 사진은 갤러리용으로 보고
// 파일 이름 순서대로 gallery-01.enc, gallery-02.enc … 로 저장 (원본 파일 이름은 git에 남지 않음)
const FIXED = ['intro', 'main'];
const IMAGE_RE = /\.(jpe?g|png)$/i;
let galleryCount = 0;
const jobs = fs.readdirSync(DIR)
  .filter(f => IMAGE_RE.test(f))
  .sort()
  .map(f => {
    const base = f.replace(IMAGE_RE, '');
    const dest = FIXED.includes(base)
      ? base + '.enc'
      : 'gallery-' + String(++galleryCount).padStart(2, '0') + '.enc';
    return { src: f, dest };
  });

const only = process.argv.slice(2).map(f => path.basename(f).normalize('NFC'));
const selected = jobs.filter(j => !only.length || only.includes(j.src.normalize('NFC')));

// 계좌 정보: assets/invite/accounts.json (git에 올리지 않음) → accounts.enc
const ACCOUNTS = 'accounts.json';
const doAccounts = fs.existsSync(path.join(DIR, ACCOUNTS)) && (!only.length || only.includes(ACCOUNTS));
if (!selected.length && !doAccounts) console.log('assets/invite/ 에 암호화할 파일이 없습니다.');

function encryptTo(plain, destName) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([iv, cipher.update(plain), cipher.final(), cipher.getAuthTag()]);
  fs.writeFileSync(path.join(DIR, destName), enc);
  return enc.length;
}

// 전체 실행일 때, 사진이 줄어 남게 된 예전 gallery-NN.enc 는 지움
if (!only.length) {
  const keep = new Set(jobs.map(j => j.dest));
  for (const f of fs.readdirSync(DIR)) {
    if (/^gallery-\d+\.enc$/.test(f) && !keep.has(f)) {
      fs.unlinkSync(path.join(DIR, f));
      console.log(`${f} 삭제 (원본 사진 없음)`);
    }
  }
}

for (const { src: f, dest: destName } of selected) {
  const src = path.join(DIR, f);
  const tmp = resizeToTemp(src);
  const plain = fs.readFileSync(tmp);
  fs.unlinkSync(tmp);

  const size = encryptTo(plain, destName);
  console.log(`${f} → ${destName} (${(size / 1024).toFixed(0)} KB)`);
}

if (doAccounts) {
  const raw = fs.readFileSync(path.join(DIR, ACCOUNTS), 'utf8');
  let data;
  try { data = JSON.parse(raw); } catch (e) {
    console.error(`${ACCOUNTS}: JSON 형식이 잘못되었습니다 (${e.message})`);
    process.exit(1);
  }
  for (const side of ['groom', 'bride']) {
    for (const a of data[side] || []) {
      if (!a.bank || !a.number || !a.name) {
        console.error(`${ACCOUNTS}: ${side} 항목에 bank / number / name 이 모두 있어야 합니다`);
        process.exit(1);
      }
    }
  }
  // 페이지가 쓰는 값만 남겨 암호화
  const clean = {};
  for (const side of ['groom', 'bride']) {
    clean[side] = (data[side] || []).map(a => ({ bank: String(a.bank), number: String(a.number), name: String(a.name) }));
  }
  const size = encryptTo(Buffer.from(JSON.stringify(clean), 'utf8'), 'accounts.enc');
  console.log(`${ACCOUNTS} → accounts.enc (${size} bytes, 신랑측 ${clean.groom.length}건 · 신부측 ${clean.bride.length}건)`);
}
