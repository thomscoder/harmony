package virtual

import (
	"fmt"
	"io"
	"log"

	"nova/editor"
	"nova/texts"
	"os"
	"strings"

	"github.com/go-git/go-billy/v5"
	"github.com/go-git/go-billy/v5/memfs"
	"github.com/go-git/go-billy/v5/util"
	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/config"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/storage/memory"
)

func createVirtualSystem(url string) (billy.Filesystem, *memory.Storage) {
	storer := memory.NewStorage()
	novaFs := memfs.New()
	virtualGit(storer, novaFs, url)
	return novaFs, storer
}

func virtualGit(storer *memory.Storage, fs billy.Filesystem, url string) error {
	repo, err := git.Clone(storer, fs, &git.CloneOptions{
		URL: url,
	})
	if err != nil {
		log.Fatal(err)
	}
	remote, err := repo.Remote("origin")
	if err != nil {
		return err
	}

	opts := &git.FetchOptions{
		RefSpecs: []config.RefSpec{"refs/*:refs/*", "HEAD:refs/heads/HEAD"},
	}

	if err := remote.Fetch(opts); err != nil {
		return err
	}
	return nil
}

func listFiles(store billy.Filesystem, dir string) error {
	files, err := store.ReadDir(dir)

	if err != nil {
		log.Println(err)
		return nil
	}
	for _, file := range files {
		if file.IsDir() && file.Name() != ".git" {
			listFiles(store, file.Name())
		}
		fmt.Printf("%s %s%s %s\n", file.Mode(), texts.GREEN, dir+"/"+file.Name(), texts.RESET)
	}
	return nil
}

func openFile(store billy.Filesystem, fileName string) billy.Filesystem {
	newFile, err := store.OpenFile(fileName, os.O_RDWR|os.O_CREATE, 0644)
	if err != nil {
		log.Println(err)
		return nil
	}
	editor.InitNovaEditor(store, newFile)
	newFile.Close()
	return store
}

func readFileContent(store billy.Filesystem, fileName string) {
	file, err := util.ReadFile(store, fileName)
	if err != nil {
		log.Println(err)
		return
	}
	log.Println(string(file))
}

func turnToString(r io.Reader, file billy.File) (res string, err error) {
	var sb strings.Builder
	if _, err = io.Copy(&sb, r); err == nil {
		res = sb.String()
		file.Write([]byte(res))
	}
	return
}

func fileLastModification(store billy.Filesystem) map[string]string {
	oldFiles := make(map[string]string)
	files, _ := store.ReadDir(texts.CurrentDirectory)
	for _, file := range files {
		stat, _ := store.Stat(file.Name())
		oldFiles[file.Name()] = stat.ModTime().String()
	}
	return oldFiles
}

func craftScreenshotMessage(store billy.Filesystem, wt *git.Worktree) string {
	return texts.Screenshot
}

func createBranch(repo *git.Repository, branchName string) error {
	exists := false
	wt, _ := repo.Worktree()
	branches, _ := repo.Branches()
	branches.ForEach(func(branch *plumbing.Reference) error {
		if branch.Name().Short() == branchName {
			exists = true
			err := wt.Checkout(&git.CheckoutOptions{
				Create: false,
				Force:  false,
				Branch: plumbing.NewBranchReferenceName(branchName),
			})
			if err != nil {
				return err
			}
			return nil
		}
		return nil
	})
	if exists == false {
		err := wt.Checkout(&git.CheckoutOptions{
			Create: true,
			Force:  false,
			Branch: plumbing.NewBranchReferenceName(branchName),
		})
		if err != nil {
			return err
		}
	}
	return nil
}
