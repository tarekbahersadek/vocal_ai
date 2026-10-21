/* =========================================================
   MINIDESK - COMPLETE SCRIPT.JS
   ========================================================= */

/* ---------------------------------------------------------
   BASIC HELPERS
--------------------------------------------------------- */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function showNotification(message) {
    const notification = $("#notification");

    if (!notification) return;

    notification.textContent = message;
    notification.classList.add("show");

    clearTimeout(window.notificationTimer);

    window.notificationTimer = setTimeout(() => {
        notification.classList.remove("show");
    }, 2500);
}

/* =========================================================
   WINDOW SYSTEM
========================================================= */

let highestZ = 50;

function getWindow(appName) {
    return document.querySelector(
        `.window[data-app="${appName}"], #${appName}Window`
    );
}

function openApp(appName) {
    const windowElement = getWindow(appName);

    if (!windowElement) {
        showNotification(`${appName} app was not found.`);
        return;
    }

    windowElement.classList.add("open");

    highestZ++;
    windowElement.style.zIndex = highestZ;

    addTaskbarApp(appName);

    closeStartMenu();

    showNotification(
        `${getAppIcon(appName)} ${getAppName(appName)} opened`
    );
}

function closeApp(appName) {
    const windowElement = getWindow(appName);

    if (!windowElement) return;

    windowElement.classList.remove("open");

    removeTaskbarApp(appName);
}

function minimizeApp(appName) {
    const windowElement = getWindow(appName);

    if (!windowElement) return;

    windowElement.classList.remove("open");
}

function focusWindow(windowElement) {
    if (!windowElement) return;

    highestZ++;
    windowElement.style.zIndex = highestZ;
}

function getAppName(appName) {
    const names = {
        files: "Files",
        calculator: "Calculator",
        notes: "Notes",
        todo: "To-Do",
        music: "Music",
        paint: "Paint",
        calendar: "Calendar",
        clock: "Clock",
        browser: "Browser",
        gallery: "Gallery",
        games: "Games",
        terminal: "Terminal",
        weather: "Weather",
        chat: "Chat",
        settings: "Settings"
    };

    return names[appName] || appName;
}

function getAppIcon(appName) {
    const icons = {
        files: "📁",
        calculator: "🧮",
        notes: "📝",
        todo: "✅",
        music: "🎵",
        paint: "🎨",
        calendar: "📅",
        clock: "⏰",
        browser: "🌐",
        gallery: "🖼️",
        games: "🎮",
        terminal: "💻",
        weather: "🌤️",
        chat: "💬",
        settings: "⚙️"
    };

    return icons[appName] || "📦";
}

/* ---------------------------------------------------------
   OPEN APPS FROM DESKTOP ICONS
--------------------------------------------------------- */

$$("[data-app]").forEach((element) => {
    if (
        element.classList.contains("window") ||
        element.classList.contains("taskbar-app")
    ) {
        return;
    }

    element.addEventListener("dblclick", () => {
        const app = element.dataset.app;

        if (app) {
            openApp(app);
        }
    });

    element.addEventListener("click", () => {
        const app = element.dataset.app;

        if (
            app &&
            element.classList.contains("desktop-icon")
        ) {
            openApp(app);
        }
    });
});

/* =========================================================
   WINDOW CONTROLS
========================================================= */

$$(".window").forEach((windowElement) => {

    windowElement.addEventListener("mousedown", () => {
        focusWindow(windowElement);
    });

    const closeButton =
        windowElement.querySelector(".close");

    const minimizeButton =
        windowElement.querySelector(".minimize");

    const maximizeButton =
        windowElement.querySelector(".maximize");

    if (closeButton) {
        closeButton.addEventListener("click", (event) => {
            event.stopPropagation();

            windowElement.classList.remove("open");

            const app =
                windowElement.dataset.app ||
                windowElement.id.replace("Window", "");

            removeTaskbarApp(app);
        });
    }

    if (minimizeButton) {
        minimizeButton.addEventListener("click", (event) => {
            event.stopPropagation();

            windowElement.classList.remove("open");
        });
    }

    if (maximizeButton) {
        maximizeButton.addEventListener("click", (event) => {
            event.stopPropagation();

            windowElement.classList.toggle("maximized");
        });
    }
});

/* =========================================================
   DRAGGABLE WINDOWS
========================================================= */

let draggingWindow = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

$$(".window-header").forEach((header) => {

    header.addEventListener("mousedown", (event) => {

        if (
            event.target.closest(".window-controls")
        ) {
            return;
        }

        const windowElement =
            header.closest(".window");

        if (!windowElement) return;

        if (
            windowElement.classList.contains("maximized")
        ) {
            return;
        }

        draggingWindow = windowElement;

        const rect =
            windowElement.getBoundingClientRect();

        dragOffsetX = event.clientX - rect.left;
        dragOffsetY = event.clientY - rect.top;

        focusWindow(windowElement);
    });
});

document.addEventListener("mousemove", (event) => {

    if (!draggingWindow) return;

    const width =
        draggingWindow.offsetWidth;

    const height =
        draggingWindow.offsetHeight;

    let x = event.clientX - dragOffsetX;
    let y = event.clientY - dragOffsetY;

    const maxX =
        window.innerWidth - width - 10;

    const maxY =
        window.innerHeight - height - 65;

    x = Math.max(5, Math.min(x, maxX));
    y = Math.max(5, Math.min(y, maxY));

    draggingWindow.style.left = `${x}px`;
    draggingWindow.style.top = `${y}px`;

    draggingWindow.style.transform = "none";
});

document.addEventListener("mouseup", () => {
    draggingWindow = null;
});

/* =========================================================
   TASKBAR
========================================================= */

function addTaskbarApp(appName) {

    const taskbar =
        $(".taskbar-apps");

    if (!taskbar) return;

    const existing =
        taskbar.querySelector(
            `[data-taskbar-app="${appName}"]`
        );

    if (existing) return;

    const button =
        document.createElement("button");

    button.className = "taskbar-app";
    button.dataset.taskbarApp = appName;

    button.innerHTML = `
        <span>${getAppIcon(appName)}</span>
        <span>${getAppName(appName)}</span>
    `;

    button.addEventListener("click", () => {

        const windowElement =
            getWindow(appName);

        if (!windowElement) return;

        if (
            windowElement.classList.contains("open")
        ) {
            windowElement.classList.remove("open");
        } else {
            windowElement.classList.add("open");
            focusWindow(windowElement);
        }
    });

    taskbar.appendChild(button);
}

function removeTaskbarApp(appName) {

    const button =
        document.querySelector(
            `[data-taskbar-app="${appName}"]`
        );

    if (button) {
        button.remove();
    }
}

/* =========================================================
   START MENU
========================================================= */

const startButton = $(".start-button");
const startMenu = $(".start-menu");

function closeStartMenu() {
    if (startMenu) {
        startMenu.classList.remove("open");
    }
}

if (startButton) {
    startButton.addEventListener("click", (event) => {
        event.stopPropagation();

        if (startMenu) {
            startMenu.classList.toggle("open");
        }
    });
}

document.addEventListener("click", (event) => {

    if (
        startMenu &&
        !startMenu.contains(event.target) &&
        !event.target.closest(".start-button")
    ) {
        closeStartMenu();
    }
});

/* Start menu applications */

$$(".start-app").forEach((button) => {

    button.addEventListener("click", () => {

        const app =
            button.dataset.app;

        if (app) {
            openApp(app);
        }
    });
});

/* Start menu search */

const appSearch = $(".app-search");

if (appSearch) {

    appSearch.addEventListener("input", () => {

        const query =
            appSearch.value.toLowerCase().trim();

        $$(".start-app").forEach((app) => {

            const text =
                app.textContent.toLowerCase();

            app.style.display =
                text.includes(query)
                    ? ""
                    : "none";
        });
    });
}

/* =========================================================
   DESKTOP CLOCK
========================================================= */

function updateDesktopClock() {

    const now = new Date();

    const timeElement =
        $("#desktopTime");

    const dateElement =
        $("#desktopDate");

    const taskbarTime =
        $(".taskbar-time");

    const time =
        now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    const date =
        now.toLocaleDateString([], {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        });

    if (timeElement) {
        timeElement.textContent = time;
    }

    if (dateElement) {
        dateElement.textContent = date;
    }

    if (taskbarTime) {
        taskbarTime.textContent = time;
    }
}

updateDesktopClock();

setInterval(updateDesktopClock, 1000);

/* =========================================================
   CALCULATOR
========================================================= */

const calculatorDisplay =
    $(".calculator-display");

let calculatorExpression = "";

function updateCalculator() {

    if (calculatorDisplay) {
        calculatorDisplay.value =
            calculatorExpression || "0";
    }
}

$$("[data-calc]").forEach((button) => {

    button.addEventListener("click", () => {

        const value =
            button.dataset.calc;

        if (value === "clear") {
            calculatorExpression = "";
        }

        else if (value === "delete") {
            calculatorExpression =
                calculatorExpression.slice(0, -1);
        }

        else if (value === "=") {

            try {

                if (!calculatorExpression) {
                    return;
                }

                if (
                    !/^[0-9+\-*/().%\s]+$/.test(
                        calculatorExpression
                    )
                ) {
                    throw new Error("Invalid");
                }

                calculatorExpression =
                    String(
                        Function(
                            `"use strict"; return (${calculatorExpression})`
                        )()
                    );

            } catch {
                calculatorExpression = "";
                showNotification("Invalid calculation");
            }
        }

        else {
            calculatorExpression += value;
        }

        updateCalculator();
    });
});

updateCalculator();

/* =========================================================
   NOTES
========================================================= */

let notes =
    JSON.parse(
        localStorage.getItem("minidesk_notes") ||
        "[]"
    );

let selectedNote =
    Number(
        localStorage.getItem("minidesk_selected_note") ||
        0
    );

function saveNotes() {
    localStorage.setItem(
        "minidesk_notes",
        JSON.stringify(notes)
    );
}

function renderNotes() {

    const list = $("#notesList");

    if (!list) return;

    list.innerHTML = "";

    notes.forEach((note, index) => {

        const button =
            document.createElement("button");

        button.className =
            "note-list-item";

        if (index === selectedNote) {
            button.classList.add("active");
        }

        button.textContent =
            note.title || "Untitled note";

        button.addEventListener("click", () => {

            selectedNote = index;

            localStorage.setItem(
                "minidesk_selected_note",
                selectedNote
            );

            loadSelectedNote();
            renderNotes();
        });

        list.appendChild(button);
    });
}

function loadSelectedNote() {

    const title = $(".note-title");
    const editor = $(".note-editor textarea");

    if (!title || !editor) return;

    if (!notes.length) {

        title.value = "";
        editor.value = "";

        return;
    }

    const note =
        notes[selectedNote] || notes[0];

    title.value =
        note.title || "";

    editor.value =
        note.content || "";
}

function saveCurrentNote() {

    const title = $(".note-title");
    const editor = $(".note-editor textarea");

    if (!title || !editor) return;

    if (!notes.length) return;

    notes[selectedNote].title =
        title.value;

    notes[selectedNote].content =
        editor.value;

    notes[selectedNote].updated =
        Date.now();

    saveNotes();
    renderNotes();

    const saved =
        $("#noteSaved");

    if (saved) {
        saved.textContent = "Saved";

        setTimeout(() => {
            saved.textContent = "";
        }, 1500);
    }
}

const newNoteButton =
    $("#newNote");

if (newNoteButton) {

    newNoteButton.addEventListener("click", () => {

        notes.push({
            title: "New Note",
            content: "",
            created: Date.now()
        });

        selectedNote =
            notes.length - 1;

        saveNotes();

        localStorage.setItem(
            "minidesk_selected_note",
            selectedNote
        );

        renderNotes();
        loadSelectedNote();
    });
}

$(".note-title")?.addEventListener(
    "input",
    saveCurrentNote
);

$(".note-editor textarea")?.addEventListener(
    "input",
    saveCurrentNote
);

if (!notes.length) {

    notes.push({
        title: "Welcome",
        content:
            "Welcome to MiniDesk!\n\nThis is your notes app.",
        created: Date.now()
    });

    saveNotes();
}

renderNotes();
loadSelectedNote();

/* =========================================================
   TODO LIST
========================================================= */

let todos =
    JSON.parse(
        localStorage.getItem("minidesk_todos") ||
        "[]"
    );

let currentTodoFilter = "all";

function saveTodos() {

    localStorage.setItem(
        "minidesk_todos",
        JSON.stringify(todos)
    );
}

function renderTodos() {

    const list = $(".todo-list");

    if (!list) return;

    list.innerHTML = "";

    const filtered =
        todos.filter((todo) => {

            if (currentTodoFilter === "active") {
                return !todo.completed;
            }

            if (currentTodoFilter === "completed") {
                return todo.completed;
            }

            return true;
        });

    filtered.forEach((todo) => {

        const item =
            document.createElement("div");

        item.className =
            `todo-item priority-${todo.priority}`;

        if (todo.completed) {
            item.classList.add("completed");
        }

        item.innerHTML = `
            <input type="checkbox"
                   ${todo.completed ? "checked" : ""}>

            <span class="todo-text"></span>

            <button class="todo-delete">✕</button>
        `;

        item.querySelector(".todo-text")
            .textContent = todo.text;

        item.querySelector("input")
            .addEventListener("change", () => {

                todo.completed =
                    !todo.completed;

                saveTodos();
                renderTodos();
            });

        item.querySelector(".todo-delete")
            .addEventListener("click", () => {

                todos =
                    todos.filter(
                        (t) => t.id !== todo.id
                    );

                saveTodos();
                renderTodos();
            });

        list.appendChild(item);
    });

    const count =
        $(".todo-count");

    if (count) {

        const remaining =
            todos.filter(
                (todo) => !todo.completed
            ).length;

        count.textContent =
            `${remaining} task${
                remaining === 1 ? "" : "s"
            } remaining`;
    }
}

function addTodo() {

    const input =
        $(".todo-input-row input");

    const priority =
        $(".todo-input-row select");

    if (!input) return;

    const text =
        input.value.trim();

    if (!text) return;

    todos.push({
        id: Date.now(),
        text,
        priority:
            priority?.value || "medium",
        completed: false
    });

    input.value = "";

    saveTodos();
    renderTodos();
}

$(".todo-input-row button")
    ?.addEventListener("click", addTodo);

$(".todo-input-row input")
    ?.addEventListener("keydown", (event) => {

        if (event.key === "Enter") {
            addTodo();
        }
    });

$$(".todo-filter").forEach((button) => {

    button.addEventListener("click", () => {

        $$(".todo-filter")
            .forEach((b) =>
                b.classList.remove("active")
            );

        button.classList.add("active");

        currentTodoFilter =
            button.dataset.filter || "all";

        renderTodos();
    });
});

renderTodos();

/* =========================================================
   MUSIC PLAYER
========================================================= */

const songs = [
    {
        title: "Chill Morning",
        artist: "MiniDesk",
        icon: "🌅"
    },
    {
        title: "Focus Mode",
        artist: "MiniDesk",
        icon: "🎧"
    },
    {
        title: "Night Drive",
        artist: "MiniDesk",
        icon: "🌃"
    },
    {
        title: "Dream Space",
        artist: "MiniDesk",
        icon: "🌌"
    }
];

let currentSong = 0;
let musicPlaying = false;
let musicSeconds = 0;
let musicTimer = null;

function updateMusic() {

    const song = songs[currentSong];

    const title =
        $("#musicTitle");

    const artist =
        $("#musicArtist");

    const art =
        $(".album-art");

    if (title) title.textContent = song.title;
    if (artist) artist.textContent = song.artist;
    if (art) art.textContent = song.icon;

    $$(".playlist-item").forEach(
        (item, index) => {
            item.classList.toggle(
                "active",
                index === currentSong
            );
        }
    );
}

function setMusicPlaying(playing) {

    musicPlaying = playing;

    const button =
        $("#musicPlay");

    if (button) {
        button.textContent =
            playing ? "⏸" : "▶";
    }

    if (playing) {

        clearInterval(musicTimer);

        musicTimer =
            setInterval(() => {

                musicSeconds++;

                if (musicSeconds >= 180) {
                    nextSong();
                }

                const progress =
                    $("#musicProgress");

                if (progress) {
                    progress.value =
                        (musicSeconds / 180) * 100;
                }

            }, 1000);

    } else {
        clearInterval(musicTimer);
    }
}

function nextSong() {

    currentSong =
        (currentSong + 1) %
        songs.length;

    musicSeconds = 0;

    updateMusic();
}

function previousSong() {

    currentSong =
        (currentSong - 1 + songs.length) %
        songs.length;

    musicSeconds = 0;

    updateMusic();
}

$("#musicPlay")?.addEventListener(
    "click",
    () => setMusicPlaying(!musicPlaying)
);

$("#musicNext")?.addEventListener(
    "click",
    nextSong
);

$("#musicPrevious")?.addEventListener(
    "click",
    previousSong
);

$("#musicProgress")?.addEventListener(
    "input",
    (event) => {

        musicSeconds =
            (Number(event.target.value) / 100) * 180;
    }
);

const playlist =
    $(".playlist");

if (playlist) {

    songs.forEach((song, index) => {

        const item =
            document.createElement("button");

        item.className =
            "playlist-item";

        item.textContent =
            `${song.icon} ${song.title}`;

        item.addEventListener("click", () => {

            currentSong = index;
            musicSeconds = 0;

            updateMusic();
            setMusicPlaying(true);
        });

        playlist.appendChild(item);
    });
}

updateMusic();

/* =========================================================
   PAINT
========================================================= */

const canvas =
    $("#paintCanvas");

let painting = false;
let paintColor = "#000000";
let paintSize = 5;

if (canvas) {

    const ctx =
        canvas.getContext("2d");

    function resizeCanvas() {

        const rect =
            canvas.getBoundingClientRect();

        const oldCanvas =
            document.createElement("canvas");

        oldCanvas.width =
            canvas.width;

        oldCanvas.height =
            canvas.height;

        if (
            canvas.width &&
            canvas.height
        ) {
            oldCanvas
                .getContext("2d")
                .drawImage(canvas, 0, 0);
        }

        canvas.width =
            Math.max(300, rect.width);

        canvas.height =
            Math.max(300, rect.height);

        ctx.fillStyle = "white";
        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        if (
            oldCanvas.width &&
            oldCanvas.height
        ) {
            ctx.drawImage(
                oldCanvas,
                0,
                0,
                canvas.width,
                canvas.height
            );
        }
    }

    setTimeout(resizeCanvas, 100);

    window.addEventListener(
        "resize",
        resizeCanvas
    );

    function getMousePosition(event) {

        const rect =
            canvas.getBoundingClientRect();

        return {
            x:
                event.clientX -
                rect.left,

            y:
                event.clientY -
                rect.top
        };
    }

    canvas.addEventListener(
        "mousedown",
        (event) => {

            painting = true;

            const pos =
                getMousePosition(event);

            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        }
    );

    canvas.addEventListener(
        "mousemove",
        (event) => {

            if (!painting) return;

            const pos =
                getMousePosition(event);

            ctx.lineWidth =
                paintSize;

            ctx.lineCap = "round";
            ctx.strokeStyle =
                paintColor;

            ctx.lineTo(
                pos.x,
                pos.y
            );

            ctx.stroke();
        }
    );

    canvas.addEventListener(
        "mouseup",
        () => {
            painting = false;
        }
    );

    canvas.addEventListener(
        "mouseleave",
        () => {
            painting = false;
        }
    );

    $("#paintColor")
        ?.addEventListener(
            "input",
            (event) => {
                paintColor =
                    event.target.value;
            }
        );

    $("#paintSize")
        ?.addEventListener(
            "input",
            (event) => {
                paintSize =
                    Number(event.target.value);
            }
        );

    $("#clearCanvas")
        ?.addEventListener(
            "click",
            () => {

                ctx.fillStyle = "white";

                ctx.fillRect(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );
            }
        );
}

/* =========================================================
   CALENDAR
========================================================= */

let calendarDate =
    new Date();

function renderCalendar() {

    const grid =
        $(".calendar-grid");

    const title =
        $("#calendarMonth");

    if (!grid || !title) return;

    grid.innerHTML = "";

    const year =
        calendarDate.getFullYear();

    const month =
        calendarDate.getMonth();

    title.textContent =
        calendarDate.toLocaleDateString(
            [],
            {
                month: "long",
                year: "numeric"
            }
        );

    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();

    const days =
        new Date(
            year,
            month + 1,
            0
        ).getDate();

    const previousDays =
        new Date(
            year,
            month,
            0
        ).getDate();

    for (
        let i = firstDay - 1;
        i >= 0;
        i--
    ) {

        const day =
            document.createElement("div");

        day.className =
            "calendar-day other-month";

        day.textContent =
            previousDays - i;

        grid.appendChild(day);
    }

    const today =
        new Date();

    for (
        let dayNumber = 1;
        dayNumber <= days;
        dayNumber++
    ) {

        const day =
            document.createElement("div");

        day.className =
            "calendar-day";

        day.textContent =
            dayNumber;

        if (
            dayNumber === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        ) {
            day.classList.add("today");
        }

        day.addEventListener("click", () => {

            showNotification(
                `Selected ${calendarDate.toLocaleDateString(
                    [],
                    {
                        month: "long",
                        day: "numeric"
                    }
                )} ${dayNumber}`
            );
        });

        grid.appendChild(day);
    }
}

$("#calendarPrevious")
    ?.addEventListener("click", () => {

        calendarDate.setMonth(
            calendarDate.getMonth() - 1
        );

        renderCalendar();
    });

$("#calendarNext")
    ?.addEventListener("click", () => {

        calendarDate.setMonth(
            calendarDate.getMonth() + 1
        );

        renderCalendar();
    });

$("#calendarToday")
    ?.addEventListener("click", () => {

        calendarDate = new Date();

        renderCalendar();
    });

renderCalendar();

/* =========================================================
   CLOCK + TIMER
========================================================= */

function updateBigClock() {

    const now = new Date();

    const clock =
        $("#bigClock");

    const date =
        $("#clockDate");

    if (clock) {

        clock.textContent =
            now.toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }
            );
    }

    if (date) {

        date.textContent =
            now.toLocaleDateString(
                [],
                {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                }
            );
    }
}

setInterval(updateBigClock, 1000);
updateBigClock();

$$(".clock-tab").forEach((tab) => {

    tab.addEventListener("click", () => {

        $$(".clock-tab")
            .forEach((button) =>
                button.classList.remove("active")
            );

        $$(".clock-panel")
            .forEach((panel) =>
                panel.classList.remove("active")
            );

        tab.classList.add("active");

        const target =
            document.getElementById(
                tab.dataset.target
            );

        target?.classList.add("active");
    });
});

let timerSeconds = 0;
let timerInterval = null;

function updateTimer() {

    const display =
        $(".timer-display");

    if (!display) return;

    const minutes =
        Math.floor(timerSeconds / 60);

    const seconds =
        timerSeconds % 60;

    display.textContent =
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")}`;
}

$("#timerStart")?.addEventListener(
    "click",
    () => {

        if (timerInterval) return;

        timerInterval =
            setInterval(() => {

                if (timerSeconds <= 0) {

                    clearInterval(timerInterval);
                    timerInterval = null;

                    showNotification(
                        "⏰ Timer finished!"
                    );

                    return;
                }

                timerSeconds--;
                updateTimer();

            }, 1000);
    }
);

$("#timerPause")?.addEventListener(
    "click",
    () => {

        clearInterval(timerInterval);
        timerInterval = null;
    }
);

$("#timerReset")?.addEventListener(
    "click",
    () => {

        clearInterval(timerInterval);
        timerInterval = null;

        const minutes =
            Number(
                $("#timerMinutes")?.value || 5
            );

        const seconds =
            Number(
                $("#timerSeconds")?.value || 0
            );

        timerSeconds =
            minutes * 60 + seconds;

        updateTimer();
    }
);

timerSeconds = 5 * 60;
updateTimer();

/* =========================================================
   BROWSER
========================================================= */

const browserAddress =
    $("#browserAddress");

const browserFrame =
    $("#browserFrame");

function navigateBrowser() {

    if (!browserAddress || !browserFrame) {
        return;
    }

    let url =
        browserAddress.value.trim();

    if (!url) return;

    if (
        !url.startsWith("http://") &&
        !url.startsWith("https://")
    ) {
        url =
            "https://" + url;
    }

    browserAddress.value = url;

    browserFrame.src = url;
}

$("#browserGo")
    ?.addEventListener(
        "click",
        navigateBrowser
    );

browserAddress?.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {
            navigateBrowser();
        }
    }
);

$("#browserHome")
    ?.addEventListener(
        "click",
        () => {

            if (browserAddress) {
                browserAddress.value =
                    "https://www.google.com";
            }

            if (browserFrame) {
                browserFrame.src =
                    "https://www.google.com";
            }
        }
    );

/* =========================================================
   GALLERY
========================================================= */

let galleryImages =
    JSON.parse(
        localStorage.getItem(
            "minidesk_gallery"
        ) || "[]"
    );

function renderGallery() {

    const grid =
        $(".gallery-grid");

    if (!grid) return;

    grid.innerHTML = "";

    galleryImages.forEach((image) => {

        const img =
            document.createElement("img");

        img.className =
            "gallery-image";

        img.src = image;

        grid.appendChild(img);
    });
}

$("#galleryUpload")
    ?.addEventListener(
        "change",
        (event) => {

            const files =
                [...event.target.files];

            files.forEach((file) => {

                const reader =
                    new FileReader();

                reader.onload = () => {

                    galleryImages.push(
                        reader.result
                    );

                    localStorage.setItem(
                        "minidesk_gallery",
                        JSON.stringify(
                            galleryImages
                        )
                    );

                    renderGallery();
                };

                reader.readAsDataURL(file);
            });
        }
    );

$("#clearGallery")
    ?.addEventListener(
        "click",
        () => {

            galleryImages = [];

            localStorage.removeItem(
                "minidesk_gallery"
            );

            renderGallery();
        }
    );

renderGallery();

/* =========================================================
   GAMES - TIC TAC TOE
========================================================= */

let ticBoard =
    ["", "", "", "", "", "", "", ""];

let ticPlayer = "X";
let ticGameOver = false;

function renderTicTacToe() {

    const cells =
        $$(".tic-cell");

    cells.forEach((cell, index) => {

        cell.textContent =
            ticBoard[index];

        cell.dataset.value =
            ticBoard[index];
    });
}

function checkTicWinner() {

    const winningLines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (const line of winningLines) {

        const [a, b, c] = line;

        if (
            ticBoard[a] &&
            ticBoard[a] === ticBoard[b] &&
            ticBoard[a] === ticBoard[c]
        ) {

            return ticBoard[a];
        }
    }

    if (
        ticBoard.every(
            (cell) => cell !== ""
        )
    ) {
        return "draw";
    }

    return null;
}

function computerMove() {

    const available =
        ticBoard
            .map((value, index) =>
                value === "" ? index : null
            )
            .filter((value) => value !== null);

    if (!available.length) return;

    const random =
        available[
            Math.floor(
                Math.random() *
                available.length
            )
        ];

    ticBoard[random] = "O";

    renderTicTacToe();

    const winner =
        checkTicWinner();

    if (winner) {
        endTicGame(winner);
    }
}

function endTicGame(winner) {

    ticGameOver = true;

    const status =
        $("#ticStatus");

    if (!status) return;

    if (winner === "draw") {
        status.textContent =
            "It's a draw!";
    } else {
        status.textContent =
            `${winner} wins!`;
    }
}

function resetTicTacToe() {

    ticBoard =
        ["", "", "", "", "", "", "", ""];

    ticPlayer = "X";
    ticGameOver = false;

    const status =
        $("#ticStatus");

    if (status) {
        status.textContent =
            "Your turn — X";
    }

    renderTicTacToe();
}

$$(".tic-cell").forEach((cell, index) => {

    cell.addEventListener("click", () => {

        if (
            ticGameOver ||
            ticBoard[index]
        ) {
            return;
        }

        ticBoard[index] = "X";

        renderTicTacToe();

        const winner =
            checkTicWinner();

        if (winner) {
            endTicGame(winner);
            return;
        }

        const status =
            $("#ticStatus");

        if (status) {
            status.textContent =
                "Computer is thinking...";
        }

        setTimeout(computerMove, 400);
    });
});

$("#ticReset")
    ?.addEventListener(
        "click",
        resetTicTacToe
    );

resetTicTacToe();

/* =========================================================
   MEMORY GAME
========================================================= */

const memorySymbols = [
    "🍎",
    "🍎",
    "🚀",
    "🚀",
    "🌈",
    "🌈",
    "⭐",
    "⭐",
    "🎵",
    "🎵",
    "🔥",
    "🔥"
];

let memoryCards = [];
let memoryFlipped = [];
let memoryLocked = false;

function shuffle(array) {

    const result =
        [...array];

    for (
        let i = result.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );

        [result[i], result[j]] =
            [result[j], result[i]];
    }

    return result;
}

function startMemoryGame() {

    const board =
        $(".memory-board");

    if (!board) return;

    memoryCards =
        shuffle(memorySymbols);

    memoryFlipped = [];
    memoryLocked = false;

    board.innerHTML = "";

    memoryCards.forEach(
        (symbol, index) => {

            const card =
                document.createElement("button");

            card.className =
                "memory-card";

            card.dataset.index =
                index;

            card.textContent = "?";

            card.addEventListener(
                "click",
                () => flipMemoryCard(card)
            );

            board.appendChild(card);
        }
    );
}

function flipMemoryCard(card) {

    if (memoryLocked) return;

    const index =
        Number(card.dataset.index);

    if (
        memoryFlipped.includes(index) ||
        card.classList.contains("matched")
    ) {
        return;
    }

    card.textContent =
        memoryCards[index];

    card.classList.add("flipped");

    memoryFlipped.push(index);

    if (memoryFlipped.length !== 2) {
        return;
    }

    memoryLocked = true;

    const first =
        memoryFlipped[0];

    const second =
        memoryFlipped[1];

    const cards =
        $$(".memory-card");

    if (
        memoryCards[first] ===
        memoryCards[second]
    ) {

        cards[first].classList.add(
            "matched"
        );

        cards[second].classList.add(
            "matched"
        );

        memoryFlipped = [];
        memoryLocked = false;

    } else {

        setTimeout(() => {

            cards[first].textContent = "?";
            cards[second].textContent = "?";

            cards[first].classList.remove(
                "flipped"
            );

            cards[second].classList.remove(
                "flipped"
            );

            memoryFlipped = [];
            memoryLocked = false;

        }, 700);
    }
}

$("#memoryReset")
    ?.addEventListener(
        "click",
        startMemoryGame
    );

startMemoryGame();

/* =========================================================
   SNAKE GAME
========================================================= */

const snakeCanvas =
    $("#snakeCanvas");

if (snakeCanvas) {

    const snakeCtx =
        snakeCanvas.getContext("2d");

    const gridSize = 20;

    let snake = [
        {
            x: 10,
            y: 10
        }
    ];

    let food = {
        x: 15,
        y: 15
    };

    let snakeDirection = {
        x: 1,
        y: 0
    };

    let nextDirection = {
        x: 1,
        y: 0
    };

    let snakeRunning = false;
    let snakeScore = 0;
    let snakeTimer = null;

    function randomFood() {

        food = {
            x:
                Math.floor(
                    Math.random() *
                    (snakeCanvas.width / gridSize)
                ),

            y:
                Math.floor(
                    Math.random() *
                    (snakeCanvas.height / gridSize)
                )
        };
    }

    function drawSnake() {

        snakeCtx.fillStyle =
            "#111827";

        snakeCtx.fillRect(
            0,
            0,
            snakeCanvas.width,
            snakeCanvas.height
        );

        snakeCtx.fillStyle =
            "#ef4444";

        snakeCtx.fillRect(
            food.x * gridSize,
            food.y * gridSize,
            gridSize - 2,
            gridSize - 2
        );

        snake.forEach(
            (part, index) => {

                snakeCtx.fillStyle =
                    index === 0
                        ? "#22c55e"
                        : "#4ade80";

                snakeCtx.fillRect(
                    part.x * gridSize,
                    part.y * gridSize,
                    gridSize - 2,
                    gridSize - 2
                );
            }
        );

        const score =
            $("#snakeScore");

        if (score) {
            score.textContent =
                `Score: ${snakeScore}`;
        }
    }

    function snakeStep() {

        snakeDirection =
            nextDirection;

        const head = {
            x:
                snake[0].x +
                snakeDirection.x,

            y:
                snake[0].y +
                snakeDirection.y
        };

        const columns =
            snakeCanvas.width / gridSize;

        const rows =
            snakeCanvas.height / gridSize;

        if (
            head.x < 0 ||
            head.y < 0 ||
            head.x >= columns ||
            head.y >= rows
        ) {
            stopSnake();
            return;
        }

        if (
            snake.some(
                (part) =>
                    part.x === head.x &&
                    part.y === head.y
            )
        ) {
            stopSnake();
            return;
        }

        snake.unshift(head);

        if (
            head.x === food.x &&
            head.y === food.y
        ) {

            snakeScore++;

            randomFood();

        } else {

            snake.pop();
        }

        drawSnake();
    }

    function startSnake() {

        clearInterval(snakeTimer);

        snake = [
            {
                x: 10,
                y: 10
            }
        ];

        snakeDirection = {
            x: 1,
            y: 0
        };

        nextDirection = {
            x: 1,
            y: 0
        };

        snakeScore = 0;
        snakeRunning = true;

        randomFood();
        drawSnake();

        snakeTimer =
            setInterval(
                snakeStep,
                120
            );
    }

    function stopSnake() {

        clearInterval(snakeTimer);

        snakeRunning = false;

        showNotification(
            `🐍 Game over! Score: ${snakeScore}`
        );
    }

    document.addEventListener(
        "keydown",
        (event) => {

            if (!snakeRunning) return;

            const key =
                event.key.toLowerCase();

            if (
                key === "arrowup" &&
                snakeDirection.y !== 1
            ) {
                nextDirection = {
                    x: 0,
                    y: -1
                };
            }

            else if (
                key === "arrowdown" &&
                snakeDirection.y !== -1
            ) {
                nextDirection = {
                    x: 0,
                    y: 1
                };
            }

            else if (
                key === "arrowleft" &&
                snakeDirection.x !== 1
            ) {
                nextDirection = {
                    x: -1,
                    y: 0
                };
            }

            else if (
                key === "arrowright" &&
                snakeDirection.x !== -1
            ) {
                nextDirection = {
                    x: 1,
                    y: 0
                };
            }
        }
    );

    $("#snakeStart")
        ?.addEventListener(
            "click",
            startSnake
        );

    drawSnake();
}

/* =========================================================
   TERMINAL
========================================================= */

const terminalInput =
    $("#terminalInput");

const terminalOutput =
    $(".terminal-output");

function terminalPrint(text) {

    if (!terminalOutput) return;

    terminalOutput.textContent +=
        `\n${text}`;

    terminalOutput.scrollTop =
        terminalOutput.scrollHeight;
}

function runTerminalCommand(command) {

    const cmd =
        command.trim().toLowerCase();

    if (!cmd) return;

    terminalPrint(
        `guest@minidesk:~$ ${command}`
    );

    if (cmd === "help") {

        terminalPrint(
            "Available commands:\n" +
            "help - show commands\n" +
            "clear - clear terminal\n" +
            "date - show date\n" +
            "time - show time\n" +
            "apps - list applications\n" +
            "about - about MiniDesk"
        );
    }

    else if (cmd === "clear") {

        if (terminalOutput) {
            terminalOutput.textContent = "";
        }
    }

    else if (cmd === "date") {

        terminalPrint(
            new Date().toLocaleDateString()
        );
    }

    else if (cmd === "time") {

        terminalPrint(
            new Date().toLocaleTimeString()
        );
    }

    else if (cmd === "apps") {

        terminalPrint(
            "Files, Calculator, Notes, To-Do, Music, " +
            "Paint, Calendar, Clock, Browser, Gallery, " +
            "Games, Terminal, Weather, Chat, Settings"
        );
    }

    else if (cmd === "about") {

        terminalPrint(
            "MiniDesk is a browser-based mini desktop."
        );
    }

    else {

        terminalPrint(
            `Command not found: ${command}`
        );
    }
}

terminalInput?.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {

            runTerminalCommand(
                terminalInput.value
            );

            terminalInput.value = "";
        }
    }
);

/* =========================================================
   WEATHER
========================================================= */

const weatherCities = {
    dubai: {
        temperature: "31°C",
        icon: "☀️",
        description: "Sunny"
    },

    london: {
        temperature: "16°C",
        icon: "🌥️",
        description: "Partly cloudy"
    },

    tokyo: {
        temperature: "22°C",
        icon: "🌤️",
        description: "Mostly sunny"
    },

    newyork: {
        temperature: "20°C",
        icon: "⛅",
        description: "Cloudy"
    },

    paris: {
        temperature: "18°C",
        icon: "🌦️",
        description: "Light rain"
    }
};

function updateWeather(city) {

    const data =
        weatherCities[
            city.toLowerCase()
                .replace(/\s/g, "")
        ];

    const temperature =
        $(".weather-temperature");

    const icon =
        $(".weather-icon");

    const description =
        $(".weather-description");

    const cityName =
        $(".weather-city");

    if (!data) {

        showNotification(
            "Demo weather is available for Dubai, London, Tokyo, New York and Paris."
        );

        return;
    }

    if (temperature)
        temperature.textContent =
            data.temperature;

    if (icon)
        icon.textContent =
            data.icon;

    if (description)
        description.textContent =
            data.description;

    if (cityName)
        cityName.textContent =
            city;
}

$("#weatherSearch")
    ?.addEventListener(
        "click",
        () => {

            const input =
                $("#weatherInput");

            if (input) {
                updateWeather(
                    input.value.trim()
                );
            }
        }
    );

$("#weatherInput")
    ?.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {

                updateWeather(
                    event.target.value.trim()
                );
            }
        }
    );

updateWeather("Dubai");

/* =========================================================
   CHAT
========================================================= */

function sendChatMessage() {

    const input =
        $("#chatInput");

    const messages =
        $(".chat-messages");

    if (!input || !messages) return;

    const text =
        input.value.trim();

    if (!text) return;

    const message =
        document.createElement("div");

    message.className =
        "chat-message sent";

    message.textContent =
        text;

    messages.appendChild(message);

    input.value = "";

    messages.scrollTop =
        messages.scrollHeight;

    setTimeout(() => {

        const reply =
            document.createElement("div");

        reply.className =
            "chat-message received";

        reply.textContent =
            "This is a demo chat inside MiniDesk.";

        messages.appendChild(reply);

        messages.scrollTop =
            messages.scrollHeight;

    }, 500);
}

$("#chatSend")
    ?.addEventListener(
        "click",
        sendChatMessage
    );

$("#chatInput")
    ?.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {
                sendChatMessage();
            }
        }
    );

/* =========================================================
   SETTINGS
========================================================= */

const darkModeToggle =
    $("#darkModeToggle");

if (darkModeToggle) {

    const darkMode =
        localStorage.getItem(
            "minidesk_dark_mode"
        ) === "true";

    if (darkMode) {
        document.body.classList.add(
            "dark-mode"
        );

        darkModeToggle.checked = true;
    }

    darkModeToggle.addEventListener(
        "change",
        () => {

            const enabled =
                darkModeToggle.checked;

            document.body.classList.toggle(
                "dark-mode",
                enabled
            );

            localStorage.setItem(
                "minidesk_dark_mode",
                enabled
            );
        }
    );
}

$("#resetData")
    ?.addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    "Reset all MiniDesk saved data?"
                );

            if (!confirmed) return;

            localStorage.clear();

            location.reload();
        }
    );

/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        /* ESC closes start menu */

        if (event.key === "Escape") {
            closeStartMenu();
        }

        /* CTRL + ALT + C = Calculator */

        if (
            event.ctrlKey &&
            event.altKey &&
            event.key.toLowerCase() === "c"
        ) {
            event.preventDefault();
            openApp("calculator");
        }

        /* CTRL + ALT + N = Notes */

        if (
            event.ctrlKey &&
            event.altKey &&
            event.key.toLowerCase() === "n"
        ) {
            event.preventDefault();
            openApp("notes");
        }

        /* CTRL + ALT + T = Terminal */

        if (
            event.ctrlKey &&
            event.altKey &&
            event.key.toLowerCase() === "t"
        ) {
            event.preventDefault();
            openApp("terminal");
        }
    }
);

/* =========================================================
   DOUBLE CLICK DESKTOP
========================================================= */

$(".desktop")?.addEventListener(
    "dblclick",
    (event) => {

        if (
            event.target === event.currentTarget
        ) {
            closeStartMenu();
        }
    }
);

/* =========================================================
   INITIALIZE
========================================================= */

console.log(
    "MiniDesk loaded successfully."
);

console.log(
    "Apps available:",
    Object.keys({
        files: true,
        calculator: true,
        notes: true,
        todo: true,
        music: true,
        paint: true,
        calendar: true,
        clock: true,
        browser: true,
        gallery: true,
        games: true,
        terminal: true,
        weather: true,
        chat: true,
        settings: true
    })
);

showNotification(
    "🖥️ Welcome to MiniDesk!"
);
