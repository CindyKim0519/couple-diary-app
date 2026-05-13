const STORAGE_KEY = "coupleDiaryAppState.v1";
const COLLECTION_PAGE_SIZE = 5;

const memoryTypes = ["데이트", "여행", "기념일", "맛집", "선물", "일상", "사진", "편지", "싸움/화해", "특별한 날"];
const emotions = ["행복", "설렘", "고마움", "감동", "편안함", "그리움", "웃김", "미안함", "서운함", "화해"];
const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

const app = document.querySelector("#app");

const state = loadState();
let view = {
  screen: needsSetup() ? "setup" : "pin",
  activeTab: "calendar",
  currentUser: state.currentUser || "",
  selectedDate: toDateKey(new Date()),
  viewedMonth: monthKey(new Date()),
  editingMemoryId: null,
  viewingMemoryId: null,
  search: "",
  typeFilter: "전체",
  collectionVisibleCount: COLLECTION_PAGE_SIZE,
  formPhotos: [],
  formDraft: null,
};

render();

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  return {
    settings: null,
    currentUser: "",
    memories: [],
    anniversaries: [],
  };
}

function saveState() {
  state.currentUser = view.currentUser;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function needsSetup() {
  return !state.settings;
}

function render() {
  app.innerHTML = `<div class="phone-frame">${screenMarkup()}</div>`;
  bindScreen();
}

function screenMarkup() {
  if (view.screen === "setup") return setupScreen();
  if (view.screen === "pin") return pinScreen();
  if (view.screen === "user") return userSelectScreen();
  if (view.screen === "form") return memoryFormScreen();
  if (view.screen === "detail") return detailScreen();
  if (view.screen === "gallery") return galleryScreen();
  return mainScreen();
}

function setupScreen() {
  return `
    <section class="screen screen-soft screen-scroll">
      <div class="brand-block">
        <div class="brand-mark">♥</div>
        <h1 class="brand-title">우리의 추억</h1>
        <p class="brand-subtitle">둘만의 기록장을 처음 열어볼게요</p>
      </div>
      <form class="form-stack" id="setup-form">
        <div class="field-group">
          <label for="pin">공동 PIN 4자리</label>
          <input class="ds-field pin-input" id="pin" name="pin" inputmode="numeric" maxlength="4" required />
        </div>
        <div class="field-grid">
          <div class="field-group">
            <label for="me">내 닉네임</label>
            <input class="ds-field" id="me" name="me" required />
          </div>
          <div class="field-group">
            <label for="my-birthday">내 생일</label>
            <input class="ds-field" id="my-birthday" name="myBirthday" type="date" required />
          </div>
        </div>
        <div class="field-grid">
          <div class="field-group">
            <label for="partner">상대 닉네임</label>
            <input class="ds-field" id="partner" name="partner" required />
          </div>
          <div class="field-group">
            <label for="partner-birthday">상대 생일</label>
            <input class="ds-field" id="partner-birthday" name="partnerBirthday" type="date" required />
          </div>
        </div>
        <div class="field-group">
          <label for="start-date">우리 시작일</label>
          <input class="ds-field" id="start-date" name="startDate" type="date" required />
        </div>
        <p class="error-text" id="setup-error"></p>
        <button class="ds-button-primary" type="submit">시작하기</button>
      </form>
    </section>
  `;
}

function pinScreen() {
  return `
    <section class="screen screen-soft">
      <div class="brand-block">
        <div class="brand-mark">♥</div>
        <h1 class="brand-title">우리의 추억</h1>
        <p class="brand-subtitle">PIN을 입력해 주세요</p>
      </div>
      <form class="form-stack" id="pin-form">
        <div class="field-group">
          <label for="pin-login">공동 PIN</label>
          <input class="ds-field pin-input" id="pin-login" name="pin" inputmode="numeric" maxlength="4" autocomplete="off" required />
        </div>
        <p class="error-text" id="pin-error"></p>
        <button class="ds-button-primary" type="submit">입장하기</button>
      </form>
    </section>
  `;
}

function userSelectScreen() {
  const users = state.settings.users.map((user) => `
    <button class="ds-button-secondary user-select-button" data-user="${escapeAttr(user.nickname)}">${escapeHtml(user.nickname)}</button>
  `).join("");

  return `
    <section class="screen screen-soft">
      <div class="brand-block">
        <div class="brand-mark">♥</div>
        <h1 class="brand-title">오늘은 누가 들어왔나요?</h1>
      </div>
      <div class="button-row">${users}</div>
    </section>
  `;
}

function mainScreen() {
  return `
    <section class="screen screen-soft screen-scroll">
      <header class="topbar">
        <h1>우리의 추억</h1>
        <button class="user-pill" id="change-user">${escapeHtml(view.currentUser)}</button>
      </header>
      <p class="day-count">함께한 지 ${relationshipDays()}일</p>
      <nav class="tabs">
        <button class="tab-button ${view.activeTab === "calendar" ? "is-active" : ""}" data-tab="calendar">캘린더</button>
        <button class="tab-button ${view.activeTab === "collection" ? "is-active" : ""}" data-tab="collection">모아보기</button>
      </nav>
      <div class="main-content">
        ${view.activeTab === "calendar" ? calendarView() : collectionView()}
      </div>
    </section>
  `;
}

function calendarView() {
  const [year, month] = view.viewedMonth.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  const cells = calendarCells(date).map((cell) => calendarCellMarkup(cell)).join("");
  const dayMemories = memoriesForDate(view.selectedDate);
  const anniversaries = anniversariesForDate(view.selectedDate);

  return `
    <section class="calendar-panel">
      <div class="month-nav">
        <button class="icon-button" id="prev-month" aria-label="이전 달">‹</button>
        <h2 class="month-title">${year}년 ${month}월</h2>
        <button class="icon-button" id="next-month" aria-label="다음 달">›</button>
      </div>
      <div class="calendar-weekdays">${weekdays.map((day) => `<span>${day}</span>`).join("")}</div>
      <div class="calendar-grid">${cells}</div>
      <div class="selected-day">
        <h2 class="date-title">${formatLongDate(view.selectedDate)}</h2>
        <div>
          <p class="section-title">기념일</p>
          <div class="anniversary-list">
            ${anniversaries.length ? anniversaries.map(anniversaryMarkup).join("") : `<p class="empty-text">이 날짜에는 기념일이 없어요</p>`}
          </div>
        </div>
        <div>
          <p class="section-title">추억 ${dayMemories.length}개</p>
          <div class="memory-list">${dayMemories.length ? dayMemories.map(memoryCard).join("") : emptyMemoryText()}</div>
        </div>
      </div>
      <div class="bottom-actions">
        <p class="meta-text">총 추억 ${state.memories.length}개</p>
        <div class="button-row">
          <button class="ds-button-secondary" id="add-anniversary">기념일 추가</button>
          <button class="ds-button-primary" id="add-memory">추억 추가</button>
        </div>
      </div>
    </section>
  `;
}

function collectionView() {
  const memories = filteredMemories();
  const visibleMemories = memories.slice(0, view.collectionVisibleCount);
  const hasMore = visibleMemories.length < memories.length;
  const countText = resultCountText(memories.length);
  return `
    <section class="section-panel">
      <div class="search-row">
        <div class="field-group">
          <label class="sr-only" for="memory-search">검색</label>
          <input class="ds-field" id="memory-search" value="${escapeAttr(view.search)}" placeholder="제목, 장소, 본문, 감정을 찾아봐요" />
        </div>
        <div class="field-group">
          <label class="sr-only" for="type-filter">기록 유형</label>
          <select class="ds-field select-field" id="type-filter">
            ${["전체", ...memoryTypes].map((type) => `<option ${view.typeFilter === type ? "selected" : ""}>${type}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="collection-actions">
        <p class="meta-text">${countText}</p>
        <button class="ds-button-primary" id="add-memory">추억 추가</button>
      </div>
      <div class="memory-list">${visibleMemories.length ? visibleMemories.map(memoryCard).join("") : emptySearchText()}</div>
      ${hasMore ? `<button class="ds-button-secondary load-more-button" id="load-more-memories">더보기</button>` : ""}
    </section>
  `;
}

function memoryFormScreen() {
  const memory = view.editingMemoryId ? state.memories.find((item) => item.id === view.editingMemoryId) : null;
  const form = view.formDraft || memory || {
    title: "",
    date: view.selectedDate,
    place: "",
    type: "데이트",
    emotion: "행복",
    content: "",
    photos: [],
  };
  view.formPhotos = view.formPhotos.length ? view.formPhotos : clonePhotos(form.photos);

  return `
    <section class="screen screen-soft screen-scroll">
      <div class="topbar">
        <button class="icon-button" id="back-main" aria-label="뒤로">‹</button>
        <h1>${memory ? "추억 수정하기" : "추억 추가"}</h1>
        <span></span>
      </div>
      <form class="form-stack" id="memory-form">
        <p class="helper-text">${escapeHtml(view.currentUser)}의 기록으로 저장돼요</p>
        ${photoManagerMarkup()}
        <div class="field-group">
          <label for="memory-title">제목</label>
          <input class="ds-field" id="memory-title" name="title" value="${escapeAttr(form.title)}" required />
        </div>
        <div class="field-grid">
          <div class="field-group">
            <label for="memory-date">날짜</label>
            <input class="ds-field" id="memory-date" name="date" type="date" value="${escapeAttr(form.date)}" required />
          </div>
          <div class="field-group">
            <label for="memory-place">장소</label>
            <input class="ds-field" id="memory-place" name="place" value="${escapeAttr(form.place)}" placeholder="어디에서의 기억인가요?" />
          </div>
        </div>
        <div class="field-grid">
          <div class="field-group">
            <label for="memory-type">기록 유형</label>
            <select class="ds-field" id="memory-type" name="type" required>
              ${memoryTypes.map((type) => `<option ${form.type === type ? "selected" : ""}>${type}</option>`).join("")}
            </select>
          </div>
          <div class="field-group">
            <label>감정</label>
            <div class="chip-grid">
              ${emotions.map((emotion) => `<button class="chip ${form.emotion === emotion ? "is-selected" : ""}" type="button" data-emotion="${emotion}">${emotion}</button>`).join("")}
            </div>
            <input type="hidden" name="emotion" id="memory-emotion" value="${escapeAttr(form.emotion)}" />
          </div>
        </div>
        <div class="field-group">
          <label for="memory-content">본문</label>
          <textarea class="ds-field text-area" id="memory-content" name="content" placeholder="오늘 기억하고 싶은 순간을 짧게 남겨봐">${escapeHtml(form.content)}</textarea>
        </div>
        <div class="button-row">
          <button class="ds-button-primary" type="submit">${memory ? "수정 완료" : "저장하기"}</button>
          ${memory ? `<button class="ds-button-secondary" type="button" id="delete-memory">삭제</button>` : ""}
        </div>
      </form>
      <input class="hidden" id="photo-input" type="file" accept="image/*" multiple />
    </section>
  `;
}

function detailScreen() {
  const memory = state.memories.find((item) => item.id === view.viewingMemoryId);
  if (!memory) {
    view.screen = "main";
    return mainScreen();
  }
  const cover = coverPhoto(memory);
  const canEdit = memory.authorNickname === view.currentUser;

  return `
    <section class="screen screen-soft screen-scroll">
      <div class="topbar">
        <button class="icon-button" id="back-main" aria-label="뒤로">‹</button>
        <h1>추억 보기</h1>
        <span></span>
      </div>
      <article class="section-panel">
        ${cover ? `<div class="detail-photo" id="open-gallery"><img src="${cover.url}" alt="${escapeAttr(memory.title)}" /></div>` : ""}
        <h2 class="detail-title">${escapeHtml(memory.title)}</h2>
        <p class="helper-text">${escapeHtml(memory.authorNickname)}가 남긴 기록</p>
        <p class="meta-text">${formatKoreanDate(memory.date)}${memory.place ? ` / ${escapeHtml(memory.place)}` : ""}</p>
        <p class="meta-text">${escapeHtml(memory.type)} / ${escapeHtml(memory.emotion)}</p>
        <div class="detail-content">${escapeHtml(memory.content || "오늘의 작은 순간을 남겨두었어요.")}</div>
        ${canEdit ? `<div class="button-row" style="margin-top: var(--space-5)"><button class="ds-button-primary" id="edit-memory">수정</button></div>` : ""}
      </article>
    </section>
  `;
}

function galleryScreen() {
  const memory = state.memories.find((item) => item.id === view.viewingMemoryId);
  const photos = memory ? orderedPhotos(memory.photos) : [];
  return `
    <section class="fullscreen-gallery screen-scroll">
      <div class="topbar">
        <button class="ds-button-secondary" id="close-gallery">닫기</button>
        <h1>${memory ? escapeHtml(memory.title) : "사진"}</h1>
        <span></span>
      </div>
      ${photos.map((photo, index) => `<img src="${photo.url}" alt="사진 ${index + 1}" />`).join("")}
    </section>
  `;
}

function photoManagerMarkup() {
  const tiles = view.formPhotos.map((photo, index) => `
    <div class="photo-tile">
      <img src="${photo.url}" alt="추억 사진 ${index + 1}" draggable="false" />
      ${index === 0 ? `<span class="cover-label">대표</span>` : ""}
      <button class="photo-delete-button" type="button" data-photo-delete="${photo.id}" aria-label="삭제">×</button>
    </div>
  `).join("");

  return `
    <div class="photo-manager">
      <div class="photo-head">
        <label class="section-title">사진 추가</label>
        <span class="meta-text">최대 10장</span>
      </div>
      <div class="photo-grid">
        <button class="photo-add" id="photo-add" type="button" aria-label="사진 추가">+</button>
        ${tiles}
      </div>
    </div>
  `;
}

function bindScreen() {
  const setupForm = document.querySelector("#setup-form");
  if (setupForm) setupForm.addEventListener("submit", handleSetup);

  const pinForm = document.querySelector("#pin-form");
  if (pinForm) pinForm.addEventListener("submit", handlePin);

  document.querySelectorAll(".user-select-button").forEach((button) => {
    button.addEventListener("click", () => {
      view.currentUser = button.dataset.user;
      view.screen = "main";
      saveState();
      render();
    });
  });

  document.querySelector("#change-user")?.addEventListener("click", () => {
    view.screen = "user";
    render();
  });

  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      view.activeTab = button.dataset.tab;
      render();
    });
  });

  document.querySelector("#prev-month")?.addEventListener("click", () => shiftMonth(-1));
  document.querySelector("#next-month")?.addEventListener("click", () => shiftMonth(1));
  document.querySelectorAll(".calendar-cell").forEach((button) => {
    button.addEventListener("click", () => {
      view.selectedDate = button.dataset.date;
      view.viewedMonth = monthKey(parseDate(button.dataset.date));
      render();
    });
  });

  document.querySelectorAll(".memory-card").forEach((card) => {
    card.addEventListener("click", () => {
      view.viewingMemoryId = card.dataset.memoryId;
      view.screen = "detail";
      render();
    });
  });

  document.querySelector("#add-memory")?.addEventListener("click", () => {
    view.editingMemoryId = null;
    view.formPhotos = [];
    view.formDraft = null;
    view.screen = "form";
    render();
  });

  document.querySelector("#add-anniversary")?.addEventListener("click", () => openAnniversaryDialog());
  document.querySelectorAll("[data-edit-anniversary]").forEach((button) => {
    button.addEventListener("click", () => openAnniversaryDialog(button.dataset.editAnniversary));
  });
  document.querySelectorAll("[data-delete-anniversary]").forEach((button) => {
    button.addEventListener("click", () => deleteAnniversary(button.dataset.deleteAnniversary));
  });

  document.querySelector("#memory-search")?.addEventListener("input", (event) => {
    view.search = event.target.value;
    resetCollectionVisibleCount();
    render();
  });
  document.querySelector("#type-filter")?.addEventListener("change", (event) => {
    view.typeFilter = event.target.value;
    resetCollectionVisibleCount();
    render();
  });
  document.querySelector("#load-more-memories")?.addEventListener("click", () => {
    view.collectionVisibleCount += COLLECTION_PAGE_SIZE;
    render();
  });

  document.querySelector("#back-main")?.addEventListener("click", () => {
    view.screen = "main";
    view.formPhotos = [];
    view.formDraft = null;
    render();
  });

  document.querySelector("#memory-form")?.addEventListener("submit", handleMemorySubmit);
  document.querySelectorAll("[data-emotion]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector("#memory-emotion").value = button.dataset.emotion;
      document.querySelectorAll("[data-emotion]").forEach((item) => item.classList.toggle("is-selected", item === button));
    });
  });

  document.querySelector("#photo-add")?.addEventListener("click", () => {
    collectFormDraft();
    document.querySelector("#photo-input").click();
  });
  document.querySelector("#photo-input")?.addEventListener("change", handlePhotoInput);
  document.querySelectorAll("[data-photo-delete]").forEach((button) => {
    button.addEventListener("click", () => deletePhoto(button.dataset.photoDelete));
  });

  document.querySelector("#delete-memory")?.addEventListener("click", confirmDeleteMemory);
  document.querySelector("#edit-memory")?.addEventListener("click", () => {
    view.editingMemoryId = view.viewingMemoryId;
    view.formPhotos = [];
    view.formDraft = null;
    view.screen = "form";
    render();
  });

  document.querySelector("#open-gallery")?.addEventListener("click", () => {
    view.screen = "gallery";
    render();
  });
  document.querySelector("#close-gallery")?.addEventListener("click", () => {
    view.screen = "detail";
    render();
  });
}

function handleSetup(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const pin = onlyDigits(data.get("pin"));
  const error = document.querySelector("#setup-error");

  if (pin.length !== 4) {
    error.textContent = "PIN은 4자리 숫자로 입력해 주세요";
    return;
  }

  const me = String(data.get("me")).trim();
  const partner = String(data.get("partner")).trim();
  if (!me || !partner || me === partner) {
    error.textContent = "서로 다른 닉네임을 입력해 주세요";
    return;
  }

  state.settings = {
    pin,
    users: [
      { nickname: me, birthday: data.get("myBirthday"), badgeColor: "rose" },
      { nickname: partner, birthday: data.get("partnerBirthday"), badgeColor: "blue" },
    ],
    relationshipStartDate: data.get("startDate"),
  };
  seedMemoriesIfEmpty(me, partner, data.get("startDate"));
  view.currentUser = me;
  view.screen = "main";
  saveState();
  render();
}

function handlePin(event) {
  event.preventDefault();
  const pin = onlyDigits(new FormData(event.currentTarget).get("pin"));
  if (pin !== state.settings.pin) {
    document.querySelector("#pin-error").textContent = "PIN이 맞지 않아요";
    return;
  }
  view.screen = "user";
  render();
}

function handleMemorySubmit(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const now = new Date().toISOString();
  const photos = normalizePhotos(view.formPhotos);

  const payload = {
    title: String(data.get("title")).trim(),
    date: data.get("date"),
    place: String(data.get("place")).trim(),
    type: data.get("type"),
    emotion: data.get("emotion"),
    content: String(data.get("content")).trim(),
    photos,
    authorNickname: view.currentUser,
    updatedAt: now,
  };

  if (view.editingMemoryId) {
    const index = state.memories.findIndex((memory) => memory.id === view.editingMemoryId);
    state.memories[index] = { ...state.memories[index], ...payload };
    view.viewingMemoryId = view.editingMemoryId;
  } else {
    const memory = {
      id: makeId("memory"),
      ...payload,
      createdAt: now,
    };
    state.memories.unshift(memory);
    view.viewingMemoryId = memory.id;
  }

  view.selectedDate = payload.date;
  view.viewedMonth = monthKey(parseDate(payload.date));
  view.formPhotos = [];
  view.formDraft = null;
  view.screen = "detail";
  saveState();
  render();
}

function handlePhotoInput(event) {
  collectFormDraft();
  const files = Array.from(event.target.files).slice(0, Math.max(0, 10 - view.formPhotos.length));
  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = () => {
      view.formPhotos.push({
        id: makeId("photo"),
        url: reader.result,
        order: view.formPhotos.length + 1,
        isCover: view.formPhotos.length === 0,
      });
      view.formPhotos = normalizePhotos(view.formPhotos);
      syncFormDraftPhotos();
      render();
    };
    reader.readAsDataURL(file);
  });
}

function deletePhoto(photoId) {
  collectFormDraft();
  const index = view.formPhotos.findIndex((photo) => photo.id === photoId);
  if (index < 0) return;

  view.formPhotos.splice(index, 1);
  view.formPhotos = normalizePhotos(view.formPhotos);
  syncFormDraftPhotos();
  render();
}

function syncFormDraftPhotos() {
  if (view.formDraft) view.formDraft.photos = view.formPhotos;
}

function confirmDeleteMemory() {
  openDialog(`
    <h2>이 추억을 삭제할까요?</h2>
    <p class="helper-text">삭제하면 다시 복구할 수 없어요.</p>
    <div class="button-row" style="margin-top: var(--space-5)">
      <button class="ds-button-secondary" id="dialog-cancel">취소</button>
      <button class="ds-button-primary" id="dialog-delete">삭제</button>
    </div>
  `);
  document.querySelector("#dialog-cancel").addEventListener("click", closeDialog);
  document.querySelector("#dialog-delete").addEventListener("click", () => {
    state.memories = state.memories.filter((memory) => memory.id !== view.editingMemoryId);
    closeDialog();
    view.screen = "main";
    view.activeTab = "calendar";
    view.formPhotos = [];
    view.formDraft = null;
    saveState();
    render();
  });
}

function collectFormDraft() {
  const form = document.querySelector("#memory-form");
  if (!form) return;
  const data = new FormData(form);
  view.formDraft = {
    title: String(data.get("title") || ""),
    date: data.get("date") || view.selectedDate,
    place: String(data.get("place") || ""),
    type: data.get("type") || "데이트",
    emotion: data.get("emotion") || "행복",
    content: String(data.get("content") || ""),
    photos: view.formPhotos,
  };
}

function openAnniversaryDialog(id = null) {
  const item = id ? state.anniversaries.find((anniversary) => anniversary.id === id) : null;
  openDialog(`
    <h2>${item ? "기념일 수정" : "기념일 추가"}</h2>
    <form class="form-stack" id="anniversary-form">
      <div class="field-group">
        <label for="anniversary-title">기념일 이름</label>
        <input class="ds-field" id="anniversary-title" name="title" value="${escapeAttr(item?.title || "")}" required />
      </div>
      <div class="field-group">
        <label for="anniversary-date">날짜</label>
        <input class="ds-field" id="anniversary-date" name="date" type="date" value="${escapeAttr(item?.date || view.selectedDate)}" required />
      </div>
      <div class="field-group">
        <label for="anniversary-memo">메모</label>
        <textarea class="ds-field text-area" id="anniversary-memo" name="memo">${escapeHtml(item?.memo || "")}</textarea>
      </div>
      <div class="button-row">
        <button class="ds-button-secondary" id="dialog-cancel" type="button">취소</button>
        <button class="ds-button-primary" type="submit">${item ? "수정 완료" : "추가"}</button>
      </div>
    </form>
  `);
  document.querySelector("#dialog-cancel").addEventListener("click", closeDialog);
  document.querySelector("#anniversary-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      title: String(data.get("title")).trim(),
      date: data.get("date"),
      memo: String(data.get("memo")).trim(),
    };
    if (item) {
      Object.assign(item, payload);
    } else {
      state.anniversaries.push({ id: makeId("anniversary"), ...payload, createdAt: new Date().toISOString() });
    }
    view.selectedDate = payload.date;
    view.viewedMonth = monthKey(parseDate(payload.date));
    closeDialog();
    saveState();
    render();
  });
}

function deleteAnniversary(id) {
  state.anniversaries = state.anniversaries.filter((item) => item.id !== id);
  saveState();
  render();
}

function openDialog(markup) {
  const backdrop = document.createElement("div");
  backdrop.className = "dialog-backdrop";
  backdrop.innerHTML = `<div class="dialog">${markup}</div>`;
  document.body.append(backdrop);
}

function closeDialog() {
  document.querySelector(".dialog-backdrop")?.remove();
}

function shiftMonth(offset) {
  const [year, month] = view.viewedMonth.split("-").map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  view.viewedMonth = monthKey(date);
  render();
}

function calendarCells(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();
  const cells = [];

  for (let index = firstDay - 1; index >= 0; index -= 1) {
    const cellDate = new Date(year, month - 1, previousMonthDays - index);
    cells.push({ date: toDateKey(cellDate), muted: true });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ date: toDateKey(new Date(year, month, day)), muted: false });
  }
  while (cells.length % 7 !== 0) {
    const day = cells.length - firstDay - daysInMonth + 1;
    cells.push({ date: toDateKey(new Date(year, month + 1, day)), muted: true });
  }
  return cells;
}

function calendarCellMarkup(cell) {
  const memoryCount = memoriesForDate(cell.date).length;
  const hasAnniversary = anniversariesForDate(cell.date).length > 0;
  const isSelected = cell.date === view.selectedDate;
  const isToday = cell.date === toDateKey(new Date());
  const day = parseDate(cell.date).getDate();
  return `
    <button class="calendar-cell ${cell.muted ? "is-muted" : ""} ${isSelected ? "is-selected" : ""} ${isToday ? "is-today" : ""}" data-date="${cell.date}">
      <span class="date-number">${day}</span>
      <span class="date-marks">${memoryCount ? `<span>${memoryCount}</span>` : ""}${hasAnniversary ? `<span class="heart-mark">♥</span>` : ""}</span>
    </button>
  `;
}

function anniversariesForDate(dateKey) {
  const manual = state.anniversaries
    .filter((item) => item.date === dateKey)
    .map((item) => ({ ...item, automatic: false }));
  return [...autoAnniversariesForDate(dateKey), ...manual];
}

function autoAnniversariesForDate(dateKey) {
  const result = [];
  const target = parseDate(dateKey);
  const start = parseDate(state.settings.relationshipStartDate);
  const days = diffDaysInclusive(start, target);

  if (days >= 100 && days % 100 === 0) result.push({ id: `auto-days-${days}`, title: `${days}일`, automatic: true });
  if (target.getMonth() === start.getMonth() && target.getDate() === start.getDate() && target.getFullYear() > start.getFullYear()) {
    result.push({ id: `auto-year-${target.getFullYear()}`, title: `${target.getFullYear() - start.getFullYear()}주년`, automatic: true });
  }

  state.settings.users.forEach((user) => {
    const birthday = parseDate(user.birthday);
    if (target.getMonth() === birthday.getMonth() && target.getDate() === birthday.getDate()) {
      result.push({ id: `auto-birthday-${user.nickname}-${target.getFullYear()}`, title: `${user.nickname} 생일`, automatic: true });
    }
  });
  return result;
}

function anniversaryMarkup(item) {
  return `
    <div class="anniversary-item">
      <span class="heart-mark">♥</span>
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        ${item.memo ? `<p class="memory-preview">${escapeHtml(item.memo)}</p>` : ""}
      </div>
      ${item.automatic ? "" : `<div class="anniversary-actions"><button class="text-button" data-edit-anniversary="${item.id}">수정</button><button class="text-button" data-delete-anniversary="${item.id}">삭제</button></div>`}
    </div>
  `;
}

function memoriesForDate(dateKey) {
  return state.memories
    .filter((memory) => memory.date === dateKey)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function filteredMemories() {
  const query = view.search.trim().toLowerCase();
  return state.memories
    .filter((memory) => view.typeFilter === "전체" || memory.type === view.typeFilter)
    .filter((memory) => {
      if (!query) return true;
      return [memory.title, memory.place, memory.content, memory.type, memory.emotion]
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function resetCollectionVisibleCount() {
  view.collectionVisibleCount = COLLECTION_PAGE_SIZE;
}

function memoryCard(memory) {
  const cover = coverPhoto(memory);
  const badge = userBadge(memory.authorNickname);
  return `
    <article class="memory-card" data-memory-id="${memory.id}">
      <div class="memory-cover">${cover ? `<img src="${cover.url}" alt="${escapeAttr(memory.title)}" />` : "꽃"}</div>
      <div class="memory-copy">
        <div class="memory-card-head">
          <h3>${escapeHtml(memory.title)}</h3>
          <span class="author-badge ${badge}">${escapeHtml(memory.authorNickname)}</span>
        </div>
        <p class="memory-meta">${formatDotDate(memory.date)} · ${escapeHtml(memory.type)} · ${escapeHtml(memory.emotion)}</p>
        ${memory.content ? `<p class="memory-preview">${escapeHtml(memory.content)}</p>` : ""}
      </div>
    </article>
  `;
}

function userBadge(nickname) {
  return state.settings.users.find((user) => user.nickname === nickname)?.badgeColor || "rose";
}

function resultCountText(count) {
  if (view.search.trim()) return `검색 결과 ${count}개`;
  if (view.typeFilter !== "전체") return `${view.typeFilter} 추억 ${count}개`;
  return `총 추억 ${count}개`;
}

function emptyMemoryText() {
  return `<p class="empty-text">이 날짜에는 아직 추억이 없어요<br />다른 날의 우리를 찾아볼까요?</p>`;
}

function emptySearchText() {
  return `<p class="empty-text">찾는 추억이 없어요<br />다른 단어로 다시 찾아볼까요?</p>`;
}

function relationshipDays() {
  return diffDaysInclusive(parseDate(state.settings.relationshipStartDate), new Date());
}

function diffDaysInclusive(start, end) {
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.floor((endUtc - startUtc) / 86400000) + 1;
}

function seedMemoriesIfEmpty(me, partner, startDate) {
  if (state.memories.length) return;
  const now = new Date().toISOString();
  state.memories = [
    {
      id: makeId("memory"),
      title: "처음 남긴 작은 기록",
      date: startDate,
      place: "",
      type: "일상",
      emotion: "설렘",
      content: "우리의 첫 페이지를 열어둔 날.",
      photos: [],
      authorNickname: me,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: makeId("memory"),
      title: "같이 걷던 저녁",
      date: startDate,
      place: "동네 산책길",
      type: "데이트",
      emotion: "편안함",
      content: "별일 없어도 같이 걸어서 좋았던 시간.",
      photos: [],
      authorNickname: partner,
      createdAt: new Date(Date.now() - 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1000).toISOString(),
    },
  ];
}

function coverPhoto(memory) {
  return orderedPhotos(memory.photos)[0];
}

function orderedPhotos(photos = []) {
  return [...photos].sort((a, b) => a.order - b.order);
}

function clonePhotos(photos = []) {
  return normalizePhotos(photos);
}

function normalizePhotos(photos = []) {
  return orderedPhotos(photos).map((photo, index) => ({
    ...photo,
    order: index + 1,
    isCover: index === 0,
  }));
}

function parseDate(dateKey) {
  const [year, month, day] = String(dateKey).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function monthKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatLongDate(dateKey) {
  const date = parseDate(dateKey);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function formatKoreanDate(dateKey) {
  const date = parseDate(dateKey);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function formatDotDate(dateKey) {
  const date = parseDate(dateKey);
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
}

function makeId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}
