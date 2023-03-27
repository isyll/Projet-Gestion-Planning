import { Default, Datas } from "./config.js";

const ViewConfig = {
  maxLabelSize: 6,

  menuItem: "",
  option: "",

  async themeStyle() {
    const choiceBtn = {
        checkbox: document.getElementById("checkbox"),
        checkboxBall: document.getElementById("checkbox-ball"),
      },
      style = document.createElement("link");

    style.rel = "stylesheet";
    style.type = "text/css";
    style.href = `${Default.theme}-theme.css`;
    document.querySelector("head").append(style);

    await new Promise((resolve, reject) => {
      style.onload = resolve();
      style.onerror = reject();
    });

    choiceBtn.checkbox.addEventListener("click", () => {
      Default.theme = `${Default.theme === "dark" ? "light" : "dark"}`;
      localStorage.setItem("theme", Default.theme);
      style.href = Default.theme + "-theme.css";

      if (Default.theme === "light")
        choiceBtn.checkboxBall.style.transform = "translateX(22px)";
      else choiceBtn.checkboxBall.style.transform = "translateX(0)";

      choiceBtn.checkboxBall.style.transition = "transform 0.1s linear";
    });
  },

  normalizeLabelSize() {
    [...document.getElementsByClassName(Default.selectors.label)].forEach(
      (e) => {
        e.textContent = e.textContent.trim();
        e.textContent =
          e.textContent.charAt(0).toUpperCase() + e.textContent.substring(1);
        if (e.innerHTML.length >= this.maxLabelSize)
          e.textContent =
            e.textContent.trim().substring(0, this.maxLabelSize - 1) + ".";
      }
    );
  },

  init() {
    if (localStorage.getItem("theme"))
      Default.theme = localStorage.getItem("theme");

    if (!localStorage.getItem("menuItem"))
      localStorage.setItem("menuItem", Default.menuItem);
    if (!localStorage.getItem("option"))
      localStorage.setItem("option", Default.option);

    this.option = localStorage.getItem("option");
    this.menuItem = localStorage.getItem("menuItem");
    this.themeStyle();
    this.normalizeLabelSize();
  },

  properties(menuItem, option) {
    localStorage.setItem(
      "menuItem",
      menuItem !== undefined ? menuItem : localStorage.getItem("menuItem")
    );
    localStorage.setItem(
      "option",
      option !== undefined ? option : localStorage.getItem("option")
    );

    this.menuItem = localStorage.getItem("menuItem");
    this.option = localStorage.getItem("option");
  },

  async refresh() {
    document.getElementById(
      "header-title"
    ).textContent = `Planning : ${this.option}`;

    await Planning.fill();
  },
};

const Menu = {
  async fillOptions(toSelect) {
    const select = document.getElementById("search-items-select"),
      selected = document
        .getElementById("menu-items")
        .querySelector(".selected");

    [...select.children].forEach((e) => {
      if (e.value !== "none") e.remove();
      else
        e.textContent = selected
          ? document
              .getElementById(ViewConfig.menuItem)
              .querySelector(".menu-item__label")
              .textContent.trim()
          : "";
    });

    if (!selected) return;
    const infos = await Datas.retrieve(selected.getAttribute("id"), "name");

    if (!infos) return;

    let i = 1;

    for (const val of infos) {
      const option = document.createElement("option");
      option.value = `_opt${i}`;
      option.setAttribute("id", option.value);
      option.textContent = val.charAt(0).toUpperCase() + val.slice(1);
      select.appendChild(option);

      if (toSelect?.trim().toLowerCase() === val.trim().toLowerCase())
        option.setAttribute("selected", "selected");
      i++;
    }
  },
};

const Planning = {
  colors: ["#71afac", "#dc45ce", "#d66163", "#f78001", "#bd8486"],
  pcDatas: {},

  async get(params) {
    if (params === undefined) params = {};
    else if (typeof params !== "object") return;

    const datas = await Datas.retrieve("plannings"),
      values = [];

    if (params.day !== undefined) {
      if (params.day < 0 || params.day >= Default.days) return;
      for (const val of datas[params.day])
        values.push(
          params.item !== undefined && params.item in val
            ? val[params.item]
            : val
        );
    } else {
      let i = 0;
      for (const elem of datas) {
        values[i] = [];
        for (const val of elem)
          values[i].push(
            params.item !== undefined && params.item in val
              ? val[params.item]
              : val
          );

        i++;
      }
    }

    return values;
  },

  async filter(options) {
    const datas =
      options.day !== undefined &&
      options.day >= 0 &&
      options.day < Default.days
        ? [await this.get({ day: options.day, item: options.item })]
        : await this.get({ day: options.day, item: options.item });

    for (const day of datas)
      for (let i = 0; i < day.length; i++)
        for (let key in day[i])
          if (
            key in options &&
            day[i][key].toLowerCase() !== options[key].toLowerCase()
          ) {
            day.splice(i--, 1);
            break;
          }

    return datas;
  },

  async fillAddClassOptions() {
    const selectOptions = {
      teachers: {
        select: document.getElementById("add-class-select-teacher"),
        options: await Datas.retrieve("teachers", "name"),
      },
      classrooms: {
        select: document.getElementById("add-class-select-classroom"),
        options: await Datas.retrieve("classrooms", "name"),
      },
      subjects: {
        select: document.getElementById("add-class-select-subject"),
        options: await Datas.retrieve("subjects", "name"),
      },
      classes: {
        select: document.getElementById("add-class-select-class"),
        options: await Datas.retrieve("classes", "name"),
      },
      start: {
        select: document.getElementById("add-class-select-start-time"),
      },
      end: {
        select: document.getElementById("add-class-select-end-time"),
      },
    };

    let times = await Datas.retrieve("timeIntervals");
    selectOptions.start.options = times.map((e) => e.split("-")[0]);
    selectOptions.end.options = times.map((e) => e.split("-")[1]);

    for (let key in selectOptions) {
      let i = 1;
      for (let val of selectOptions[key].options) {
        const s = document.createElement("option");
        s.value = `_opt${i}`;
        s.setAttribute("id", `add-options-${key}${s.value}`);
        s.textContent = val;
        if (selectOptions[key].select) selectOptions[key].select.appendChild(s);
        i++;
      }
    }
  },

  pcSizeRefresh() {
    // let i = 0;
    // [...document.getElementsByClassName("planning-class")].forEach(
    //   (pc) =>
    //     (pc.style.width = `${
    //       document.querySelector(".timetable-row__col").offsetWidth *
    //       this.pcDatas.widths[i++]
    //     }px`)
    // );
  },

  async fill() {
    this.pcDatas.widths = [];
    let color = 0;

    [...document.getElementsByClassName("planning-class")].forEach((e) =>
      e.remove()
    );

    for (let i = 0; i < Default.days; i++) {
      const day = document.getElementById(
        `${Default.selectors.dayOfWeek}${i + 1}`
      );

      if (!day) return;
      const filterOptions = { day: i };
      filterOptions[ViewConfig.menuItem] = ViewConfig.option;

      const datas = (await this.filter(filterOptions))[0];

      for (const pc of datas) {
        const pcElems = {
          container: document.createElement("div"),
          title: document.createElement("div"),
          content: document.createElement("div"),
          footer: document.createElement("div"),
          close: document.createElement("i"),
        };

        let start = day.querySelector(
            `.${Default.selectors.classTime}${pc.start.toLowerCase()}`
          ),
          end = day.querySelector(
            `.${Default.selectors.classTime}${pc.end.toLowerCase()}`
          );

        let temp = start,
          pcWidth = 0,
          cols = 0;
        while (temp !== end) {
          pcWidth += temp.offsetWidth;
          temp = temp.nextElementSibling;
          cols++;
        }

        this.pcDatas.widths.push(cols);

        pcElems.container.classList.add("planning-class");
        pcElems.container.style.width = `${pcWidth}px`;
        pcElems.container.style.height = "100%";
        pcElems.container.style.backgroundColor =
          this.colors[color % this.colors.length];
        color++;

        pcElems.title.classList.add("planning-class__title");
        pcElems.content.classList.add("planning-class__content");
        pcElems.footer.classList.add("planning-class__footer");
        pcElems.close.classList.add(
          "planning-class__close",
          "fa-solid",
          "fa-x"
        );

        pcElems.title.textContent = !("teachers" in filterOptions)
          ? pc.teachers
          : pc.classes;
        pcElems.content.textContent = pc.subjects;
        pcElems.footer.textContent = pc.classrooms;

        pcElems.container.append(
          pcElems.title,
          pcElems.content,
          pcElems.footer,
          pcElems.close
        );
        start.appendChild(pcElems.container);
      }
    }
  },

  updateErrorMsg: "",

  async update(day, params) {
    const plannings = await this.get(),
      hourNum = (hour) => {
        hour = hour.trim();
        if (hour[hour.length - 1].toLowerCase() === "h")
          hour = hour.slice(0, -1);
        return +hour;
      };

    for (const pc of plannings[day]) {
      if (pc.classrooms.toLowerCase() === params.classrooms.toLowerCase()) {
        if (
          (hourNum(params.start) < hourNum(pc.end) &&
            hourNum(params.start) > hourNum(pc.start)) ||
          (hourNum(pc.start) < hourNum(params.end) &&
            hourNum(pc.start) > hourNum(params.start))
        ) {
          this.updateErrorMsg = `La salle ${pc.classrooms} n'est pas disponible à cette heure`;
          return false;
        }
      }

      if (pc.classes.toLowerCase() === params.classes.toLowerCase()) {
        if (
          (hourNum(params.start) < hourNum(pc.end) &&
            hourNum(params.start) > hourNum(pc.start)) ||
          (hourNum(pc.start) < hourNum(params.end) &&
            hourNum(pc.start) > hourNum(params.start))
        ) {
          this.updateErrorMsg = `La classe ${pc.classes} est indisponible à cette heure`;
          return false;
        }
      }

      if (pc.teachers.toLowerCase() === params.teachers.toLowerCase()) {
        const teacherHours = await this.filter({ teachers: pc.teachers });
        for (const val of teacherHours)
          for (const key in val)
            if (
              hourNum(val[key].end) > hourNum(params.start) ||
              hourNum(val[key].start) < hourNum(params.end)
            ) {
              this.updateErrorMsg = `Le prof '${pc.teachers}' n'est pas disponible à cette heure`;
              return false;
            }
      }
    }

    plannings[day].push(params);

    Datas.sync("plannings", plannings);
    await ViewConfig.refresh();

    return true;
  },

  remove(params) {},
};

const ViewTools = {
  modal(params) {
    if (typeof params !== "object") return;

    const title = params.title !== undefined ? params.title : "Modal Title",
      content =
        params.content !== undefined
          ? params.content
          : `<div id="modal-content-inner">Contenu</div>`,
      footer =
        params.footer !== undefined
          ? params.footer
          : `<button class="btn" id="close-modal-btn">Fermer</button>`,
      modalWindow = {
        container: document.createElement("div"),
        modal: document.createElement("div"),
        content: document.createElement("div"),
        title: document.createElement("h3"),
        footer: document.createElement("div"),
        close: document.createElement("div"),

        remove() {
          this.container.remove();
        },
      };

    modalWindow.container.setAttribute("id", "modal-container");
    modalWindow.modal.setAttribute("id", "modal-window");
    modalWindow.content.setAttribute("id", "modal-content");
    modalWindow.title.setAttribute("id", "modal-title");
    modalWindow.footer.setAttribute("id", "modal-footer");
    modalWindow.close.setAttribute("id", "close-modal");

    modalWindow.close.innerHTML = '<i class="fa-solid fa-x"></i>';
    modalWindow.title.textContent = title;
    modalWindow.content.innerHTML = content;
    modalWindow.footer.innerHTML = footer;

    modalWindow.title.appendChild(modalWindow.close);
    modalWindow.modal.appendChild(modalWindow.title);
    modalWindow.modal.appendChild(modalWindow.content);
    modalWindow.modal.appendChild(modalWindow.footer);
    modalWindow.container.appendChild(modalWindow.modal);

    document.body.appendChild(modalWindow.container);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") modalWindow.remove();
    });
    modalWindow.container.addEventListener("click", (e) => {
      if (e.target === modalWindow.container) modalWindow.remove();
    });

    modalWindow.close.addEventListener("click", () => modalWindow.remove());

    if (params.footer === undefined)
      document
        .getElementById("close-modal-btn")
        .addEventListener("click", () => modalWindow.remove());

    return modalWindow;
  },

  notification(msg) {
    const notifWindow = {
      container: document.createElement("div"),
      notif: document.createElement("div"),
      content: document.createElement("div"),
      close: document.createElement("div"),

      remove() {
        this.container.remove();
      },
    };

    notifWindow.container.setAttribute("id", "notification-container");
    notifWindow.notif.setAttribute("id", "notification-window");
    notifWindow.content.setAttribute("id", "notification-content");
    notifWindow.close.setAttribute("id", "notification-close");

    notifWindow.close.innerHTML = '<i class="fa-solid fa-x"></i>';
    notifWindow.content.textContent = msg;

    notifWindow.notif.append(notifWindow.content, notifWindow.close);
    notifWindow.container.appendChild(notifWindow.notif);
    document.body.appendChild(notifWindow.container);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") notifWindow.remove();
    });
    notifWindow.container.addEventListener("click", (e) => {
      if (e.target === notifWindow.container) notifWindow.remove();
    });
    notifWindow.close.addEventListener("click", () => notifWindow.remove());

    return notifWindow.container;
  },
};

export { ViewConfig, ViewTools, Menu, Planning };
