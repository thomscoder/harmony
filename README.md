# Harmony

Quickly upload, create, open, read, modify and download files, on the fly.

Harmony also keep tracks of your changes or "workspaces" through git branches and git commits, all in-memory in your browser.

<img src="https://i.ibb.co/brDw78C/Schermata-2022-10-08-alle-14-56-53.png" width=80% />

> Just me experimenting with WebAssembly.
<br/>

Harmony implements via WebAssembly a virtual file system and a in-memory version of Git, written in Go, (a revisited version of my <a href="https://github.com/thomscoder/nova-git" target="_blank">Nova</a> project) where all the file operations happen. 

Save and switch between your "workspaces" in few clicks or even quicker with shortcuts.

<img src="https://i.ibb.co/1zXsCVk/Schermata-2022-10-02-alle-18-13-54.png" width=80% />


## Harmony supports git commits and branches.



https://user-images.githubusercontent.com/78874117/193465430-7a76e848-1e5b-406a-b2b0-99869a031f3a.mp4


## Navigate back to a specific commit with the graph

https://user-images.githubusercontent.com/78874117/194714002-f6ec20c5-c7cc-4144-85e1-0bdb65097b7d.mov


Create branches, 
create files, 
upload files, 
change them, 
save them, 
commit them, 
switch branches, 
repeat.

Simply refresh the page to restart anew.

#### Run it locally
Requires `pnpm`, `go

- Install go packages -

```bash
$ pnpm dev
```
This will compile Nova via `make`, and also spin up a reverse proxy

### Important
> Prepend `http://0.0.0.0:5000` to the repo url in `nova/virtual/functions.go` (to not incur in CORS errors - in Development)
