# Harmony

Quickly upload, create, open, read, modify and download files in the browser (no remote server).

<img src="https://i.ibb.co/8gZgk5D/Schermata-2022-09-25-alle-15-10-02.png" width=80% />

> Just me experimenting with WebAssembly.
<br/>

Harmony implements via WebAssembly a virtual file system in Go (a revisited version of my <a href="https://github.com/thomscoder/nova-git" target="_blank">Nova</a> project) where all the file operations happen. 

Either upload or create one or multiple new files, double click to open and start modifying, copy the entire file content in one click.

<img src="https://i.ibb.co/gy07sQ3/Schermata-2022-09-25-alle-16-40-12.png" width=80% />


### Harmony now supports commits and branches.



https://user-images.githubusercontent.com/78874117/193081985-4414305a-9d46-4246-9ef3-297ee09348dd.mov


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
Requires `pnpm`, `go`, 

- Install go packages -

```bash
$ pnpm dev
```
This will compile (`make`) and also spin up a reverse proxy

### Important
> Prepend `http://0.0.0.0:5000` to the repo url in `functions.go` (to not incur in CORS errors)
