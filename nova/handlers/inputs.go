package handlers

import (
	"bufio"
	"fmt"
	"log"
	"nova/texts"
	ns "nova/virtual"
	"os"
	"regexp"
	"strings"

	"github.com/go-git/go-billy/v5"
	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/object"
)

func Init(ns ns.NovaStore) {
	var text string
	var err error
	repoToClone := getInputs()

	if repoToClone == "" {
		repoToClone = texts.CurrentDirectory
	}
	store, storer := ns.CreateStore(repoToClone)
	ns.SetWatcher(store)
	reader := bufio.NewReader(os.Stdin)
	repo, openingError := git.Open(storer, store)
	if openingError != nil {
		log.Fatal(openingError)
	}

	for {
		if text == "" {
			ns.SetBranch(repo)
			fmt.Printf("%s%s%s %s", texts.WHITE, ns.CurrentBranch.Name().Short(), texts.RESET, texts.BeforeInput)
			if text, err = reader.ReadString('\n'); err != nil {
				fmt.Println(texts.ReadingError)
				return
			} else {
				if !inputsParser(store, repo, ns, text) {
					os.Exit(1)
				}
				text = ""
			}
		}
	}
}

func inputsParser(store billy.Filesystem, repo *git.Repository, ns ns.NovaStore, str string) bool {
	wt, _ := repo.Worktree()
	input := strings.TrimSuffix(str, "\n")
	lastWord := input[strings.LastIndex(input, " ")+1:]
	branchSwitchRegex := regexp.MustCompile(texts.SwitchBranchCommand)
	fileOpeningRegex := regexp.MustCompile(texts.CreateCommand)
	if !branchSwitchRegex.MatchString(input) && !fileOpeningRegex.MatchString(input) {
		switch input {
		case texts.StopNova:
			return false
		case texts.ClearScreen:
			os.Stdout.Write([]byte("\033[H\033[2J"))
			return true
		case texts.Files:
			ns.GetFiles(store, texts.CurrentDirectory)
			return true
		case texts.Infos:
			watcher := ns.SetWatcher(store)
			for k, v := range watcher {
				log.Println(k, v)
			}
			return true
		case texts.Screenshot:
			ns.Screenshot(store, wt)
			return true
		case texts.Status:
			status := ns.GetStatus(wt).String()
			log.Printf(fmt.Sprintf(texts.StatusSuccessfully, texts.CYAN, texts.RESET, status))
			return true
		case texts.Logger:
			logs := ns.GetLogs(repo)
			logs.ForEach(func(commit *object.Commit) error {
				log.Println(commit)
				return nil
			})
			return true
		case texts.Branches:
			branches, _ := ns.GetBranches(repo)
			branches.ForEach(func(branch *plumbing.Reference) error {
				fmt.Printf("%s%s%s\n", texts.GREEN, branch.Name().Short(), texts.RESET)
				return nil
			})
			return true
		default:
			return true
		}
	} else {
		switch {
		case branchSwitchRegex.MatchString(input):
			ns.GotoBranch(repo, lastWord)
			return true
		case fileOpeningRegex.MatchString(input):
			ns.OpenFile(store, lastWord)
			return true
		default:
			return true
		}
	}
}

func getInputs() string {
	var repoToClone string
	fmt.Printf("%s%s%s ", texts.CYAN, texts.RepositoryToClone, texts.RESET)
	fmt.Scanf("%s", &repoToClone)
	return repoToClone
}
