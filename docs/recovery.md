# 위드더레이크 홈페이지 복원 기록

2026년 11월 24일 한국시간 기준입니다. 회사·제품 소개용 홈페이지와 연결된 공개 콘텐츠를 복원했습니다. SENIO 앱, 네이버 스마트스토어의 주문 시스템, Google 설문 응답은 각 서비스에서 운영합니다.

## 확인된 인프라

| 구성 | 확인 결과 | 근거와 범위 |
| --- | --- | --- |
| 화면과 라우팅 | Next.js App Router, React, TypeScript | 운영 페이지의 Next 이미지 경로, RSC 응답 관련 헤더, Turbopack 청크와 소스의 app 디렉터리가 일치합니다. 9월 공개 소스의 잠금 버전은 Next.js 16.3.6, React 및 React DOM 19.2.8, TypeScript 5.9.3입니다. 11월 Worker의 패키지 잠금 파일은 공개되어 있지 않습니다. |
| 레이아웃과 글꼴 | Tailwind CSS 4.3.3, Pretendard Variable 1.3.9, Manrope, Noto Sans KR | Tailwind 버전은 공개 잠금 파일 기준입니다. 운영 브라우저에서 Pretendard의 jsDelivr CSS 및 자체 호스팅 woff2 요청을 확인했습니다. 복원본에는 동일 버전 Pretendard 92개 서브셋과 Google 글꼴 130개 서브셋을 동봉했습니다. |
| 도메인과 엣지 | Cloudflare DNS, HTTPS 프록시 | NS 조회 결과는 alexis.ns.cloudflare.com, amalia.ns.cloudflare.com입니다. 당시 A 응답 104.21.80.242, 172.67.155.154는 Cloudflare 엣지 주소입니다. |
| 실행 환경 | Cloudflare Workers + OpenNext | 운영 응답 헤더에서 Server=cloudflare, x-opennext=1, x-powered-by=Next.js를 확인했습니다. 공개 Wrangler 설정에 대표 도메인·www, Worker 엔트리 및 ASSETS 바인딩이 있습니다. 공개 잠금 파일의 어댑터는 1.20.6, Wrangler는 4.143.0입니다. |
| 이미지·콘텐츠 | 프로젝트 정적 파일, Supabase Storage, JSON CMS | 새 글 사진과 가이드 사진의 원주소가 Supabase의 공개 uploads 버킷입니다. 저장소에는 cms_files 테이블, Supabase Storage 업로드, 로컬 파일 저장과 선택적 GitHub 저장 구현이 있습니다. 운영 데이터베이스와 계정 권한은 미확인입니다. |
| 문의 메일 | 자체 /api/contact → Resend | 공개 코드에서 수신처를 환경변수로 지정해 Resend API를 호출합니다. 운영 비밀키, 발신 도메인 인증, 실수신함과 도달 여부는 확인할 수 없었습니다. |
| 외부 서비스 | 네이버 스마트스토어·카페·블로그, Instagram, YouTube, 앱스토어, Google Forms | 실제 공개 링크를 유지했습니다. 브라우저에서 Cloudflare Insights 비콘이 관측됐습니다. Google Analytics는 원본 코드에서 측정 ID를 설정할 때 활성화됩니다. |

기존 공개 저장소의 gh-pages 브랜치는 과거 공유용 정적 미리보기입니다. 기존 서비스 소개용 Vercel 저장소는 현재 홈페이지보다 이전 버전입니다.

[운영 홈페이지](https://withthelake.com/) · [복원 기반 커밋](https://github.com/hsk9867/withthelake-website/tree/f23fe92527802cb095bb2798590cd4d36095fb3f) · [기존 배포 설정](https://github.com/hsk9867/withthelake-website/blob/f23fe92527802cb095bb2798590cd4d36095fb3f/wrangler.jsonc) · [이전 세대 저장소](https://github.com/WithTheLake/withthelake-web-platform)

## 확보한 소스와 자료

- 9월 29일 공개 커밋의 파일 151개를 복원하고 각각의 Git blob SHA-1을 대조했습니다. 운영 사이트와 비교해 대표 연락처, 10월 MG 건강학교 기사, 가이드 페이지, 스토어 및 메뉴의 가이드 진입점을 갱신했습니다.
- public/assets와 public/uploads에 사진과 로고 53개를 보관했습니다. 공개 22개 페이지의 이미지 요소에서 확인한 41개와 인트로 마스크 로고 1개는 운영 브라우저가 내려받은 응답과 복원 파일의 SHA-256이 모두 같습니다. 첨부 CSV에는 원주소, 표시용 URL 예시, 로컬 경로, 바이트 수, 양쪽 해시가 있습니다. 나머지 11개는 공개 소스에 들어 있던 추가 이미지입니다.
- 서버용 소스와 관리자 코드, 테이블 및 버킷 생성 SQL은 포함돼 있습니다. 기존 업체의 비공개 커밋, 문의 이력, CMS 변경 이력, 관리자 계정과 비밀키는 공개 자료로 확인할 수 없습니다.
- 힐링로드 ON 플레이어, 21곡 목록, 산책로 선택과 감정 기록을 복원했습니다. 21곡 모두 원래 서비스에서 재생 오류가 발생했고 음원 원본은 발견하지 못했습니다. 음원 제작 파일이 있으면 CMS에서 트랙 주소를 다시 연결할 수 있습니다.

[운영 제품 가이드](https://withthelake.com/store/guide) · [10월 추가된 기사](https://withthelake.com/story/mgmmm-school) · [이미지 해시 목록](image-inventory.csv) · [음원별 확인 기록](healing-audio.md)

## 공개 경로

| 구분 | 경로 |
| --- | --- |
| 회사 | /, /about |
| 사업 | /what-we-do, /senio, /what-we-do/with-well-me, /what-we-do/community-health |
| 힐링로드·성과 | /healing, /info, /impact |
| 스토리 | /story 및 콘텐츠의 슬러그를 사용하는 상세 페이지 8개 |
| 스토어·연락 | /store, /store/guide, /contact, /privacy |

## 실행 검증

정적 미리보기와 관리자·문의 API를 포함하는 서버 빌드를 별도로 수행했습니다. 패키지 레지스트리에 연결할 수 없어 사용 가능한 Next.js 16.2.6, React 19.2.4, Tailwind CSS 4.3.0으로 검증했습니다. 배포용 소스에는 공개 원본의 package-lock.json을 보존했습니다. 원본 잠금 버전으로 빌드하고 외부 서비스를 연결한 후 운영 도메인을 전환할 수 있습니다.

공개 22개 경로에서 운영 화면의 본문 텍스트·제목·요소 순서와 스타일 클래스를 정규화하여 대조했습니다. 스토리 목록은 초기 렌더 상태를 대조한 뒤 게시물과 필터를 별도로 검사했고, 문의 화면은 서버에서 전달되는 양식을 포함했습니다. 경로별 결과는 [화면 검증표](page-verification.csv)에 있습니다.

공개 22개 경로의 내부 링크·앵커·표시에 필요한 로컬 파일과 글꼴을 점검했습니다. 스토리 카테고리 3종, 문의 유형 자동 선택과 필수 항목 검사, 정적 미리보기의 발송 차단, 힐링로드 트랙 선택 및 감정 기록 저장·삭제를 확인했습니다. 화면 대조는 문구·요소 구조·스타일 클래스·실제 이미지 바이트 기준입니다. 모든 화면 크기의 픽셀 단위 스크린샷 비교와 실메일 발송 테스트는 수행하지 않았습니다.
