# Alchemist — GitHub Pages용 소스

React + TypeScript + Vite로 만든 한국어 분자 조립 게임입니다. 정적 파일로 빌드되며 서버·인증·데이터베이스가 필요 없습니다. 발견한 도감은 해당 사이트 경로별 localStorage에 저장합니다.

## 실행

Node.js 24 이상과 pnpm 11.25.0을 사용합니다. Node.js를 설치한 다음 터미널에서 이 폴더로 이동하여 실행합니다.

```sh
npm install -g pnpm@11.25.0
pnpm install --frozen-lockfile
npm run dev
```

터미널에 표시되는 로컬 주소를 브라우저로 엽니다. `index.html`을 파일 탐색기에서 직접 열지 마세요.

## 검사와 빌드

```sh
npm test
npm run build
npm run preview
```

`dist`가 배포 결과입니다. GitHub Pages의 `main / (root)`에 **dist 내부 파일**을 올립니다. 자세한 순서는 함께 제공한 `DEPLOY.md`를 참고하세요. 소스의 `index.html`은 빌드 전 파일이므로 그대로 Pages에 올리면 실행되지 않습니다.

GitHub 프로젝트 하위 경로를 지원하도록 Vite의 `base`는 `./`입니다. 별도 환경 변수와 API 키는 필요하지 않습니다. 새 설치를 여기서 다시 수행하지는 않았으며, 제공된 버전의 기존 설치 환경에서 TypeScript 검사·빌드·30개 테스트를 통과했습니다.

## 주요 파일

- `app/page.tsx`: 조합대, 주기율표, 도감과 상호작용
- `lib/chemistry.ts`, `lib/expanded-catalog.ts`: 분자 목록과 그래프 기반 구조 인식
- `lib/local-collection.ts`: 도감 저장, 재로딩, 중복·저장 실패 처리
- `lib/geometry.ts`: 2D 정렬과 3D 좌표
- `lib/molecule-info.ts`, `lib/hints.ts`: 분자 설명과 단계별 힌트
- `components/molecule-viewer.tsx`: 회전·확대 가능한 입체 모형
- `lib/sounds.ts`: 브라우저에서 합성하는 작은 효과음
- `tests/`: 화학 모델·게임 규칙·저장 동작 검사

도감 저장 형식이나 키를 바꿀 때는 기존 데이터의 이전을 고려하세요. 현재 저장 키는 `alchemist:collection:v1:<사이트 경로>`입니다. 작업대 자체는 저장하지 않습니다. 기존 비공개 사이트의 로그인·DB·배포 설정·개인 도감 데이터는 이 공개 소스에 포함하지 않았습니다.

## 이온 결합 모드 (1.1)

- 화면 위에서 공유 결합과 이온 결합을 전환합니다. 각 작업대는 전환 중 유지됩니다.
- Li⁺, Na⁺, K⁺, Mg²⁺, Ca²⁺, Al³⁺, F⁻, Cl⁻, O²⁻를 소환합니다.
- 반대 전하 이온을 드래그로 묶거나 연결 버튼으로 선택합니다. 점선은 작업대의 묶음 표시입니다.
- 전하 중성·등록된 조성비·연결된 묶음을 함께 검사합니다. 여러 화학식 단위도 같은 화합물로 인식합니다.
- NaCl, KCl, LiF, MgO, CaO, Na₂O, MgCl₂, CaCl₂, CaF₂, Al₂O₃를 지원합니다.
- NaCl 3D는 64개 이온으로 잘라낸 격자 일부입니다. 나머지는 실제 격자 대신 명시적으로 표시한 조성 비율 모형입니다.
- 이온 도감은 기존 분자 저장 키 뒤에 `:ionic`을 붙인 별도 키를 씁니다. 기존 분자 도감 데이터를 변경하지 않습니다.
- 핵심 로직은 `lib/ionic.ts`, 저장은 `lib/ionic-collection.ts`, 화면은 `components/ionic-lab.tsx`입니다.

30개 자동 검사와 TypeScript·배포 빌드를 확인했습니다. 이 환경에서 브라우저의 실제 드래그·오디오 재생은 직접 검증하지 못했습니다.
