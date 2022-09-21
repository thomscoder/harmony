package editor

import (
	"bufio"
	"bytes"
	"errors"
	"fmt"
	"log"
	"nova/editor/variables"
	"nova/texts"
	"os"
	"path/filepath"
	"strings"
	"time"
	"unicode"
	"unicode/utf8"

	"github.com/go-git/go-billy/v5"
	"github.com/go-git/go-billy/v5/util"
	"github.com/mattn/go-runewidth"

	"golang.org/x/sys/unix"
)

type NovaInterface interface {
	Init() error
	Close() error
	Save(store billy.Filesystem, file billy.File, onOS bool)
}

type NovaEditor struct {
	cx, cy        int
	rx            int
	rowOffset     int
	colOffset     int
	screenRows    int
	screenCols    int
	rows          []*Row
	dirty         int
	quitCounter   int
	filename      string
	statusmsg     string
	statusmsgTime time.Time
	syntax        *NovaEditorSyntax
	origTermios   *unix.Termios
}

func (e *NovaEditor) Init() error {
	termios, err := enableRawMode()
	if err != nil {
		return err
	}
	e.origTermios = termios
	ws, err := unix.IoctlGetWinsize(variables.Stdoutfd, unix.TIOCGWINSZ)
	if err != nil || ws.Col == 0 {
		if _, err = os.Stdout.Write([]byte("\x1b[999C\x1b[999B")); err != nil {
			return err
		}
		if row, col, err := getCursorPosition(); err == nil {
			e.screenRows = row
			e.screenCols = col
			return nil
		}
		return err
	}
	e.screenRows = int(ws.Row) - 2
	e.screenCols = int(ws.Col)
	return nil
}

func (e *NovaEditor) Close() error {
	if e.origTermios == nil {
		return fmt.Errorf("raw mode is not enabled")
	}

	return unix.IoctlSetTermios(variables.Stdinfd, variables.WriteTermios, e.origTermios)
}

type NovaEditorSyntax struct {
	filetype  string
	filematch []string
	keywords  []string
	scs       string
	mcs       string
	mce       string
	flags     int
}

type Row struct {
	idx                int
	chars              []rune
	render             string
	hl                 []uint8
	hasUnclosedComment bool
}

func ctrl(char byte) byte {
	return char & 0x1f
}

func (e *NovaEditor) MoveCursor(k variables.Key) {
	switch k {
	case variables.ArrowUp:
		if e.cy != 0 {
			e.cy--
		}
	case variables.ArrowDown:
		if e.cy < len(e.rows) {
			e.cy++
		}
	case variables.ArrowLeft:
		if e.cx != 0 {
			e.cx--
		} else if e.cy > 0 {
			e.cy--
			e.cx = len(e.rows[e.cy].chars)
		}
	case variables.ArrowRight:
		linelen := -1
		if e.cy < len(e.rows) {
			linelen = len(e.rows[e.cy].chars)
		}
		if linelen >= 0 && e.cx < linelen {
			e.cx++
		} else if linelen >= 0 && e.cx == linelen {
			e.cy++
			e.cx = 0
		}
	}

	var linelen int
	if e.cy < len(e.rows) {
		linelen = len(e.rows[e.cy].chars)
	}
	if e.cx > linelen {
		e.cx = linelen
	}
}

const quitTimes = 3

func (e *NovaEditor) ProcessKey(store billy.Filesystem, file billy.File) error {
	k, err := readKey()
	if err != nil {
		return err
	}
	switch k {
	case variables.Enter:
		e.InsertNewline()

	case variables.Key(ctrl('x')):

		if e.dirty > 0 && e.quitCounter < quitTimes {
			e.SetStatusMessage(
				texts.UnsavedChangesWarning, quitTimes-e.quitCounter)
			e.quitCounter++
			return nil
		}
		os.Stdout.WriteString("\x1b[2J")
		os.Stdout.WriteString("\x1b[H")
		return variables.ErrQuitEditor

	case variables.Key(ctrl('s')):
		n, err := e.Save(store, file, false)
		if err != nil {
			if err == variables.ErrPromptCanceled {
				e.SetStatusMessage("Save aborted")
			} else {
				e.SetStatusMessage("Can't save! I/O error: %s", err.Error())
			}
		} else {
			e.SetStatusMessage("%d bytes written to virtual file", n)
		}
	case variables.Key(ctrl('r')):
		n, err := e.Save(store, file, true)
		if err != nil {
			if err == variables.ErrPromptCanceled {
				e.SetStatusMessage("Save aborted")
			} else {
				e.SetStatusMessage("Can't save! I/O error: %s", err.Error())
			}
		} else {
			e.SetStatusMessage("%d bytes written to disk", n)
		}
	case variables.Key(ctrl('f')):
		err := e.Find()
		if err != nil {
			if err == variables.ErrPromptCanceled {
				e.SetStatusMessage("")
			} else {
				return err
			}
		}

	case variables.Home:
		e.cx = 0

	case variables.End:
		if e.cy < len(e.rows) {
			e.cx = len(e.rows[e.cy].chars)
		}

	case variables.Backspace, variables.Key(ctrl('h')):
		e.DeleteChar()

	case variables.Delete:
		if e.cy == len(e.rows)-1 && e.cx == len(e.rows[e.cy].chars) {

			break
		}
		e.MoveCursor(variables.ArrowRight)
		e.DeleteChar()

	case variables.PageUp:
		e.cy = e.rowOffset

		for i := 0; i < e.screenRows; i++ {
			e.MoveCursor(variables.ArrowUp)
		}
	case variables.PageDown:
		e.cy = e.rowOffset + e.screenRows - 1
		if e.cy > len(e.rows) {
			e.cy = len(e.rows)
		}

		for i := 0; i < e.screenRows; i++ {
			e.MoveCursor(variables.ArrowDown)
		}
	case variables.ArrowUp, variables.ArrowDown, variables.ArrowLeft, variables.ArrowRight:
		e.MoveCursor(k)
	case variables.Key(ctrl('l')), variables.Key('\x1b'):
		break
	case variables.Key('('):
		e.InsertChar(rune(k))
		e.InsertChar(rune(')'))
		break
	case variables.Key('['):
		e.InsertChar(rune(k))
		e.InsertChar(rune(']'))
		break
	case variables.Key('{'):
		e.InsertChar(rune(k))
		e.InsertChar(rune('}'))
		break
	case variables.Key('<'):
		e.InsertChar(rune(k))
		e.InsertChar(rune('>'))
		break
	case variables.Key('"'):
		e.InsertChar(rune(k))
		e.InsertChar(rune('"'))
		break
	case variables.Key('\''):
		e.InsertChar(rune(k))
		e.InsertChar(rune('\''))
		break
	case variables.Key('`'):
		e.InsertChar(rune(k))
		e.InsertChar(rune('`'))
		break
	default:
		e.InsertChar(rune(k))
	}

	e.quitCounter = 0
	return nil
}

func (e *NovaEditor) drawRows(b *strings.Builder) {
	for y := 0; y < e.screenRows; y++ {
		filerow := y + e.rowOffset
		if filerow >= len(e.rows) {
			if len(e.rows) == 0 && y == e.screenRows/3 {
				welcomeMsg := fmt.Sprintf("Nova editing %s", e.filename)
				if runewidth.StringWidth(welcomeMsg) > e.screenCols {
					welcomeMsg = utf8Slice(welcomeMsg, 0, e.screenCols)
				}
				padding := (e.screenCols - runewidth.StringWidth(welcomeMsg)) / 2
				if padding > 0 {
					b.Write([]byte("~"))
					padding--
				}
				for ; padding > 0; padding-- {
					b.Write([]byte(" "))
				}
				b.WriteString(welcomeMsg)
			} else {
				b.Write([]byte("~"))
			}

		} else {
			var (
				line string
				hl   []uint8
			)
			if runewidth.StringWidth(e.rows[filerow].render) > e.colOffset {
				line = utf8Slice(
					e.rows[filerow].render,
					e.colOffset,
					utf8.RuneCountInString(e.rows[filerow].render))
				hl = e.rows[filerow].hl[e.colOffset:]
			}
			if runewidth.StringWidth(line) > e.screenCols {
				line = runewidth.Truncate(line, e.screenCols, "")
				hl = hl[:utf8.RuneCountInString(line)]
			}
			currentColor := -1
			for i, r := range []rune(line) {
				if unicode.IsControl(r) {

					sym := '?'
					if r < 26 {
						sym = '@' + r
					}
					b.WriteString("\x1b[7m")
					b.WriteRune(sym)
					b.WriteString("\x1b[m")
					if currentColor != -1 {

						b.WriteString(fmt.Sprintf("\x1b[%dm", currentColor))
					}
				} else if hl[i] == variables.HlNormal {
					if currentColor != -1 {
						currentColor = -1
						b.WriteString("\x1b[39m")
					}
					b.WriteRune(r)
				} else {
					color := syntaxToColor(hl[i])
					if color != currentColor {
						currentColor = color
						b.WriteString(fmt.Sprintf("\x1b[%dm", color))
					}
					b.WriteRune(r)
				}
			}
			b.WriteString("\x1b[39m")
		}
		b.Write([]byte("\x1b[K"))
		b.Write([]byte("\r\n"))
	}
}

func (e *NovaEditor) drawStatusBar(b *strings.Builder) {
	b.Write([]byte("\x1b[33m"))
	defer b.Write([]byte("\x1b[m"))
	filename := e.filename
	if utf8.RuneCountInString(filename) == 0 {
		filename = "[No Name]"
	}
	dirtyStatus := ""
	if e.dirty > 0 {
		dirtyStatus = "(modified)"
	}
	lmsg := fmt.Sprintf("%.20s - %d lines %s", filename, len(e.rows), dirtyStatus)
	if runewidth.StringWidth(lmsg) > e.screenCols {
		lmsg = runewidth.Truncate(lmsg, e.screenCols, "...")
	}
	b.WriteString(lmsg)
	filetype := "no filetype"
	if e.syntax != nil {
		filetype = e.syntax.filetype
	}
	rmsg := fmt.Sprintf("%s | %d/%d", filetype, e.cy+1, len(e.rows))
	l := runewidth.StringWidth(lmsg)
	for l < e.screenCols {
		if e.screenCols-l == runewidth.StringWidth(rmsg) {
			b.WriteString(rmsg)
			break
		}
		b.Write([]byte(" "))
		l++
	}
	b.Write([]byte("\r\n"))
}

func utf8Slice(s string, start, end int) string {
	return string([]rune(s)[start:end])
}

func (e *NovaEditor) drawMessageBar(b *strings.Builder) {
	b.Write([]byte("\x1b[K"))
	msg := e.statusmsg
	if runewidth.StringWidth(msg) > e.screenCols {
		msg = runewidth.Truncate(msg, e.screenCols, "...")
	}

	if time.Since(e.statusmsgTime) < 5*time.Second {
		b.WriteString(msg)
	}
}

func (e *NovaEditor) scroll() {
	e.rx = 0
	if e.cy < len(e.rows) {
		e.rx = rowCxToRx(e.rows[e.cy], e.cx)
	}

	if e.cy < e.rowOffset {
		e.rowOffset = e.cy
	}

	if e.cy >= e.rowOffset+e.screenRows {
		e.rowOffset = e.cy - e.screenRows + 1
	}

	if e.rx < e.colOffset {
		e.colOffset = e.rx
	}

	if e.rx >= e.colOffset+e.screenCols {
		e.colOffset = e.rx - e.screenCols + 1
	}
}

func (e *NovaEditor) Render() {
	e.scroll()

	var b strings.Builder

	b.Write([]byte("\x1b[?25l"))
	b.Write([]byte("\x1b[H"))

	e.drawRows(&b)
	e.drawStatusBar(&b)
	e.drawMessageBar(&b)

	b.WriteString(fmt.Sprintf("\x1b[%d;%dH", (e.cy-e.rowOffset)+1, (e.rx-e.colOffset)+1))

	b.Write([]byte("\x1b[?25h"))
	os.Stdout.WriteString(b.String())
}

func (e *NovaEditor) SetStatusMessage(format string, a ...interface{}) {
	e.statusmsg = fmt.Sprintf(format, a...)
	e.statusmsgTime = time.Now()
}

func (e *NovaEditor) rowsToString() string {
	var b strings.Builder
	for _, row := range e.rows {
		b.WriteString(string(row.chars))
		b.WriteRune('\n')
	}
	return b.String()
}

func (e *NovaEditor) Prompt(prompt string, cb func(query string, k variables.Key)) (string, error) {
	var b strings.Builder
	for {
		e.SetStatusMessage(prompt, b.String())
		e.Render()

		k, err := readKey()
		if err != nil {
			return "", err
		}
		if k == variables.Delete || k == variables.Backspace || k == variables.Key(ctrl('h')) {
			if b.Len() > 0 {
				bytes := []byte(b.String())
				_, size := utf8.DecodeLastRune(bytes)
				b.Reset()
				b.WriteString(string(bytes[:len(bytes)-size]))
			}
		} else if k == variables.Key('\x1b') {
			e.SetStatusMessage("")
			if cb != nil {
				cb(b.String(), k)
			}
			return "", variables.ErrPromptCanceled
		} else if k == variables.Enter {
			if b.Len() > 0 {
				e.SetStatusMessage("")
				if cb != nil {
					cb(b.String(), k)
				}
				return b.String(), nil
			}
		} else if !unicode.IsControl(rune(k)) && !isArrowKey(k) && unicode.IsPrint(rune(k)) {
			b.WriteRune(rune(k))
		}

		if cb != nil {
			cb(b.String(), k)
		}
	}
}

func (e *NovaEditor) Save(store billy.Filesystem, file billy.File, onOS bool) (int, error) {

	if len(e.filename) == 0 {
		fname, err := e.Prompt("Save as: %s (ESC to cancel)", nil)
		if err != nil {
			return 0, err
		}
		e.filename = fname
		e.selectSyntaxHighlight()
	}

	if !onOS {
		f, err := store.OpenFile(e.filename, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0644)
		if err != nil {
			return 0, err
		}
		defer f.Close()
		n := util.WriteFile(store, file.Name(), []byte(e.rowsToString()), 0644)
		if n != nil {
			return 0, err
		}
		e.dirty = 0
	} else {
		f, err := os.OpenFile(e.filename, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0644)
		if err != nil {
			return 0, err
		}
		defer f.Close()
		n := os.WriteFile(file.Name(), []byte(e.rowsToString()), 0644)
		if n != nil {
			return 0, err
		}
		e.dirty = 0
	}
	return 1, nil
}

func (e *NovaEditor) OpenFile(store billy.Filesystem, file billy.File) error {
	filename := file.Name()
	e.filename = filename
	e.selectSyntaxHighlight()
	f, err := store.Open(filename)
	if err != nil {
		log.Println("error", err)
		return err
	}
	defer f.Close()
	s := bufio.NewScanner(f)
	for s.Scan() {
		line := s.Bytes()

		bytes.TrimRightFunc(line, func(r rune) bool { return r == '\n' || r == '\r' })
		e.InsertRow(len(e.rows), string(line))
	}
	if err := s.Err(); err != nil {
		return err
	}
	e.dirty = 0
	return nil
}

func (e *NovaEditor) InsertRow(at int, chars string) {
	if at < 0 || at > len(e.rows) {
		return
	}
	row := &Row{chars: []rune(chars)}
	row.idx = at
	if at > 0 {
		row.hasUnclosedComment = e.rows[at-1].hasUnclosedComment
	}
	e.updateRow(row)

	e.rows = append(e.rows, &Row{})
	copy(e.rows[at+1:], e.rows[at:])
	for i := at + 1; i < len(e.rows); i++ {
		e.rows[i].idx++
	}
	e.rows[at] = row
}

func (e *NovaEditor) InsertNewline() {
	if e.cx == 0 {
		e.InsertRow(e.cy, "")
	} else {
		row := e.rows[e.cy]
		e.InsertRow(e.cy+1, string(row.chars[e.cx:]))

		row = e.rows[e.cy]
		row.chars = row.chars[:e.cx]
		e.updateRow(row)
	}
	e.cy++
	e.cx = 0
}

func (e *NovaEditor) updateRow(row *Row) {
	var b strings.Builder
	col := 0
	for _, r := range row.chars {
		if r == '\t' {

			b.WriteRune(' ')
			col++
			for col%variables.Tabs != 0 {
				b.WriteRune(' ')
				col++
			}
		} else {
			b.WriteRune(r)
		}
	}
	row.render = b.String()
	e.updateHighlight(row)
}

func (e *NovaEditor) updateHighlight(row *Row) {
	row.hl = make([]uint8, utf8.RuneCountInString(row.render))
	for i := range row.hl {
		row.hl[i] = variables.HlNormal
	}

	if e.syntax == nil {
		return
	}

	prevSep := true

	var strQuote rune

	inComment := row.idx > 0 && e.rows[row.idx-1].hasUnclosedComment

	idx := 0
	runes := []rune(row.render)
	for idx < len(runes) {
		r := runes[idx]
		prevHl := variables.HlNormal
		if idx > 0 {
			prevHl = row.hl[idx-1]
		}

		if e.syntax.scs != "" && strQuote == 0 && !inComment {
			if strings.HasPrefix(string(runes[idx:]), e.syntax.scs) {
				for idx < len(runes) {
					row.hl[idx] = variables.HlComment
					idx++
				}
				break
			}
		}

		if e.syntax.mcs != "" && e.syntax.mce != "" && strQuote == 0 {
			if inComment {
				row.hl[idx] = variables.HlMlComment
				if strings.HasPrefix(string(runes[idx:]), e.syntax.mce) {
					for j := 0; j < len(e.syntax.mce); j++ {
						row.hl[idx] = variables.HlMlComment
						idx++
					}
					inComment = false
					prevSep = true
					continue
				} else {
					idx++
					continue
				}
			} else if strings.HasPrefix(string(runes[idx:]), e.syntax.mcs) {
				for j := 0; j < len(e.syntax.mcs); j++ {
					row.hl[idx] = variables.HlMlComment
					idx++
				}
				inComment = true
				continue
			}
		}

		if (e.syntax.flags & variables.HL_HIGHLIGHT_STRINGS) != 0 {
			if strQuote != 0 {
				row.hl[idx] = variables.HlString

				if r == '\\' && idx+1 < len(runes) {
					row.hl[idx+1] = variables.HlString
					idx += 2
					continue
				}
				if r == strQuote {
					strQuote = 0
				}
				idx++
				prevSep = true
				continue
			} else {
				if r == '"' || r == '\'' {
					strQuote = r
					row.hl[idx] = variables.HlString
					idx++
					continue
				}
			}
		}

		if (e.syntax.flags & variables.HL_HIGHLIGHT_NUMBERS) != 0 {
			if unicode.IsDigit(r) && (prevSep || prevHl == variables.HlNumber) ||
				r == '.' && prevHl == variables.HlNumber {
				row.hl[idx] = variables.HlNumber
				idx++
				prevSep = false
				continue
			}
		}

		if prevSep {
			keywordFound := false
			for _, kw := range e.syntax.keywords {
				isKeyword2 := strings.HasSuffix(kw, "|")
				if isKeyword2 {
					kw = strings.TrimSuffix(kw, "|")
				}

				end := idx + utf8.RuneCountInString(kw)
				if end <= len(runes) && kw == string(runes[idx:end]) &&
					(end == len(runes) || isSeparator(runes[end])) {
					keywordFound = true
					hl := variables.HlKeyword1
					if isKeyword2 {
						hl = variables.HlKeyword2
					}
					for idx < end {
						row.hl[idx] = hl
						idx++
					}
					break
				}
			}
			if keywordFound {
				prevSep = false
				continue
			}
		}

		prevSep = isSeparator(r)
		idx++
	}

	changed := row.hasUnclosedComment != inComment
	row.hasUnclosedComment = inComment
	if changed && row.idx+1 < len(e.rows) {
		e.updateHighlight(e.rows[row.idx+1])
	}
}

func (e *NovaEditor) selectSyntaxHighlight() {
	e.syntax = nil
	if len(e.filename) == 0 {
		return
	}

	ext := filepath.Ext(e.filename)

	for _, syntax := range HLDB {
		for _, pattern := range syntax.filematch {
			isExt := strings.HasPrefix(pattern, ".")
			if (isExt && pattern == ext) ||
				(!isExt && strings.Index(e.filename, pattern) != -1) {
				e.syntax = syntax
				for _, row := range e.rows {
					e.updateHighlight(row)
				}
				return
			}
		}
	}
}

func (row *Row) insertChar(at int, c rune) {
	if at < 0 || at > len(row.chars) {
		at = len(row.chars)
	}
	row.chars = append(row.chars, 0)
	copy(row.chars[at+1:], row.chars[at:])
	row.chars[at] = c
}

func (row *Row) appendChars(chars []rune) {
	row.chars = append(row.chars, chars...)
}

func (row *Row) deleteChar(at int) {
	if at < 0 || at >= len(row.chars) {
		return
	}
	row.chars = append(row.chars[:at], row.chars[at+1:]...)
}

func (e *NovaEditor) InsertChar(c rune) {
	if e.cy == len(e.rows) {
		e.InsertRow(len(e.rows), "")
	}
	row := e.rows[e.cy]
	row.insertChar(e.cx, c)
	e.updateRow(row)
	e.cx++
	e.dirty++
}

func (e *NovaEditor) DeleteChar() {
	if e.cy == len(e.rows) {
		return
	}
	if e.cx == 0 && e.cy == 0 {
		return
	}
	row := e.rows[e.cy]
	if e.cx > 0 {
		row.deleteChar(e.cx - 1)
		e.updateRow(row)
		e.cx--
		e.dirty++
	} else {
		prevRow := e.rows[e.cy-1]
		e.cx = len(prevRow.chars)
		prevRow.appendChars(row.chars)
		e.updateRow(prevRow)
		e.DeleteRow(e.cy)
		e.cy--
	}
}

func (e *NovaEditor) DeleteRow(at int) {
	if at < 0 || at >= len(e.rows) {
		return
	}
	e.rows = append(e.rows[:at], e.rows[at+1:]...)
	for i := at; i < len(e.rows); i++ {
		e.rows[i].idx--
	}
	e.dirty++
}

func (e *NovaEditor) Find() error {
	savedCx := e.cx
	savedCy := e.cy
	savedColOffset := e.colOffset
	savedRowOffset := e.rowOffset

	lastMatchRowIndex := -1
	searchDirection := 1

	savedHlRowIndex := -1
	savedHl := []uint8(nil)

	onKeyPress := func(query string, k variables.Key) {
		if len(savedHl) > 0 {
			copy(e.rows[savedHlRowIndex].hl, savedHl)
			savedHl = []uint8(nil)
		}
		switch k {
		case variables.Enter, variables.Key('\x1b'):
			lastMatchRowIndex = -1
			searchDirection = 1
			return
		case variables.ArrowRight, variables.ArrowDown:
			searchDirection = 1
		case variables.ArrowLeft, variables.ArrowUp:
			searchDirection = -1
		default:

			lastMatchRowIndex = -1
			searchDirection = 1
		}

		if lastMatchRowIndex == -1 {
			searchDirection = 1
		}

		current := lastMatchRowIndex

		for i := 0; i < len(e.rows); i++ {
			current += searchDirection
			switch current {
			case -1:
				current = len(e.rows) - 1
			case len(e.rows):
				current = 0
			}

			row := e.rows[current]
			rx := strings.Index(row.render, query)
			if rx != -1 {
				lastMatchRowIndex = current
				e.cy = current
				e.cx = rowRxToCx(row, rx)

				e.rowOffset = len(e.rows)

				savedHlRowIndex = current
				savedHl = make([]uint8, len(row.hl))
				copy(savedHl, row.hl)
				for i := 0; i < utf8.RuneCountInString(query); i++ {
					row.hl[rx+i] = variables.HlMatch
				}
				break
			}
		}
	}

	_, err := e.Prompt("Search: %s (ESC = cancel | Enter = confirm | Arrows = prev/next)", onKeyPress)

	if err == variables.ErrPromptCanceled {
		e.cx = savedCx
		e.cy = savedCy
		e.colOffset = savedColOffset
		e.rowOffset = savedRowOffset
	}
	return err
}

func InitNovaEditor(store billy.Filesystem, file billy.File) {
	var editor NovaEditor

	if err := editor.Init(); err != nil {
		die(err)
	}
	defer editor.Close()

	if file.Name() != "" {
		err := editor.OpenFile(store, file)
		if err != nil && !errors.Is(err, os.ErrNotExist) {
			die(err)
		}
	}

	for {
		editor.Render()
		if err := editor.ProcessKey(store, file); err != nil {
			if err == variables.ErrQuitEditor {
				break
			}
			die(err)
		}
	}
}
