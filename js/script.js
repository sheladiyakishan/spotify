let songs;
let currfolder;
const currentsong = new Audio();  // Ensure currentsong is properly defined


const baseURL = "https://sheladiyakishan.github.io/spotify/";

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    currfolder = folder;
    try {
        let a = await fetch(`${baseURL}${folder}/`);
        if (!a.ok) {
            throw new Error(`Failed to fetch ${folder}: ${a.statusText}`);
        }
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;

        let as = div.getElementsByTagName("a");
        songs = [];

        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                songs.push(element.href.split(`/${folder}/`)[1]);
            }
        }

        let songul = document.querySelector(".songlist ul");
        songul.innerHTML = "";
        for (const song of songs) {
            songul.innerHTML += `<li>
                <img src="${baseURL}img/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", ' ').replaceAll('%26', ' ')}</div>
                    <div>song Artist</div>
                </div>
                <div class="playnow">
                    <span>play now</span>
                    <img src="${baseURL}img/play.svg" alt="">
                </div>
            </li>`;
        }

        Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", element => {
                playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
                play.src = `${baseURL}img/play.svg`;
            });
        });

        return songs;
    } catch (error) {
        console.error(error);
    }
}

const playmusic = (track) => {
    currentsong.src = `${baseURL}${currfolder}/` + track;
    currentsong.play();
    console.log(track);

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}

async function displayalbum() {
    try {
        let a = await fetch(`${baseURL}songs/`);
        if (!a.ok) {
            throw new Error(`Failed to fetch /songs/: ${a.statusText}`);
        }

        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        let anchors = div.getElementsByTagName("a");
        let cardcontainer = document.querySelector(".cardcontainer");

        let array = Array.from(anchors);
        for (let index = 0; index < array.length; index++) {
            const e = array[index];

            if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
                let folder = e.href.split("/").slice(-1)[0];
                let a = await fetch(`${baseURL}songs/${folder}/info.json`);

                if (!a.ok) {
                    throw new Error(`Failed to fetch /songs/${folder}/info.json: ${a.statusText}`);
                }

                let response = await a.json();

                cardcontainer.innerHTML += `<div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="25" cy="25" r="25" fill="#1ed760" />
                            <g transform="translate(13, 13)">
                                <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z" fill="#000000"></path>
                            </g>
                        </svg>
                    </div>
                    <img src="${baseURL}songs/${folder}/cover.jpeg" alt="">
                    <p class="p1">${response.title}</p>
                    <p class="p2">${response.description}</p>
                </div>`;
            }
        }

        // Add card click event listener after cards are created
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
                console.log(songs);
                playmusic(songs[0]);
                play.src = `${baseURL}img/play.svg`;
            });
        });

    } catch (error) {
        console.error(error);
    }
}

async function main() {
    // Get the list of all the songs 
    await getsongs("songs/ncs");

    // Display all the albums on the page 
    await displayalbum();

    // Add play/pause event listener
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = `${baseURL}img/play.svg`;
        } else {
            currentsong.pause();
            play.src = `${baseURL}img/pause.svg`;
        }
    });

    // Add time update event listener
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    // Add seekbar click event listener
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent / 100);
    });

    // Add hamburger menu event listener
    document.querySelector(".hamberger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Add close menu event listener
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-150%";
    });

    // Add previous song event listener
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        play.src = `${baseURL}img/play.svg`;
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1]);
        } else {
            playmusic(songs[index]);
        }
    });

    // Add next song event listener
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        play.src = `${baseURL}img/play.svg`;
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1]);
        } else {
            playmusic(songs[index]);
        }
    });

    // Add volume change event listener
    document.querySelector(".range input").addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;
        if (currentsong.volume > 0) {
            document.querySelector(".volume img").src = document.querySelector(".volume img").src.replace("mute.svg", "volume.svg");
        }
    });

    // Add volume icon click event listener
    document.querySelector(".volume img").addEventListener("click", e => {
        if (e.target.src.includes(`${baseURL}img/volume.svg`)) {
            e.target.src = e.target.src.replace(`${baseURL}img/volume.svg`, `${baseURL}img/mute.svg`);
            currentsong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = `${baseURL}img/volume.svg`;
            currentsong.volume = 0.10;
            document.querySelector(".range input").value = 70;
        }
    });
}

main();
