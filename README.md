# 위드더레이크 홈페이지 복원본

2026년 11월 24일 운영 중인 홈페이지를 기준으로 복원한 프로젝트입니다. 공개 페이지 22개, 수정 가능한 Next.js 소스, 사진과 로고, 글꼴, 빌드된 미리보기가 들어 있습니다. 관리자 페이지 없이 정적 사이트(SSG)로 빌드해 Cloudflare Pages에 배포하는 구조입니다.

## 바로 보기

Node.js 22 또는 24가 설치된 컴퓨터에서 이 폴더로 이동한 뒤 실행합니다. 미리보기에는 패키지 설치가 필요 없습니다.

```sh
node preview.mjs
```

브라우저에서 http://127.0.0.1:4173 을 엽니다. 포트를 바꾸려면 macOS 또는 Linux에서 `PORT=4174 node preview.mjs`를 실행합니다. 미리보기는 메뉴·게시물 필터·제품 가이드·기기 내 감정 기록을 사용할 수 있습니다. 문의를 제출하면 전송되지 않았다는 안내가 표시됩니다. 운영 서버에서 조회할 사진이나 서체 없이 화면이 표시됩니다.

## 편집과 빌드

```sh
npm ci
npm run dev      # 개발 서버 http://localhost:3000
npm run build    # 정적 사이트를 out/ 에 생성
npm start        # out/ 을 Cloudflare Pages 로컬 에뮬레이터로 확인 (http://localhost:8788)
```

`/about` 같은 기존 URL은 `out/about.html`로 생성되며 Cloudflare Pages에서 슬래시 없는 주소 그대로 제공됩니다. 수정 후 동봉 미리보기(`preview/`)를 갱신하려면 `npm run build:preview`를 실행합니다. 의존성은 공개 원본 저장소의 잠금 파일에 맞춰 두었습니다. 복원 당시의 검증 범위는 [복원 기록](docs/recovery.md)에 있습니다.

콘텐츠는 JSON 파일을 수정한 뒤 다시 빌드하면 반영됩니다.

| 수정할 항목 | 위치 |
| --- | --- |
| 사이트 문구·대표 연락처·메뉴에 쓰이는 외부 주소·성과·스토리·상품 | `content/site-content.json` |
| 제품 가이드 사진·사용법·주의사항 | `content/product-guide.json` |
| 페이지·공통 레이아웃·반응형 스타일·모션 | `src/app/`, `src/components/` |
| 사진·로고·업로드 이미지 | `public/assets/`, `public/uploads/` |
| 직접 호스팅하는 글꼴·라이선스 | `public/fonts/` |
| 콘텐츠 기본값과 타입 | `src/lib/cms/defaults.ts`, `src/lib/cms/types.ts` |
| 공유 카드 이미지와 기존 제작 코드 | `src/app/opengraph-image.png`, `scripts/artwork/opengraph-image.tsx` |

## 문의 접수

문의 폼은 `/api/contact`로 전송하며, Cloudflare Pages Function [functions/api/contact.ts](functions/api/contact.ts)가 Resend로 메일을 보냅니다. 검증 규칙·메일 형식·응답 문구는 정적 전환 전 서버 코드([docs/legacy/api-contact-route.ts](docs/legacy/api-contact-route.ts))와 같습니다.

발송에는 Resend의 `RESEND_API_KEY`(Secret), 수신 주소 `CONTACT_TO_EMAIL`(쉼표로 여러 개), 발신 도메인 인증을 마친 `CONTACT_FROM_EMAIL`이 필요합니다. Cloudflare Pages 프로젝트의 **Settings → Variables and Secrets**에 등록하고, 로컬에서는 프로젝트 루트의 `.dev.vars` 파일(git 제외)에 넣은 뒤 `npm start`로 확인합니다. `.dev.vars`에 실제 키를 넣으면 로컬에서도 메일이 실제로 발송됩니다. `npm start`는 실수로 인한 발송을 막기 위해 `.env` 파일을 읽지 않습니다. 발송 설정이 없으면 API가 503 안내를 반환하고, API 자체가 없는 환경에서는 폼이 메일 앱으로 작성 내용을 넘깁니다. 원본 운영 화면에 노출되는 대표 이메일은 `ceo@withthelake.com`입니다.

## Cloudflare Pages 배포

`wrangler.jsonc`는 Pages 프로젝트 `withthelake-recovered`의 빌드 결과 위치(`out/`)만 정의합니다. 기존 도메인을 자동 연결하는 설정은 없습니다. Cloudflare Pages에서 빌드 명령 `npm run build`, 출력 디렉터리 `out`으로 설정하고, 필요하면 환경변수 `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GA_ID`를 지정합니다. 관리자 페이지와 Supabase 저장소는 정적 전환에서 제거했습니다.

[기존 인프라와 검증 결과](docs/recovery.md) · [운영 이미지 대조 목록](docs/image-inventory.csv) · [힐링로드 음원 현황](docs/healing-audio.md)
