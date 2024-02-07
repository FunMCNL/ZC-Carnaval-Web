const searchInput = document.getElementById("searchInput");
const resultList = document.getElementById("resultList");
const topList = document.getElementById("topList");
const api = 'https://songsearch.funmc.net/v1';

function refreshSongs() {
  const query = searchInput.value.trim();
  if (query !== "") {
    fetch(`${api}/songs`, {
      method: "POST",
      body: query,
    })
      .then((response) => response.json())
      .then((data) => displayResults(data.results))
      .catch((error) => {
        console.error("Error fetching data:", error);
        displayAlert("ERROR", "Couldn't load songs");
      });
  } else resultList.innerHTML = "";
}

function refreshTop() {
  fetch(`${api}/carnaval/songs`, {
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
    selectedItemDiv.textContent = `${song}`;
    if (list == resultList) list.style.display = "none";
  });
  list.appendChild(listItem);
}

function displayAlert(status, message) {
  const statusField = document.getElementById("statusField");
  statusField.innerHTML = `<section class="alert ${
    status === "SUCCESS" ? "alert-success" : "alert-danger"
  }" role="alert">${message}</section>`;
}

searchInput.addEventListener("focus", function () {
  refreshSongs();
  resultList.style.display = "block";
});
searchInput.addEventListener("input", function () {
  refreshSongs();
});

const submitVoteBtn = document.getElementById("submitVote");
submitVoteBtn.addEventListener("click", function () {
  var selectedSong = selectedItem.textContent.trim();
  fetch(`${api}/carnaval`, {
    method: "POST",
    body: selectedSong,
  })
    .then((response) => response.json())
    .then((data) => {
      displayAlert(data.status, data.message);
      refreshTop();
    })
    .catch((error) => {
      console.error("Error submitting data:", error);
      displayAlert("ERROR", "Failed! Please try again later, and report this!");
    });
});
