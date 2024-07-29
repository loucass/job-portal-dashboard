if (document.title == "sign up") {
  this.file.style.cssText = "display:none";
  this.job.style.cssText = "display:none";
  this.jobI.removeAttribute("required");
  document.querySelector("#file").oninput = (e) => {
    let FILE = document.querySelector("#file").files["0"];
    if (FILE.size > 2 * 1024 * 1024) {
      this.errors.innerHTML = "File size must be less than 2MB";
      document.querySelector("#file").value = "";
    } else if (FILE.type != "application/pdf") {
      this.errors.innerHTML = "File type must be pdf";
      document.querySelector("#file").value = "";
    } else {
      this.errors.innerHTML = "";
    }
  };
  document.querySelector("#rule").oninput = (e) => {
    if (this.rule.value == "employer") {
      this.file.style.cssText = "display:flex";
      this.job.style.cssText = "display:flex";
      this.jobI.setAttribute("required", "required");
    } else {
      this.file.style.cssText = "display:none";
      this.job.style.cssText = "display:none";
      this.jobI.removeAttribute("required");
    }
  };
  document.forms[0].onsubmit = (e) => {
    let request = new XMLHttpRequest();
    request.onload = () => {
      console.log(document.querySelector("#file").files[0]);
      if (request.status == 200 && request.readyState == 4) {
        let resD = JSON.parse(request.responseText);
        if (resD.message == "user-exist") {
          errors.innerHTML = "user already signed up";
        } else if (resD.message == "user-created") {
          message.innerHTML = "user created";
          window.location.replace("/about");
        } else if (resD.message == "file-error") {
          errors.innerHTML = "error uploading cv";
        } else if (resD.message == "name-invalid") {
          errors.innerHTML = "user name not valid";
        }
      }
    };
    request.open("POST", "/signup");
    // request.setRequestHeader("Content-Type", "application/json;charset=UTF-8"); // use only when send json
    // request.setRequestHeader("Content-Type", "multipart/form-data"); // let browser set it to prevent any errors the browser automateclly send this header
    let d = new FormData(document.forms[0]);
    // d.append("user", document.querySelector("#user").value);
    // d.append("email", document.querySelector("#email").value);
    // d.append("password", document.querySelector("#pass").value);
    // d.append("rule", document.querySelector("#rule").value);
    // d.append("cvFile", document.querySelector("#file").files[0]);
    request.send(d);
    e.preventDefault();
  };
} else if (document.title == "log in") {
  console.log("lll");
  document.forms[0].onsubmit = (e) => {
    e.preventDefault();
    let request = new XMLHttpRequest();
    request.onload = () => {
      if (request.status == 200 && request.readyState == 4) {
        let resD = JSON.parse(request.responseText);
        // console.log(resD.message);
        if (resD.message == "done") {
          message.innerHTML = "user log in";
          // message.classList += "text-danger";
          window.location.replace("/home");
        } else if (resD.message == "no") {
          message.innerHTML = "no such user";
        }
      }
    };
    request.open("POST", "/login");
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(
      JSON.stringify({
        email: document.querySelector("#email").value,
        password: document.querySelector("#pass").value,
      })
    );
  };
} else if (document.title == "add about") {
  skip.onclick = (e) => {
    window.location.replace("/home");
  };
  document.forms[0].onsubmit = (e) => {
    let request = new XMLHttpRequest();
    request.onload = () => {
      if (request.status == 200 && request.readyState == 4) {
        let response = JSON.parse(request.response);
        console.log(response);
        console.log(response.message == "done");
        if (response.message == "done") {
          location.replace("/home");
        }
      }
    };
    console.log(document.forms[0]);
    let d = JSON.stringify({
      about: about.value,
    });
    request.open("POST", "/about");
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8"); // let browser set it to prevent any errors the browser automateclly send this header
    request.send(d);
    e.preventDefault();
  };
}
