accept.onclick = (e) => {
  let request = new XMLHttpRequest();
  request.onload = () => {
    if (request.status == 200 && request.readyState == 4) {
      console.log(document.querySelector("#statue"));
      document.querySelector("#statue").innerText = "accepted";
      document.querySelector("#statue").className = "fw-bold text-success";
    }
  };
  request.open(
    "POST",
    "/jobs/Applications/modify/" +
      reject.parentElement.parentElement.getAttribute("data-oidFF")
  );
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(
    JSON.stringify({
      type: "accept",
      oid: document
        .querySelector("#accept")
        .parentElement.parentElement.getAttribute("oidFF"),
    })
  );
};
reject.onclick = (e) => {
  let request = new XMLHttpRequest();
  request.onload = () => {
    if (request.status == 200 && request.readyState == 4) {
      console.log(request.response);
      document.querySelector("#statue").innerText = "rejected";
      document.querySelector("#statue").className = "fw-bold text-danger";
    }
  };
  request.open(
    "POST",
    "/jobs/Applications/modify/" +
      reject.parentElement.parentElement.getAttribute("data-oidFF")
  );
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(
    JSON.stringify({
      type: "reject",
      oid: document
        .querySelector("#accept")
        .parentElement.parentElement.getAttribute("oidFF"),
    })
  );
};
clear.onclick = (e) => {
  let request = new XMLHttpRequest();
  request.onload = () => {
    if (request.status == 200 && request.readyState == 4) {
      console.log(request.response);
      document.querySelector("#statue").innerText = "bending";
      document.querySelector("#statue").className = "fw-bold text-warning";
    }
  };
  request.open(
    "POST",
    "/jobs/Applications/modify/" +
      reject.parentElement.parentElement.getAttribute("data-oidFF")
  );
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(
    JSON.stringify({
      type: "bending",
      oid: document
        .querySelector("#accept")
        .parentElement.parentElement.getAttribute("oidFF"),
    })
  );
};
