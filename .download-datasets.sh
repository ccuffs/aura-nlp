#!/bin/bash

# Scripts para baixar um conjunto de datasets de um planilha do Google Docs. Essa planilha
# tem uma estrutura de linhas, onde cada linha contém o nome do dataset e a URL da planilha
# com os dados daquele dataset.
# 
# Ex.:
#    domain-1   https://docs.google.com/spreadsheets/d/1-2-3-4/edit#gid=0
#    domain-2   https://docs.google.com/spreadsheets/d/1-2-3-4/edit#gid=0  
#
# Por:
#    Fernando Bevilacqua <fernando.bevilacqua@uffs.edu.br>
#    2021-10-24

TEMP_DIR=/tmp
AURANLP_DIR=.
DATASETS_DIR=$AURANLP_DIR/data/train/domain

GSHEET_DOMAINS="https://docs.google.com/spreadsheets/d/e/2PACX-1vT7VnUBPocj2YWWajPxjzjPi2t_0qRlGAilhciUrRXJg50UTkLhAjRoOYsK03rblGV4mCtB-qN2eVQs/pub?output=tsv"
curl -sSL $GSHEET_DOMAINS > ${TEMP_DIR}/gsheet-domains.tsv

echo "Downloading datasets"

# iterate over each line of the tsv file
while read line; do
    # split the line into an array
    IFS=$'\t' read -r -a array <<< "$line"

    dataset=${array[0]}
    url=${array[1]}

    # remove \r from the end of the url
    url=$(echo $url | sed 's/\r//g')

    output_path=${DATASETS_DIR}/$dataset.tsv
    
    echo " $dataset -> $output_path [$url]"
    
    # download the dataset
    curl -sSL $url > ${DATASETS_DIR}/$dataset.tsv
done <<<$(cat ${TEMP_DIR}/gsheet-domains.tsv)

echo "Datasets downloaded"