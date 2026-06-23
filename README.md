# 🏫 우리학교 학사일정 캘린더

학생과 학부모가 학교 학사일정을 쉽고 빠르게 확인할 수 있도록 만든 **학교별 학사일정 캘린더 웹앱**입니다.

학교명을 검색하면 나이스 교육정보 개방 API 기반으로 해당 학교의 월별 학사일정을 캘린더와 목록 형태로 확인할 수 있습니다.

## 바로가기

* 서비스 바로가기: https://sen-vip.github.io/school-calendar/
* GitHub 저장소: https://github.com/sen-vip/school-calendar
* 도움말 README: https://github.com/sen-vip/school-calendar#readme

## 만든 이유

학교 학사일정은 학생과 학부모가 자주 확인하는 정보입니다.

하지만 방학, 개학, 시험, 체험학습, 재량휴업일 등 반복적인 일정 문의가 전화민원으로 이어지는 경우가 많습니다.

이 서비스는 학교별 학사일정을 한눈에 확인할 수 있도록 제공하여 학생·학부모의 정보 접근성을 높이고, 학교의 반복적인 일정 문의 부담을 줄이는 것을 목표로 합니다.

## 주요 기능

* 전국 학교명 검색
* 학교 선택 후 학사일정 확인
* 월별 캘린더 보기
* 이번 달 주요 일정 목록 보기
* 방학·개학 / 시험·평가 / 행사·체험 일정 필터
* 일정 키워드 검색
* 선택한 학교 저장
* 모바일 반응형 화면
* 나이스 교육정보 개방 API 연동 구조

## 화면 구성

서비스는 다음 흐름으로 구성되어 있습니다.

```text
학교 검색
↓
학교 선택
↓
월별 학사일정 확인
↓
필터 또는 검색으로 필요한 일정 확인
```

## 데이터 연동 구조

이 서비스는 GitHub Pages에서 바로 나이스 API를 호출하지 않습니다.

API 키가 프론트엔드 코드에 노출되지 않도록 Render 프록시 서버를 거쳐 데이터를 가져옵니다.

```text
GitHub Pages 프론트엔드
↓
Render Flask 프록시
↓
NEIS Open API
```

## 사용 API

나이스 교육정보 개방 API를 활용합니다.

* 학교기본정보 API
* 학사일정 API

## Render 프록시

프록시 서버 주소는 다음과 같습니다.

```text
https://school-calendar-proxy.onrender.com
```

프론트엔드 `app.js`의 연결 설정은 다음과 같습니다.

```js
const API_CONFIG = {
  useMock: false,
  baseUrl: "https://school-calendar-proxy.onrender.com"
};
```

Render 무료 플랜 사용 시 서버가 잠들어 있다가 첫 요청 때 깨어나므로, 첫 검색은 다소 느릴 수 있습니다.

## 도움말

화면 상단의 **도움말** 버튼은 이 README로 연결됩니다.

```text
https://github.com/sen-vip/school-calendar#readme
```

## 배포 방법

이 저장소는 정적 웹앱으로 구성되어 있어 GitHub Pages에 배포할 수 있습니다.

필요 파일은 다음과 같습니다.

```text
index.html
style.css
app.js
README.md
```

GitHub Pages 설정:

```text
Settings
→ Pages
→ Branch: main
→ Folder: /root
→ Save
```

배포 후 서비스 주소:

```text
https://sen-vip.github.io/school-calendar/
```

## 로컬 테스트

로컬에서 직접 열 때는 `index.html`을 더블클릭하기보다 간단한 로컬 서버를 사용하는 것이 좋습니다.

```bash
python -m http.server 5500
```

브라우저에서 아래 주소로 접속합니다.

```text
http://localhost:5500
```

## 주의사항

* 나이스 API 키는 프론트엔드 코드에 넣지 않습니다.
* API 키는 Render 환경변수에만 저장합니다.
* 학교 사정에 따라 학사일정이 변경될 수 있으므로 세부 내용은 학교 안내를 함께 확인해야 합니다.
* Render 무료 플랜은 첫 접속 시 응답이 늦을 수 있습니다.

## 향후 개선 예정

* Cloudflare Worker 프록시 전환 검토
* 학년별 일정 필터
* 오늘 이후 일정만 보기
* 카카오톡 공유용 일정 복사
* 급식 API 연동 검토
* 시간표 API 연동 검토
* 학교 즐겨찾기 기능 개선

## 제작

학돌 프로젝트
by sen-vip
