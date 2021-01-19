// NAME: Copy Playlists
// AUTHOR: einzigartigerName
// DESCRIPTION: Works together with the App "Copy Playlist" to allow copying and combining Playlist directly in Spotify

(function CopyPlaylist() {

    const { CosmosAPI, BridgeAPI, LocalStorage, PlaybackControl, ContextMenu, URI } = Spicetify
    if (!(CosmosAPI || BridgeAPI)) {
        setTimeout(CopyPlaylist, 1000);
        return;
    }

    const STORAGE_KEY = "copy_buffer_spicetify"

    // New Playlist Button
    const playlistDialogButton = document.getElementsByClassName("LeftSidebarNewPlaylistButton__button")
    if (!playlistDialogButton || playlistDialogButton.length === 0) {
        return
    }

    // fetched Playlist Tracks
    var fetchedTracks = [];

    const subMenu = new Spicetify.ContextMenu.SubMenu(
        "Copy Playlist",
        [
            new Spicetify.ContextMenu.Item(
                "Create Playlist",
                (uris) => {
                    if (uris.length === 1) {
                        fetchPlaylist(uris[0])
                            .then((list) => {
                                // console.log(list)
                                highjackCreateDialog(list)
                            })
                            .catch((err) => Spicetify.showNotification(`${err}`));
                        return;
                    } else {
                        Spicetify.showNotification("Unable to find Playlist URI")
                    }           
                },
                (_) => true
            ),
            new Spicetify.ContextMenu.Item(
                "Insert in Buffer",
                (uris) => {
                    
                    if (uris.length === 1) {
                        fetchPlaylist(uris[0])
                            .then((list) => {fetchedTracks.push(list); console.log(fetchedTracks);})
                            .catch((err) => Spicetify.showNotification(`${err}`));
                        return;
                    } 
                },
                (_) => true
            )
        ],
        (uris) => {
            if (uris.length === 1) {
                const uriObj = Spicetify.URI.fromString(uris[0]);
                switch (uriObj.type) {
                    case Spicetify.URI.Type.PLAYLIST:
                    case Spicetify.URI.Type.PLAYLIST_V2:
                        return true;
                }
                return false;
            }
            // Multiple Items selected.
            return false;
        }
    )
    subMenu.register();

    // Highjack Spotifies 'New Playlist' Dialog
    function highjackCreateDialog(tracks) {
        playlistDialogButton[0].click()

       
        var createButton = document.querySelector("body > div.Modal__portal > div > div > div > div.PlaylistAnnotationModal__submit-button-container > button")
        var buttonContainer = document.querySelector("body > div.Modal__portal > div > div > div > div.PlaylistAnnotationModal__submit-button-container")

        var highjackedButton = createButton.cloneNode(true)
        highjackedButton.addEventListener("click", () => onCreateNewPlaylist(tracks))

        createButton.remove()
        buttonContainer.insertAdjacentElement("afterbegin", highjackedButton)
    }

    // Create a new Playlist from Inputs
    function onCreateNewPlaylist(tracks) {
        var exitButton = document.querySelector("body > div.Modal__portal > div > div > div > div.PlaylistAnnotationModal__close-button > button");
        var nameInput = document.querySelector("body > div.Modal__portal > div > div > div > div.PlaylistAnnotationModal__content > div.PlaylistAnnotationModal__playlist-name > input")
        var descInput = document.querySelector("body > div.Modal__portal > div > div > div > div.PlaylistAnnotationModal__content > div.PlaylistAnnotationModal__playlist-description > textarea")
        var imageInput = document.querySelector("body > div.Modal__portal > div > div > div > div.PlaylistAnnotationModal__content > div.PlaylistAnnotationModal__img-container > div > div.PlaylistAnnotationModal__img-holder > img")

        var name = nameInput.value
        if (!name) {
            name = nameInput.getAttribute("placeholder")
        }

        var desc = descInput.value

        var img;
        if (imageInput) {
            img = imageInput.getAttribute("src")
        }

        console.log(name, desc, img)

        createPlaylist(name)
            .then((res) => {
                addTracks(res.uri, tracks)
                    .then((_) => Spicetify.showNotification(`Created Playlist: "${name}"`))
                    .catch((err) => Spicetify.showNotification(`${err}`));
            })
            .catch((err) => Spicetify.showNotification(`${err}`));

        exitButton.click()

        if (exitButton) {
            exitButton.click()
        }
    }
    
    /**************************************************************************
                                Calls to the CosmosAPI
    **************************************************************************/
    // Fetch all Track from Playlist URI
    async function fetchPlaylist(uri) {
        return await new Promise((resolve, reject) => {
            Spicetify.BridgeAPI.cosmosJSON(
                {
                    method: "GET",
                    uri: `sp://core-playlist/v1/playlist/${uri}/rows`,
                    body: {
                        policy: {
                            link: true,
                        },
                    },
                },
                (error, res) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    let replace = res.rows.map((item) => (item.link));

                    resolve(replace);
                }
            );
        });
    }

    // Create a new Playlist
    async function createPlaylist(name) {
        return await new Promise((resolve, reject) => {
            Spicetify.BridgeAPI.cosmosJSON(
                {
                    method: "POST",
                    uri: `sp://core-playlist/v1/rootlist`,
                    body: {
                        operation: "create",
                        playlist: !0,
                        before: "start",
                        name: name,
                    },
                },
                (error, res) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve(res);
                }
            );
        });
    }

    // add track list to playlist
    async function addTracks(uri, tracks) {
        return await new Promise((resolve, reject) => {
            Spicetify.BridgeAPI.cosmosJSON(
                {
                    method: "POST",
                    uri: `sp://core-playlist/v1/playlist/${uri}`,
			        body: {
				        operation: "add",
				        uris: tracks,
				        after: "end"
			        }
                },
                (error, res) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve(res);
                }
            );
        });
    }
})();
