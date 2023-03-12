---
layout: post
preview: "SQL Alchemy Basics in Python with Postgresql"
title:  "SQL Alchemy Basics in Python with Postgresql"
date:   2023-02-28 12:00:00 -0700
categories: 
    - "databases"
tags: python databases sql development postgresql
---
Building off my [Previous Blog Post](/databases/2023/02/26/SQL-Alchemy-Setup.html), we now have 
Postgresql installed and sql alchemy installed. In this blog post we will go over the basics of 
inserting, deleting, and updating a database.
### Step 1: Create a Database
There are many ways to create a database such as through the postgres terminal, through the 
graphical tool(pgAdmin4), or in this blog post to keep everything about SQL Alchemy and Python we 
will do it through Python. The first step will be to install a python package that allows us
to do a few extra things like create databases since SQL Alchemy out of the box doesn't allow us to
do this.
``` bash
pip install sqlalchemy-utils
```
Once we have this installed we can now go ahead and create our first database. In this scenario I 
am creating a database called test. Now is a quick time to remind you to make sure your postgresql
server is running through the terminal, service, or docker. We will be adding on where we left off 
last time and create and connect to database by doing the following.
``` python
import sqlalchemy as sql
from sqlalchemy_utils import database_exists, create_database

engine = sql.create_engine("postgresql+psycopg2://postgres:postgres@localhost:5432/test")
if not database_exists(engine.url):
    create_database(engine.url)
engine.connect()
```
To create a database with the name of your choosing you simply would do 
`sql.create_engine("postgresql+psycopg2://postgres:postgres@localhost:5432/<insert name of database here")`
### Step 2: Creating a Table
The next step is to create a Table we can insert data into. A table is a collection of data with predefined format. For instance you can create a table called People and define each person has an age, date of birth(DOB), name, gender, city they reside in. To create a Table we use the CREATE command in SQL.
``` sql
CREATE TABLE PEOPLE (
    PersonID int,
    Age int,
    DOB DATE,
    FirstName varchar(255),
    LastName varchar(255),
    city varchar(255)
)
```
Now lets dive into the above SQL statement. The first line is telling SQL to create a table named PEOPLE. Then we go on to define the data format. In SQL we have many different datatypes such as shown [here](https://www.w3schools.com/sql/sql_datatypes.asp) but we only use int(integers), Date(just year/month/day), and varchar(x)'s which is a string of length x or 255 in out case string.

Now to execute these statements we will be using SQL Alchemy. SQL Alchemy has functionality to execute SQL statements using the engine we created earlier.
#### SQL Alchemy 2.x
``` python
with engine.connect() as conn:
    create_people_table = "CREATE TABLE PEOPLE(\n" + \
        "PersonID int,\n" + \
        "Age int,\n" + \
        "DOB Date,\n" + \
        "FirstName varchar(255),\n" + \
        "LastName varchar(255),\n" + \
        "City varchar(255)\n" + \
        ");"
    conn.exec_driver_sql(create_people_table)
```
#### SQL Alchemy 1.x
Back in SQL Alchemy 1.x you can just do
``` python
create_people_table = "CREATE TABLE PEOPLE(\n" + \
    "PersonID int,\n" + \
    "Age int,\n" + \
    "DOB Date,\n" + \
    "FirstName varchar(255),\n" + \
    "LastName varchar(255),\n" + \
    "City varchar(255)\n" + \
    ");"
engine.execute(create_people_table)
```
#### Checking if Table Exists
If we want to double check if the Table was created successfully you can either look at the pgAdmin or run the following line.
``` python
out = sql.inspect(conn).has_table('people')
```
Which should print:
``` bash
PEOPLE TABLE EXISTS:  True
```
### Step 3: Insert Data into Table
We now have created the PEOPLE table and it is ready for us to INSERT data into it.
#### INSERT Statements
Insert statements have the following structure, where you specify which table you are inserting data into.
One thing to note here is if we look at the python block below we need to wrap all non-numeric items as strings
which SQL can parse. If you did VALUES(0,1,2022-03-01......), SQL Alchemy will throw an error so that is something
to look out for.
``` sql
INSERT INTO table_name (column1, column2, column3, ...)
VALUES (value1, value2, value3, ...);
```
So lets make a fake person named John who was born on March 1 2022. The corresponding SQL statement would
be the one below where we first list the table, then all the columns you want to insert data into. You can leave
them blank and they will be null(SQL has a null or empty parameter when no data wasn't inserted).

``` sql
INSERT INTO PEOPLE (personid, age, dob, firstname, lastname, city)
VALUES (0, 1, 2022-03-01, john, smith, vancouver);
```
Now to translate that into python we can see the block below where we do a very similar statement as the sql
statement except we have to as talked about earlier wrap different values such as strings and dates in quotations.
``` python
create_john_smith = "INSERT INTO PEOPLE (personid, age, dob, firstname, lastname, city)\n" + \
        "VALUES (0, 1, '2022-03-01', 'john', 'smith', 'vancouver');"
conn.exec_driver_sql(create_john_smith)
```
#### NULL in SQL
I wanted to include an example of what I was talking about earlier where items in a row can be null.
The below is an sql statement where we can look for rows where a certain column is null.
``` sql
SELECT column_names
FROM table_name
WHERE column_name IS NULL;
```

#### SELECT Statement
Now that we have inserted data into our database, we can now look through the database for our John Smith
person. The essential tool for this is the SELECT statement in SQL. This allows us to query our database for data.
Another cool part about SELECT statements is you can specify certain rows if we are only looking for certain information.
Below we can see the structure of the SELECT statement that is very straightforward where we SELECT what columns we want
from what table.
``` sql
SELECT column1, column2, ...
FROM table_name;
```
Now to translate this into python, it is almost identical except just to show all the data in the row we include
the wildcard *. The wildcard * means select all columns which saves having to type out each and every column name.
``` python
get_all_rows = "SELECT * FROM PEOPLE;"
result = conn.exec_driver_sql(get_all_rows).all()
print(result)
```
We now see exactly what we inserted into the database! The result that gets printed gives us everything in python
formats ready to be used for different applications.
``` bash
[(0, 1, datetime.date(2022, 3, 1), 'john', 'smith', 'vancouver')]
```
### Conclusion
In this blog post we create Tables and define the structure of them, we learn how to make sure the Table has
been created, insert data into the table and then retrieve the data and print it out. 
