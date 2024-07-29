document.querySelector("#searchInHome").oninput = (e) => {
  let request = new XMLHttpRequest();
  request.onload = () => {
    if (request.status == 200 && request.readyState == 4) {
      let resD = JSON.parse(request.responseText);
      console.log(document.querySelector("#postsCard"));
      document.querySelector("#postsCard").innerHTML = "";
      // console.log(resD.message);
      if (resD.posts.length > 0) {
        document.querySelector("#postsCard").innerHTML += "<h4>posts</h4>";
        for (let index = 0; index < resD.posts.length; index++) {
          document.querySelector("#postsCard").innerHTML += `
            <div class="card my-3">
                <div class="card-body">
                    <div class="d-flex flex-column align-items-start">
                        <div class="row">
                            <div class="fw-bold" />
                            ${resD.posts[index].userName}
                            ${
                              resD.posts[index].userRule == "seeker"
                                ? '<span class="text-success">HR</span>'
                                : resD.posts[index].userRule == "admin"
                                ? '<span class="text-info text-uppercase">server admin</span>'
                                : ""
                            }
                <br />
                <small>
                    ${resD.posts[index].createdDate}
                </small>
                </div>
                <br />
                ${resD.posts[index].postContent}
                </div>
                </div>
            </div>
            </div>
            </div>
            <hr />
            `;
        }
      } else {
        document.querySelector("#postsCard").innerText = "no match posts found";
      }
    }
  };
  request.open("POST", "/search");
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(
    JSON.stringify({
      content: document.querySelector("#searchInHome").value,
      location: "home",
    })
  );
};
document.querySelectorAll(".apply").forEach((e) => {
  e.onclick = () => {
    function popUp(text) {
      let popupElement = document.createElement("span");
      popupElement.textContent = text;
      popupElement.classList +=
        "rounded-4 bg-success text-center text-light p-2 custom-pop";
      document.body.appendChild(popupElement);
      setTimeout(() => {
        popupElement.remove();
      }, 5000);
    }
    console.log(document.cookie.split(";")[0].substring(4));
    let request = new XMLHttpRequest();
    request.onload = () => {
      if (request.status == 200 && request.readyState == 4) {
        let resD = JSON.parse(request.responseText);
        if (resD.message == "done") {
          popUp("applied");
        }
      }
    };
    let d = JSON.stringify({
      jobID: e.parentElement.parentElement.getAttribute("data-oidFF"),
      userID: document.cookie.split(";")[0].substring(4),
    });
    request.open("POST", "/apply");
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(d);
  };
});
let request = new XMLHttpRequest();
request.onload = () => {
  if (request.status == 200 && request.readyState == 4) {
    let resD = JSON.parse(request.responseText);
    console.log(resD);
    console.log(resD.applications);
    if (resD.applications.length > 0) {
      console.log("d");
      resD.applications.forEach((element) => {
        if (element.feedbackReceived == "false") {
          new Notification("job application update", {
            body: `your application on ${element.title} is ${element.statue}`,
          });
        }
      });
    }
  }
};
let d = JSON.stringify({
  userID: document.cookie.split(";")[0].substring(4),
});
request.open("POST", "/applications");
request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
request.send(d);
