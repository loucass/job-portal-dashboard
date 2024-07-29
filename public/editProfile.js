profileForm.onsubmit = (e) => {
  let request = new XMLHttpRequest();
  request.onload = () => {
    console.log(document.querySelector("#profile").files[0]);
    if (request.status == 200 && request.readyState == 4) {
      let resD = JSON.parse(request.responseText);
      if (resD.message == "done") {
        document.images[0].src = resD.path;
      }
    }
  };
  request.open("POST", "/editprofilepic");
  let d = new FormData(document.forms[0]);
  request.send(d);
  e.preventDefault();
};
detailsForm.onsubmit = (e) => {
  e.preventDefault();
  let request = new XMLHttpRequest();
  request.onload = () => {
    console.log(document.querySelector("#profile").files[0]);
    if (request.status == 200 && request.readyState == 4) {
      let resD = JSON.parse(request.responseText);
      if (resD.message == "done") {
        location.assign("/profile");
      }
    }
  };
  request.open("POST", "/editDetails");
  let d = new FormData(document.forms[1]);
  let allSkill = [];
  if (skillsArena.children.length > 0) {
    for (let index = 0; index < skillsArena.children.length; index++) {
      const element = skillsArena.children[`${index}`].innerText;
      allSkill.push(element);
    }
    d.append("skills", allSkill);
  }
  request.send(d);
};
addS.onclick = (e) => {
  for (let index = 0; index < skillsArena.children.length; index++) {
    const element = skillsArena.children[`${index}`];
    if (element.innerText == skills.value) {
      skills.value = "";
      errors.innerHTML = "don't enter value twice";
      return;
    } else {
      errors.innerHTML = "";
    }
  }
  if (skills.value) {
    let rr = [];
    for (
      let r = 0;
      r < document.querySelector("datalist").children.length;
      r++
    ) {
      rr.push(document.querySelector("datalist").children[r].value);
    }
    if (rr.includes(skills.value)) {
      errors.innerHTML = "";
      let d = document.createElement("p");
      let i = document.createElement("img");
      i.setAttribute("class", "ms-3 rounded-pill bg-danger click");
      i.setAttribute("src", "cancel.svg");
      i.setAttribute("width", "20px");
      i.addEventListener("click", (ee) => {
        d.remove();
      });
      d.className += "gult p-2 m-2 rounded-pill";
      d.innerText += skills.value;
      d.appendChild(i);
      skillsArena.append(d);
      skills.value = "";
    } else {
      skills.value = "";
      errors.innerHTML = "values must be valid";
    }
  }
};
editCV.onsubmit = (e) => {
  e.preventDefault();
  let request = new XMLHttpRequest();
  request.onload = () => {
    if (request.readyState == 4 && request.status == 200) {
      let resD = JSON.parse(request.response);
      if (resD.message == "done") {
        location.assign("/profile");
      }
    }
  };
  request.open("POST", "/editCV");
  let d = new FormData(editCV);
  request.send(d);
};
