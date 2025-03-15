# AdvancedUrl-shortner-app
# Node Version
18.17.1   || 20.12.1
# npm Version
9.6.7     || 10.5.0
### Installation Instructions
# install node_modules
npm install

# START
pm2 start index.js
pm2 reload all

# Migration
knex migrate: latest

# seeding
knex seed:run

----- Additional Commands for migration and seeding -----
### knex migrate:make migration_name  --- Create migration 
### knex seed:make seed_name
