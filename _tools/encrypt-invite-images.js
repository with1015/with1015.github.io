#!/usr/bin/env node
// 청첩장 사진 암호화 스크립트
//
//   node _tools/encrypt-invite-images.js
//
// - assets/invite/ 안의 원본 사진(.jpg/.jpeg/.png)을 웹용 크기(긴 변 1800px)로 줄인 뒤
//   AES-256-GCM으로 암호화해 같은 폴더에 <이름>.enc 로 저장합니다.
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

const files = fs.readdirSync(DIR).filter(f => /\.(jpe?g|png)$/i.test(f));
if (!files.length) console.log('assets/invite/ 에 암호화할 사진이 없습니다.');

for (const f of files) {
  const src = path.join(DIR, f);
  const tmp = resizeToTemp(src);
  const plain = fs.readFileSync(tmp);
  fs.unlinkSync(tmp);

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([iv, cipher.update(plain), cipher.final(), cipher.getAuthTag()]);
  const dest = path.join(DIR, f.replace(/\.(jpe?g|png)$/i, '.enc'));
  fs.writeFileSync(dest, enc);
  console.log(`${f} → ${path.basename(dest)} (${(enc.length / 1024).toFixed(0)} KB)`);
}
