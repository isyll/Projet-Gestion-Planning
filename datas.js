export const Datas = {
  items: ["teachers", "classes", "classrooms", "subjects", "plannings"],

  teachers: [
    { id: 1, name: "baila", subjects: [1, 4, 5] },
    { id: 2, name: "aly", subjects: [2, 4] },
    { id: 3, name: "mbaye", subjects: [4] },
    { id: 4, name: "djiby", subjects: [1, 3] },
    { id: 5, name: "seckouba", subjects: [3, 5] },
    { id: 5, name: "ndoye", subjects: [1, 6] },
  ],

  classrooms: [
    { id: 1, name: "101", max: 59 },
    { id: 2, name: "102", max: 59 },
    { id: 3, name: "103", max: 59 },
    { id: 4, name: "101", max: 59 },
    { id: 5, name: "201", max: 59 },
    { id: 6, name: "Incub", max: 59 },
  ],

  classes: [
    { id: 1, name: "L2 CDSD", size: 50 },
    { id: 2, name: "L1 GLRS A", size: 50 },
    { id: 3, name: "L1 GLRS B", size: 50 },
    { id: 4, name: "L2 ETSE", size: 50 },
    { id: 5, name: "L1 A", size: 50 },
    { id: 6, name: "IAGE B", size: 50 },
  ],

  subjects: [
    { id: 1, name: "PHP" },
    { id: 2, name: "Python" },
    { id: 3, name: "JAVA" },
    { id: 4, name: "JavaScript" },
    { id: 5, name: "LC" },
    { id: 6, name: "Algo" },
  ],

  plannings: [
    [
      {
        start: 8,
        end: 12,
        teachers: 3,
        subjects: 6,
        classrooms: 2,
        classes: 3,
      },
      {
        start: 13,
        end: 17,
        teachers: 5,
        subjects: 2,
        classrooms: 1,
        classes: 2,
      },
    ],
    [
      {
        start: 10,
        end: 17,
        teachers: 1,
        subjects: 5,
        classrooms: 3,
        classes: 1,
      },
    ],
    [
      {
        start: 14,
        end: 17,
        teachers: 2,
        subjects: 4,
        classrooms: 2,
        classes: 1,
      },
    ],
    [
      {
        day: 5,
        start: 11,
        end: 13,
        teachers: 2,
        subjects: 3,
        classrooms: 4,
        classes: 5,
      },
    ],
    [],
    [
      {
        day: 6,
        start: 13,
        end: 17,
        teachers: 3,
        subjects: 3,
        classrooms: 3,
        classes: 2,
      },
    ],
  ],

  initDatas() {
    const datas = {
      teachers: this.teachers,
      subjects: this.subjects,
      classrooms: this.classrooms,
      classes: this.classes,
      plannings: this.plannings,
    };

    localStorage.setItem("datas", JSON.stringify(datas));
  },

  retrieve(item, key) {
    if (!localStorage.getItem("datas")) this.initDatas();
    const datas = JSON.parse(localStorage.getItem("datas")),
      values = [];

    if (datas[item] === undefined) return false;
    if (key === undefined) return datas[item];
    if (datas[item][0][key] === undefined) return false;

    for (const elem of datas[item]) values.push(elem[key]);

    return values;
  },

  search(term) {
    const values = [];
    for (const i of this.items) {
      const name = this.retrieve(i, "name");
      if (name)
        for (const val of name)
          if (val.toLowerCase().indexOf(term.toLowerCase()) !== -1)
            values.push({ menuItem: i, value: val });
    }

    return values;
  },

  sync(item, newValues) {
    if (!localStorage.getItem("datas")) this.initDatas();
    let datas = JSON.parse(localStorage.getItem("datas"));
    if (item in datas) {
      datas[item] = newValues;
      localStorage.setItem("datas", JSON.stringify(datas));
      return true;
    }
    return false;
  },

  getTeachersBySubject(subjectId) {
    return this.teachers.filter((e) => e.subjects.includes(subjectId));
  },

  fillHourOptions(select, min, max, label = "Choisir une heure") {
    select.innerHTML = "";
    let option = document.createElement("option");
    option.textContent = label;
    select.appendChild(option);

    for (let i = min; i <= max; i++) {
      option = document.createElement("option");
      option.textContent = `${i}H`;
      option.value = i;
      select.appendChild(option);
    }
  },
};
