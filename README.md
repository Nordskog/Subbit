# Subbit for Reddit

Subbit for Reddit is webapp that lets you subscribe to individual authors in one, multiple, or all subreddits on Reddit.
Subscribed authors are sorted by their latest post, and displayed as cards with their last 6 post immediately visible.

Subbit for Reddit is currently running at https://subbit.org/

![Screenshot of subscribed authors tab](https://i.imgur.com/CxdVUxY.png)

You can also:
* Browse all of Reddit in the same format
* Search for subreddits, authors, or author by post title if in a subreddit.
* Import all your subscriptions from [Watchful1's](https://github.com/Watchful1) wonderful [UpdateMeBot](https://github.com/Watchful1/RedditSubsBot/)
* Choose between 3 different display modes (compact, normal, full)
* Browse Subbit on mobile devices

## Running Subbit yourself

You may run an instance of Subbit for your own personal use.  
This requires a server with Node and NPM installed, and access to a PostgresSQL or MySql database.

1. Clone this repository.
2. Navigate to the folder and run ```npm install```
3. Rename ```server_config.ts.default``` and ```config.ts.default```, removing the default suffix. 
4. Make the necessary changes to these two configuration files.
   ```config.ts``` contains information that will be available to both the client and the server.
   ```server_config.ts``` contains information only available to the server, including the database configuration, encryption keys, and your Reddit app secret.
5. Run ```npm run build``` to generate the javascript bundle and other resources that will be served to the client.
6. Run ```npm start``` to start the server.
7. If running on linux, you may want to utilize the ```subbit.service``` systemd template to run Subbit as a service.

The Subbit server provides comprehensive real-time statistics.  
The statistics page is available from the menu only if the user has been assigned the "stats" role.   
This, and a few other tidbits, can be configured via ```npm run cli```

\>```npm run cli help```
```
Available commands:

user [USERNAME]                        print user info
role [USERNAME] [ROLE] [ENABLED]       toggle user role

Valid arguments:

ENABLED:   true or false
ROLE:      admin or stats
USERNAME:  Case-sensitive username
```
The ```admin``` role currently does not provide any additional access.  
The user will have to log out and back in before being permitted access to the statistics page.

The stats page provides the following information at 3 hour / 3 day / 90 day intervals, or per minute / hour / day.

* Total user count
* Total subscription count
* Total author count
* CPU utilization (Linux only)
* Memory utilization
* Request rate
* Page loads
* Page loads by registered users
* Successful logins
* Failed logins
* Error rate

The Subbit server does not handle common web-server functions such as compression or rate limiting.  
You should use apache or nginx for this.

## Attributions

This project is depenendant on very many NPM packages.  
Please see Github's insight page or packages.json for a complete list.

Core dependencies include:

* Wetland ORM
* Typescript
* React
* React-toastify
* Redux
* Redux-first-router
* Webpack
* Winston
* Victory
* GSAP
* Express
* Awesome-Typescript-Loader
