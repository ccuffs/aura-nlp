#!/bin/bash

AURANLP_RUN_DIR=/home/ccuffsbotmine
AURANLP_DIR=/home/ccuffsbotmine/aura-nlp

GSHEET_QNA="https://docs.google.com/spreadsheets/d/e/2PACX-1vQOVxduUNXKdR8GAtIVVB8irh3GG7OkAVFaXVuK4Y6qBrzm8kmEiTsCra2HIU7AH4jdTujjWQAf7hof/pub?output=tsv"
GSHEET_DOMAIN="https://docs.google.com/spreadsheets/d/e/2PACX-1vQVaupGlAbrFQrt9DY6kREHgr3thcK_-F-z7Ml5190ksc4XH3paOyuxqmFBNV4KSvu2bV9tcmbbkpoa/pub?output=tsv"

curl -L $GSHEET_QNA > ${AURANLP_DIR}/data/train/qna-pt.tsv

node ${AURANLP_DIR}/aura.js train --type="qna" --dataset="${AURANLP_DIR}/data/train/qna-pt.tsv" --output="${AURANLP_DIR}/data/models/qna.model"

curl -L $GSHEET_DOMAIN > ${AURANLP_DIR}/data/train/domain-pt.tsv

node ${AURANLP_DIR}/aura.js train --type="domain" --dataset="${AURANLP_DIR}/data/train/domain-pt.tsv" --output="${AURANLP_DIR}/data/models/domain.model"

[ -f ${AURANLP_RUN_DIR}/aura-nlp.pid ] && kill -9 `cat ${AURANLP_RUN_DIR}/aura-nlp.pid`

nohup node ${AURANLP_DIR}/aura.js serve -e "domain:domain:${AURANLP_DIR}/data/models/domain.model,qna:qna:${AURANLP_DIR}/data/models/qna.model" > aura-nlp-server.log 2>&1 &

echo $! > ${AURANLP_RUN_DIR}/aura-nlp.pid