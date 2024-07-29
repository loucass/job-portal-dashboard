editInfo.onclick = (e) => {
  location.assign("/editprofile");
};
if (document.querySelector("#editInfo2")) {
  document.querySelector("#editInfo2").onclick = (e) => {
    location.assign("/createPost");
  };
}

if (document.querySelector("#posts")) {
  document.querySelector("#posts").onclick = (e) => {
    location.assign("/createPost");
  };
}
if (document.querySelector("#jobs")) {
  console.log("ol");
  document.querySelector("#jobs").onclick = (e) => {
    location.assign("/createJob");
  };
}
logout.onclick = (e) => {
  document.cookie = "JID=;expires=01 jan 1900 00:00:00 ;path=/";
  document.cookie = "rule=;expires=01 jan 1900 00:00:00 ;path=/";
  location.replace("/");
};

viewJobs.onclick = (e) => {
  location.assign("/viewJobs");
};

document.querySelector("#searchInProfile").oninput = (e) => {
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
          <div class="row mt-3">
              <div class="fw-bold">
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
      content: document.querySelector("#searchInProfile").value,
      location: "profile",
    })
  );
};
