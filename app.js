// ============================================================
// 우리학교 학사일정 캘린더
// 2-1단계: NEIS API 연동 준비 구조 + mock fallback
// ============================================================

const API_CONFIG = {
  // Render 프록시 서버와 실제 NEIS API를 연결합니다.
  useMock: false,
  baseUrl: "https://school-calendar-proxy.onrender.com"
};

const STORAGE_KEYS = {
  selectedSchool: "schoolCalendar.selectedSchool"
};

const OFFICE_OPTIONS = [
  { code: "", name: "전체" },
  { code: "B10", name: "서울특별시교육청", shortName: "서울" },
  { code: "C10", name: "부산광역시교육청", shortName: "부산" },
  { code: "D10", name: "대구광역시교육청", shortName: "대구" },
  { code: "E10", name: "인천광역시교육청", shortName: "인천" },
  { code: "F10", name: "광주광역시교육청", shortName: "광주" },
  { code: "G10", name: "대전광역시교육청", shortName: "대전" },
  { code: "H10", name: "울산광역시교육청", shortName: "울산" },
  { code: "I10", name: "세종특별자치시교육청", shortName: "세종" },
  { code: "J10", name: "경기도교육청", shortName: "경기" },
  { code: "K10", name: "강원특별자치도교육청", shortName: "강원" },
  { code: "M10", name: "충청북도교육청", shortName: "충북" },
  { code: "N10", name: "충청남도교육청", shortName: "충남" },
  { code: "P10", name: "전북특별자치도교육청", shortName: "전북" },
  { code: "Q10", name: "전라남도교육청", shortName: "전남" },
  { code: "R10", name: "경상북도교육청", shortName: "경북" },
  { code: "S10", name: "경상남도교육청", shortName: "경남" },
  { code: "T10", name: "제주특별자치도교육청", shortName: "제주" }
];


const mockSchools = [
  { schoolName: "서울학돌초등학교", region: "서울특별시교육청", officeCode: "B10", schoolCode: "7010000", schoolType: "초등학교", address: "서울특별시 중구 학돌로 10" },
  { schoolName: "부산학돌중학교", region: "부산광역시교육청", officeCode: "C10", schoolCode: "7020000", schoolType: "중학교", address: "부산광역시 해운대구 학돌로 20" },
  { schoolName: "경기학돌고등학교", region: "경기도교육청", officeCode: "J10", schoolCode: "7030000", schoolType: "고등학교", address: "경기도 수원시 학돌로 30" },
  { schoolName: "대전우리초등학교", region: "대전광역시교육청", officeCode: "G10", schoolCode: "7040000", schoolType: "초등학교", address: "대전광역시 서구 우리로 12" },
  { schoolName: "인천우리중학교", region: "인천광역시교육청", officeCode: "E10", schoolCode: "7050000", schoolType: "중학교", address: "인천광역시 남동구 우리로 24" }
];

const mockSchedules = [
  { schoolCode: "7010000", date: "2026-06-03", title: "재량휴업일", content: "학교장 재량휴업일", grades: ["1", "2", "3", "4", "5", "6"] },
  { schoolCode: "7010000", date: "2026-06-10", title: "현장체험학습", content: "3학년 현장체험학습", grades: ["3"] },
  { schoolCode: "7010000", date: "2026-06-17", title: "1학기 평가", content: "전학년 과정중심평가", grades: ["1", "2", "3", "4", "5", "6"] },
  { schoolCode: "7010000", date: "2026-06-24", title: "학부모 공개수업", content: "학부모 초청 공개수업", grades: ["1", "2", "3", "4", "5", "6"] },
  { schoolCode: "7010000", date: "2026-07-22", title: "여름방학식", content: "여름방학식", grades: ["1", "2", "3", "4", "5", "6"] },
  { schoolCode: "7010000", date: "2026-08-19", title: "2학기 개학식", content: "2학기 개학식 및 생활교육", grades: ["1", "2", "3", "4", "5", "6"] },
  { schoolCode: "7020000", date: "2026-06-05", title: "학생자치회", content: "1학기 학생자치회 정기회의", grades: ["1", "2", "3"] },
  { schoolCode: "7020000", date: "2026-06-18", title: "기말고사", content: "2·3학년 기말고사", grades: ["2", "3"] },
  { schoolCode: "7030000", date: "2026-06-12", title: "진로체험의 날", content: "전학년 진로체험 프로그램", grades: ["1", "2", "3"] },
  { schoolCode: "7030000", date: "2026-06-25", title: "1학기 지필평가", content: "1학기 2차 지필평가", grades: ["1", "2", "3"] },
  { schoolCode: "7040000", date: "2026-06-15", title: "개교기념일", content: "개교기념일 휴업", grades: ["1", "2", "3", "4", "5", "6"] },
  { schoolCode: "7050000", date: "2026-06-08", title: "스포츠클럽 대회", content: "교내 스포츠클럽 대회", grades: ["1", "2", "3"] }
].map((schedule) => ({
  ...schedule,
  type: classifyScheduleType(schedule.title, schedule.content)
}));

const state = {
  selectedSchool: null,
  currentDate: new Date(2026, 5, 1),
  activeFilter: "all",
  selectedGrade: "all",
  searchKeyword: "",
  selectedOfficeCode: "",
  scheduleSearchKeyword: "",
  selectedDateKey: "",
  schools: [],
  schedules: [],
  isSchoolLoading: false,
  isScheduleLoading: false,
  errorMessage: ""
};

const els = {
  schoolSearchForm: document.querySelector("#schoolSearchForm"),
  schoolKeyword: document.querySelector("#schoolKeyword"),
  schoolRegion: document.querySelector("#schoolRegion"),
  topSelectedSchool: document.querySelector("#topSelectedSchool"),
  topChangeSchoolBtn: document.querySelector("#topChangeSchoolBtn"),
  schoolResults: document.querySelector("#schoolResults"),
  resetSchoolBtn: document.querySelector("#resetSchoolBtn"),
  selectedSchoolName: document.querySelector("#selectedSchoolName"),
  selectedSchoolMeta: document.querySelector("#selectedSchoolMeta"),
  copyShareBtn: document.querySelector("#copyShareBtn"),
  summaryTitle: document.querySelector("#summaryTitle"),
  summaryCount: document.querySelector("#summaryCount"),
  summaryBadges: document.querySelector("#summaryBadges"),
  currentMonthTitle: document.querySelector("#currentMonthTitle"),
  prevMonthBtn: document.querySelector("#prevMonthBtn"),
  nextMonthBtn: document.querySelector("#nextMonthBtn"),
  todayBtn: document.querySelector("#todayBtn"),
  calendar: document.querySelector("#calendar"),
  scheduleListTitle: document.querySelector("#scheduleListTitle"),
  scheduleList: document.querySelector("#scheduleList"),
  selectedDatePanel: document.querySelector("#selectedDatePanel"),
  scheduleKeyword: document.querySelector("#scheduleKeyword"),
  filterButtons: document.querySelectorAll(".filter-chip[data-filter]"),
  gradeFilterRow: document.querySelector("#gradeFilterRow"),
  quickSchoolButtons: document.querySelectorAll("[data-school-keyword]")
};

const typeLabels = {
  exam: "시험·평가",
  vacation: "방학·휴업",
  event: "행사·체험",
  normal: "기타"
};

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

// ------------------------------------------------------------
// API 함수
// ------------------------------------------------------------
async function searchSchools(keyword, officeCode = state.selectedOfficeCode) {
  const trimmed = keyword.trim();
  if (!trimmed) return [];

  state.searchKeyword = trimmed;
  state.selectedOfficeCode = officeCode || "";
  setSchoolLoading(true);
  clearError();
  renderProxyWakeNotice("학교 검색을 준비하고 있어요. Render 무료 서버는 첫 요청 시 잠시 깨어나는 시간이 걸릴 수 있어요.");
  renderSchoolResults([]);

  try {
    const schools = API_CONFIG.useMock
      ? await searchSchoolsFromMock(trimmed, officeCode)
      : await searchSchoolsFromProxy(trimmed, officeCode);

    state.schools = schools;
    return schools;
  } catch (error) {
    console.error(error);
    setError("학교 검색 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.");
    return [];
  } finally {
    setSchoolLoading(false);
  }
}

async function searchSchoolsFromMock(keyword, officeCode = "") {
  await wait(240);
  const normalizedKeyword = keyword.trim().toLowerCase();
  return mockSchools.filter((school) => {
    const matchedKeyword = [school.schoolName, school.region, school.schoolType, school.address]
      .join(" ")
      .toLowerCase()
      .includes(normalizedKeyword);
    const matchedRegion = !officeCode || school.officeCode === officeCode;
    return matchedKeyword && matchedRegion;
  });
}

async function searchSchoolsFromProxy(keyword, officeCode = "") {
  const params = new URLSearchParams({ keyword });
  if (officeCode) params.set("officeCode", officeCode);
  const url = `${API_CONFIG.baseUrl}/api/schools?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) throw new Error("학교 검색 실패");

  const data = await response.json();
  return data.schools || [];
}

async function fetchSchedules({ officeCode, schoolCode, year, month }) {
  if (!schoolCode) return [];

  setScheduleLoading(true);
  clearError();
  renderProxyWakeNotice("학사일정을 불러오고 있어요. 첫 요청은 서버가 깨어나는 동안 조금 느릴 수 있어요.");
  renderScheduleLoading();

  try {
    const schedules = API_CONFIG.useMock
      ? await fetchSchedulesFromMock({ schoolCode, year, month })
      : await fetchSchedulesFromProxy({ officeCode, schoolCode, year, month });

    state.schedules = schedules.map((schedule) => normalizeNeisScheduleData(schedule));
    return state.schedules;
  } catch (error) {
    console.error(error);
    setError("학사일정을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
    state.schedules = [];
    return [];
  } finally {
    setScheduleLoading(false);
  }
}

async function fetchSchedulesFromMock({ schoolCode, year, month }) {
  await wait(220);
  return mockSchedules.filter((schedule) => {
    const scheduleDate = parseDateKey(schedule.date);
    return schedule.schoolCode === schoolCode &&
      scheduleDate.getFullYear() === Number(year) &&
      scheduleDate.getMonth() + 1 === Number(month);
  });
}

async function fetchSchedulesFromProxy({ officeCode, schoolCode, year, month }) {
  const params = new URLSearchParams({ officeCode, schoolCode, year, month });
  const response = await fetch(`${API_CONFIG.baseUrl}/api/schedules?${params.toString()}`);

  if (!response.ok) throw new Error("학사일정 조회 실패");

  const data = await response.json();
  return data.schedules || [];
}


function getOfficeName(code) {
  return OFFICE_OPTIONS.find((office) => office.code === code)?.name || "전체";
}

function getOfficeShortName(codeOrRegion = "") {
  const matched = OFFICE_OPTIONS.find((office) => office.code === codeOrRegion || office.name === codeOrRegion);
  if (matched) return matched.shortName || matched.name;
  return String(codeOrRegion || "").replace("특별시교육청", "").replace("광역시교육청", "").replace("특별자치시교육청", "").replace("특별자치도교육청", "").replace("교육청", "");
}

function renderOfficeOptions() {
  if (!els.schoolRegion) return;
  els.schoolRegion.innerHTML = OFFICE_OPTIONS.map((office) => `
    <option value="${escapeHtml(office.code)}">${escapeHtml(office.name)}</option>
  `).join("");
}

function renderTopSelectedSchool() {
  if (!els.topSelectedSchool) return;

  if (!state.selectedSchool) {
    els.topSelectedSchool.textContent = "우리학교 학사일정";
    els.topSelectedSchool.title = "우리학교 학사일정";
    els.topChangeSchoolBtn?.classList.add("is-hidden");
    return;
  }

  els.topSelectedSchool.textContent = state.selectedSchool.schoolName;
  els.topSelectedSchool.title = `${state.selectedSchool.schoolName} · ${state.selectedSchool.region}`;
  els.topChangeSchoolBtn?.classList.remove("is-hidden");
}

function scrollToSearch() {
  document.querySelector("#searchSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => els.schoolKeyword?.focus(), 350);
}


function normalizeNeisSchoolData(rawData) {
  // TODO: NEIS 학교기본정보 응답을 아래 내부 구조로 변환 예정
  // { schoolName, region, officeCode, schoolCode, schoolType, address }
  return rawData;
}

function normalizeNeisScheduleData(rawData) {
  // NEIS 원본 또는 프록시 정규화 응답을 화면 표시용 구조로 한 번 더 보정한다.
  const normalized = { ...rawData };
  const title = normalized.title || normalized.EVENT_NM || normalized.AA_YMD_EVENT_NM || normalized.eventName || "학사일정";
  const content = normalized.content || normalized.EVENT_CNTNT || normalized.EVENT_CONTENT || normalized.eventContent || "";
  const rawDate = normalized.date || normalized.AA_YMD || normalized.EVENT_DATE || normalized.eventDate || "";

  return {
    ...normalized,
    schoolCode: normalized.schoolCode || normalized.SD_SCHUL_CODE || normalized.school_code || "",
    date: normalizeScheduleDate(rawDate),
    title,
    content,
    grades: getGradesFromSchedule(normalized),
    isAllGrades: isAllGradeSchedule(normalized),
    type: normalized.type || classifyScheduleType(title, content)
  };
}

// 예전 함수명을 쓰는 코드와 호환되도록 별칭 유지
async function searchSchoolsFromNeis(keyword, officeCode = state.selectedOfficeCode) {
  return searchSchools(keyword, officeCode);
}

async function fetchSchedulesFromNeis(officeCode, schoolCode, year, month) {
  return fetchSchedules({ officeCode, schoolCode, year, month });
}

// ------------------------------------------------------------
// 상태/저장
// ------------------------------------------------------------
function setSchoolLoading(value) {
  state.isSchoolLoading = value;
}

function setScheduleLoading(value) {
  state.isScheduleLoading = value;
}

function setError(message) {
  state.errorMessage = message;
  renderError(message);
}

function clearError() {
  state.errorMessage = "";
  const existing = document.querySelector(".error-box");
  if (existing) existing.remove();
  const wakeNotice = document.querySelector(".proxy-wake-notice");
  if (wakeNotice) wakeNotice.remove();
}

function saveSelectedSchool(school) {
  localStorage.setItem(STORAGE_KEYS.selectedSchool, JSON.stringify(school));
}

function loadSelectedSchool() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.selectedSchool);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("저장된 학교 정보를 읽지 못했어요.", error);
    return null;
  }
}

function clearSelectedSchoolStorage() {
  localStorage.removeItem(STORAGE_KEYS.selectedSchool);
}

// ------------------------------------------------------------
// 렌더링
// ------------------------------------------------------------

async function retryLastAction() {
  clearError();

  if (state.selectedSchool) {
    await loadSchedulesForCurrentMonth();
    renderAll();
    return;
  }

  if (els.schoolKeyword?.value.trim()) {
    const schools = await searchSchools(els.schoolKeyword.value, els.schoolRegion?.value || "");
    renderSchoolResults(schools);
  }
}

function getCurrentPageUrl() {
  return window.location.href.split("#")[0];
}

function makeShareText() {
  const school = state.selectedSchool;
  if (!school) return "";

  const schedules = getMonthSchedules();
  const monthTitle = formatMonthTitle(state.currentDate);
  const topSchedules = schedules.slice(0, 6).map((schedule) => {
    const date = parseDateKey(schedule.date);
    return `- ${date.getMonth() + 1}.${date.getDate()} ${schedule.title}`;
  }).join("\n");

  return [
    `🏫 ${school.schoolName} ${monthTitle} 학사일정`,
    topSchedules || "- 등록된 학사일정이 없습니다.",
    "",
    `자세히 보기: ${getCurrentPageUrl()}`
  ].join("\n");
}

async function copyShareText() {
  if (!state.selectedSchool) return;

  const text = makeShareText();

  try {
    await navigator.clipboard.writeText(text);
    showToast("공유 문구를 복사했어요.");
  } catch (error) {
    console.warn(error);
    showToast("복사하지 못했어요. 브라우저 권한을 확인해 주세요.");
  }
}

function showToast(message) {
  const existing = document.querySelector(".toast-message");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 220);
  }, 2200);
}


function renderProxyWakeNotice(message) {
  if (API_CONFIG.useMock) return;
  const target = document.querySelector("main");
  if (!target) return;

  const existing = document.querySelector(".proxy-wake-notice");
  if (existing) existing.remove();

  const box = document.createElement("div");
  box.className = "proxy-wake-notice";
  box.innerHTML = `<span aria-hidden="true">⏳</span><p>${message}</p>`;
  target.prepend(box);
}

function renderError(message) {
  clearError();
  state.errorMessage = message;
  const target = document.querySelector("main");
  if (!target) return;
  const box = document.createElement("div");
  box.className = "error-box error-box-with-action";
  box.innerHTML = `
    <span aria-hidden="true">⚠️</span>
    <div>
      <p>${message}</p>
      <button type="button" id="retryLastActionBtn">다시 시도</button>
    </div>`;
  target.prepend(box);

  document.querySelector("#retryLastActionBtn")?.addEventListener("click", retryLastAction);
}

function renderSchoolResults(schools) {
  if (!els.schoolResults) return;

  if (state.isSchoolLoading) {
    els.schoolResults.innerHTML = `
      <div class="loading-card">
        <span class="loader-dot"></span>
        학교를 찾고 있어요...
      </div>`;
    return;
  }

  if (!state.searchKeyword) {
    els.schoolResults.innerHTML = "";
    return;
  }

  const selectedRegionName = getOfficeName(state.selectedOfficeCode);
  const resultTitle = state.selectedOfficeCode
    ? `${selectedRegionName} 검색 결과 ${schools.length}개`
    : `검색 결과 ${schools.length}개`;
  const resultGuide = !state.selectedOfficeCode && schools.length >= 8
    ? `<p class="result-guide">검색 결과가 많아요. 지역을 선택하면 더 정확하게 찾을 수 있어요.</p>`
    : schools.length >= 20
      ? `<p class="result-guide">검색 결과는 상위 일부만 표시될 수 있어요. 학교명을 조금 더 정확히 입력해 주세요.</p>`
      : "";

  if (!schools.length) {
    els.schoolResults.innerHTML = `
      <div class="result-summary">
        <strong>${escapeHtml(resultTitle)}</strong>
      </div>
      <div class="empty-state">검색된 학교가 없어요.<br />지역을 바꾸거나 학교명을 조금 더 짧게 입력해 보세요.</div>`;
    return;
  }

  els.schoolResults.innerHTML = `
    <div class="result-summary">
      <strong>${escapeHtml(resultTitle)}</strong>
      ${resultGuide}
    </div>
    ${schools.map((school, index) => `
      <article class="school-card">
        <div class="school-card-main">
          <div class="school-card-title-line">
            <h3>${escapeHtml(school.schoolName)}</h3>
            <span class="school-type-badge">${escapeHtml(school.schoolType || "학교")}</span>
          </div>
          <div class="school-card-meta-line">
            <span class="region-badge">${escapeHtml(getOfficeShortName(school.officeCode || school.region))}</span>
            <span>${escapeHtml(school.region)}</span>
          </div>
          <p class="school-address">${escapeHtml(school.address)}</p>
        </div>
        <button type="button" data-school-index="${index}">이 학교 선택</button>
      </article>
    `).join("")}
  `;

  els.schoolResults.querySelectorAll("[data-school-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const selected = state.schools[Number(button.dataset.schoolIndex)];
      selectSchool(selected);
    });
  });
}

function renderSelectedSchool() {
  renderTopSelectedSchool();

  if (!state.selectedSchool) {
    els.selectedSchoolName.textContent = "학교를 선택하면 학사일정이 표시돼요.";
    els.selectedSchoolMeta.textContent = "지역과 학교명을 입력한 뒤, 이 학교 선택 버튼을 눌러주세요.";
    els.copyShareBtn?.classList.add("is-hidden");
    return;
  }

  els.selectedSchoolName.textContent = state.selectedSchool.schoolName;
  els.selectedSchoolMeta.textContent = `${state.selectedSchool.region} · ${state.selectedSchool.schoolType} · ${state.selectedSchool.address}`;
  els.copyShareBtn?.classList.remove("is-hidden");
}

function renderGradeFilters() {
  if (!els.gradeFilterRow) return;

  const filters = getAvailableGradeFilters(state.selectedSchool, state.schedules);
  const availableValues = filters.map((filter) => filter.value);
  if (!availableValues.includes(state.selectedGrade)) state.selectedGrade = "all";

  els.gradeFilterRow.innerHTML = filters.map((filter) => `
    <button
      type="button"
      class="filter-chip grade-chip ${state.selectedGrade === filter.value ? "active" : ""}"
      data-grade="${escapeHtml(filter.value)}"
      aria-pressed="${state.selectedGrade === filter.value ? "true" : "false"}"
    >${escapeHtml(filter.label)}</button>
  `).join("");
}

function renderSummary() {
  const monthSchedules = getMonthSchedules().filter((schedule) => isScheduleVisibleByGrade(schedule, state.selectedGrade));
  const monthTitle = formatMonthTitle(state.currentDate);
  els.summaryTitle.textContent = monthTitle;
  els.summaryCount.textContent = state.selectedSchool
    ? state.isScheduleLoading ? "학사일정을 불러오고 있어요..." : `이번 달 주요 일정 ${monthSchedules.length}개`
    : "학교를 선택하면 일정 개수를 확인할 수 있어요.";

  const counts = monthSchedules.reduce((acc, schedule) => {
    acc[schedule.type] = (acc[schedule.type] || 0) + 1;
    return acc;
  }, { exam: 0, vacation: 0, event: 0, normal: 0 });

  els.summaryBadges.innerHTML = `
    <span class="summary-badge vacation">방학·휴업 ${counts.vacation || 0}</span>
    <span class="summary-badge exam">시험·평가 ${counts.exam || 0}</span>
    <span class="summary-badge event">행사·체험 ${counts.event || 0}</span>
  `;
}

function renderCalendar() {
  const date = state.currentDate;
  const year = date.getFullYear();
  const month = date.getMonth();
  els.currentMonthTitle.textContent = formatMonthTitle(date);

  if (state.isScheduleLoading) {
    els.calendar.innerHTML = Array.from({ length: 21 }, () => `<div class="calendar-skeleton"></div>`).join("");
    return;
  }

  const firstDay = new Date(year, month, 1);
  const startDate = new Date(year, month, 1 - firstDay.getDay());
  const todayKey = toDateKey(new Date());
  const monthSchedules = getMonthSchedules().filter((schedule) => {
    return isScheduleVisibleByGrade(schedule, state.selectedGrade) &&
      (state.activeFilter === "all" || schedule.type === state.activeFilter);
  });

  const schedulesByDate = monthSchedules.reduce((acc, schedule) => {
    acc[schedule.date] = acc[schedule.date] || [];
    acc[schedule.date].push(schedule);
    return acc;
  }, {});

  const cells = [];
  weekdays.forEach((weekday) => cells.push(`<div class="weekday">${weekday}</div>`));

  for (let i = 0; i < 42; i += 1) {
    const cellDate = new Date(startDate);
    cellDate.setDate(startDate.getDate() + i);

    const key = toDateKey(cellDate);
    const schedules = schedulesByDate[key] || [];
    const visibleSchedules = schedules.slice(0, 2);
    const moreCount = Math.max(0, schedules.length - visibleSchedules.length);
    const classes = ["day-cell"];

    if (cellDate.getMonth() !== month) classes.push("other-month");
    if (key === todayKey) classes.push("today");
    if (state.selectedDateKey === key) classes.push("selected-date");
    if (schedules.length) classes.push("has-schedule");

    cells.push(`
      <div
        class="${classes.join(" ")}"
        role="${schedules.length ? "button" : "gridcell"}"
        tabindex="${schedules.length ? "0" : "-1"}"
        data-date="${key}"
        aria-label="${key}${schedules.length ? ` 일정 ${schedules.length}개` : ""}"
        title="${escapeHtml(getDateTooltip(key, schedules))}"
      >
        <div class="day-number">${cellDate.getDate()}</div>
        ${visibleSchedules.map((schedule) => `<span class="calendar-schedule ${schedule.type}" title="${escapeHtml(getScheduleTooltip(schedule))}">${escapeHtml(schedule.title)}</span>`).join("")}
        ${moreCount ? `<span class="more-count">+${moreCount}</span>` : ""}
      </div>
    `);
  }

  els.calendar.innerHTML = cells.join("");
}

function renderSelectedDatePanel() {
  if (!els.selectedDatePanel) return;

  if (!state.selectedDateKey) {
    els.selectedDatePanel.classList.add("is-hidden");
    els.selectedDatePanel.innerHTML = "";
    return;
  }

  const date = parseDateKey(state.selectedDateKey);
  const daySchedules = getSelectedSchoolSchedules().filter((schedule) => {
    return schedule.date === state.selectedDateKey &&
      isScheduleVisibleByGrade(schedule, state.selectedGrade) &&
      (state.activeFilter === "all" || schedule.type === state.activeFilter);
  });
  const label = `${date.getMonth() + 1}.${date.getDate()} ${weekdays[date.getDay()]}`;

  els.selectedDatePanel.classList.remove("is-hidden");
  els.selectedDatePanel.innerHTML = `
    <div>
      <strong>${label}</strong>
      <span>선택한 날짜 일정 ${daySchedules.length}개</span>
    </div>
    <button type="button" id="clearSelectedDateBtn">전체 일정 보기</button>
  `;

  document.querySelector("#clearSelectedDateBtn")?.addEventListener("click", () => {
    state.selectedDateKey = "";
    renderCalendar();
    renderScheduleList();
  });
}

function renderScheduleList() {
  const schedules = getFilteredSchedules();
  const isSearching = Boolean(state.scheduleSearchKeyword.trim());
  const isDateSelected = Boolean(state.selectedDateKey);

  renderSelectedDatePanel();

  els.scheduleListTitle.textContent = isSearching
    ? "검색 결과"
    : isDateSelected
      ? "선택한 날짜 일정"
      : `${state.currentDate.getMonth() + 1}월 주요 학사일정`;

  if (state.isScheduleLoading) {
    renderScheduleLoading();
    return;
  }

  if (!state.selectedSchool) {
    els.scheduleList.innerHTML = `<div class="empty-state">먼저 학교를 검색하고 선택해 주세요.</div>`;
    return;
  }

  if (!schedules.length) {
    const emptyMessage = isSearching
      ? "검색된 학사일정이 없어요."
      : state.selectedGrade !== "all"
        ? "선택한 학년에 해당하는 일정이 없습니다."
        : "이번 달 등록된 학사일정이 없어요.";
    els.scheduleList.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
    return;
  }

  els.scheduleList.innerHTML = schedules.map((schedule) => {
    const date = parseDateKey(schedule.date);
    const monthDay = `${date.getMonth() + 1}.${date.getDate()}`;
    const weekday = weekdays[date.getDay()];
    return `
      <article class="schedule-item" title="${escapeHtml(getScheduleTooltip(schedule))}">
        <div class="date-pill"><span>${monthDay}</span><small>${weekday}</small></div>
        <div class="schedule-body">
          <h3>${escapeHtml(schedule.title)}</h3>
          ${schedule.content ? `<p>${escapeHtml(schedule.content)}</p>` : ""}
          <span class="type-badge ${schedule.type}">${typeLabels[schedule.type] || typeLabels.normal}</span>
          <span class="grade-badge">${escapeHtml(getGradeLabel(schedule))}</span>
        </div>
      </article>
    `;
  }).join("");
}

function renderScheduleLoading() {
  if (els.scheduleList) {
    els.scheduleList.innerHTML = `
      <div class="loading-card">
        <span class="loader-dot"></span>
        학사일정을 불러오고 있어요...
      </div>`;
  }
}

function renderAll() {
  renderSelectedSchool();
  renderGradeFilters();
  renderSummary();
  renderCalendar();
  renderScheduleList();
}

// ------------------------------------------------------------
// 동작
// ------------------------------------------------------------
async function selectSchool(school) {
  if (!school) return;
  state.selectedSchool = school;
  state.scheduleSearchKeyword = "";
  state.selectedDateKey = "";
  state.selectedGrade = "all";
  els.scheduleKeyword.value = "";
  saveSelectedSchool(school);
  els.schoolResults.innerHTML = "";
  state.searchKeyword = "";
  if (els.schoolKeyword) els.schoolKeyword.value = "";
  await loadSchedulesForCurrentMonth();
  renderAll();
  document.querySelector("#scheduleSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function resetSchool() {
  state.selectedSchool = null;
  state.schedules = [];
  state.scheduleSearchKeyword = "";
  state.selectedDateKey = "";
  state.selectedGrade = "all";
  els.scheduleKeyword.value = "";
  clearSelectedSchoolStorage();
  els.schoolResults.innerHTML = "";
  renderTopSelectedSchool();
  scrollToSearch();
  renderAll();
}

async function loadSchedulesForCurrentMonth() {
  if (!state.selectedSchool) {
    state.schedules = [];
    renderAll();
    return;
  }

  const year = state.currentDate.getFullYear();
  const month = state.currentDate.getMonth() + 1;
  await fetchSchedules({
    officeCode: state.selectedSchool.officeCode,
    schoolCode: state.selectedSchool.schoolCode,
    year,
    month
  });
}

async function changeMonth(offset) {
  state.selectedDateKey = "";
  state.currentDate = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth() + offset, 1);
  await loadSchedulesForCurrentMonth();
  renderAll();
}

async function goToday() {
  state.selectedDateKey = "";
  const today = new Date();
  state.currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
  await loadSchedulesForCurrentMonth();
  renderAll();
}

function handleCalendarDateClick(event) {
  const cell = event.target.closest(".day-cell[data-date]");
  if (!cell || !els.calendar?.contains(cell)) return;

  const clickedDate = cell.dataset.date;
  const clickedSchedules = getSelectedSchoolSchedules().filter((schedule) => {
    return schedule.date === clickedDate &&
      isScheduleVisibleByGrade(schedule, state.selectedGrade) &&
      (state.activeFilter === "all" || schedule.type === state.activeFilter);
  });

  if (!clickedSchedules.length) return;

  state.selectedDateKey = state.selectedDateKey === clickedDate ? "" : clickedDate;
  state.scheduleSearchKeyword = "";
  if (els.scheduleKeyword) els.scheduleKeyword.value = "";

  renderCalendar();
  renderScheduleList();

  document.querySelector("#scheduleListTitle")?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


function bindEvents() {
  els.calendar?.addEventListener("click", handleCalendarDateClick);
  els.calendar?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (!event.target.closest(".day-cell[data-date]")) return;
    event.preventDefault();
    handleCalendarDateClick(event);
  });
  els.schoolSearchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const schools = await searchSchools(els.schoolKeyword.value, els.schoolRegion?.value || "");
    renderSchoolResults(schools);
  });

  els.schoolRegion?.addEventListener("change", async () => {
    state.selectedOfficeCode = els.schoolRegion.value;
    if (els.schoolKeyword.value.trim()) {
      const schools = await searchSchools(els.schoolKeyword.value, state.selectedOfficeCode);
      renderSchoolResults(schools);
    }
  });

  els.quickSchoolButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      if (button.dataset.officeCode !== undefined) {
        state.selectedOfficeCode = button.dataset.officeCode;
        if (els.schoolRegion) els.schoolRegion.value = state.selectedOfficeCode;
      }

      if (button.dataset.schoolKeyword) {
        els.schoolKeyword.value = button.dataset.schoolKeyword;
      }

      const schools = await searchSchools(els.schoolKeyword.value || button.textContent, state.selectedOfficeCode);
      renderSchoolResults(schools);
    });
  });

  els.resetSchoolBtn.addEventListener("click", resetSchool);
  els.topChangeSchoolBtn?.addEventListener("click", resetSchool);
  els.copyShareBtn?.addEventListener("click", copyShareText);

  els.topSelectedSchool?.addEventListener("click", (event) => {
    event.preventDefault();
    document.querySelector("#selectedSchoolCard")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  els.prevMonthBtn.addEventListener("click", () => changeMonth(-1));
  els.nextMonthBtn.addEventListener("click", () => changeMonth(1));
  els.todayBtn.addEventListener("click", goToday);

  els.filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.activeFilter = button.dataset.filter;
      els.filterButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderAll();
    });
  });

  els.gradeFilterRow?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-grade]");
    if (!button) return;

    state.selectedGrade = button.dataset.grade;
    state.selectedDateKey = "";
    renderAll();
  });

  els.scheduleKeyword.addEventListener("input", () => {
    state.scheduleSearchKeyword = els.scheduleKeyword.value;
    state.selectedDateKey = "";
    renderCalendar();
    renderScheduleList();
  });
}

async function init() {
  renderOfficeOptions();
  bindEvents();
  const savedSchool = loadSelectedSchool();
  if (savedSchool) {
    state.selectedSchool = savedSchool;
    await loadSchedulesForCurrentMonth();
  }
  renderAll();
}

// ------------------------------------------------------------
// 유틸
// ------------------------------------------------------------

const GRADE_FIELD_MAP = [
  { grade: "1", fields: ["ONE_GRADE_EVENT_YN", "ONE_GRADE_EVENT_AT", "ONE_GRADE_EVENT", "oneGradeEventYn"] },
  { grade: "2", fields: ["TW_GRADE_EVENT_YN", "TWO_GRADE_EVENT_YN", "TW_GRADE_EVENT_AT", "twoGradeEventYn"] },
  { grade: "3", fields: ["THREE_GRADE_EVENT_YN", "THREE_GRADE_EVENT_AT", "threeGradeEventYn"] },
  { grade: "4", fields: ["FR_GRADE_EVENT_YN", "FOUR_GRADE_EVENT_YN", "FR_GRADE_EVENT_AT", "fourGradeEventYn"] },
  { grade: "5", fields: ["FIV_GRADE_EVENT_YN", "FIVE_GRADE_EVENT_YN", "FIV_GRADE_EVENT_AT", "fiveGradeEventYn"] },
  { grade: "6", fields: ["SIX_GRADE_EVENT_YN", "SIX_GRADE_EVENT_AT", "sixGradeEventYn"] }
];

function normalizeScheduleDate(value = "") {
  const raw = String(value || "").trim();
  if (/^\d{8}$/.test(raw)) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  }
  return raw;
}

function isYesValue(value) {
  return value === true || ["Y", "YES", "1", "TRUE", "O", "○"].includes(String(value || "").trim().toUpperCase());
}

function hasGradeFields(schedule) {
  return GRADE_FIELD_MAP.some(({ fields }) => fields.some((field) => Object.prototype.hasOwnProperty.call(schedule, field)));
}

function getGradesFromSchedule(schedule = {}) {
  if (Array.isArray(schedule.grades) && schedule.grades.length) {
    return [...new Set(schedule.grades.map((grade) => String(grade).replace(/[^1-6]/g, "")).filter(Boolean))];
  }

  const gradesFromFields = GRADE_FIELD_MAP
    .filter(({ fields }) => fields.some((field) => isYesValue(schedule[field])))
    .map(({ grade }) => grade);

  if (gradesFromFields.length) return gradesFromFields;

  const text = `${schedule.title || ""} ${schedule.content || ""} ${schedule.EVENT_NM || ""} ${schedule.EVENT_CNTNT || ""}`;
  if (/전\s*학년|전체\s*학년|공통/.test(text)) return getDefaultGradesForSchool(state.selectedSchool);

  const gradesFromText = [...text.matchAll(/([1-6])\s*학년/g)].map((match) => match[1]);
  return [...new Set(gradesFromText)];
}

function isAllGradeSchedule(schedule = {}) {
  if (schedule.isAllGrades === true || schedule.allGrades === true) return true;

  const hasFields = hasGradeFields(schedule);
  const grades = Array.isArray(schedule.grades) ? schedule.grades.map(String) : getGradesFromSchedule(schedule);
  const defaultGrades = getDefaultGradesForSchool(state.selectedSchool);

  if (!grades.length) return true;
  return defaultGrades.every((grade) => grades.includes(grade));
}

function getDefaultGradesForSchool(school = state.selectedSchool) {
  const typeText = `${school?.schoolType || ""} ${school?.schoolName || ""}`;
  if (/초등|초등학교|초$/.test(typeText)) return ["1", "2", "3", "4", "5", "6"];
  if (/중학|중학교|고등|고등학교|중$|고$/.test(typeText)) return ["1", "2", "3"];
  return ["1", "2", "3", "4", "5", "6"];
}

function getAvailableGradeFilters(schoolInfo, schedules = []) {
  const defaultGrades = getDefaultGradesForSchool(schoolInfo);
  const maxDefaultGrade = Math.max(...defaultGrades.map(Number));
  const maxScheduleGrade = Math.max(0, ...schedules.flatMap((schedule) => (schedule.grades || []).map(Number).filter(Boolean)));
  const maxGrade = Math.max(maxDefaultGrade, maxScheduleGrade);
  const grades = Array.from({ length: maxGrade }, (_, index) => String(index + 1));

  return [
    { value: "all", label: "전체" },
    ...grades.map((grade) => ({ value: grade, label: `${grade}학년` }))
  ];
}

function isScheduleVisibleByGrade(schedule, selectedGrade) {
  if (selectedGrade === "all") return true;
  if (schedule.isAllGrades) return true;
  const grades = Array.isArray(schedule.grades) ? schedule.grades.map(String) : [];
  return grades.includes(String(selectedGrade));
}

function getGradeLabel(schedule) {
  if (schedule.isAllGrades) return "전학년";
  const grades = Array.isArray(schedule.grades) ? schedule.grades.map(String).filter(Boolean) : [];
  return grades.length ? `${grades.join("·")}학년` : "학년공통";
}

function getScheduleTooltip(schedule) {
  const parts = [schedule.title, schedule.content].filter(Boolean);
  return parts.join(" · ");
}

function getDateTooltip(dateKey, schedules) {
  if (!schedules.length) return dateKey;

  const lines = schedules.map((schedule) => {
    const detail = getScheduleTooltip(schedule);
    return detail || schedule.title || "학사일정";
  });

  return `${dateKey}\n${lines.join("\n")}`;
}


function formatMonthTitle(date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getMonthSchedules(allSchedules = state.schedules) {
  const year = state.currentDate.getFullYear();
  const month = state.currentDate.getMonth();
  return allSchedules.filter((schedule) => {
    const date = parseDateKey(schedule.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });
}

function getSelectedSchoolSchedules() {
  if (!state.selectedSchool) return [];
  // 실제 API 연결 전에는 현재 월만 불러오지만, mock/proxy 응답 모두 state.schedules를 기준으로 표시한다.
  return state.schedules;
}

function getFilteredSchedules() {
  const keyword = state.scheduleSearchKeyword.trim().toLowerCase();
  let baseSchedules = keyword ? getSelectedSchoolSchedules() : getMonthSchedules();

  if (state.selectedDateKey && !keyword) {
    baseSchedules = baseSchedules.filter((schedule) => schedule.date === state.selectedDateKey);
  }

  return baseSchedules.filter((schedule) => {
    const matchedFilter = state.activeFilter === "all" || schedule.type === state.activeFilter;
    const matchedGrade = isScheduleVisibleByGrade(schedule, state.selectedGrade);
    const matchedKeyword = !keyword || [schedule.title, schedule.content]
      .join(" ")
      .toLowerCase()
      .includes(keyword);
    return matchedFilter && matchedGrade && matchedKeyword;
  }).sort((a, b) => a.date.localeCompare(b.date));
}

function classifyScheduleType(title = "", content = "") {
  const text = `${title} ${content}`;

  if (/시험|평가|고사|성취도/.test(text)) return "exam";
  if (/방학|개학|휴업|재량휴업|휴교|개교기념/.test(text)) return "vacation";
  if (/체험|수련|수학여행|공개수업|행사|축제|운동회|입학식|졸업식|자치회|스포츠/.test(text)) return "event";

  return "normal";
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

init();
