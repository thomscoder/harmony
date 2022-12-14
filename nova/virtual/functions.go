package virtual

import (
	"fmt"
	"io"
	"log"

	"nova/texts"
	"os"
	"strings"

	"github.com/go-git/go-billy/v5"
	"github.com/go-git/go-billy/v5/memfs"
	"github.com/go-git/go-billy/v5/util"
	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/storage/memory"
)

func createVirtualSystem() (billy.Filesystem, *memory.Storage) {
	storer := memory.NewStorage()
	novaFs := memfs.New()

	repo, _ := git.Clone(storer, novaFs, &git.CloneOptions{
		URL: "http://0.0.0.0:5000/https://github.com/thomscoder/harmony-bare.git",
	})
	fmt.Println(repo.Head())
	return novaFs, storer
}

func listFiles(store billy.Filesystem, dir string) []string {
	files, err := store.ReadDir(dir)
	var fileInfos []string

	if err != nil {
		log.Println(err)
		return nil
	}
	for _, file := range files {
		if file.IsDir() {
			listFiles(store, file.Name())
		}
		fileInfos = append(fileInfos, file.Name())
		fmt.Printf("%s %s%s %s\n", file.Mode(), texts.GREEN, dir+"/"+file.Name(), texts.RESET)
	}
	return fileInfos
}

func isDirectory(store billy.Filesystem, dir string, filename string) bool {
	files, err := store.ReadDir(dir)

	if err != nil {
		log.Println(err)
		return false
	}

	for _, file := range files {
		if file.Name() == filename {
			if file.IsDir() {
				return true
			}
		}
	}

	return false
}

func getDirectoryFiles(store billy.Filesystem, dir string, filename string) []string {
	files, err := store.ReadDir(dir)

	if err != nil {
		log.Println(err)
		return nil
	}
	for _, file := range files {
		if file.Name() == filename {
			if file.IsDir() {
				return listFiles(store, file.Name())
			}
		}
	}
	return nil
}

func openFile(store billy.Filesystem, fileName string) (billy.Filesystem, billy.File) {
	newFile, err := store.OpenFile(fileName, os.O_RDWR|os.O_CREATE, 0644)
	if err != nil {
		log.Println(err)
		return nil, nil
	}
	newFile.Close()
	return store, newFile
}

func readFileContent(store billy.Filesystem, fileName string) string {
	file, err := util.ReadFile(store, fileName)
	if err != nil {
		log.Println(err)
		return "Couldn't read " + fileName
	}
	return string(file)
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

func checkoutToCommit(repo *git.Repository, commitHash string) error {
	wt, _ := repo.Worktree()

	err := wt.Checkout((&git.CheckoutOptions{
		Hash: plumbing.NewHash(commitHash),
	}))

	if err != nil {
		return err
	}

	return nil
}
