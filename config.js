const Default = {
  days: 6,
  theme: "dark",
  menuItem: "classes",
  option: "L2 CDSD",

  selectors: {
    dayOfWeek: "day",
    label: "_label",
    classTime: "time_",
  },
};

const Datas = {
  items: [
    "teachers",
    "classes",
    "classrooms",
    "subjects",
    "timeIntervals",
    "plannings",
  ],

  filePath: "./datas.json",

  async initDatas(base) {
    let datas;

    if (base === undefined) {
      datas = await fetch(this.filePath);
      datas = await datas.json();
    } else datas = typeof base === 'string' ? JSON.parse(base) : base;

    localStorage.setItem("datas", JSON.stringify(datas));
  },

  async retrieve(item, key) {
    if (!localStorage.getItem("datas")) await this.initDatas();
    const datas = JSON.parse(localStorage.getItem("datas")),
      values = [];

    if (datas[item] === undefined) return false;
    if (key === undefined) return datas[item];
    if (datas[item][0][key] === undefined) return false;

    for (const elem of datas[item]) values.push(elem[key]);

    return values;
  },

  async searchTerm(term) {
    const values = [];
    for (const i of this.items) {
      const name = await this.retrieve(i, "name");
      if (name)
        for (const val of name)
          if (val.indexOf(term) !== -1)
            values.push({ menuItem: i, value: val });
    }

    return values;
  },

  async sync(item, newValues) {
    let datas;
    if (!localStorage.getItem("datas")) await this.initDatas();
    datas = localStorage.getItem("datas");
    datas = JSON.parse(datas);
    datas[item] = newValues;
    await this.initDatas(datas);
  },
};

export { Default, Datas };
