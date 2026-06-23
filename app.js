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
  searchKeyword: "",
  selectedOfficeCode: "",
  scheduleSearchKeyword: "",
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
  scheduleKeyword: document.querySelector("#scheduleKeyword"),
  filterButtons: document.querySelectorAll(".filter-chip"),
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
  renderScheduleLoading();

  try {
    const schedules = API_CONFIG.useMock
      ? await fetchSchedulesFromMock({ schoolCode, year, month })
      : await fetchSchedulesFromProxy({ officeCode, schoolCode, year, month });

    state.schedules = schedules.map((schedule) => ({
      ...schedule,
      type: schedule.type || classifyScheduleType(schedule.title, schedule.content)
    }));
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
  // TODO: NEIS 학사일정 응답을 아래 내부 구조로 변환 예정
  // { schoolCode, date: "YYYY-MM-DD", title, content, grades, type }
  return rawData;
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
function renderError(message) {
  clearError();
  state.errorMessage = message;
  const target = document.querySelector("main");
  if (!target) return;
  const box = document.createElement("div");
  box.className = "error-box";
  box.innerHTML = `<span aria-hidden="true">⚠️</span><p>${message}</p>`;
  target.prepend(box);
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
        <div>
          <div class="school-card-top">
            <h3>${escapeHtml(school.schoolName)}</h3>
            <span class="region-badge">${escapeHtml(getOfficeShortName(school.officeCode || school.region))}</span>
            <span class="school-type-badge">${escapeHtml(school.schoolType || "학교")}</span>
          </div>
          <p>${escapeHtml(school.region)} · ${escapeHtml(school.schoolType)}</p>
          <p>${escapeHtml(school.address)}</p>
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
    return;
  }

  els.selectedSchoolName.textContent = state.selectedSchool.schoolName;
  els.selectedSchoolMeta.textContent = `${state.selectedSchool.region} · ${state.selectedSchool.schoolType} · ${state.selectedSchool.address}`;
}

function renderSummary() {
  const monthSchedules = getMonthSchedules();
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
    return state.activeFilter === "all" || schedule.type === state.activeFilter;
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
    if (schedules.length) classes.push("has-schedule");

    cells.push(`
      <div class="${classes.join(" ")}" aria-label="${key}">
        <div class="day-number">${cellDate.getDate()}</div>
        ${visibleSchedules.map((schedule) => `<span class="calendar-schedule ${schedule.type}">${escapeHtml(schedule.title)}</span>`).join("")}
        ${moreCount ? `<span class="more-count">+${moreCount}</span>` : ""}
      </div>
    `);
  }

  els.calendar.innerHTML = cells.join("");
}

function renderScheduleList() {
  const schedules = getFilteredSchedules();
  const isSearching = Boolean(state.scheduleSearchKeyword.trim());
  els.scheduleListTitle.textContent = isSearching ? "검색 결과" : `${state.currentDate.getMonth() + 1}월 주요 학사일정`;

  if (state.isScheduleLoading) {
    renderScheduleLoading();
    return;
  }

  if (!state.selectedSchool) {
    els.scheduleList.innerHTML = `<div class="empty-state">먼저 학교를 검색하고 선택해 주세요.</div>`;
    return;
  }

  if (!schedules.length) {
    els.scheduleList.innerHTML = `<div class="empty-state">${isSearching ? "검색된 학사일정이 없어요." : "이번 달 등록된 학사일정이 없어요."}</div>`;
    return;
  }

  els.scheduleList.innerHTML = schedules.map((schedule) => {
    const date = parseDateKey(schedule.date);
    const monthDay = `${date.getMonth() + 1}.${date.getDate()}`;
    const weekday = weekdays[date.getDay()];
    return `
      <article class="schedule-item">
        <div class="date-pill"><span>${monthDay}</span><small>${weekday}</small></div>
        <div class="schedule-body">
          <h3>${escapeHtml(schedule.title)}</h3>
          <p>${escapeHtml(schedule.content || "세부 내용은 학교 안내를 확인해 주세요.")}</p>
          <span class="type-badge ${schedule.type}">${typeLabels[schedule.type] || typeLabels.normal}</span>
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
  state.currentDate = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth() + offset, 1);
  await loadSchedulesForCurrentMonth();
  renderAll();
}

async function goToday() {
  const today = new Date();
  state.currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
  await loadSchedulesForCurrentMonth();
  renderAll();
}

function bindEvents() {
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

  els.scheduleKeyword.addEventListener("input", () => {
    state.scheduleSearchKeyword = els.scheduleKeyword.value;
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
  const baseSchedules = keyword ? getSelectedSchoolSchedules() : getMonthSchedules();

  return baseSchedules
    .filter((schedule) => state.activeFilter === "all" || schedule.type === state.activeFilter)
    .filter((schedule) => {
      if (!keyword) return true;
      return `${schedule.title} ${schedule.content}`.toLowerCase().includes(keyword);
    })
    .sort((a, b) => a.date.localeCompare(b.date));
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
