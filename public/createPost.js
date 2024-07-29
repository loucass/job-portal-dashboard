if (document.querySelector("#createPost")) {
  document.querySelector("#createPost").onsubmit = (e) => {
    let request = new XMLHttpRequest();
    request.onload = () => {
      if (request.status == 200 && request.readyState == 4) {
        let resD = JSON.parse(request.responseText);
        if (resD.message == "done") {
          location.assign("/home");
        }
        console.log("done");
      }
    };
    let d = new FormData(document.querySelector("#createPost"));
    request.open("POST", "/createPost");
    request.send(d);
    e.preventDefault();
  };
} else {
  document.querySelector("#createJob").onsubmit = (e) => {
    let request = new XMLHttpRequest();
    request.onload = () => {
      if (request.status == 200 && request.readyState == 4) {
        let resD = JSON.parse(request.responseText);
        if (resD.message == "done") {
          location.assign("/home");
        }
        console.log("done");
      }
    };
    let d = new FormData(document.querySelector("#createJob"));
    request.open("POST", "/createJob");
    request.send(d);
    e.preventDefault();
  };
}
