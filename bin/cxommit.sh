#!/bin/sh

ssh -T git@github.com
git add .
git commit -m Check-in
git push
exit
