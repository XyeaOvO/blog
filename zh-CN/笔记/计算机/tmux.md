tumx
```bash
for i in {0..255}; do printf "\033[38;5;%dm%3d\033[0m " "$i" "$i"; done; echo
```