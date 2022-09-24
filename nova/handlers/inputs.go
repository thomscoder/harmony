package handlers

import (
	"fmt"
	"nova/texts"
	ns "nova/virtual"
	"strings"

	"github.com/go-git/go-billy/v5"
)

func Init(ns ns.NovaStore, store billy.Filesystem, filename string, content string) string {
	ns.SetWatcher(store)
	file := ns.OpenFile(store, filename)
	ns.Save(store, file, content)
	filenames := ns.GetFiles(store, texts.CurrentDirectory)
	fmt.Println(filenames)
	//ns.GetFileContent(store, filename)
	return strings.Join(filenames, " ")
}

// func inputsParser(store billy.Filesystem, repo *git.Repository, ns ns.NovaStore, str string) bool {
// 	wt, _ := repo.Worktree()
// 	input := strings.TrimSuffix(str, "\n")
// 	lastWord := input[strings.LastIndex(input, " ")+1:]
// 	branchSwitchRegex := regexp.MustCompile(texts.SwitchBranchCommand)
// 	fileOpeningRegex := regexp.MustCompile(texts.CreateCommand)
// 	if !branchSwitchRegex.MatchString(input) && !fileOpeningRegex.MatchString(input) {
// 		switch input {
// 		case texts.StopNova:
// 			return false
// 		case texts.ClearScreen:
// 			os.Stdout.Write([]byte("\033[H\033[2J"))
// 			return true
// 		case texts.Files:
// 			ns.GetFiles(store, texts.CurrentDirectory)
// 			return true
// 		case texts.Infos:
// 			watcher := ns.SetWatcher(store)
// 			for k, v := range watcher {
// 				log.Println(k, v)
// 			}
// 			return true
// 		case texts.Screenshot:
// 			ns.Screenshot(store, wt)
// 			return true
// 		case texts.Status:
// 			status := ns.GetStatus(wt).String()
// 			log.Printf(fmt.Sprintf(texts.StatusSuccessfully, texts.CYAN, texts.RESET, status))
// 			return true
// 		case texts.Logger:
// 			logs := ns.GetLogs(repo)
// 			logs.ForEach(func(commit *object.Commit) error {
// 				log.Println(commit)
// 				return nil
// 			})
// 			return true
// 		case texts.Branches:
// 			branches, _ := ns.GetBranches(repo)
// 			branches.ForEach(func(branch *plumbing.Reference) error {
// 				fmt.Printf("%s%s%s\n", texts.GREEN, branch.Name().Short(), texts.RESET)
// 				return nil
// 			})
// 			return true
// 		default:
// 			return true
// 		}
// 	} else {
// 		switch {
// 		case branchSwitchRegex.MatchString(input):
// 			ns.GotoBranch(repo, lastWord)
// 			return true
// 		case fileOpeningRegex.MatchString(input):
// 			ns.OpenFile(store, lastWord)
// 			return true
// 		default:
// 			return true
// 		}
// 	}
// }

func getInputs() string {
	var repoToClone string
	fmt.Printf("%s%s%s ", texts.CYAN, texts.RepositoryToClone, texts.RESET)
	fmt.Scanf("%s", &repoToClone)
	return repoToClone
}
