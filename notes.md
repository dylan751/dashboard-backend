## Deploy backend to heroku (using CLI)

- Install heroku CLI: `brew tap heroku/brew && brew install heroku`
- Create a node project: `npm init`
- Specify the Node version:
  ```js
  "engines": {
    "node": "14.x"
  },
  ```
- Specify a start script:
  - Create `Procfile`
  - Input into that file: `node main.js`
- Deploy to heroku:
  ```
  - `git add .`
  - `git commit -m "...'`
  - `heroku login`
  - `heroku create`
  - `git push heroku main`
  ```
- Access the API url

## Deploy postgres DB to heroku

- Create an app in [heroku](https://dashboard.heroku.com/) page
- Go to https://dashboard.heroku.com/apps/<app_name>/resources
- Add-ons -> Heroku Postgres
- Click on `Heroku Postgres` -> redirect to DB page -> Go to Settings -> Get Credentials

- Create a script file `.sql`
- Import SQL code command: `heroku pg:psql --app <app_name> < <.sql file name>`

- Get into postgres server: `psql --host=<host_name> --port=<port_num> --username=<username> --password --dbname=<db_name>` -> Insert Password

- CLI commands:
  - `\dt`: Get all relations (TABLE)
  - `\d+ <table_name>`: Get the table details + constraints of the table
