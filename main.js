import { Default, Datas } from "./config.js";
import { ViewTools, ViewConfig, Menu, Planning } from "./view.js";

window.onload = async function () {
  ViewConfig.init();
  await ViewConfig.refresh();

  const menuItems = document.getElementsByClassName("menu-item"),
    selectItem = document.getElementById("search-items-select"),
    addClass = document.getElementsByClassName("dayofweek__add"),
    pcCLose = document.getElementsByClassName("planning-class__close");

  window.addEventListener("resize", () => Planning.pcSizeRefresh());

  async function selectMenuItem(menuItem) {
    [...menuItems].forEach((elem) => elem.classList.remove("selected"));
    menuItem.classList.add("selected");
    ViewConfig.properties(menuItem.getAttribute("id"));
    await Menu.fillOptions(ViewConfig.option ? ViewConfig.option : "");
  }

  selectMenuItem(document.getElementById(ViewConfig.menuItem));

  [...menuItems].forEach((e) => {
    e.addEventListener("click", async () => await selectMenuItem(e));
  });

  selectItem.addEventListener("change", async function () {
    const option = document.getElementById(selectItem.value);
    ViewConfig.properties(undefined, option ? option.textContent.trim() : "");
    [...menuItems].forEach((e) => {
      if (e.classList.contains("selected")) {
        ViewConfig.properties(e.getAttribute("id"));
        return;
      }
    });
    await ViewConfig.refresh();
  });

  [...addClass].forEach((e) => {
    e.addEventListener("click", (event) => {
      const params = {
        title: "Ajouter un cours",
        footer: `<button id="add-class-btn">Ajouter</button>
        <button id="cancel-add-class">Annuler</button>`,
        content: `<table id="add-class-options">
        ${
          ViewConfig.menuItem !== "subjects"
            ? `<tr>
          <td>Module</td>
          <td>
            <select id="add-class-select-subject">
              <option value="none">Choisir un module</option>
            </select>
          </td>
        </tr>`
            : ""
        }
        ${
          ViewConfig.menuItem !== "teachers"
            ? `
        <tr>
          <td>Enseignant</td>
          <td>
            <select id="add-class-select-teacher">
              <option value="none">Choisir un enseignant</option>
            </select>
          </td>
        </tr>`
            : ""
        }
        ${
          ViewConfig.menuItem !== "classrooms"
            ? `
        <tr>
          <td>Salle</td>
          <td>
            <select  id="add-class-select-classroom">
              <option value="none">Choisir un salle</option>
            </select>
          </td>
        </tr>`
            : ""
        }
      ${
        ViewConfig.menuItem !== "classes"
          ? `
      <tr>
        <td>Classe</td>
        <td>
          <select  id="add-class-select-class">
            <option value="none">Choisir une classe</option>
          </select>
        </td>
      </tr>`
          : ""
      }
        <tr>
          <td>Heure de début</td>
          <td>
            <select  id="add-class-select-start-time">
              <option value="none">Choisir une heure</option>
            </select>
          </td>
        </tr>
        <tr>
          <td>Heure de fin</td>
          <td>
            <select  id="add-class-select-end-time">
              <option value="none">Choisir une heure</option>
            </select>
          </td>
        </tr>
        </table>`,
      };

      const modal = ViewTools.modal(params);
      Planning.fillAddClassOptions();

      document
        .getElementById("cancel-add-class")
        .addEventListener("click", () => modal.remove());

      document
        .getElementById("add-class-select-start-time")
        .addEventListener("change", function (e) {
          let temp = document.getElementById(
            "add-class-select-end-time"
          ).firstElementChild;

          [
            ...document.getElementById("add-class-select-end-time").children,
          ].forEach((e) => e.removeAttribute("disabled"));

          while (
            temp.textContent.trim().toLowerCase() !==
            document
              .getElementById(`add-options-end${e.target.value}`)
              .textContent.trim()
              .toLowerCase()
          ) {
            if (temp.value !== "none") temp.toggleAttribute("disabled");
            temp = temp.nextElementSibling;
          }
        });

      document
        .getElementById("add-class-select-end-time")
        .addEventListener("change", function (e) {
          let temp = document.getElementById(
            "add-class-select-start-time"
          ).lastElementChild;

          [
            ...document.getElementById("add-class-select-start-time").children,
          ].forEach((e) => e.removeAttribute("disabled"));

          while (
            temp.textContent.trim().toLowerCase() !==
            document
              .getElementById(`add-options-start${e.target.value}`)
              .textContent.trim()
              .toLowerCase()
          ) {
            if (temp.value !== "none") temp.toggleAttribute("disabled");
            temp = temp.previousElementSibling;
          }
        });

      document
        .getElementById("add-class-btn")
        .addEventListener("click", async function () {
          const elems = {
            subjects: document.getElementById("add-class-select-subject")
              ? document.getElementById("add-class-select-subject").value
              : "",
            teachers: document.getElementById("add-class-select-teacher")
              ? document.getElementById("add-class-select-teacher").value
              : "",
            classrooms: document.getElementById("add-class-select-classroom")
              ? document.getElementById("add-class-select-classroom").value
              : "",
            classes: document.getElementById("add-class-select-class")
              ? document.getElementById("add-class-select-class").value
              : "",
            start: document.getElementById("add-class-select-start-time").value,
            end: document.getElementById("add-class-select-end-time").value,
          };

          for (var key in elems)
            if (elems[key] === "none") {
              ViewTools.notification("Vous devez remplir toutes les options");
              break;
            }

          if (elems[key] !== "none") {
            for (const k in elems)
              if (elems[k].length)
                elems[k] = document
                  .getElementById(`add-options-${k}${elems[k]}`)
                  .textContent.trim()
                  .toUpperCase();

            let day,
              temp = event.target;
            while (!temp.classList.contains("timetable-row"))
              temp = temp.parentNode;
            day = parseInt(
              temp
                .getAttribute("id")
                .substring(Default.selectors.dayOfWeek.length)
            );

            // ViewConfig.properties(undefined, ViewConfig.option);
            elems[ViewConfig.menuItem] = ViewConfig.option;
            if (await Planning.update(day - 1, elems)) {
              modal.remove();
              ViewTools.notification("Modification effectuée avec succès!");
            } else ViewTools.notification(Planning.updateErrorMsg);
          }
        });
    });
  });

  [...pcCLose].forEach((pc) => {
    pc.addEventListener("click", function () {
      let temp = pc;
      while (!temp.classList.contains("planning-class")) temp = temp.parentNode;
      temp.remove();
    });
  });

  document
    .getElementById("search-global-input")
    .addEventListener("focusin", function (e) {
      const suggestion = document.createElement("div");
      suggestion.setAttribute("id", "search-suggestion");
      document.getElementById("search-global").appendChild(suggestion);

      e.target.addEventListener("input", async function () {
        let results = await Datas.searchTerm(e.target.value.toLowerCase());
        suggestion.innerHTML = "";
        for (let i of results) {
          let suggest = document.createElement("div");
          suggest.classList.add("suggest");

          suggest.textContent = i.value;
          suggest.setAttribute("value", i.menuItem);
          suggestion.appendChild(suggest);

          [...document.getElementsByClassName("suggest")].forEach((element) =>
            element.addEventListener("click", async (e) => {
              ViewConfig.properties(
                e.target.getAttribute("value"),
                e.target.textContent.trim().toLowerCase()
              );
              await selectMenuItem(
                document.getElementById(ViewConfig.menuItem)
              );

              [
                ...document.getElementById("search-items-select").children,
              ].forEach((el) => {
                if (
                  el.textContent.trim().toLowerCase() ===
                  ViewConfig.option.toLowerCase()
                ) {
                  el.setAttribute("selected", "selected");
                  return;
                }
              });

              ViewConfig.refresh();
              document.getElementById("search-global-input").value = "";
              document.getElementById("search-suggestion")?.remove();
            })
          );
        }
      });
    });

  document.addEventListener("click", function (e) {
    if (
      !e.target.classList.contains("suggest") &&
      e.target !== document.getElementById("search-global-input")
    )
      document.getElementById("search-suggestion")?.remove();
  });
};
