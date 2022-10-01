# Harmony

Quickly upload, create, open, read, modify and download files, on the fly.

Harmony also keep tracks of your changes or "workspaces" through git branches and git commits, all in-memory in your browser.

<img src="https://i.ibb.co/mb99Q01/Schermata-2022-10-01-alle-13-00-39.png" width=80% />

> Just me experimenting with WebAssembly.

<img src="https://i.ibb.co/sWkCLrr/Schermata-2022-10-01-alle-13-00-27.png" width=80% />
<br/>

Harmony implements via WebAssembly a virtual file system and a in-memory version of Git, written in Go, (a revisited version of my <a href="https://github.com/thomscoder/nova-git" target="_blank">Nova</a> project) where all the file operations happen. 

Save and switch between your "workspaces" in few clicks or even quicker with shortcuts.

<img src="https://i.ibb.co/dJGL6kR/Schermata-2022-10-01-alle-13-00-12.png" width=80% />


## Harmony supports git commits and branches.



https://user-images.githubusercontent.com/78874117/193406968-cf0b44c6-c5a9-4e14-9085-edbea06bf59e.mp4



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
