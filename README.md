# Spicetify Copy for Spotify v1.1.56 or older

Spicetify extension which allows you to copyand combine playlists/queue directly in Spotify.

## Preview
Copy a single playlist:  
![Screenshot Context](screenshot_context.png)

Combine multiple playlist to a single big playlist:  
![Screenshot Crad](screenshot_card.png)

Create a new playlist from Queue or copy into the buffer:
![Screenshot Queue](screenshot_queue.png)

## Installation
* Download and install [Spicetify](https://github.com/khanhas/spicetify-cli.git)
* Add the [copyPlaylist.js](copyPlaylist.js) file to the Extensions folder (spicetify-cli/Extensions)
* Add the extension to the `config.ini` file
```shell
spicetify config extensions copyPlaylist.js
spicetify apply
```
## Important
When creating a new Playlist you **MUST** use the `Create` button, otherwise an empty playlist will be created.
