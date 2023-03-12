---
layout: post
title:  "Introduction to SQL Alchemy in Python"
date:   2023-02-26 12:00:00 -0000
categories: databases
tags: python databases sql development
---
As an avid python user and data scientist and machine learning engineer, data is always the name of
the game whether it be storing and visualizing stock data or developing deep learning models for
autonomous vehicles. To store data one of my favorite ways is to use SQL based relational databases.

### SQL

SQL stands for **Structured Query Language** and lets you access and manipulate data in databases.
SQL is a standard and there are many different implementations of SQL databases such as PostgreSql
and MySQL as two examples. Using commands called queries you can retrieve, insert, update, and
delete data in your database.

### Python & SQL

Now SQL on its own is just a language for databases. To use a SQL database we need to use an 
implementation and we will be using [Postgresql](https://www.postgresql.org/) as it is an advanced 
SQL database that has lots of support and documentation online and works well in linux and mac based 
systems. I also personnally like that it has a tool that is a GUI for inspecting your databases and 
running queries. All these reasons makes it my database of choice in most circumstances. The 
following is from the Postgresql website:

>PostgreSQL is a powerful, open source object-relational database system with over 35 years of active development that has earned it a strong reputation for reliability, feature robustness, and performance.

#### Manually Installing Postgresql
To get started with Postgresql you can go to their [download page](https://www.postgresql.org/download/)
and install it on your system. Also if you want their tool for visualizing inspecting your databases
go to the [Postgresql](https://www.postgresql.org/) website and look for a tool called pgAdmin. At 
the time of writing this was pgAdmin4.
#### Installing through Docker
I personnally prefer to use [Docker](https://www.docker.com/) as it abstracts a lot of the 
configuration away and isolates all the database related data into containers which are sandboxed
process on your machine that are isolated from all other processes on host machine. I will go into 
the installation and use of Docker in another blog post but to get started with Docker go to their 
[getting started page](https://docs.docker.com/get-started/). Once you have docker installed we now
can simply use a docker official image for Postgres. 
[The official image page](https://hub.docker.com/_/postgres) does a great job explaining on how to 
get going with Docker and Postgres.
#### Starting Postgresql
If you installed it manually, in your terminal you will have to start the postgresql server manually
by doing the following where the ``-D`` flag denotes where the database data will stored.
``` bash
    $ postgres -D /usr/local/pgsql/data
```
If you are using docker, you can following the docker official image page to start the container 
using the Docker run command. Once you start it you should get in your docker/terminal see the 
server starting up. You should see similar stuff as below where I included a snippet of what was 
printed in the terminal.
``` bash
    2023-02-26 20:44:19 2023-02-27 04:44:19.140 UTC [1] LOG:  starting PostgreSQL 15.1 (Debian 15.1-1.pgdg110+1) on aarch64-unknown-linux-gnu, compiled by gcc (Debian 10.2.1-6) 10.2.1 20210110, 64-bit
    2023-02-26 20:44:19 2023-02-27 04:44:19.140 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
    2023-02-26 20:44:19 2023-02-27 04:44:19.140 UTC [1] LOG:  listening on IPv6 address "::", port 5432
    2023-02-26 20:44:19 2023-02-27 04:44:19.141 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
```
The important part of the above block is we can see that the Postgresql server is listening for 
connections on port 5432 on the machine. This will be important to connect to it with SQL Alchemy.

### SQL Alchemy

SQL Alchemy is a python package we can use to connect to different SQL databases such as MySQL or in
our case Postgresql.
> SQLAlchemy is the Python SQL toolkit and Object Relational Mapper that gives application developers the full power and flexibility of SQL.

To install SQL Alchemy, we use pip or conda to install the package
``` bash
pip install SQLAlchemy
```
We will quickly need to install a python adapter for Postgresql databases named [psycopg2](https://pypi.org/project/psycopg2/).
> Psycopg is the most popular PostgreSQL database adapter for the Python programming language

To install Psycopg, we simply run
``` bash
pip install psycopg2
```
#### Checking Everything works
Now we can finally hop into python and get started. Fire up the IDE of your choice (VSCode for me!)
and create a new python file. We will start with a simple file:
``` python
import sqlalchemy as sql
engine = sql.create_engine("postgresql+psycopg2://postgres:postgres@localhost:5432/")
engine.connect()
```
If this works, we now have successfully installed Postgresql and connected to it using SQL Alchemy 
and Psycopg2 in Python.
#### Common Error
A common error to get will give you an error message like the following:
``` bash
sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) connection to server at "localhost" (::1), port 5432 failed: Connection refused
	Is the server running on that host and accepting TCP/IP connections?
connection to server at "localhost" (127.0.0.1), port 5432 failed: Connection refused
	Is the server running on that host and accepting TCP/IP connections?
```
This means your Postgresql server isn't running or can't connect. The next steps here would be go to
the terminal you started the server in and make sure no errors popped up or check if maybe the port
is different.

### Conclusion
In this blog post we introduced what SQL databases were, how to install them, and how to connect to
them in python using SQL Alchemy. In the next blog post we will go over inserting data into the 
database and modifying or deleting it afterwards. \\
[(Next Blog Post)](/databases/2023/02/27/SQL-Alchemy-Basics.html)