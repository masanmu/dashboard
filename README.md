## Introduction

dashboard是提供给用户，以图表的方式查看push上来的数据

## Check log from masanmu
有些个别的endpoint的counter数量比较多，有的1k多，甚至有的2-3k，然而显示中最多只能显示500个．在select选择>器上加了all选项，可以查看所选主机的所有counter．
>
counter很多查看起来很不方便，比如我们现在想看redis的监控，但是redis起了很多实例，但我们需要看一下相应实例
的数据对比，我们需要去在counter list去查找，这里我将所有counter的tag给提取出来,这样我们可以先选择对比实例
的tag，再去看相应的screen．
>
添加dashboard中所选出的图表可以保存成相应的screen，同时加入创建screen判断，在同一层级创建相同name的screen是会自动跳转到已经创建的screen．


## Clone

    $ export HOME=/home/work/

    $ mkdir -p $HOME/open-falcon/
    $ cd $HOME/open-falcon && git clone https://github.com/open-falcon/dashboard.git
    $ cd dashboard;

## Install dependency

    # yum install -y python-virtualenv

    $ cd $HOME/open-falcon/dashboard/
    $ virtualenv ./env

    $ ./env/bin/pip install -r pip_requirements.txt -i http://pypi.douban.com/simple


## Init database

    $ mysql -h localhost -u root -p < ../scripts/db_schema/dashboard-db-schema.sql
    $ mysql -h localhost -u root -p < ../scripts/db_schema/graph-db-schema.sql

    ## default mysql user is root, default passwd is ""
    ## change mysql info in rrd/config.py if necessary


## Start

    $ ./env/bin/python wsgi.py

    --> goto http://127.0.0.1:8081


## Run with gunicorn

    $ bash control start

    --> goto http://127.0.0.1:8081


## Stop gunicorn

    $ bash control stop

## Check log

    $ bash control tail
