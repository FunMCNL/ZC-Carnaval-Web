const resultList = document.getElementById("resultList");
const topList = document.getElementById("topList");

const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("focus", function () {
  resultList.style.display = "block";
});

function refreshTop() {
  fetch(`https://songsearch.funmc.net/v1/carnaval/songs`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      topList.innerHTML = "";

      const sortedVotes = Object.entries(data.votes)
        .sort(([, a], [, b]) => b - a)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      Object.keys(sortedVotes)
        .slice(0, 5)
        .forEach((vote) =>
          addSong(topList, vote, getIndex(sortedVotes, vote) + 1 + ". " + vote)
        );
    })
    .catch((error) => {
      console.error("Error fetching prefill data:", error);
      const nothingFound = document.createElement("p");
      nothingFound.textContent = "No results found";
      topList.appendChild(nothingFound);
    });
}

function getIndex(haystack, needle) {
  const keysArray = Object.keys(haystack);
  return keysArray.indexOf(needle);
}

function displayResults(results) {
  resultList.innerHTML = "";

  if (results.trackmatches.track.length === 0) {
    const nothingFound = document.createElement("p");
    nothingFound.textContent = "No results found";
    resultList.appendChild(nothingFound);
  } else
    results.trackmatches.track
      .slice(0, 5)
      .forEach((track) =>
        addSong(resultList, track.name + " - " + track.artist, null)
      );

  resultList.style.display = "block";
}

function addSong(list, song, name) {
  const selectedItemDiv = document.getElementById("selectedItem");
  const listItem = document.createElement("li");
  listItem.className = "list-group-item";
  listItem.textContent = name ? name : song;
  listItem.addEventListener("click", function () {
    // searchInput.value = song;
    selectedItemDiv.textContent = `${song}`;
    if (list == resultList) list.style.display = "none";
  });
  list.appendChild(listItem);
}

function displayAlert(status, message) {
  const statusField = document.getElementById("statusField");
  statusField.innerHTML = `<div class="alert ${
    status === "SUCCESS" ? "alert-success" : "alert-danger"
  }" role="alert">${message}</div>`;
}

searchInput.addEventListener("input", function () {
  const query = this.value.trim();
  if (query !== "") {
    fetch(`https://songsearch.funmc.net/v1/songs`, {
      method: "POST",
      body: query,
    })
      .then((response) => response.json())
      .then((data) => displayResults(data.results))
      .catch((error) => {
        console.error("Error fetching data:", error);
        displayAlert("ERROR", "Couldn't load songs");
      });
  } else {
    document.getElementById("resultList").innerHTML = "";
  }
});

const submitVoteBtn = document.getElementById("submitVote");
submitVoteBtn.addEventListener("click", function () {
  var selectedSong = selectedItem.textContent.trim();
  fetch("https://songsearch.funmc.net/v1/carnaval", {
    method: "POST",
    body: selectedSong,
  })
    .then((response) => response.json())
    .then((data) => {
      displayAlert(data.status, data.message);
      refreshTop();
    })
    .catch((error) => {
      displayAlert("ERROR", "Failed! Please try again later, and report this!");
    });
});
